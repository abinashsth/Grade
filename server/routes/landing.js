const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');

const router = express.Router();

// @desc    Get landing page statistics
// @route   GET /api/landing/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get public statistics for the landing page
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalGrades = await Grade.countDocuments();
    
    // Calculate some basic stats
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true 
    });
    
    const recentCourses = await Course.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalGrades,
        recentActivity: {
          newUsers: recentUsers,
          newCourses: recentCourses
        }
      }
    });

  } catch (error) {
    console.error('Landing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get testimonials/reviews
// @route   GET /api/landing/testimonials
// @access  Public
router.get('/testimonials', async (req, res) => {
  try {
    // Mock testimonials for now - in a real app, these would come from a database
    const testimonials = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        role: "Principal",
        school: "Lincoln High School",
        message: "GradePro has revolutionized how we manage student grades. The system is intuitive and saves us hours of administrative work.",
        rating: 5,
        avatar: "👩‍🏫"
      },
      {
        id: 2,
        name: "Michael Chen",
        role: "Mathematics Teacher",
        school: "Roosevelt Middle School",
        message: "The grade calculation features are fantastic. I can easily track student progress and generate detailed reports for parents.",
        rating: 5,
        avatar: "👨‍🏫"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        role: "Student",
        school: "Washington Elementary",
        message: "I love being able to check my grades anytime and see my progress. The interface is really user-friendly!",
        rating: 5,
        avatar: "👩‍🎓"
      }
    ];

    res.status(200).json({
      success: true,
      data: testimonials
    });

  } catch (error) {
    console.error('Landing testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get system announcements
// @route   GET /api/landing/announcements
// @access  Public
router.get('/announcements', async (req, res) => {
  try {
    // Mock announcements - in a real app, these would come from a database
    const announcements = [
      {
        id: 1,
        title: "New Feature: Bulk Grade Import",
        message: "Teachers can now import grades from CSV files for faster data entry.",
        date: new Date(),
        type: "feature"
      },
      {
        id: 2,
        title: "System Maintenance Scheduled",
        message: "Scheduled maintenance on Sunday, 2 AM - 4 AM EST. Minimal downtime expected.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        type: "maintenance"
      },
      {
        id: 3,
        title: "Welcome to GradePro 2.0",
        message: "Experience our enhanced interface and improved performance features.",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        type: "announcement"
      }
    ];

    res.status(200).json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('Landing announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Submit contact form
// @route   POST /api/landing/contact
// @access  Public
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // In a real application, you would:
    // 1. Save the contact form to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    console.log('Contact form submission:', { name, email, subject, message });

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get demo data for landing page
// @route   GET /api/landing/demo
// @access  Public
router.get('/demo', async (req, res) => {
  try {
    // Mock demo data showing what the system can do
    const demoData = {
      sampleGrades: [
        { subject: 'Mathematics', grade: 'A+', percentage: 95 },
        { subject: 'Science', grade: 'A', percentage: 92 },
        { subject: 'English', grade: 'B+', percentage: 87 },
        { subject: 'History', grade: 'A-', percentage: 90 }
      ],
      sampleCourses: [
        { name: 'Advanced Mathematics', students: 28, teacher: 'Dr. Smith' },
        { name: 'Physics 101', students: 32, teacher: 'Prof. Johnson' },
        { name: 'Literature', students: 25, teacher: 'Ms. Davis' }
      ],
      systemFeatures: [
        'Real-time grade updates',
        'Automated report generation',
        'Parent-teacher communication',
        'Mobile-friendly interface',
        'Secure data encryption',
        'Backup and recovery'
      ]
    };

    res.status(200).json({
      success: true,
      data: demoData
    });

  } catch (error) {
    console.error('Demo data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
