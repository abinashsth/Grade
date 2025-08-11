const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student'])
    .withMessage('Role must be admin, teacher, or student')
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for course creation
 */
const validateCourseCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
  
  body('subjectCode')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Subject code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Subject code can only contain uppercase letters and numbers'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  
  body('teacherId')
    .isMongoId()
    .withMessage('Please provide a valid teacher ID'),
  
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  
  body('semester')
    .isIn(['Fall', 'Spring', 'Summer'])
    .withMessage('Semester must be Fall, Spring, or Summer'),
  
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Maximum students must be between 1 and 200'),
  
  body('gradingSchema')
    .optional()
    .isIn(['letter', 'percentage', 'gpa'])
    .withMessage('Grading schema must be letter, percentage, or gpa')
];

/**
 * Validation rules for grade creation
 */
const validateGradeCreation = [
  body('studentId')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
  
  body('courseId')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  
  body('assignmentName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Assignment name must be between 1 and 100 characters'),
  
  body('assignmentType')
    .isIn(['exam', 'quiz', 'assignment', 'project', 'participation', 'final'])
    .withMessage('Assignment type must be exam, quiz, assignment, project, participation, or final'),
  
  body('gradeType')
    .isIn(['letter', 'percentage', 'gpa'])
    .withMessage('Grade type must be letter, percentage, or gpa'),
  
  body('maxPoints')
    .isFloat({ min: 1 })
    .withMessage('Maximum points must be at least 1'),
  
  body('earnedPoints')
    .isFloat({ min: 0 })
    .withMessage('Earned points cannot be negative'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Weight must be between 0 and 100'),
  
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot be more than 500 characters'),
  
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot be more than 1000 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`)
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['name', 'email', 'createdAt', 'updatedAt', '-name', '-email', '-createdAt', '-updatedAt'])
    .withMessage('Sort field is not valid')
];

/**
 * Custom validation for grade values based on grade type
 */
const validateGradeValue = (req, res, next) => {
  const { gradeType, grade } = req.body;
  
  if (gradeType === 'letter' && grade.letter) {
    const validLetterGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
    if (!validLetterGrades.includes(grade.letter)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid letter grade'
      });
    }
  }
  
  if (gradeType === 'percentage' && grade.percentage !== undefined) {
    if (grade.percentage < 0 || grade.percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage must be between 0 and 100'
      });
    }
  }
  
  if (gradeType === 'gpa' && grade.gpa !== undefined) {
    if (grade.gpa < 0 || grade.gpa > 4.0) {
      return res.status(400).json({
        success: false,
        message: 'GPA must be between 0 and 4.0'
      });
    }
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCourseCreation,
  validateGradeCreation,
  validateObjectId,
  validatePagination,
  validateGradeValue
};
