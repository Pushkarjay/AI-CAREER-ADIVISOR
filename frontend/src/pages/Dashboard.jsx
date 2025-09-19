import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { profileAPI, chatAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: 'Deepak Bansal',
    education_level: 'College / University',
    current_role: 'Software Engineer',
    experience_years: '2-5 years',
    skills: 'JavaScript, React, Node.js',
    interests: 'Frontend Development, UI/UX',
    location: 'New Delhi, India',
    preferred_salary: '12-20 LPA'
  });

  const [careerMatches] = useState([
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      salary: '15-25 LPA',
      match_score: 92,
      requirements: ['React', 'JavaScript', 'CSS', 'Node.js'],
      location: 'Bangalore'
    },
    {
      title: 'Full Stack Developer',
      company: 'Innovation Labs',
      salary: '18-28 LPA',
      match_score: 88,
      requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],
      location: 'Mumbai'
    },
    {
      title: 'UI/UX Developer',
      company: 'Design Studio',
      salary: '12-22 LPA',
      match_score: 85,
      requirements: ['React', 'Figma', 'CSS', 'JavaScript'],
      location: 'Delhi'
    }
  ]);

  const [selectedCareer, setSelectedCareer] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState({
    current_skills: ['JavaScript', 'React', 'CSS', 'HTML'],
    skill_gaps: ['TypeScript', 'AWS', 'Docker', 'Testing'],
    recommendations: [
      'Learn TypeScript for better code quality',
      'Get AWS certification for cloud skills',
      'Practice Docker for containerization',
      'Learn testing frameworks like Jest'
    ],
    learning_resources: []
  });

  // Initialize with first career when component loads
  React.useEffect(() => {
    if (careerMatches.length > 0 && !selectedCareer) {
      updateSkillAnalysis(careerMatches[0].title);
    }
  }, [careerMatches, selectedCareer]);

  // Career-specific skill data
  const careerSkillData = {
    'Senior Frontend Developer': {
      required_skills: ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript', 'Webpack', 'Testing'],
      learning_resources: [
        { title: 'React Official Documentation', url: 'https://react.dev/', type: 'Documentation' },
        { title: 'TypeScript in 100 Seconds', url: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA', type: 'YouTube' },
        { title: 'Frontend Masters - Complete Intro to React', url: 'https://frontendmasters.com/courses/complete-react-v8/', type: 'Course' },
        { title: 'Jest Testing Framework', url: 'https://www.youtube.com/watch?v=7r4xVDI2vho', type: 'YouTube' }
      ]
    },
    'Full Stack Developer': {
      required_skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Git'],
      learning_resources: [
        { title: 'Full Stack Open - University of Helsinki', url: 'https://fullstackopen.com/', type: 'Course' },
        { title: 'Node.js Complete Course', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', type: 'YouTube' },
        { title: 'Docker Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI', type: 'YouTube' },
        { title: 'AWS Cloud Practitioner', url: 'https://aws.amazon.com/training/', type: 'Certification' }
      ]
    },
    'UI/UX Developer': {
      required_skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Figma', 'Design Systems', 'User Research'],
      learning_resources: [
        { title: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', type: 'Course' },
        { title: 'Figma UI Design Tutorial', url: 'https://www.youtube.com/watch?v=jwCmIBJ8Jtc', type: 'YouTube' },
        { title: 'CSS Grid Complete Course', url: 'https://www.youtube.com/watch?v=jV8B24rSN5o', type: 'YouTube' },
        { title: 'Design Systems Handbook', url: 'https://www.designbetter.co/design-systems-handbook', type: 'Documentation' }
      ]
    }
  };

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const updateSkillAnalysis = (careerTitle) => {
    const userSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()) : ['JavaScript', 'React', 'CSS', 'HTML'];
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
        current_skills: current,
        skill_gaps: gaps,
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
      await profileAPI.save(profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({ message: userMessage, history: chatHistory });
      setChatHistory(prev => [...prev, { type: 'ai', message: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return;
    await handleChatSubmit({ preventDefault: () => {} });
  };

  const getMatchedSkills = (careerMatch) => {
    const userSkills = profile.skills ? profile.skills.split(',').map(s => s.trim().toLowerCase()) : [];
    const requiredSkills = careerMatch.requirements || [];
    
    const matched = requiredSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill))
    );
    
    const missing = requiredSkills.filter(skill => 
      !userSkills.some(userSkill => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill))
    );
    
    return { matched, missing };
  };

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
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={profile.education_level}
                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={profile.current_role}
                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <select
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List your key skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Interests
                  </label>
                  <textarea
                    value={profile.interests}
                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
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
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
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
                    value={profile.preferred_salary}
                    onChange={(e) => setProfile({ ...profile, preferred_salary: e.target.value })}
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
                Hi {profile.name.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-600 mb-4">
                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!
              </p>
              
              {/* Chat History */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isLoading && (
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
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatMessage.trim()}
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
                {careerMatches.map((match, index) => (
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Skill Analysis {selectedCareer && <span className="text-blue-600">for {selectedCareer}</span>}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Skills */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Skills You Have ({skillAnalysis.current_skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.current_skills?.length > 0 ? (
                      skillAnalysis.current_skills.map((skill, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No matching skills found</p>
                    )}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Skills to Learn ({skillAnalysis.skill_gaps?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.skill_gaps?.length > 0 ? (
                      skillAnalysis.skill_gaps.map((gap, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                          📚 {gap}
                        </span>
                      ))
                    ) : (
                      <p className="text-green-600 text-sm font-medium">🎉 You have all required skills!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Learning Resources */}
              {skillAnalysis.learning_resources?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-700 mb-4">
                    📖 Recommended Learning Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillAnalysis.learning_resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex-shrink-0">
                          {resource.type === 'YouTube' && (
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                          )}
                          {resource.type === 'Course' && (
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          {resource.type === 'Documentation' && (
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          {resource.type === 'Certification' && (
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-gray-500">{resource.type}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">💡 Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {skillAnalysis.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          
          {/* Profile Form - Mobile */}
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
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={profile.education_level}
                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={profile.current_role}
                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <select
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List your key skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Interests
                  </label>
                  <textarea
                    value={profile.interests}
                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What type of roles interest you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Preferred work location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Salary
                  </label>
                  <input
                    type="text"
                    value={profile.preferred_salary}
                    onChange={(e) => setProfile({ ...profile, preferred_salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 12-20 LPA"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* AI Career Assistant - Mobile */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Hi {profile.name.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-600 mb-4">
                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!
              </p>
              
              {/* Chat History - Mobile */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input - Mobile */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about your career..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>

          {/* Career Matches - Mobile */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>
              <div className="space-y-4">
                {careerMatches.map((match, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCareer === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCareer(selectedCareer === index ? null : index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{match.title}</h3>
                      <span className="text-sm font-medium text-green-600">{match.match_score}% match</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{match.company}</p>
                    <p className="text-gray-600 text-sm mb-2">{match.salary} • {match.location}</p>
                    <div className="flex flex-wrap gap-1">
                      {match.requirements.slice(0, 3).map((req, reqIndex) => (
                        <span key={reqIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {req}
                        </span>
                      ))}
                      {match.requirements.length > 3 && (
                        <span className="text-xs text-gray-500">+{match.requirements.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Analysis - Mobile */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>
              
              {selectedCareer !== null && careerMatches[selectedCareer] && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Analysis for: {careerMatches[selectedCareer].title}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✅ Skills You Have</h4>
                      <div className="flex flex-wrap gap-1">
                        {getMatchedSkills(careerMatches[selectedCareer]).matched.map((skill, index) => (
                          <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">📚 Skills to Learn</h4>
                      <div className="flex flex-wrap gap-1">
                        {getMatchedSkills(careerMatches[selectedCareer]).missing.map((skill, index) => (
                          <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-700 mb-2">🎯 Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <a href={`https://www.google.com/search?q=${careerMatches[selectedCareer].title}+course`} target="_blank" rel="noopener noreferrer">
                        <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer">
                          🔍 Find Courses
                          <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations - Mobile */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">💡 Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {skillAnalysis.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;