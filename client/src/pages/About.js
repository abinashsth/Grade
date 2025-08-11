import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            About GradePro
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Revolutionizing academic grading and evaluation systems for the digital age
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              At GradePro, we believe that effective grading and evaluation systems are the backbone 
              of quality education. Our mission is to empower educational institutions with modern, 
              efficient, and user-friendly tools that streamline the grading process while enhancing 
              transparency and communication between educators, students, and administrators.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
                <p className="text-gray-600">Streamline grading processes and reduce administrative burden</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-gray-600">Provide clear, accessible grade information for all stakeholders</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth</h3>
                <p className="text-gray-600">Enable data-driven insights for improved educational outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  GradePro was born from the frustration of educators who spent countless hours on 
                  manual grading processes, complex spreadsheets, and inefficient communication systems. 
                  Our founders, a team of educators and technologists, recognized the need for a 
                  comprehensive solution that could address these challenges.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  After extensive research and collaboration with schools worldwide, we developed 
                  GradePro as a modern, cloud-based platform that combines powerful functionality 
                  with intuitive design. Our goal was to create a system that teachers would love 
                  to use and students would find helpful for tracking their academic progress.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Today, GradePro serves educational institutions of all sizes, from small private 
                  schools to large university systems, helping them modernize their grading processes 
                  and improve educational outcomes.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Milestones</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">2023 - Project Inception</h4>
                      <p className="text-gray-600 text-sm">Initial research and development began</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">2024 - Beta Launch</h4>
                      <p className="text-gray-600 text-sm">First pilot programs with partner schools</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">2024 - Full Release</h4>
                      <p className="text-gray-600 text-sm">Public launch with comprehensive features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Meet the passionate educators and technologists behind GradePro
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Sarah Johnson",
                  role: "Co-Founder & CEO",
                  background: "Former Principal with 15+ years in education",
                  avatar: "👩‍💼"
                },
                {
                  name: "Michael Chen",
                  role: "Co-Founder & CTO",
                  background: "Full-stack developer and education technology expert",
                  avatar: "👨‍💻"
                },
                {
                  name: "Emily Rodriguez",
                  role: "Head of Product",
                  background: "UX designer focused on educational interfaces",
                  avatar: "👩‍🎨"
                },
                {
                  name: "David Kim",
                  role: "Lead Developer",
                  background: "Backend specialist with expertise in scalable systems",
                  avatar: "👨‍🔧"
                },
                {
                  name: "Lisa Thompson",
                  role: "Education Consultant",
                  background: "Curriculum specialist and teacher trainer",
                  avatar: "👩‍🏫"
                },
                {
                  name: "James Wilson",
                  role: "Customer Success",
                  background: "Dedicated to helping schools succeed with GradePro",
                  avatar: "👨‍💼"
                }
              ].map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition duration-300">
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.background}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">🎓 Education First</h3>
                <p className="text-blue-100">
                  Every decision we make is guided by what's best for educators and students. 
                  We prioritize educational outcomes over everything else.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">🔒 Privacy & Security</h3>
                <p className="text-blue-100">
                  We understand the sensitive nature of educational data and implement 
                  the highest standards of security and privacy protection.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">🚀 Innovation</h3>
                <p className="text-blue-100">
                  We continuously evolve our platform based on user feedback and 
                  emerging educational technologies to stay ahead of the curve.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8">
                <h3 className="text-2xl font-semibold mb-4">🤝 Community</h3>
                <p className="text-blue-100">
                  We believe in building strong relationships with our users and 
                  fostering a community of educators who support each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Grading System?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who have already made the switch to GradePro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
