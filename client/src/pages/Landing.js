import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      // Fetch statistics
      const statsResponse = await axios.get('/api/landing/stats');
      setStats(statsResponse.data.data);

      // Fetch testimonials
      const testimonialsResponse = await axios.get('/api/landing/testimonials');
      setTestimonials(testimonialsResponse.data.data);
    } catch (error) {
      console.error('Error fetching landing data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <HeroSection isAuthenticated={isAuthenticated} />

      {/* Statistics Section */}
      {stats && <StatsSection stats={stats} />}

      {/* About Section */}
      <AboutSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}

      {/* Call to Action */}
      <CTASection isAuthenticated={isAuthenticated} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

const HeroSection = ({ isAuthenticated }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Grade<span className="text-yellow-300">Pro</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-4 text-blue-100">
              Your smart academic grading and performance evaluation solution
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-2xl">
              Streamline your educational institution's grading process with our comprehensive, 
              role-based system designed for administrators, teachers, and students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition duration-500">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-100 rounded w-16 mt-2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-green-200 rounded w-full"></div>
                    <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                    <div className="h-3 bg-yellow-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-2xl font-bold text-green-600">A+</span>
                    <span className="text-sm text-gray-500">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ stats }) => {
  const statItems = [
    { label: 'Active Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
    { label: 'Students', value: stats.totalStudents, icon: '🎓', color: 'text-green-600' },
    { label: 'Teachers', value: stats.totalTeachers, icon: '👨‍🏫', color: 'text-purple-600' },
    { label: 'Courses', value: stats.totalCourses, icon: '📚', color: 'text-orange-600' },
    { label: 'Grades Recorded', value: stats.totalGrades, icon: '📝', color: 'text-red-600' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of schools already using GradePro
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-1`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm lg:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What is GradePro?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            GradePro is a comprehensive academic grading and evaluation system that revolutionizes 
            how educational institutions manage student performance, streamline grading processes, 
            and enhance communication between administrators, teachers, and students.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏫</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Schools</h3>
            <p className="text-gray-600">
              Centralized grade management, comprehensive reporting, and streamlined administrative processes.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Teachers</h3>
            <p className="text-gray-600">
              Efficient grade entry, automated calculations, and detailed student performance analytics.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Students</h3>
            <p className="text-gray-600">
              Real-time grade access, progress tracking, and transparent performance evaluation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: '🔐',
      title: 'Role-Based Access Control',
      description: 'Secure authentication with distinct permissions for Admins, Teachers, and Students.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: '🔒',
      title: 'JWT-Based Security',
      description: 'Industry-standard authentication ensuring data security and user privacy.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: '📚',
      title: 'Course Management',
      description: 'Create, organize, and manage courses with flexible grading schemas.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: '📊',
      title: 'Performance Tracking',
      description: 'Comprehensive analytics and reporting for student performance evaluation.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: '📄',
      title: 'Export Reports',
      description: 'Generate and export detailed grade reports in PDF and CSV formats.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: '🔔',
      title: 'Real-Time Updates',
      description: 'Instant notifications and updates for grade changes and announcements.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage academic grading efficiently and effectively.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = ({ testimonials }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Hear from educators and students who love using GradePro
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 hover:bg-opacity-20 transition duration-300">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-blue-200 text-sm">{testimonial.role}</p>
                  <p className="text-blue-300 text-xs">{testimonial.school}</p>
                </div>
              </div>
              <p className="text-blue-100 mb-4 leading-relaxed">"{testimonial.message}"</p>
              <div className="flex text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ isAuthenticated }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Ready to modernize your school's grading system?
        </h2>
        <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
          Join thousands of educators who trust GradePro for their academic evaluation needs.
        </p>
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Try GradePro Now
            </Link>
            <Link
              to="/login"
              className="border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Login to Your Account
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">GradePro</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering educational institutions with smart grading and evaluation solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition duration-300">About</Link></li>
              <li><Link to="/features" className="text-gray-400 hover:text-white transition duration-300">Features</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition duration-300">Contact</Link></li>
              <li><Link to="/documentation" className="text-gray-400 hover:text-white transition duration-300">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 GradePro. All rights reserved. Built with ❤️ for education.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Landing;
