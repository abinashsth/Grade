const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');

const router = express.Router();

// All analytics routes require admin
router.use(protect, authorize('admin'));

// @desc    System overview analytics
// @route   GET /api/analytics/overview
// @access  Private/Admin
router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, totalTeachers, totalStudents, totalAdmins, totalCourses, totalGrades] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      Course.countDocuments({ isActive: true }),
      Grade.countDocuments()
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, newCourses, recentGrades] = await Promise.all([
      User.find({ createdAt: { $gte: thirtyDaysAgo } }).sort('-createdAt').limit(10),
      Course.find({ createdAt: { $gte: thirtyDaysAgo } }).sort('-createdAt').limit(10),
      Grade.find({ createdAt: { $gte: thirtyDaysAgo } }).sort('-createdAt').limit(10)
    ]);

    const recentActivity = [
      ...newUsers.map(u => ({ id: `user-${u._id}`, icon: '👤', title: `New user: ${u.name}`, date: u.createdAt })),
      ...newCourses.map(c => ({ id: `course-${c._id}`, icon: '📚', title: `New course: ${c.name}`, date: c.createdAt })),
      ...recentGrades.map(g => ({ id: `grade-${g._id}`, icon: '📝', title: `Grade recorded for assignment ${g.assignmentName}`, date: g.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalTeachers,
          totalStudents,
          totalAdmins,
          totalCourses,
          totalGrades
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
