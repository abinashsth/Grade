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
  // New CMS fields
  attachments: [{ type: String }], // file URLs
  assignments: [
    {
      title: { type: String, required: true },
      description: { type: String },
      dueDate: { type: Date },
      fileURL: { type: String },
      createdAt: { type: Date, default: Date.now }
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

// Pre-save middleware to validate teacher role
courseSchema.pre('save', async function(next) {
  if (this.isModified('teacherId')) {
    const User = mongoose.model('User');
    const teacher = await User.findById(this.teacherId);
    
    if (!teacher || teacher.role !== 'teacher') {
      const error = new Error('Assigned user must be a teacher');
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

module.exports = mongoose.model('Course', courseSchema);
