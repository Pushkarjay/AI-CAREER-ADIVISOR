import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { careerAPI, profileAPI, chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

  const [skillAnalysis] = useState({
    current_skills: ['JavaScript', 'React', 'CSS', 'HTML'],
    skill_gaps: ['TypeScript', 'AWS', 'Docker', 'Testing'],
    recommendations: [
      'Learn TypeScript for better code quality',
      'Get AWS certification for cloud skills',
      'Practice Docker for containerization',
      'Learn testing frameworks like Jest'
    ]
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await profileAPI.updateProfile(profile);
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
      const response = await chatAPI.sendMessage(userMessage);
      setChatHistory(prev => [...prev, { type: 'ai', message: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Profile Form */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-2 space-y-6">
            
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {careerMatches.map((match, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Skills */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Current Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.current_skills?.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Skills to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.skill_gaps?.map((gap, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Recommendations</h3>
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