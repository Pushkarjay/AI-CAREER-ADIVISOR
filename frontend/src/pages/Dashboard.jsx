import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    profile, 
    careers, 
    chat,
    sendChatMessage,
    initializeChat,
    updateProfile
  } = useData();
  
  // Local state for form fields (mirrors profile data for editing)
  const [profileForm, setProfileForm] = useState({
    name: '',
    education_level: '',
    current_role: '',
    experience_years: '',
    skills: '',
    interests: '',
    location: '',
    preferred_salary: ''
  });

  const [selectedCareer, setSelectedCareer] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState({
    matched_skills: [],
    missing_skills: [],
    recommendations: [],
    learning_resources: []
  });

  const [chatMessage, setChatMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile data to form when profile data changes
  useEffect(() => {
    if (profile.data) {
      setProfileForm({
        name: profile.data.name || '',
        education_level: profile.data.education_level || '',
        current_role: profile.data.current_role || '',
        experience_years: profile.data.experience_years || '',
        skills: Array.isArray(profile.data.skills) 
          ? profile.data.skills.join(', ') 
          : profile.data.skills || '',
        interests: Array.isArray(profile.data.interests)
          ? profile.data.interests.join(', ')
          : profile.data.interests || '',
        location: profile.data.location || '',
        preferred_salary: profile.data.preferred_salary || ''
      });
    }
  }, [profile.data]);

  // Initialize chat when component loads
  useEffect(() => {
    initializeChat();
  }, []);

  // Initialize with first career when component loads
  useEffect(() => {
    if (careers.recommendations.length > 0 && !selectedCareer) {
      updateSkillAnalysis(careers.recommendations[0].title);
    }
  }, [careers.recommendations, selectedCareer]);

  // Career-specific skill data
  const careerSkillData = {
    'Software Developer': {
      required_skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'APIs'],
      learning_resources: [
        { title: 'freeCodeCamp - Full Stack Development', url: 'https://www.freecodecamp.org/', type: 'Course' },
        { title: 'JavaScript Complete Course', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'YouTube' },
        { title: 'Python for Beginners', url: 'https://www.python.org/about/gettingstarted/', type: 'Documentation' },
        { title: 'Git Tutorial', url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc', type: 'YouTube' }
      ]
    },
    'Data Analyst': {
      required_skills: ['Python', 'SQL', 'Excel', 'Statistics', 'Tableau', 'Power BI'],
      learning_resources: [
        { title: 'Google Data Analytics Certificate', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', type: 'Course' },
        { title: 'SQL for Data Science', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'YouTube' },
        { title: 'Python for Data Analysis', url: 'https://pandas.pydata.org/docs/', type: 'Documentation' },
        { title: 'Tableau Public Training', url: 'https://public.tableau.com/app/learn/how-to-videos', type: 'Course' }
      ]
    },
    'Product Manager': {
      required_skills: ['Communication', 'Strategy', 'Analytics', 'Leadership', 'User Research', 'Agile'],
      learning_resources: [
        { title: 'Product Management Course', url: 'https://www.coursera.org/specializations/product-management', type: 'Course' },
        { title: 'Product Management Framework', url: 'https://www.youtube.com/watch?v=2JzgIgLYFJ4', type: 'YouTube' },
        { title: 'User Story Mapping', url: 'https://www.atlassian.com/agile/product-management/user-story-mapping', type: 'Documentation' },
        { title: 'Google Analytics Academy', url: 'https://analytics.google.com/analytics/academy/', type: 'Course' }
      ]
    }
  };

  const updateSkillAnalysis = (careerTitle) => {
    const userSkills = profileForm.skills ? profileForm.skills.split(',').map(s => s.trim()) : [];
    const careerData = careerSkillData[careerTitle];
    
    if (careerData) {
      const required = careerData.required_skills;
      const current = required.filter(skill => 
        userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      const gaps = required.filter(skill => 
        !userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
      );

      setSkillAnalysis({
        matched_skills: current,
        missing_skills: gaps,
        recommendations: gaps.map(skill => `Learn ${skill} to enhance your ${careerTitle} capabilities`),
        learning_resources: careerData.learning_resources
      });
      setSelectedCareer(careerTitle);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const payload = {
        name: profileForm.name,
        education_level: profileForm.education_level,
        current_role: profileForm.current_role,
        experience_years: profileForm.experience_years,
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: profileForm.interests.split(',').map(s => s.trim()).filter(Boolean),
        location: profileForm.location,
        preferred_salary: profileForm.preferred_salary
      };
      
      const success = await updateProfile(payload);
      if (success) {
        // Success message already shown by DataContext
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    await sendChatMessage(chatMessage);
    setChatMessage('');
  };

  const getMatchedSkills = (careerMatch) => {
    const userSkills = profileForm.skills ? profileForm.skills.split(',').map(s => s.trim().toLowerCase()) : [];
    const requiredSkills = careerMatch.requirements || [];
    
    const matched = requiredSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill))
    );
    
    const missing = requiredSkills.filter(skill => 
      !userSkills.some(userSkill => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill))
    );
    
    return { matched, missing };
  };

  if (profile.loading || careers.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your career dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Desktop Layout - Full Window Width */}
      <div className="hidden lg:block px-6 py-6">
        <div className="grid grid-cols-3 gap-6">

          {/* Left Panel - Profile Form */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={profileForm.education_level}
                    onChange={(e) => setProfileForm({ ...profileForm, education_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="College / University">College / University</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={profileForm.current_role}
                    onChange={(e) => setProfileForm({ ...profileForm, current_role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <select
                    value={profileForm.experience_years}
                    onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Experience</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <textarea
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List your key skills (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Interests
                  </label>
                  <textarea
                    value={profileForm.interests}
                    onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What interests you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Salary Range
                  </label>
                  <input
                    type="text"
                    value={profileForm.preferred_salary}
                    onChange={(e) => setProfileForm({ ...profileForm, preferred_salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12-20 LPA"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-2 space-y-6">

            {/* AI Career Assistant */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Hi {profileForm.name || 'there'} 👋
              </h2>
              <p className="text-gray-600 mb-4">
                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!
              </p>

              {/* Chat History */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                {chat.messages.length === 0 ? (
                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>
                ) : (
                  <div className="space-y-3">
                    {chat.messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          msg.from === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {chat.loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg">
                      Typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about your career path..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={chat.loading}
                />
                <button
                  type="submit"
                  disabled={chat.loading || !chatMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Career Matches */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>
              <p className="text-gray-600 text-sm mb-4">Click on a career to see detailed skill analysis</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(careers.recommendations || []).map((match, index) => (
                  <div
                    key={index}
                    onClick={() => updateSkillAnalysis(match.title)}
                    className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                      selectedCareer === match.title
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:shadow-md hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{match.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {match.match_score}% match
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">{match.company}</p>
                    <p className="text-blue-600 font-semibold text-sm mb-2">{match.salary}</p>
                    <p className="text-gray-500 text-xs mb-3">{match.location}</p>

                    <div className="flex flex-wrap gap-1">
                      {match.requirements?.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                      {match.requirements?.length > 3 && (
                        <span className="text-gray-500 text-xs">+{match.requirements.length - 3} more</span>
                      )}
                    </div>

                    {selectedCareer === match.title && (
                      <div className="mt-2 text-blue-600 text-xs font-medium">
                        ✓ Viewing skill analysis for this role
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Analysis */}
            {selectedCareer && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Skill Analysis: {selectedCareer}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-600 mb-2">Your Current Skills ✓</h3>
                    <div className="space-y-1">
                      {(skillAnalysis.matched_skills || []).map((skill, idx) => (
                        <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {skill}
                        </span>
                      ))}
                      {(skillAnalysis.matched_skills || []).length === 0 && (
                        <p className="text-gray-500 text-sm">No matching skills found in your profile</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-orange-600 mb-2">Skills to Develop</h3>
                    <div className="space-y-1">
                      {(skillAnalysis.missing_skills || []).map((skill, idx) => (
                        <span key={idx} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {skillAnalysis.learning_resources && skillAnalysis.learning_resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-blue-600 mb-3">Recommended Learning Resources</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {skillAnalysis.learning_resources.slice(0, 4).map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{resource.title}</p>
                            <p className="text-xs text-gray-500">{resource.type}</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          
          {/* Profile Form Mobile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                  value={profileForm.education_level}
                  onChange={(e) => setProfileForm({ ...profileForm, education_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="College / University">College / University</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                <input
                  type="text"
                  value={profileForm.current_role}
                  onChange={(e) => setProfileForm({ ...profileForm, current_role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <textarea
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List your key skills"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Chat Mobile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assistant</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
              {chat.messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">Start a conversation!</p>
              ) : (
                <div className="space-y-2">
                  {chat.messages.slice(-3).map((msg, index) => (
                    <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.from === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {chat.loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    Typing...
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about careers..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={chat.loading}
              />
              <button
                type="submit"
                disabled={chat.loading || !chatMessage.trim()}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                Send
              </button>
            </form>
          </div>

          {/* Career Matches Mobile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>
            
            <div className="space-y-4">
              {(careers.recommendations || []).slice(0, 3).map((match, index) => (
                <div 
                  key={index}
                  onClick={() => updateSkillAnalysis(match.title)}
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedCareer === match.title 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{match.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {match.match_score}%
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{match.company}</p>
                  <p className="text-blue-600 font-semibold text-sm">{match.salary}</p>
                  <p className="text-gray-500 text-xs">{match.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Analysis Mobile */}
          {skillAnalysis && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Skills Analysis</h2>
                <button
                  onClick={() => setSkillAnalysis(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h3 className="font-semibold text-green-800 text-sm mb-2">
                    ✅ Skills You Have ({skillAnalysis.matched_skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {skillAnalysis.matched_skills?.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h3 className="font-semibold text-orange-800 text-sm mb-2">
                    📚 Skills to Learn ({skillAnalysis.missing_skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {skillAnalysis.missing_skills?.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;