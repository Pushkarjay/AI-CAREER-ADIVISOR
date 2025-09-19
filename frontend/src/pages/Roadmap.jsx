import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

const Roadmap = () => {
  const [contentType, setContentType] = useState('html'); // 'html' or 'pdf'

  // Enhanced HTML content
  const htmlContent = `
    <div class="prose prose-lg max-w-none">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8 text-center">
        <h1 class="text-3xl font-bold text-white mb-4">🚀 Accelerate Your Career Journey</h1>
        <p class="text-blue-100 text-lg">Your personalized roadmap to success starts here. Follow this guide to unlock your full potential.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span class="mr-3">🎯</span>
            Immediate Action Items
          </h2>
          
          <div class="space-y-6">
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">Skill Development</h3>
              <ul class="text-blue-800 space-y-1 text-sm">
                <li>• Complete identified skill gaps through online courses</li>
                <li>• Practice coding/technical skills daily (30 min/day)</li>
                <li>• Build 2-3 portfolio projects showcasing new skills</li>
                <li>• Contribute to open-source projects weekly</li>
              </ul>
            </div>
            
            <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <h3 class="text-lg font-semibold text-green-900 mb-2">Professional Networking</h3>
              <ul class="text-green-800 space-y-1 text-sm">
                <li>• Update LinkedIn with latest skills and projects</li>
                <li>• Join 3 professional communities in your field</li>
                <li>• Attend 1 industry event/webinar per week</li>
                <li>• Connect with 5 professionals monthly</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span class="mr-3">📚</span>
            Learning Roadmap
          </h2>
          
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-yellow-900 mb-2">📅 Month 1-2: Foundation</h3>
              <ul class="text-yellow-800 space-y-1 text-sm">
                <li>• Complete core skill assessments</li>
                <li>• Start fundamental courses in target areas</li>
                <li>• Set up development environment</li>
                <li>• Create and stick to learning schedule</li>
              </ul>
            </div>
            
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-orange-900 mb-2">📅 Month 3-4: Practice</h3>
              <ul class="text-orange-800 space-y-1 text-sm">
                <li>• Build first portfolio project</li>
                <li>• Apply skills in real-world scenarios</li>
                <li>• Start networking activities</li>
                <li>• Join professional communities</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-purple-900 mb-2">📅 Month 5-6: Growth</h3>
              <ul class="text-purple-800 space-y-1 text-sm">
                <li>• Complete advanced certifications</li>
                <li>• Lead a project or team initiative</li>
                <li>• Mentor someone in your field</li>
                <li>• Start job application process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span class="mr-3">🎓</span>
          Top Learning Resources
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span class="mr-2">💻</span>
              Technical Skills
            </h3>
            <ul class="text-gray-700 space-y-2 text-sm">
              <li>• <strong>Coursera:</strong> University-level courses</li>
              <li>• <strong>Udemy:</strong> Practical project-based learning</li>
              <li>• <strong>Pluralsight:</strong> Technology skill paths</li>
              <li>• <strong>freeCodeCamp:</strong> Free coding bootcamp</li>
              <li>• <strong>Codecademy:</strong> Interactive coding lessons</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span class="mr-2">🏢</span>
              Business Skills
            </h3>
            <ul class="text-gray-700 space-y-2 text-sm">
              <li>• <strong>LinkedIn Learning:</strong> Professional skills</li>
              <li>• <strong>MasterClass:</strong> Leadership and communication</li>
              <li>• <strong>Harvard Business Review:</strong> Management courses</li>
              <li>• <strong>Skillshare:</strong> Creative and business skills</li>
              <li>• <strong>edX:</strong> Business strategy courses</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span class="mr-2">🌍</span>
              Industry-Specific
            </h3>
            <ul class="text-gray-700 space-y-2 text-sm">
              <li>• <strong>AWS Training:</strong> Cloud computing</li>
              <li>• <strong>Google Digital Garage:</strong> Digital marketing</li>
              <li>• <strong>Salesforce Trailhead:</strong> CRM and sales</li>
              <li>• <strong>HubSpot Academy:</strong> Inbound marketing</li>
              <li>• <strong>Microsoft Learn:</strong> Azure and Office 365</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span class="mr-3">💼</span>
            Job Search Strategy
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Optimize Your Profile</h3>
                <p class="text-gray-600 text-sm">Update LinkedIn, GitHub, and portfolio with latest projects</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Target Applications</h3>
                <p class="text-gray-600 text-sm">Apply to 5-10 quality positions per week, not quantity</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Follow Up</h3>
                <p class="text-gray-600 text-sm">Send personalized follow-up messages within 1 week</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span class="mr-3">📈</span>
            Success Metrics
          </h2>
          
          <div class="space-y-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <h3 class="font-semibold text-blue-900 mb-2">Weekly Goals</h3>
              <ul class="text-blue-800 text-sm space-y-1">
                <li>• 5 hours of skill development</li>
                <li>• 1 portfolio project milestone</li>
                <li>• 5 new professional connections</li>
                <li>• 3 job applications submitted</li>
              </ul>
            </div>
            
            <div class="bg-green-50 rounded-lg p-4">
              <h3 class="font-semibold text-green-900 mb-2">Monthly Targets</h3>
              <ul class="text-green-800 text-sm space-y-1">
                <li>• Complete 1 certification/course</li>
                <li>• Finish 1 major project</li>
                <li>• Attend 2 industry events</li>
                <li>• Get 5 interviews scheduled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
        <h2 class="text-2xl font-bold mb-4">🌟 Ready to Take Action?</h2>
        <p class="text-lg mb-6 text-green-100">Your career transformation starts with the first step. Use our tools to track progress and stay motivated.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/dashboard" class="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            📊 Go to Dashboard
          </a>
          <a href="/chat" class="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors">
            💬 Get AI Guidance
          </a>
        </div>
      </div>
    </div>
  `;

  return (
    <>
      <Navbar />
      {/* Desktop Layout - Full Window Width */}
      <div className="hidden lg:block px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Roadmap</h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Your personalized career development roadmap. Track your journey and plan your next steps.
            </p>
          </div>

          {/* Content Type Switcher */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <div className="px-6 py-3 bg-white text-blue-600 shadow-sm rounded-md text-sm font-medium flex items-center space-x-2">
                <EyeIcon className="w-4 h-4" />
                <span>Career Roadmap</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/dashboard"
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-xl text-white">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600">Track your progress and get recommendations</p>
                </div>
              </a>
              
              <a
                href="/chat"
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-xl text-white">💬</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Career Assistant</h3>
                  <p className="text-sm text-gray-600">Get personalized advice and guidance</p>
                </div>
              </a>
              
              <a
                href="/resume"
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-xl text-white">📄</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Resume Builder</h3>
                  <p className="text-sm text-gray-600">Upload and enhance your resume</p>
                </div>
              </a>
            </div>
        </div>
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Roadmap</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your personalized career development roadmap. Track your journey and plan your next steps.
            </p>
          </div>

          {/* Content Type Switcher */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <div className="px-6 py-3 bg-white text-blue-600 shadow-sm rounded-md text-sm font-medium flex items-center space-x-2">
                <EyeIcon className="w-4 h-4" />
                <span>Career Roadmap</span>
              </div>
            </div>
          </div>

          {/* Roadmap Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: roadmapContent }}
          />

          {/* Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/dashboard" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-600">Track your overall progress</p>
                  </div>
                </div>
              </a>

              <a href="/careers" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <BriefcaseIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Explore Careers</h3>
                    <p className="text-sm text-gray-600">Find roles that match your skills</p>
                  </div>
                </div>
              </a>

              <a href="/resume" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <DocumentIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Resume Builder</h3>
                    <p className="text-sm text-gray-600">Upload and enhance your resume</p>
                  </div>
                </div>
              </a>
            </div>
        </div>
      </div>
    </>
  );
};

export default Roadmap;