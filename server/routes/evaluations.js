const express = require('express');
const { validationResult } = require('express-validator');
const Evaluation = require('../models/Evaluation');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../utils/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get evaluations with filtering
// @route   GET /api/evaluations
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
    const semester = req.query.semester;
    const year = req.query.year;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user.id;
      query.isPublished = true; // Students can only see published evaluations
    } else if (req.user.role === 'teacher') {
      query.evaluatedBy = req.user.id;
    }

    if (courseId) query.courseId = courseId;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    // Execute query with pagination
    const evaluations = await Evaluation.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode')
      .populate('evaluatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Evaluation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: evaluations.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: evaluations
    });

  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single evaluation by ID
// @route   GET /api/evaluations/:id
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
      query.isPublished = true;
    } else if (req.user.role === 'teacher') {
      query.evaluatedBy = req.user.id;
    }

    const evaluation = await Evaluation.findOne(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'name subjectCode semester year evaluationWeights')
      .populate('evaluatedBy', 'name email');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });

  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create or update evaluation for a student
// @route   POST /api/evaluations
// @access  Private/Teacher/Admin
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, courseId, feedback, additionalCriteria } = req.body;

    // Validate course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Teachers can only create evaluations for their own courses
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create evaluations for your own courses.'
      });
    }

    // Check if evaluation already exists
    let evaluation = await Evaluation.findOne({
      studentId,
      courseId,
      semester: course.semester,
      year: course.year
    });

    if (evaluation) {
      // Update existing evaluation
      if (feedback) evaluation.feedback = { ...evaluation.feedback, ...feedback };
      if (additionalCriteria) evaluation.additionalCriteria = additionalCriteria;
      evaluation.evaluatedBy = req.user.id;
    } else {
      // Create new evaluation
      evaluation = new Evaluation({
        studentId,
        courseId,
        evaluatedBy: req.user.id,
        semester: course.semester,
        year: course.year,
        feedback: feedback || {},
        additionalCriteria: additionalCriteria || []
      });
    }

    // Calculate scores
    await evaluation.calculateScores();
    await evaluation.save();

    await evaluation.populate('studentId', 'name email');
    await evaluation.populate('courseId', 'name subjectCode');

    res.status(evaluation.isNew ? 201 : 200).json({
      success: true,
      message: evaluation.isNew ? 'Evaluation created successfully' : 'Evaluation updated successfully',
      data: evaluation
    });

  } catch (error) {
    console.error('Create/Update evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Teacher/Admin
router.put('/:id', authorize('teacher', 'admin'), validateObjectId('id'), async (req, res) => {
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

    // Teachers can only update their own evaluations
    if (req.user.role === 'teacher') {
      query.evaluatedBy = req.user.id;
    }

    const evaluation = await Evaluation.findOne(query);
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found or access denied'
      });
    }

    const { feedback, additionalCriteria, status } = req.body;

    // Update fields
    if (feedback) evaluation.feedback = { ...evaluation.feedback, ...feedback };
    if (additionalCriteria) evaluation.additionalCriteria = additionalCriteria;
    if (status) evaluation.status = status;

    // Recalculate scores
    await evaluation.calculateScores();
    await evaluation.save();

    await evaluation.populate('studentId', 'name email');
    await evaluation.populate('courseId', 'name subjectCode');

    res.status(200).json({
      success: true,
      message: 'Evaluation updated successfully',
      data: evaluation
    });

  } catch (error) {
    console.error('Update evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Publish evaluation
// @route   PUT /api/evaluations/:id/publish
// @access  Private/Teacher/Admin
router.put('/:id/publish', authorize('teacher', 'admin'), validateObjectId('id'), async (req, res) => {
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

    // Teachers can only publish their own evaluations
    if (req.user.role === 'teacher') {
      query.evaluatedBy = req.user.id;
    }

    const evaluation = await Evaluation.findOne(query);
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found or access denied'
      });
    }

    // Recalculate scores before publishing
    await evaluation.calculateScores();
    
    evaluation.isPublished = true;
    evaluation.publishedAt = new Date();
    evaluation.status = 'published';
    
    await evaluation.save();

    res.status(200).json({
      success: true,
      message: 'Evaluation published successfully',
      data: evaluation
    });

  } catch (error) {
    console.error('Publish evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
