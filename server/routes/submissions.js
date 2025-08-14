const express = require('express');
const { validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../utils/validation');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get submissions with filtering
// @route   GET /api/submissions
// @access  Private
router.get('/', validatePagination, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-submittedAt';
    const assignmentId = req.query.assignmentId;
    const courseId = req.query.courseId;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'teacher') {
      // Teachers can see submissions for their courses
      const courses = await Course.find({ 
        teacherId: req.user.id, 
        isActive: true 
      }).select('_id');
      query.courseId = { $in: courses.map(c => c._id) };
    }

    if (assignmentId) query.assignmentId = assignmentId;
    if (courseId) query.courseId = courseId;

    // Execute query with pagination
    const submissions = await Submission.find(query)
      .populate('assignmentId', 'title dueDate totalMarks assignmentType')
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode')
      .populate('grade.gradedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: submissions.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: submissions
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let query = { _id: req.params.id };

    // Role-based access control
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'teacher') {
      // Teachers can access submissions for their courses
      const courses = await Course.find({ 
        teacherId: req.user.id, 
        isActive: true 
      }).select('_id');
      query.courseId = { $in: courses.map(c => c._id) };
    }

    const submission = await Submission.findOne(query)
      .populate('assignmentId', 'title dueDate totalMarks assignmentType allowLateSubmission lateSubmissionPenalty')
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode')
      .populate('grade.gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Calculate late penalty if applicable
    if (submission.isLate) {
      const latePenalty = await submission.calculateLatePenalty();
      submission._doc.latePenalty = latePenalty;
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create submission (student only)
// @route   POST /api/submissions
// @access  Private/Student
router.post('/', authorize('student'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    // Validate assignment exists and is accessible
    const assignment = await Assignment.findById(assignmentId)
      .populate('courseId', 'enrolledStudents');

    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or inactive'
      });
    }

    // Check if student is enrolled in the course
    if (!assignment.courseId.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Check if assignment is overdue and late submission is not allowed
    const now = new Date();
    const isLate = now > assignment.dueDate;
    
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Late submissions are not allowed for this assignment'
      });
    }

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileURL: `/uploads/${file.filename}`
    })) : [];

    // Create submission
    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      courseId: assignment.courseId._id,
      content,
      attachments,
      submittedAt: now
    });

    await submission.populate('assignmentId', 'title dueDate totalMarks');
    await submission.populate('courseId', 'name subjectCode');

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission
    });

  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Grade submission (teacher/admin only)
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher/Admin
router.put('/:id/grade', authorize('teacher', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { earnedPoints, feedback } = req.body;

    let query = { _id: req.params.id };

    // Teachers can only grade submissions for their courses
    if (req.user.role === 'teacher') {
      const courses = await Course.find({ 
        teacherId: req.user.id, 
        isActive: true 
      }).select('_id');
      query.courseId = { $in: courses.map(c => c._id) };
    }

    const submission = await Submission.findOne(query)
      .populate('assignmentId', 'totalMarks');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Validate earned points
    if (earnedPoints < 0 || earnedPoints > submission.assignmentId.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Earned points must be between 0 and ${submission.assignmentId.totalMarks}`
      });
    }

    // Update grade
    submission.grade.earnedPoints = earnedPoints;
    submission.grade.feedback = feedback;
    submission.grade.gradedBy = req.user.id;
    submission.status = 'graded';

    await submission.save();
    await submission.populate('grade.gradedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });

  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
