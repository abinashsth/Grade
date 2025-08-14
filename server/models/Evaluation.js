const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
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
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Evaluator ID is required']
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: [true, 'Semester is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  // Component scores
  components: {
    assignments: {
      totalPossible: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      weight: { type: Number, default: 40 },
      weightedScore: { type: Number, default: 0 }
    },
    attendance: {
      totalClasses: { type: Number, default: 0 },
      attendedClasses: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      weight: { type: Number, default: 20 },
      weightedScore: { type: Number, default: 0 }
    },
    exams: {
      totalPossible: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      weight: { type: Number, default: 40 },
      weightedScore: { type: Number, default: 0 }
    }
  },
  // Final calculated grade
  finalGrade: {
    percentage: { type: Number, default: 0 },
    letterGrade: { type: String, default: 'F' },
    gpa: { type: Number, default: 0.0 }
  },
  // Additional evaluation criteria
  additionalCriteria: [{
    name: { type: String, required: true },
    description: { type: String },
    maxPoints: { type: Number, required: true },
    earnedPoints: { type: Number, required: true },
    weight: { type: Number, default: 0 }
  }],
  // Teacher comments and feedback
  feedback: {
    strengths: { type: String, maxlength: 1000 },
    areasForImprovement: { type: String, maxlength: 1000 },
    overallComments: { type: String, maxlength: 2000 },
    recommendations: { type: String, maxlength: 1000 }
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'published'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for overall weighted score
evaluationSchema.virtual('overallWeightedScore').get(function() {
  const components = this.components;
  return components.assignments.weightedScore + 
         components.attendance.weightedScore + 
         components.exams.weightedScore;
});

// Index for better query performance
evaluationSchema.index({ studentId: 1, courseId: 1, semester: 1, year: 1 }, { unique: true });
evaluationSchema.index({ courseId: 1, semester: 1, year: 1 });
evaluationSchema.index({ evaluatedBy: 1 });

// Pre-save middleware to validate relationships
evaluationSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('studentId') || this.isModified('courseId')) {
      const User = mongoose.model('User');
      const Course = mongoose.model('Course');
      
      // Validate student
      const student = await User.findById(this.studentId);
      if (!student || student.role !== 'student') {
        return next(new Error('Invalid student ID'));
      }
      
      // Validate course and enrollment
      const course = await Course.findById(this.courseId);
      if (!course) {
        return next(new Error('Course not found'));
      }
      
      if (!course.enrolledStudents.includes(this.studentId)) {
        return next(new Error('Student is not enrolled in this course'));
      }
      
      // Validate evaluator is the course teacher
      if (!course.teacherId.equals(this.evaluatedBy)) {
        return next(new Error('Only the assigned teacher can evaluate students in this course'));
      }
      
      // Set semester and year from course if not provided
      if (!this.semester) this.semester = course.semester;
      if (!this.year) this.year = course.year;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to calculate and update all scores
evaluationSchema.methods.calculateScores = async function() {
  const Grade = mongoose.model('Grade');
  const Course = mongoose.model('Course');
  
  const course = await Course.findById(this.courseId);
  if (!course) throw new Error('Course not found');
  
  // Get all grades for this student in this course
  const grades = await Grade.find({
    studentId: this.studentId,
    courseId: this.courseId
  });
  
  // Calculate assignment scores
  const assignmentGrades = grades.filter(g => 
    ['assignment', 'project', 'quiz'].includes(g.assignmentType)
  );
  
  if (assignmentGrades.length > 0) {
    const totalPossible = assignmentGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const totalEarned = assignmentGrades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    
    this.components.assignments.totalPossible = totalPossible;
    this.components.assignments.totalEarned = totalEarned;
    this.components.assignments.percentage = Math.round(percentage * 100) / 100;
    this.components.assignments.weight = course.evaluationWeights.assignments;
    this.components.assignments.weightedScore = Math.round((percentage * course.evaluationWeights.assignments / 100) * 100) / 100;
  }
  
  // Calculate exam scores
  const examGrades = grades.filter(g => 
    ['exam', 'final'].includes(g.assignmentType)
  );
  
  if (examGrades.length > 0) {
    const totalPossible = examGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const totalEarned = examGrades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    
    this.components.exams.totalPossible = totalPossible;
    this.components.exams.totalEarned = totalEarned;
    this.components.exams.percentage = Math.round(percentage * 100) / 100;
    this.components.exams.weight = course.evaluationWeights.exams;
    this.components.exams.weightedScore = Math.round((percentage * course.evaluationWeights.exams / 100) * 100) / 100;
  }
  
  // Calculate attendance
  const attendancePercentage = course.calculateAttendancePercentage(this.studentId);
  const studentAttendance = course.attendance.filter(
    record => record.studentId.toString() === this.studentId.toString()
  );
  
  this.components.attendance.totalClasses = studentAttendance.length;
  this.components.attendance.attendedClasses = studentAttendance.filter(
    record => record.status === 'Present' || record.status === 'Late'
  ).length;
  this.components.attendance.percentage = attendancePercentage;
  this.components.attendance.weight = course.evaluationWeights.attendance;
  this.components.attendance.weightedScore = Math.round((attendancePercentage * course.evaluationWeights.attendance / 100) * 100) / 100;
  
  // Calculate final grade
  const finalPercentage = this.overallWeightedScore;
  this.finalGrade.percentage = Math.round(finalPercentage * 100) / 100;
  this.finalGrade.letterGrade = this.calculateLetterGrade(finalPercentage);
  this.finalGrade.gpa = this.calculateGPA(finalPercentage);
  
  this.lastCalculated = new Date();
  
  return this;
};

// Method to calculate letter grade from percentage
evaluationSchema.methods.calculateLetterGrade = function(percentage) {
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
};

// Method to calculate GPA from percentage
evaluationSchema.methods.calculateGPA = function(percentage) {
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
};

// Method to calculate and update all scores
evaluationSchema.methods.calculateScores = async function() {
  const Grade = mongoose.model('Grade');
  const Course = mongoose.model('Course');

  const course = await Course.findById(this.courseId);
  if (!course) throw new Error('Course not found');

  // Get all grades for this student in this course
  const grades = await Grade.find({
    studentId: this.studentId,
    courseId: this.courseId
  });

  // Calculate assignment scores
  const assignmentGrades = grades.filter(g =>
    ['assignment', 'project', 'quiz'].includes(g.assignmentType)
  );

  if (assignmentGrades.length > 0) {
    const totalPossible = assignmentGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const totalEarned = assignmentGrades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    this.components.assignments.totalPossible = totalPossible;
    this.components.assignments.totalEarned = totalEarned;
    this.components.assignments.percentage = Math.round(percentage * 100) / 100;
    this.components.assignments.weight = course.evaluationWeights.assignments;
    this.components.assignments.weightedScore = Math.round((percentage * course.evaluationWeights.assignments / 100) * 100) / 100;
  }

  // Calculate exam scores
  const examGrades = grades.filter(g =>
    ['exam', 'final'].includes(g.assignmentType)
  );

  if (examGrades.length > 0) {
    const totalPossible = examGrades.reduce((sum, g) => sum + g.maxPoints, 0);
    const totalEarned = examGrades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    this.components.exams.totalPossible = totalPossible;
    this.components.exams.totalEarned = totalEarned;
    this.components.exams.percentage = Math.round(percentage * 100) / 100;
    this.components.exams.weight = course.evaluationWeights.exams;
    this.components.exams.weightedScore = Math.round((percentage * course.evaluationWeights.exams / 100) * 100) / 100;
  }

  // Calculate attendance
  const attendancePercentage = course.calculateAttendancePercentage(this.studentId);
  const studentAttendance = course.attendance.filter(
    record => record.studentId.toString() === this.studentId.toString()
  );

  this.components.attendance.totalClasses = studentAttendance.length;
  this.components.attendance.attendedClasses = studentAttendance.filter(
    record => record.status === 'Present' || record.status === 'Late'
  ).length;
  this.components.attendance.percentage = attendancePercentage;
  this.components.attendance.weight = course.evaluationWeights.attendance;
  this.components.attendance.weightedScore = Math.round((attendancePercentage * course.evaluationWeights.attendance / 100) * 100) / 100;

  // Calculate final grade
  const finalPercentage = this.overallWeightedScore;
  this.finalGrade.percentage = Math.round(finalPercentage * 100) / 100;
  this.finalGrade.letterGrade = this.calculateLetterGrade(finalPercentage);
  this.finalGrade.gpa = this.calculateGPA(finalPercentage);

  this.lastCalculated = new Date();

  return this;
};

// Static method to find evaluations by student
evaluationSchema.statics.findByStudent = function(studentId, courseId = null) {
  const query = { studentId };
  if (courseId) query.courseId = courseId;
  
  return this.find(query)
    .populate('courseId', 'name subjectCode semester year')
    .populate('evaluatedBy', 'name email')
    .sort({ year: -1, semester: -1 });
};

// Static method to find evaluations by course
evaluationSchema.statics.findByCourse = function(courseId, semester = null, year = null) {
  const query = { courseId };
  if (semester) query.semester = semester;
  if (year) query.year = year;
  
  return this.find(query)
    .populate('studentId', 'name email')
    .populate('evaluatedBy', 'name email')
    .sort({ 'finalGrade.percentage': -1 });
};

module.exports = mongoose.model('Evaluation', evaluationSchema);
