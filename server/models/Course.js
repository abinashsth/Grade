const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
    trim: true,
    maxlength: [100, 'Course name cannot be more than 100 characters']
  },
  subjectCode: {
    type: String,
    required: [true, 'Please provide a subject code'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Subject code cannot be more than 10 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a teacher to this course']
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  credits: {
    type: Number,
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot be more than 10'],
    default: 3
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: [true, 'Please specify the semester']
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year cannot be more than 2030']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 50,
    min: [1, 'Maximum students must be at least 1']
  },
  gradingSchema: {
    type: String,
    enum: ['letter', 'percentage', 'gpa'],
    default: 'letter'
  },
  // Evaluation weightage settings
  evaluationWeights: {
    assignments: {
      type: Number,
      min: [0, 'Assignment weight cannot be negative'],
      max: [100, 'Assignment weight cannot exceed 100'],
      default: 40
    },
    attendance: {
      type: Number,
      min: [0, 'Attendance weight cannot be negative'],
      max: [100, 'Attendance weight cannot exceed 100'],
      default: 20
    },
    exams: {
      type: Number,
      min: [0, 'Exam weight cannot be negative'],
      max: [100, 'Exam weight cannot exceed 100'],
      default: 40
    }
  },
  // Course schedule information
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: { type: String }, // Format: "HH:MM"
    endTime: { type: String },   // Format: "HH:MM"
    room: { type: String }
  },
  // New CMS fields
  attachments: [{ type: String }], // file URLs
  assignments: [
    {
      title: { type: String, required: true },
      description: { type: String },
      dueDate: { type: Date },
      totalMarks: { type: Number, default: 100, min: 1 },
      fileURL: { type: String },
      createdAt: { type: Date, default: Date.now },
      submissions: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submittedAt: { type: Date, default: Date.now },
        fileURL: { type: String },
        status: { type: String, enum: ['submitted', 'late', 'pending'], default: 'pending' }
      }]
    }
  ],
  attendance: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      date: { type: Date, required: true },
      status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
    }
  ]
}, {
  timestamps: true
});

// Virtual for enrolled student count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.enrolledStudents.length;
});

// Index for better query performance
courseSchema.index({ teacherId: 1 });
courseSchema.index({ subjectCode: 1 });
courseSchema.index({ semester: 1, year: 1 });

// Pre-save middleware to validate teacher role and evaluation weights
courseSchema.pre('save', async function(next) {
  if (this.isModified('teacherId')) {
    const User = mongoose.model('User');
    const teacher = await User.findById(this.teacherId);

    if (!teacher || teacher.role !== 'teacher') {
      const error = new Error('Assigned user must be a teacher');
      return next(error);
    }
  }

  // Validate evaluation weights sum to 100
  if (this.isModified('evaluationWeights')) {
    const weights = this.evaluationWeights;
    const total = weights.assignments + weights.attendance + weights.exams;
    if (total !== 100) {
      const error = new Error('Evaluation weights must sum to 100%');
      return next(error);
    }
  }

  next();
});

// Method to enroll a student
courseSchema.methods.enrollStudent = async function(studentId) {
  const User = mongoose.model('User');
  const student = await User.findById(studentId);
  
  if (!student || student.role !== 'student') {
    throw new Error('User must be a student to enroll');
  }
  
  if (this.enrolledStudents.includes(studentId)) {
    throw new Error('Student is already enrolled in this course');
  }
  
  if (this.enrolledStudents.length >= this.maxStudents) {
    throw new Error('Course is full');
  }
  
  this.enrolledStudents.push(studentId);
  return this.save();
};

// Method to remove a student
courseSchema.methods.removeStudent = function(studentId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    id => !id.equals(studentId)
  );
  return this.save();
};

// Static method to find courses by teacher
courseSchema.statics.findByTeacher = function(teacherId) {
  return this.find({ teacherId, isActive: true })
    .populate('teacherId', 'name email')
    .populate('enrolledStudents', 'name email');
};

// Static method to find courses by student
courseSchema.statics.findByStudent = function(studentId) {
  return this.find({ enrolledStudents: studentId, isActive: true })
    .populate('teacherId', 'name email');
};

// Method to calculate attendance percentage for a student
courseSchema.methods.calculateAttendancePercentage = function(studentId) {
  const studentAttendance = this.attendance.filter(
    record => record.studentId.toString() === studentId.toString()
  );

  if (studentAttendance.length === 0) return 0;

  const presentCount = studentAttendance.filter(
    record => record.status === 'Present' || record.status === 'Late'
  ).length;

  return Math.round((presentCount / studentAttendance.length) * 100);
};

// Method to calculate final grade for a student
courseSchema.methods.calculateFinalGrade = async function(studentId) {
  const Grade = mongoose.model('Grade');

  // Get all grades for this student in this course
  const grades = await Grade.find({
    studentId: studentId,
    courseId: this._id
  });

  // Calculate assignment average
  const assignmentGrades = grades.filter(g =>
    ['assignment', 'project', 'quiz'].includes(g.assignmentType)
  );
  const assignmentAvg = assignmentGrades.length > 0
    ? assignmentGrades.reduce((sum, g) => sum + g.calculatedPercentage, 0) / assignmentGrades.length
    : 0;

  // Calculate exam average
  const examGrades = grades.filter(g =>
    ['exam', 'final'].includes(g.assignmentType)
  );
  const examAvg = examGrades.length > 0
    ? examGrades.reduce((sum, g) => sum + g.calculatedPercentage, 0) / examGrades.length
    : 0;

  // Get attendance percentage
  const attendancePercentage = this.calculateAttendancePercentage(studentId);

  // Calculate weighted final grade
  const weights = this.evaluationWeights;
  const finalGrade = (
    (assignmentAvg * weights.assignments / 100) +
    (attendancePercentage * weights.attendance / 100) +
    (examAvg * weights.exams / 100)
  );

  return {
    finalGrade: Math.round(finalGrade * 100) / 100,
    components: {
      assignments: {
        average: Math.round(assignmentAvg * 100) / 100,
        weight: weights.assignments,
        contribution: Math.round((assignmentAvg * weights.assignments / 100) * 100) / 100
      },
      attendance: {
        percentage: attendancePercentage,
        weight: weights.attendance,
        contribution: Math.round((attendancePercentage * weights.attendance / 100) * 100) / 100
      },
      exams: {
        average: Math.round(examAvg * 100) / 100,
        weight: weights.exams,
        contribution: Math.round((examAvg * weights.exams / 100) * 100) / 100
      }
    }
  };
};

module.exports = mongoose.model('Course', courseSchema);
