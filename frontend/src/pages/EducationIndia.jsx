import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { AcademicCapIcon, MapPinIcon, BookOpenIcon, UsersIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

const EducationIndia = () => {
  // Always show both in desktop: left PDF, right overview
  const [contentType, setContentType] = useState('overview'); // mobile switcher only

  return (
    <>
      <Navbar />
      {/* Desktop Layout - Two Columns: PDF | Overview */}
      <div className="hidden lg:block px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: PDF viewer (1 part) */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b text-sm font-semibold text-gray-800 flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                <span>Education Guide (PDF)</span>
              </div>
              <div style={{ height: '80vh' }}>
                <iframe
                  src="/What-Next.pdf"
                  className="w-full h-full border-0"
                  title="Education in India Detailed Guide"
                />
              </div>
            </div>
          </div>

          {/* Right: Overview static content (2 parts) */}
          <div className="col-span-2 space-y-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Education in India</h1>
              <p className="text-gray-600">Comprehensive guide to educational opportunities, institutions, and career pathways in India</p>
            </div>

            {/* Key Education Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
                <AcademicCapIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
                <p className="text-gray-600">Universities</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
                <BookOpenIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">40,000+</h3>
                <p className="text-gray-600">Colleges</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center">
                <UsersIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">38M+</h3>
                <p className="text-gray-600">Students</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 text-center">
                <MapPinIcon className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">28</h3>
                <p className="text-gray-600">States & UTs</p>
              </div>
            </div>

            {/* Popular Education Streams (reuse existing static) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Education Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">🔬 STEM Fields</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Computer Science & IT</li>
                    <li>• Engineering (Multiple Branches)</li>
                    <li>• Mathematics & Statistics</li>
                    <li>• Physics & Chemistry</li>
                    <li>• Biotechnology & Life Sciences</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-900 mb-4">💼 Business & Management</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• MBA & Management Studies</li>
                    <li>• Commerce & Accounting</li>
                    <li>• Economics</li>
                    <li>• Finance & Banking</li>
                    <li>• Entrepreneurship</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">🎨 Arts & Humanities</h3>
                  <ul className="space-y-2 text-purple-800">
                    <li>• Literature & Languages</li>
                    <li>• History & Archaeology</li>
                    <li>• Philosophy & Psychology</li>
                    <li>• Fine Arts & Design</li>
                    <li>• Social Sciences</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-red-900 mb-4">⚕️ Medical & Health</h3>
                  <ul className="space-y-2 text-red-800">
                    <li>• MBBS & Medical Sciences</li>
                    <li>• Nursing & Healthcare</li>
                    <li>• Pharmacy</li>
                    <li>• Dentistry</li>
                    <li>• Physiotherapy</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4">⚖️ Law & Governance</h3>
                  <ul className="space-y-2 text-yellow-800">
                    <li>• LLB & Legal Studies</li>
                    <li>• Public Administration</li>
                    <li>• Political Science</li>
                    <li>• International Relations</li>
                    <li>• Criminology</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4">🎓 Professional Courses</h3>
                  <ul className="space-y-2 text-indigo-800">
                    <li>• CA & Professional Accounting</li>
                    <li>• CS & Company Secretary</li>
                    <li>• Architecture</li>
                    <li>• Journalism & Mass Comm</li>
                    <li>• Hotel Management</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">🚀 Plan Your Educational Journey</h2>
              <p className="text-lg mb-6 text-blue-100">Use our AI Career Advisor to get personalized recommendations for your educational path in India.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/chat" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">💬 Get AI Guidance</a>
                <a href="/dashboard" className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">📊 View Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Switcher remains */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Education in India</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive guide to educational opportunities, institutions, and career pathways in India
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
              <button onClick={() => setContentType('overview')} className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${contentType === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <EyeIcon className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button onClick={() => setContentType('pdf')} className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${contentType === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <DocumentTextIcon className="w-4 h-4" />
                <span>Detailed Guide</span>
              </button>
            </div>
          </div>
          {contentType === 'overview' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Education System Overview</h2>
              <p className="text-gray-600">Explore streams, institutions, and more in the desktop view for a richer experience.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div style={{ height: '70vh' }}>
                <iframe src="/What-Next.pdf" className="w-full h-full border-0" title="Education Guide" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EducationIndia;