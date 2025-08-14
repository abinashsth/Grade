const express = require('express');
const { validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../utils/validation');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all assignments with filtering
// @route   GET /api/assignments
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
    const sort = req.query.sort || '-createdAt';
    const courseId = req.query.courseId;

    // Build query based on user role
    let query = { isActive: true };

    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students can only see assignments from courses they're enrolled in
      const courses = await Course.find({ 
        enrolledStudents: req.user.id, 
        isActive: true 
      }).select('_id');
      query.courseId = { $in: courses.map(c => c._id) };
    }

    if (courseId) {
      query.courseId = courseId;
    }

    // Execute query with pagination
    const assignments = await Assignment.find(query)
      .populate('courseId', 'name subjectCode')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Assignment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // For students, include submission status
    if (req.user.role === 'student') {
      const assignmentIds = assignments.map(a => a._id);
      const submissions = await Submission.find({
        assignmentId: { $in: assignmentIds },
        studentId: req.user.id
      });

      const submissionMap = {};
      submissions.forEach(sub => {
        submissionMap[sub.assignmentId.toString()] = sub;
      });

      assignments.forEach(assignment => {
        assignment._doc.submission = submissionMap[assignment._id.toString()] || null;
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: assignments
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
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

    let query = { _id: req.params.id, isActive: true };

    // Role-based access control
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students can only access assignments from courses they're enrolled in
      const courses = await Course.find({ 
        enrolledStudents: req.user.id, 
        isActive: true 
      }).select('_id');
      query.courseId = { $in: courses.map(c => c._id) };
    }

    const assignment = await Assignment.findOne(query)
      .populate('courseId', 'name subjectCode enrolledStudents')
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    // Include submission statistics for teachers
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      const stats = await assignment.getSubmissionStats();
      assignment._doc.submissionStats = stats;
    }

    // Include student's submission if student
    if (req.user.role === 'student') {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id
      });
      assignment._doc.submission = submission;
    }

    res.status(200).json({
      success: true,
      data: assignment
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Teacher/Admin
router.post('/', authorize('teacher', 'admin'), upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      dueDate,
      totalMarks,
      assignmentType,
      instructions,
      allowLateSubmission,
      lateSubmissionPenalty
    } = req.body;

    // Validate course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Teachers can only create assignments for their own courses
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create assignments for your own courses.'
      });
    }

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileURL: `/uploads/${file.filename}`
    })) : [];

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      createdBy: req.user.id,
      dueDate: new Date(dueDate),
      totalMarks: parseInt(totalMarks),
      assignmentType: assignmentType || 'assignment',
      instructions,
      attachments,
      allowLateSubmission: allowLateSubmission === 'true',
      lateSubmissionPenalty: parseInt(lateSubmissionPenalty) || 10
    });

    await assignment.populate('courseId', 'name subjectCode');
    await assignment.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher/Admin
router.put('/:id', authorize('teacher', 'admin'), validateObjectId('id'), upload.array('attachments', 5), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let query = { _id: req.params.id, isActive: true };

    // Teachers can only update their own assignments
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }

    const assignment = await Assignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    const {
      title,
      description,
      dueDate,
      totalMarks,
      assignmentType,
      instructions,
      allowLateSubmission,
      lateSubmissionPenalty
    } = req.body;

    // Update fields
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = new Date(dueDate);
    if (totalMarks !== undefined) assignment.totalMarks = parseInt(totalMarks);
    if (assignmentType !== undefined) assignment.assignmentType = assignmentType;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (allowLateSubmission !== undefined) assignment.allowLateSubmission = allowLateSubmission === 'true';
    if (lateSubmissionPenalty !== undefined) assignment.lateSubmissionPenalty = parseInt(lateSubmissionPenalty);

    // Add new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        fileURL: `/uploads/${file.filename}`
      }));
      assignment.attachments.push(...newAttachments);
    }

    await assignment.save();
    await assignment.populate('courseId', 'name subjectCode');
    await assignment.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete assignment (soft delete)
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher/Admin
router.delete('/:id', authorize('teacher', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let query = { _id: req.params.id, isActive: true };

    // Teachers can only delete their own assignments
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }

    const assignment = await Assignment.findOne(query);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    // Soft delete
    assignment.isActive = false;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
