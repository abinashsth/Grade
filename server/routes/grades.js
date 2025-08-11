const express = require('express');
const { validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateGradeCreation, validateObjectId, validatePagination, validateGradeValue } = require('../utils/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all grades with role-based filtering
// @route   GET /api/grades
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
    const studentId = req.query.studentId;
    const assignmentType = req.query.assignmentType;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.gradedBy = req.user.id;
    }
    // Admin can see all grades

    if (courseId) query.courseId = courseId;
    if (studentId && req.user.role !== 'student') query.studentId = studentId;
    if (assignmentType) query.assignmentType = assignmentType;

    // Execute query with pagination
    const grades = await Grade.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode')
      .populate('gradedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Grade.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: grades.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: grades
    });

  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single grade by ID
// @route   GET /api/grades/:id
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
      query.gradedBy = req.user.id;
    }
    // Admin can access any grade

    const grade = await Grade.findOne(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode')
      .populate('gradedBy', 'name');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: grade
    });

  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create grade
// @route   POST /api/grades
// @access  Private/Teacher
router.post('/', authorize('teacher', 'admin'), validateGradeCreation, validateGradeValue, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      studentId,
      courseId,
      assignmentName,
      assignmentType,
      grade,
      gradeType,
      maxPoints,
      earnedPoints,
      weight,
      remarks,
      feedback,
      dueDate
    } = req.body;

    // Verify course exists and teacher has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if teacher is assigned to this course (unless admin)
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this course'
      });
    }

    // Verify student exists and is enrolled in the course
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID or user is not a student'
      });
    }

    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Check if grade already exists for this assignment
    const existingGrade = await Grade.findOne({
      studentId,
      courseId,
      assignmentName
    });

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this assignment. Use update instead.'
      });
    }

    // Validate earned points don't exceed max points
    if (earnedPoints > maxPoints) {
      return res.status(400).json({
        success: false,
        message: 'Earned points cannot exceed maximum points'
      });
    }

    // Create grade
    const newGrade = await Grade.create({
      studentId,
      courseId,
      gradedBy: req.user.id,
      assignmentName,
      assignmentType,
      grade,
      gradeType,
      maxPoints,
      earnedPoints,
      weight: weight || 1,
      remarks,
      feedback,
      dueDate
    });

    await newGrade.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'courseId', select: 'name subjectCode' },
      { path: 'gradedBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: newGrade
    });

  } catch (error) {
    console.error('Create grade error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this assignment'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Teacher
router.put('/:id', authorize('teacher', 'admin'), validateObjectId('id'), validateGradeValue, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      assignmentName,
      assignmentType,
      grade,
      gradeType,
      maxPoints,
      earnedPoints,
      weight,
      remarks,
      feedback,
      dueDate
    } = req.body;

    // Find the grade
    let query = { _id: req.params.id };

    // Teachers can only update grades they created
    if (req.user.role === 'teacher') {
      query.gradedBy = req.user.id;
    }

    const existingGrade = await Grade.findOne(query);
    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found or access denied'
      });
    }

    // Validate earned points don't exceed max points
    const newMaxPoints = maxPoints || existingGrade.maxPoints;
    const newEarnedPoints = earnedPoints !== undefined ? earnedPoints : existingGrade.earnedPoints;

    if (newEarnedPoints > newMaxPoints) {
      return res.status(400).json({
        success: false,
        message: 'Earned points cannot exceed maximum points'
      });
    }

    // Update fields
    if (assignmentName) existingGrade.assignmentName = assignmentName;
    if (assignmentType) existingGrade.assignmentType = assignmentType;
    if (grade) existingGrade.grade = grade;
    if (gradeType) existingGrade.gradeType = gradeType;
    if (maxPoints) existingGrade.maxPoints = maxPoints;
    if (earnedPoints !== undefined) existingGrade.earnedPoints = earnedPoints;
    if (weight) existingGrade.weight = weight;
    if (remarks !== undefined) existingGrade.remarks = remarks;
    if (feedback !== undefined) existingGrade.feedback = feedback;
    if (dueDate) existingGrade.dueDate = dueDate;

    await existingGrade.save();
    await existingGrade.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'courseId', select: 'name subjectCode' },
      { path: 'gradedBy', select: 'name' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      data: existingGrade
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Teacher
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

    // Find the grade
    let query = { _id: req.params.id };

    // Teachers can only delete grades they created
    if (req.user.role === 'teacher') {
      query.gradedBy = req.user.id;
    }

    const grade = await Grade.findOne(query);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found or access denied'
      });
    }

    await Grade.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get course average for a student
// @route   GET /api/grades/average/:studentId/:courseId
// @access  Private
router.get('/average/:studentId/:courseId',
  validateObjectId('studentId'),
  validateObjectId('courseId'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, courseId } = req.params;

    // Role-based access control
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'teacher') {
      // Verify teacher is assigned to this course
      const course = await Course.findById(courseId);
      if (!course || !course.teacherId.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const average = await Grade.calculateCourseAverage(studentId, courseId);

    if (average === null) {
      return res.status(404).json({
        success: false,
        message: 'No grades found for this student in this course'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        studentId,
        courseId,
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
        letterGrade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F'
      }
    });

  } catch (error) {
    console.error('Get course average error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
