const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Grader ID is required']
  },
  assignmentName: {
    type: String,
    required: [true, 'Assignment name is required'],
    trim: true,
    maxlength: [100, 'Assignment name cannot be more than 100 characters']
  },
  assignmentType: {
    type: String,
    enum: ['exam', 'quiz', 'assignment', 'project', 'participation', 'final'],
    required: [true, 'Assignment type is required']
  },
  grade: {
    letter: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
      required: function() { return this.gradeType === 'letter'; }
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot be more than 100'],
      required: function() { return this.gradeType === 'percentage'; }
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [4.0, 'GPA cannot be more than 4.0'],
      required: function() { return this.gradeType === 'gpa'; }
    }
  },
  gradeType: {
    type: String,
    enum: ['letter', 'percentage', 'gpa'],
    required: [true, 'Grade type is required']
  },
  maxPoints: {
    type: Number,
    min: [1, 'Maximum points must be at least 1'],
    required: [true, 'Maximum points is required']
  },
  earnedPoints: {
    type: Number,
    min: [0, 'Earned points cannot be negative'],
    required: [true, 'Earned points is required'],
    validate: {
      validator: function(value) {
        return value <= this.maxPoints;
      },
      message: 'Earned points cannot exceed maximum points'
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    max: [100, 'Weight cannot be more than 100'],
    default: 1
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot be more than 500 characters']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for calculated percentage
gradeSchema.virtual('calculatedPercentage').get(function() {
  return (this.earnedPoints / this.maxPoints) * 100;
});

// Virtual for letter grade conversion
gradeSchema.virtual('calculatedLetterGrade').get(function() {
  const percentage = this.calculatedPercentage;
  
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
});

// Virtual for GPA conversion
gradeSchema.virtual('calculatedGPA').get(function() {
  const percentage = this.calculatedPercentage;
  
  if (percentage >= 97) return 4.0;
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 67) return 1.3;
  if (percentage >= 60) return 1.0;
  return 0.0;
});

// Index for better query performance
gradeSchema.index({ studentId: 1, courseId: 1 });
gradeSchema.index({ courseId: 1 });
gradeSchema.index({ gradedBy: 1 });
gradeSchema.index({ assignmentType: 1 });

// Compound index for unique assignment per student per course
gradeSchema.index({ studentId: 1, courseId: 1, assignmentName: 1 }, { unique: true });

// Pre-save middleware to validate relationships
gradeSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const Course = mongoose.model('Course');
    
    // Validate student
    const student = await User.findById(this.studentId);
    if (!student || student.role !== 'student') {
      return next(new Error('Invalid student ID'));
    }
    
    // Validate course
    const course = await Course.findById(this.courseId);
    if (!course) {
      return next(new Error('Invalid course ID'));
    }
    
    // Validate grader is the course teacher
    if (!course.teacherId.equals(this.gradedBy)) {
      return next(new Error('Only the assigned teacher can grade this course'));
    }
    
    // Check if student is enrolled in the course
    if (!course.enrolledStudents.includes(this.studentId)) {
      return next(new Error('Student is not enrolled in this course'));
    }
    
    // Set late status if submission is after due date
    if (this.dueDate && this.submissionDate > this.dueDate) {
      this.isLate = true;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get grades by student
gradeSchema.statics.findByStudent = function(studentId, courseId = null) {
  const query = { studentId };
  if (courseId) query.courseId = courseId;
  
  return this.find(query)
    .populate('courseId', 'name subjectCode')
    .populate('gradedBy', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get grades by course
gradeSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId })
    .populate('studentId', 'name email')
    .populate('gradedBy', 'name')
    .sort({ studentId: 1, assignmentType: 1 });
};

// Static method to calculate course average for a student
gradeSchema.statics.calculateCourseAverage = async function(studentId, courseId) {
  const grades = await this.find({ studentId, courseId });
  
  if (grades.length === 0) return null;
  
  let totalWeightedPoints = 0;
  let totalWeight = 0;
  
  grades.forEach(grade => {
    const percentage = (grade.earnedPoints / grade.maxPoints) * 100;
    totalWeightedPoints += percentage * grade.weight;
    totalWeight += grade.weight;
  });
  
  return totalWeight > 0 ? totalWeightedPoints / totalWeight : 0;
};

module.exports = mongoose.model('Grade', gradeSchema);
