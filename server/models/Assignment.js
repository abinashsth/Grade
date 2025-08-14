const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1'],
    max: [1000, 'Total marks cannot exceed 1000']
  },
  assignmentType: {
    type: String,
    enum: ['assignment', 'project', 'quiz', 'exam', 'final'],
    default: 'assignment'
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileURL: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  lateSubmissionPenalty: {
    type: Number,
    min: [0, 'Penalty cannot be negative'],
    max: [100, 'Penalty cannot exceed 100%'],
    default: 10 // 10% penalty per day late
  }
}, {
  timestamps: true
});

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for days until due
assignmentSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for better query performance
assignmentSchema.index({ courseId: 1, dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });

// Pre-save middleware to validate creator is course teacher
assignmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('courseId') || this.isModified('createdBy')) {
    try {
      const Course = mongoose.model('Course');
      const course = await Course.findById(this.courseId);
      
      if (!course) {
        return next(new Error('Course not found'));
      }
      
      if (!course.teacherId.equals(this.createdBy)) {
        return next(new Error('Only the assigned teacher can create assignments for this course'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to find assignments by course
assignmentSchema.statics.findByCourse = function(courseId, includeInactive = false) {
  const query = { courseId };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query)
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });
};

// Static method to find assignments by teacher
assignmentSchema.statics.findByTeacher = function(teacherId) {
  return this.find({ createdBy: teacherId, isActive: true })
    .populate('courseId', 'name subjectCode')
    .sort({ dueDate: 1 });
};

// Method to get submission statistics
assignmentSchema.methods.getSubmissionStats = async function() {
  const Submission = mongoose.model('Submission');
  const Course = mongoose.model('Course');
  
  const course = await Course.findById(this.courseId);
  const totalStudents = course.enrolledStudents.length;
  
  const submissions = await Submission.find({ assignmentId: this._id });
  const submittedCount = submissions.length;
  const onTimeCount = submissions.filter(s => s.submittedAt <= this.dueDate).length;
  const lateCount = submittedCount - onTimeCount;
  
  return {
    totalStudents,
    submittedCount,
    pendingCount: totalStudents - submittedCount,
    onTimeCount,
    lateCount,
    submissionRate: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0
  };
};

module.exports = mongoose.model('Assignment', assignmentSchema);
