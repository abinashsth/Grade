
const express = require('express');
const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Grade = require('../models/Grade');
const { protect, authorize } = require('../middleware/auth');
const { validateCourseCreation, validateObjectId, validatePagination } = require('../utils/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

const { upload } = require('../middleware/upload');

// @desc    Get all courses with role-based filtering
// @route   GET /api/courses
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
    const semester = req.query.semester;
    const year = req.query.year;
    const search = req.query.search;

    // Build query based on user role
    let query = { isActive: true };

    if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      query.enrolledStudents = req.user.id;
    }
    // Admin can see all courses

    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('teacherId', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: courses
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get single course by ID
// @route   GET /api/courses/:id
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
      query.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      query.enrolledStudents = req.user.id;
    }
    // Admin can access any course

    const course = await Course.findOne(query)
      .populate('teacherId', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', authorize('admin', 'teacher'), (req, res, next) => { if (req.user.role === 'teacher') { req.body.teacherId = req.user.id; } next(); }, validateCourseCreation, async (req, res) => {
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
      name,
      subjectCode,
      description,
      teacherId,
      credits,
      semester,
      year,
      maxStudents,
      gradingSchema
    } = req.body;

    // Determine teacher assignment: teachers can only assign themselves
    const assignedTeacherId = (req.user.role === 'teacher') ? req.user.id : teacherId;

    // Check if course with same subject code already exists
    const existingCourse = await Course.findOne({ subjectCode: subjectCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this subject code already exists'
      });
    }

    // Verify teacher exists and has correct role
    const teacher = await User.findById(assignedTeacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or user is not a teacher'
      });
    }

    // Create course
    const course = await Course.create({
      name,
      subjectCode: subjectCode.toUpperCase(),
      description,
      teacherId: assignedTeacherId,
      credits,
      semester,
      year,
      maxStudents,
      gradingSchema
    });

    // Add course to teacher's assigned courses
    if (!teacher.assignedCourses.includes(course._id)) {
      teacher.assignedCourses.push(course._id);
      await teacher.save();
    }

    await course.populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin or Teacher (own course)
router.put('/:id', authorize('admin', 'teacher'), validateObjectId('id'), async (req, res) => {
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
      name,
      subjectCode,
      description,
      teacherId,
      credits,
      semester,
      year,
      maxStudents,
      gradingSchema,
      isActive
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    // Teachers can only update their own course
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if subject code is being changed and if it already exists
    if (subjectCode && subjectCode.toUpperCase() !== course.subjectCode) {
      const existingCourse = await Course.findOne({ subjectCode: subjectCode.toUpperCase() });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this subject code already exists'
        });
      }
    }

    // If teacher is being changed, verify the new teacher
    if (teacherId && !teacherId.equals(course.teacherId)) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID or user is not a teacher'
        });
      }

      // Remove course from old teacher's assigned courses
      const oldTeacher = await User.findById(course.teacherId);
      if (oldTeacher) {
        oldTeacher.assignedCourses = oldTeacher.assignedCourses.filter(
          courseId => !courseId.equals(course._id)
        );
        await oldTeacher.save();
      }

      // Add course to new teacher's assigned courses
      if (!teacher.assignedCourses.includes(course._id)) {
        teacher.assignedCourses.push(course._id);
        await teacher.save();
      }
    }

    // Update fields
    if (name) course.name = name;
    if (subjectCode) course.subjectCode = subjectCode.toUpperCase();
    if (description !== undefined) course.description = description;
    if (teacherId) course.teacherId = teacherId;
    if (credits) course.credits = credits;
    if (semester) course.semester = semester;
    if (year) course.year = year;
    if (maxStudents) course.maxStudents = maxStudents;
    if (gradingSchema) course.gradingSchema = gradingSchema;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    await course.populate('teacherId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private/Admin or Teacher (own course)
router.delete('/:id', authorize('admin', 'teacher'), validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Teachers can only delete their own course
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Soft delete - set isActive to false
    course.isActive = false;
    await course.save();

    // Remove course from teacher's assigned courses
    const teacher = await User.findById(course.teacherId);
    if (teacher) {
      teacher.assignedCourses = teacher.assignedCourses.filter(
        courseId => !courseId.equals(course._id)
      );
      await teacher.save();
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
// ===== Attachments =====
// Upload attachment to a course (teacher own or admin)
router.post('/:id/attachments', authorize('admin','teacher'), validateObjectId('id'), upload.single('file'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    course.attachments = course.attachments || [];
    course.attachments.push(url);
    await course.save();
    res.status(201).json({ success: true, message: 'File uploaded', url, attachments: course.attachments });
  } catch (err) {
    console.error('Upload attachment error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Remove attachment by URL
router.delete('/:id/attachments', authorize('admin','teacher'), validateObjectId('id'), async (req, res) => {
  try {
    const { url } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    course.attachments = (course.attachments || []).filter(a => a !== url);
    await course.save();
    res.status(200).json({ success: true, message: 'Attachment removed', attachments: course.attachments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// ===== Assignments =====
// Create assignment (teacher or admin)
router.post('/:id/assignments', authorize('admin','teacher'), validateObjectId('id'), upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const fileURL = req.file ? `/uploads/${req.file.filename}` : undefined;
    const assignment = { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, fileURL };
    course.assignments = course.assignments || [];
    course.assignments.push(assignment);
    await course.save();
    res.status(201).json({ success: true, message: 'Assignment created', assignments: course.assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Update assignment by index
router.put('/:id/assignments/:idx', authorize('admin','teacher'), validateObjectId('id'), upload.single('file'), async (req, res) => {
  try {
    const { idx } = req.params;
    const { title, description, dueDate } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const i = parseInt(idx);
    if (!course.assignments || !course.assignments[i]) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const a = course.assignments[i];
    if (title !== undefined) a.title = title;
    if (description !== undefined) a.description = description;
    if (dueDate !== undefined) a.dueDate = new Date(dueDate);
    if (req.file) a.fileURL = `/uploads/${req.file.filename}`;
    await course.save();
    res.status(200).json({ success: true, message: 'Assignment updated', assignment: a, assignments: course.assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Delete assignment by index
router.delete('/:id/assignments/:idx', authorize('admin','teacher'), validateObjectId('id'), async (req, res) => {
  try {
    const { idx } = req.params;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const i = parseInt(idx);
    if (!course.assignments || !course.assignments[i]) return res.status(404).json({ success: false, message: 'Assignment not found' });
    course.assignments.splice(i, 1);
    await course.save();
    res.status(200).json({ success: true, message: 'Assignment removed', assignments: course.assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// ===== Attendance =====
// Mark attendance (teacher/admin)
router.post('/:id/attendance', authorize('admin','teacher'), validateObjectId('id'), async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const rec = { studentId, date: new Date(date), status };
    course.attendance = course.attendance || [];
    // upsert by studentId + date (day)
    const sameDay = (a,b)=> a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
    const existing = course.attendance.find(x => String(x.studentId)===String(studentId) && sameDay(new Date(x.date), rec.date));
    if (existing) {
      existing.status = status;
    } else {
      course.attendance.push(rec);
    }
    await course.save();
    res.status(200).json({ success: true, message: 'Attendance recorded', attendance: course.attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get attendance for a course (teacher/admin full, student own only)
router.get('/:id/attendance', validateObjectId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && !course.teacherId.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    let attendance = course.attendance || [];
    if (req.user.role === 'student') {
      attendance = attendance.filter(a => String(a.studentId) === String(req.user.id));
    }
    res.status(200).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

  }
});

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Admin, Teacher (own course) or Student (self-enrollment)
router.post('/:id/enroll', validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, studentEmail } = req.body || {};
    const courseId = req.params.id;

    // Find course and check status
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or inactive'
      });
    }

    // Determine which student to enroll and permissions
    let targetStudentId = null;
    if (req.user.role === 'student') {
      // self-enroll
      targetStudentId = req.user.id;
    } else if (req.user.role === 'admin') {
      // admin can enroll any student by id or email
      if (!studentId && !studentEmail) {
        return res.status(400).json({ success: false, message: 'studentId or studentEmail is required' });
      }
    } else if (req.user.role === 'teacher') {
      // teacher can enroll into their own course only
      if (String(course.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!studentId && !studentEmail) {
        return res.status(400).json({ success: false, message: 'studentId or studentEmail is required' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Lookup student if needed
    let student = null;
    if (!targetStudentId) {
      if (studentId) {
        student = await User.findById(studentId);
      } else if (studentEmail) {
        student = await User.findOne({ email: String(studentEmail).toLowerCase(), isActive: true });
      }
      if (!student || student.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Invalid student specified or user is not a student'
        });
      }
      targetStudentId = student._id;
    } else {
      student = await User.findById(targetStudentId);
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.includes(targetStudentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    // Check if course is full
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // Enroll student
    course.enrolledStudents.push(targetStudentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: {
        student: student?.name || 'Student',
        course: course.name,
        enrolledCount: course.enrolledStudents.length,
        availableSpots: course.maxStudents - course.enrolledStudents.length
      }
    });

  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Unenroll student from course
// @route   DELETE /api/courses/:id/enroll
// @access  Private/Admin, Teacher (own course) or Student (self-unenroll)
router.delete('/:id/enroll', validateObjectId('id'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { studentId, studentEmail } = req.body || {};
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let targetStudentId = null;
    if (req.user.role === 'student') {
      targetStudentId = req.user.id;
    } else if (req.user.role === 'admin') {
      // admin can pass id or email
      if (!studentId && !studentEmail) {
        return res.status(400).json({ success: false, message: 'studentId or studentEmail is required' });
      }
    } else if (req.user.role === 'teacher') {
      if (String(course.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (!studentId && !studentEmail) {
        return res.status(400).json({ success: false, message: 'studentId or studentEmail is required' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!targetStudentId) {
      let student = null;
      if (studentId) {
        student = await User.findById(studentId);
      } else if (studentEmail) {
        student = await User.findOne({ email: String(studentEmail).toLowerCase(), isActive: true });
      }
      if (!student || student.role !== 'student') {
        return res.status(400).json({ success: false, message: 'Invalid student specified or user is not a student' });
      }
      targetStudentId = student._id;
    }

    const before = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents
      .filter(id => id.toString() !== targetStudentId.toString());
    if (course.enrolledStudents.length === before) {
      return res.status(400).json({ success: false, message: 'Student is not enrolled in this course' });
    }

    await course.save();

    res.status(200).json({ success: true, message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;

