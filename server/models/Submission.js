const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
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
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    maxlength: [5000, 'Submission content cannot exceed 5000 characters']
  },
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileURL: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  grade: {
    earnedPoints: {
      type: Number,
      min: [0, 'Earned points cannot be negative']
    },
    feedback: {
      type: String,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    }
  },
  resubmissionAllowed: {
    type: Boolean,
    default: false
  },
  resubmissionDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for calculated percentage
submissionSchema.virtual('calculatedPercentage').get(function() {
  if (!this.grade.earnedPoints) return null;
  
  // We need to populate assignment to get totalMarks
  if (this.assignmentId && this.assignmentId.totalMarks) {
    return Math.round((this.grade.earnedPoints / this.assignmentId.totalMarks) * 100);
  }
  return null;
});

// Virtual for letter grade
submissionSchema.virtual('letterGrade').get(function() {
  const percentage = this.calculatedPercentage;
  if (percentage === null) return null;
  
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

// Index for better query performance
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ courseId: 1, studentId: 1 });
submissionSchema.index({ studentId: 1, submittedAt: -1 });

// Pre-save middleware to validate relationships and set late status
submissionSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const Assignment = mongoose.model('Assignment');
      const Course = mongoose.model('Course');
      const User = mongoose.model('User');
      
      // Validate assignment exists
      const assignment = await Assignment.findById(this.assignmentId);
      if (!assignment) {
        return next(new Error('Assignment not found'));
      }
      
      // Validate course matches
      if (!assignment.courseId.equals(this.courseId)) {
        return next(new Error('Course ID does not match assignment course'));
      }
      
      // Validate student exists and is enrolled
      const student = await User.findById(this.studentId);
      if (!student || student.role !== 'student') {
        return next(new Error('Invalid student'));
      }
      
      const course = await Course.findById(this.courseId);
      if (!course || !course.enrolledStudents.includes(this.studentId)) {
        return next(new Error('Student is not enrolled in this course'));
      }
      
      // Set late status
      if (this.submittedAt > assignment.dueDate) {
        this.isLate = true;
        this.status = 'late';
      }
    }
    
    // Update status when graded
    if (this.isModified('grade.earnedPoints') && this.grade.earnedPoints !== undefined) {
      this.status = 'graded';
      this.grade.gradedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find submissions by student
submissionSchema.statics.findByStudent = function(studentId, courseId = null) {
  const query = { studentId };
  if (courseId) query.courseId = courseId;
  
  return this.find(query)
    .populate('assignmentId', 'title dueDate totalMarks assignmentType')
    .populate('courseId', 'name subjectCode')
    .sort({ submittedAt: -1 });
};

// Static method to find submissions by assignment
submissionSchema.statics.findByAssignment = function(assignmentId) {
  return this.find({ assignmentId })
    .populate('studentId', 'name email')
    .sort({ submittedAt: 1 });
};

// Static method to find submissions by course
submissionSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId })
    .populate('assignmentId', 'title dueDate totalMarks')
    .populate('studentId', 'name email')
    .sort({ submittedAt: -1 });
};

// Method to calculate late penalty
submissionSchema.methods.calculateLatePenalty = async function() {
  if (!this.isLate) return 0;
  
  const Assignment = mongoose.model('Assignment');
  const assignment = await Assignment.findById(this.assignmentId);
  
  if (!assignment || !assignment.allowLateSubmission) return 100; // 100% penalty if late submission not allowed
  
  const daysLate = Math.ceil((this.submittedAt - assignment.dueDate) / (1000 * 60 * 60 * 24));
  const penalty = Math.min(daysLate * assignment.lateSubmissionPenalty, 100);
  
  return penalty;
};

module.exports = mongoose.model('Submission', submissionSchema);
