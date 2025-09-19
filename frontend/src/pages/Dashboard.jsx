import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { profileAPI, chatAPI, careerAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: '',
    education_level: '',
    current_role: '',
    experience_years: '',
    skills: '',
    interests: '',
    location: '',
    preferred_salary: ''
  });

  const [careerMatches, setCareerMatches] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState({
    current_skills: [],
    skill_gaps: [],
    recommendations: [],
    learning_resources: []
  });

  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load data from APIs
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load profile data
        try {
          const profileResponse = await profileAPI.fetch();
          if (profileResponse.data) {
            setProfile(prevProfile => ({
              ...prevProfile,
              ...profileResponse.data,
              // Ensure we have fallback values
              name: profileResponse.data.name || user?.email?.split('@')[0] || 'User',
              skills: profileResponse.data.skills || ''
            }));
          }
        } catch (error) {
          console.log('Profile API error, using defaults:', error);
          setProfile(prevProfile => ({
            ...prevProfile,
            name: user?.email?.split('@')[0] || 'User'
          }));
        }

        // Load career recommendations
        try {
          const careerResponse = await careerAPI.getRecommendations();
          if (careerResponse.data && careerResponse.data.length > 0) {
            setCareerMatches(careerResponse.data);
          } else {
            throw new Error('No career data returned');
          }
        } catch (error) {
          console.log('Career API error, using fallback data:', error);
          // Fallback to default careers if API doesn't return data
          setCareerMatches([
            {
              title: 'Software Developer',
              company: 'Tech Companies',
              salary: '12-25 LPA',
              match_score: 85,
              requirements: ['JavaScript', 'React', 'Node.js', 'Python'],
              location: 'Multiple Cities'
            },
            {
              title: 'Data Analyst',
              company: 'Analytics Firms',
              salary: '10-20 LPA',
              match_score: 78,
              requirements: ['Python', 'SQL', 'Excel', 'Statistics'],
              location: 'Multiple Cities'
            },
            {
              title: 'Product Manager',
              company: 'Product Companies',
              salary: '15-30 LPA',
              match_score: 72,
              requirements: ['Communication', 'Strategy', 'Analytics', 'Leadership'],
              location: 'Multiple Cities'
            }
          ]);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Initialize with first career when component loads
  useEffect(() => {
    if (careerMatches.length > 0 && !selectedCareer) {
      updateSkillAnalysis(careerMatches[0].title);
    }
  }, [careerMatches, selectedCareer]);

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
    const userSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()) : [];
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

  if (loading) {
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
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
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
                Hi {profile.name || 'there'} 👋
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
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-bold">
                              {resource.type === 'YouTube' && '📺'}
                              {resource.type === 'Course' && '📚'}
                              {resource.type === 'Documentation' && '📖'}
                              {resource.type === 'Certification' && '🏆'}
                            </span>
                          </div>
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
                Hi {profile.name || 'there'} 👋
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
                      selectedCareer === match.title 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateSkillAnalysis(match.title)}
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
              
              {selectedCareer && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Analysis for: {selectedCareer}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✅ Skills You Have</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillAnalysis.current_skills?.map((skill, index) => (
                          <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">📚 Skills to Learn</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillAnalysis.skill_gaps?.map((skill, index) => (
                          <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
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