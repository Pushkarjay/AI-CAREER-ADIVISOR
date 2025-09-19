import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import { careerAPI, profileAPI, chatAPI } from '../services/api';import Navbar from '../components/Navbar';

import { useAuth } from '../contexts/AuthContext';

import { careerAPI, profileAPI, chatAPI } from '../services/api';import Navbar from '../components/Navbar';import Navbar from '../components/Navbar';

const Dashboard = () => {

  const { user } = useAuth();import { useAuth } from '../contexts/AuthContext';

  

  const [profile, setProfile] = useState({import { careerAPI, profileAPI, chatAPI } from '../services/api';import { careerAPI, profileAPI, chatAPI } from '../services/api';

    name: 'Deepak Bansal',

    education_level: 'College / University',const Dashboard = () => {

    current_role: 'Software Engineer',

    experience_years: '2-5 years',  const { user } = useAuth();import { useAuth } from '../contexts/AuthContext';import { useAuth } from '../contexts/AuthContext';

    skills: 'JavaScript, React, Node.js',

    interests: 'Frontend Development, UI/UX',  

    location: 'New Delhi, India',

    preferred_salary: '12-20 LPA'  const [profile, setProfile] = useState({

  });

    name: 'Deepak Bansal',

  const [careerMatches, setCareerMatches] = useState([]);

  const [skillAnalysis, setSkillAnalysis] = useState(null);    education_level: 'College / University',const Dashboard = () => {const Dashboard = () => {

  const [chatMessage, setChatMessage] = useState('');

  const [chatHistory, setChatHistory] = useState([]);    current_role: 'Software Engineer',

  const [isLoading, setIsLoading] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);    experience_years: '2-5 years',  const { user } = useAuth();  const { user } = useAuth();



  useEffect(() => {    skills: 'JavaScript, React, Node.js',

    if (user) {

      loadProfile();    interests: 'Frontend Development, UI/UX',  const [profile, setProfile] = useState({  const [profile, setProfile] = useState({

      loadCareerMatches();

      loadSkillAnalysis();    location: 'New Delhi, India',

    }

  }, [user]);    preferred_salary: '12-20 LPA'    name: 'Deepak Bansal',    name: 'Deepak Bansal',



  const loadProfile = async () => {  });

    try {

      const response = await profileAPI.getProfile();    education_level: 'College / University',    education_level: 'College / University',

      if (response.data && Object.keys(response.data).length > 0) {

        setProfile(prev => ({ ...prev, ...response.data }));  const [careerMatches, setCareerMatches] = useState([]);

      }

    } catch (error) {  const [skillAnalysis, setSkillAnalysis] = useState(null);    current_role: 'Software Engineer',    skills: ['Python', 'Javascript', 'ReactJs', 'NodeJs', 'SQL', 'MongoDB', 'Machine Learning', 'Data Analysis', 'Statistics', 'Cloud Computing (AWS/GCP)', 'DevOps', 'Cyber Security', 'MERN Stack', 'Project Management', 'Communication', 'Problem Solving', 'Java', 'Git'],

      console.log('No existing profile found, using defaults');

    }  const [chatMessage, setChatMessage] = useState('');

  };

  const [chatHistory, setChatHistory] = useState([]);    experience_years: '2-5 years',    interests: 'Building scalable web applications, exploring machine learning'

  const loadCareerMatches = async () => {

    try {  const [isLoading, setIsLoading] = useState(false);

      const response = await careerAPI.getCareerMatches();

      setCareerMatches(response.data || [  const [profileLoading, setProfileLoading] = useState(false);    skills: 'JavaScript, React, Node.js',  });

        {

          title: 'Senior Frontend Developer',

          company: 'TechCorp',

          salary: '15-25 LPA',  useEffect(() => {    interests: 'Frontend Development, UI/UX',  

          match_score: 92,

          requirements: ['React', 'JavaScript', 'CSS', 'Node.js'],    if (user) {

          location: 'Bangalore'

        },      loadProfile();    location: 'New Delhi, India',  const [formData, setFormData] = useState({

        {

          title: 'Full Stack Developer',      loadCareerMatches();

          company: 'Innovation Labs',

          salary: '18-28 LPA',      loadSkillAnalysis();    preferred_salary: '12-20 LPA'    fullName: 'Deepak Bansal',

          match_score: 88,

          requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],    }

          location: 'Mumbai'

        },  }, [user]);  });    educationLevel: 'College / University',

        {

          title: 'UI/UX Developer',

          company: 'Design Studio',

          salary: '12-22 LPA',  const loadProfile = async () => {  const [careerMatches, setCareerMatches] = useState([]);    skills: 'Python, Javascript, ReactJs, NodeJs, SQL, MongoDB, Machine Learning, Data Analysis',

          match_score: 85,

          requirements: ['React', 'Figma', 'CSS', 'JavaScript'],    try {

          location: 'Delhi'

        }      const response = await profileAPI.getProfile();  const [skillAnalysis, setSkillAnalysis] = useState(null);    interests: 'Building scalable web applications, exploring machine learning'

      ]);

    } catch (error) {      if (response.data && Object.keys(response.data).length > 0) {

      console.log('Error loading career matches:', error);

    }        setProfile(prev => ({ ...prev, ...response.data }));  const [chatMessage, setChatMessage] = useState('');  });

  };

      }

  const loadSkillAnalysis = async () => {

    try {    } catch (error) {  const [chatHistory, setChatHistory] = useState([]);

      const response = await profileAPI.getSkillAnalysis();

      setSkillAnalysis(response.data || {      console.log('No existing profile found, using defaults');

        current_skills: ['JavaScript', 'React', 'CSS', 'HTML'],

        skill_gaps: ['TypeScript', 'AWS', 'Docker', 'Testing'],    }  const [isLoading, setIsLoading] = useState(false);  const [careers] = useState([

        recommendations: [

          'Learn TypeScript for better code quality',  };

          'Get AWS certification for cloud skills',

          'Practice Docker for containerization',  const [profileLoading, setProfileLoading] = useState(false);    {

          'Learn testing frameworks like Jest'

        ]  const loadCareerMatches = async () => {

      });

    } catch (error) {    try {      id: 1,

      console.log('Error loading skill analysis:', error);

    }      const response = await careerAPI.getCareerMatches();

  };

      setCareerMatches(response.data || [  useEffect(() => {      title: 'Data Scientist',

  const handleProfileUpdate = async (e) => {

    e.preventDefault();        {

    setProfileLoading(true);

    try {          title: 'Senior Frontend Developer',    if (user) {      salary: '₹12 - 25 LPA',

      await profileAPI.updateProfile(profile);

      alert('Profile updated successfully!');          company: 'TechCorp',

      loadCareerMatches();

      loadSkillAnalysis();          salary: '15-25 LPA',      loadProfile();      match: 25,

    } catch (error) {

      console.error('Error updating profile:', error);          match_score: 92,

      alert('Error updating profile. Please try again.');

    } finally {          requirements: ['React', 'JavaScript', 'CSS', 'Node.js'],      loadCareerMatches();      avgSalary: 'Avg Salary',

      setProfileLoading(false);

    }          location: 'Bangalore'

  };

        },      loadSkillAnalysis();      description: 'Analyze and interpret data to extract insights and trends.',

  const handleChatSubmit = async (e) => {

    e.preventDefault();        {

    if (!chatMessage.trim()) return;

          title: 'Full Stack Developer',    }      details: 'Work with data to extract insights and predict trends',

    const userMessage = chatMessage;

    setChatMessage('');          company: 'Innovation Labs',

    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);

    setIsLoading(true);          salary: '18-28 LPA',  }, [user]);      skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization']



    try {          match_score: 88,

      const response = await chatAPI.sendMessage(userMessage);

      setChatHistory(prev => [...prev, { type: 'ai', message: response.data.response }]);          requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],    },

    } catch (error) {

      console.error('Chat error:', error);          location: 'Mumbai'

      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);

    } finally {        },  const loadProfile = async () => {    {

      setIsLoading(false);

    }        {

  };

          title: 'UI/UX Developer',    try {      id: 2,

  return (

    <div className="min-h-screen bg-gray-50">          company: 'Design Studio',

      <Navbar />

                salary: '12-22 LPA',      const response = await profileAPI.getProfile();      title: 'Full Stack Developer',

      <div className="container mx-auto px-4 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">          match_score: 85,

          

          {/* Left Panel - Profile Form */}          requirements: ['React', 'Figma', 'CSS', 'JavaScript'],      if (response.data && Object.keys(response.data).length > 0) {      salary: '₹8 - 20 LPA',

          <div className="lg:col-span-1">

            <div className="bg-white rounded-lg shadow-md p-6">          location: 'Delhi'

              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>

                      }        setProfile(prev => ({ ...prev, ...response.data }));      match: 20,

              <form onSubmit={handleProfileUpdate} className="space-y-4">

                <div>      ]);

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Full Name    } catch (error) {      }      avgSalary: 'Avg Salary',

                  </label>

                  <input      console.log('Error loading career matches:', error);

                    type="text"

                    value={profile.name}    }    } catch (error) {      description: 'Develop both the frontend and backend of web applications.',

                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  };

                    placeholder="Enter your full name"

                  />      console.log('No existing profile found, using defaults');      details: 'Build end-to-end web applications',

                </div>

  const loadSkillAnalysis = async () => {

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">    try {    }      skills: ['Javascript', 'ReactJs', 'NodeJs', 'SQL', 'MongoDB']

                    Education Level

                  </label>      const response = await profileAPI.getSkillAnalysis();

                  <select

                    value={profile.education_level}      setSkillAnalysis(response.data || {  };    },

                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        current_skills: ['JavaScript', 'React', 'CSS', 'HTML'],

                  >

                    <option value="High School">High School</option>        skill_gaps: ['TypeScript', 'AWS', 'Docker', 'Testing'],    {

                    <option value="College / University">College / University</option>

                    <option value="Master's Degree">Master's Degree</option>        recommendations: [

                    <option value="PhD">PhD</option>

                  </select>          'Learn TypeScript for better code quality',  const loadCareerMatches = async () => {      id: 3,

                </div>

          'Get AWS certification for cloud skills',

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">          'Practice Docker for containerization',    try {      title: 'Cyber Security Analyst',

                    Current Role

                  </label>          'Learn testing frameworks like Jest'

                  <input

                    type="text"        ]      const response = await careerAPI.getCareerMatches();      salary: '₹7 - 18 LPA',

                    value={profile.current_role}

                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}      });

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="e.g., Software Engineer"    } catch (error) {      setCareerMatches(response.data || [      match: 18,

                  />

                </div>      console.log('Error loading skill analysis:', error);



                <div>    }        {      avgSalary: 'Avg Salary',

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Experience  };

                  </label>

                  <select          title: 'Senior Frontend Developer',      description: 'Protect organizations from security threats.',

                    value={profile.experience_years}

                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}  const handleProfileUpdate = async (e) => {

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                  >    e.preventDefault();          company: 'TechCorp',      details: 'Secure systems and networks from cyber threats',

                    <option value="0-1 years">0-1 years</option>

                    <option value="2-5 years">2-5 years</option>    setProfileLoading(true);

                    <option value="5-10 years">5-10 years</option>

                    <option value="10+ years">10+ years</option>    try {          salary: '15-25 LPA',      skills: ['Cyber Security', 'Network Security', 'Penetration Testing', 'Risk Assessment']

                  </select>

                </div>      await profileAPI.updateProfile(profile);



                <div>      alert('Profile updated successfully!');          match_score: 92,    }

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Skills      loadCareerMatches();

                  </label>

                  <textarea      loadSkillAnalysis();          requirements: ['React', 'JavaScript', 'CSS', 'Node.js'],  ]);

                    value={profile.skills}

                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}    } catch (error) {

                    rows="3"

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"      console.error('Error updating profile:', error);          location: 'Bangalore'

                    placeholder="List your key skills"

                  />      alert('Error updating profile. Please try again.');

                </div>

    } finally {        },  const [selectedCareer, setSelectedCareer] = useState(careers[0]);

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">      setProfileLoading(false);

                    Career Interests

                  </label>    }        {  const [loading, setLoading] = useState(false);

                  <textarea

                    value={profile.interests}  };

                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}

                    rows="2"          title: 'Full Stack Developer',  

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="What interests you?"  const handleChatSubmit = async (e) => {

                  />

                </div>    e.preventDefault();          company: 'Innovation Labs',  // Chat state



                <div>    if (!chatMessage.trim()) return;

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Location          salary: '18-28 LPA',  const [messages, setMessages] = useState([

                  </label>

                  <input    const userMessage = chatMessage;

                    type="text"

                    value={profile.location}    setChatMessage('');          match_score: 88,    { from: 'bot', text: "Hello! I'm your AI Career Assistant. Ask me about your career path to learn more." }

                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);

                    placeholder="City, Country"

                  />    setIsLoading(true);          requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],  ]);

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">    try {          location: 'Mumbai'  const [chatInput, setChatInput] = useState('');

                    Preferred Salary Range

                  </label>      const response = await chatAPI.sendMessage(userMessage);

                  <input

                    type="text"      setChatHistory(prev => [...prev, { type: 'ai', message: response.data.response }]);        },  const [chatLoading, setChatLoading] = useState(false);

                    value={profile.preferred_salary}

                    onChange={(e) => setProfile({ ...profile, preferred_salary: e.target.value })}    } catch (error) {

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="e.g., 12-20 LPA"      console.error('Chat error:', error);        {

                  />

                </div>      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);



                <button    } finally {          title: 'UI/UX Developer',  const skillsYouHave = ['Python', 'SQL'];

                  type="submit"

                  disabled={profileLoading}      setIsLoading(false);

                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"

                >    }          company: 'Design Studio',  const skillsToDevelop = ['Machine Learning', 'Data Analysis', 'Statistics', 'Problem Solving'];

                  {profileLoading ? 'Updating...' : 'Update Profile'}

                </button>  };

              </form>

            </div>          salary: '12-22 LPA',

          </div>

  return (

          {/* Right Panel */}

          <div className="lg:col-span-2 space-y-6">    <div className="min-h-screen bg-gray-50">          match_score: 85,  const handleInputChange = (e) => {

            

            {/* AI Career Assistant */}      <Navbar />

            <div className="bg-white rounded-lg shadow-md p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-4">                requirements: ['React', 'Figma', 'CSS', 'JavaScript'],    const { name, value } = e.target;

                Hi {profile.name.split(' ')[0]} 👋

              </h2>      <div className="container mx-auto px-4 py-6">

              <p className="text-gray-600 mb-4">

                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">          location: 'Delhi'    setFormData(prev => ({

              </p>

                        

              {/* Chat History */}

              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">          {/* Left Panel - Profile Form */}        }      ...prev,

                {chatHistory.length === 0 ? (

                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>          <div className="lg:col-span-1">

                ) : (

                  <div className="space-y-3">            <div className="bg-white rounded-lg shadow-md p-6">      ]);      [name]: value

                    {chatHistory.map((msg, index) => (

                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>

                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${

                          msg.type === 'user'                   } catch (error) {    }));

                            ? 'bg-blue-600 text-white' 

                            : 'bg-white border border-gray-200 text-gray-800'              <form onSubmit={handleProfileUpdate} className="space-y-4">

                        }`}>

                          {msg.message}                <div>      console.log('Error loading career matches:', error);  };

                        </div>

                      </div>                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    ))}

                  </div>                    Full Name    }

                )}

                {isLoading && (                  </label>

                  <div className="flex justify-start">

                    <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg">                  <input  };  const generateCareerInsights = () => {

                      Typing...

                    </div>                    type="text"

                  </div>

                )}                    value={profile.name}    // This would typically call the backend

              </div>

                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}

              {/* Chat Input */}

              <form onSubmit={handleChatSubmit} className="flex gap-2">                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  const loadSkillAnalysis = async () => {    console.log('Generating career insights...');

                <input

                  type="text"                    placeholder="Enter your full name"

                  value={chatMessage}

                  onChange={(e) => setChatMessage(e.target.value)}                  />    try {  };

                  placeholder="Ask about your career path..."

                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                </div>

                  disabled={isLoading}

                />      const response = await profileAPI.getSkillAnalysis();

                <button

                  type="submit"                <div>

                  disabled={isLoading || !chatMessage.trim()}

                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"                  <label className="block text-sm font-medium text-gray-700 mb-1">      setSkillAnalysis(response.data || {  const handleChatSubmit = async (e) => {

                >

                  Send                    Education Level

                </button>

              </form>                  </label>        current_skills: ['JavaScript', 'React', 'CSS', 'HTML'],    e.preventDefault();

            </div>

                  <select

            {/* Career Matches */}

            <div className="bg-white rounded-lg shadow-md p-6">                    value={profile.education_level}        skill_gaps: ['TypeScript', 'AWS', 'Docker', 'Testing'],    if (!chatInput.trim() || chatLoading) return;

              <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>

                                  onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {careerMatches.map((match, index) => (                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"        recommendations: [

                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                    <div className="flex justify-between items-start mb-2">                  >

                      <h3 className="font-semibold text-gray-800 text-sm">{match.title}</h3>

                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">                    <option value="High School">High School</option>          'Learn TypeScript for better code quality',    const userMessage = { from: 'user', text: chatInput };

                        {match.match_score}% match

                      </span>                    <option value="College / University">College / University</option>

                    </div>

                                        <option value="Master's Degree">Master's Degree</option>          'Get AWS certification for cloud skills',    setMessages(prev => [...prev, userMessage]);

                    <p className="text-gray-600 text-sm mb-2">{match.company}</p>

                    <p className="text-blue-600 font-semibold text-sm mb-2">{match.salary}</p>                    <option value="PhD">PhD</option>

                    <p className="text-gray-500 text-xs mb-3">{match.location}</p>

                                      </select>          'Practice Docker for containerization',    setChatInput('');

                    <div className="flex flex-wrap gap-1">

                      {match.requirements?.slice(0, 3).map((req, idx) => (                </div>

                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">

                          {req}          'Learn testing frameworks like Jest'    setChatLoading(true);

                        </span>

                      ))}                <div>

                      {match.requirements?.length > 3 && (

                        <span className="text-gray-500 text-xs">+{match.requirements.length - 3} more</span>                  <label className="block text-sm font-medium text-gray-700 mb-1">        ]

                      )}

                    </div>                    Current Role

                  </div>

                ))}                  </label>      });    try {

              </div>

            </div>                  <input



            {/* Skill Analysis */}                    type="text"    } catch (error) {      // Mock response for now since backend has auth issues

            {skillAnalysis && (

              <div className="bg-white rounded-lg shadow-md p-6">                    value={profile.current_role}

                <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>

                                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}      console.log('Error loading skill analysis:', error);      setTimeout(() => {

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Current Skills */}                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                  <div>

                    <h3 className="font-semibold text-gray-700 mb-3">Current Skills</h3>                    placeholder="e.g., Software Engineer"    }        const botMessage = { 

                    <div className="flex flex-wrap gap-2">

                      {skillAnalysis.current_skills?.map((skill, index) => (                  />

                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">

                          {skill}                </div>  };          from: 'bot', 

                        </span>

                      ))}

                    </div>

                  </div>                <div>          text: 'Based on your profile, I recommend focusing on data science skills like machine learning and statistics to advance your career!' 



                  {/* Skill Gaps */}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                  <div>

                    <h3 className="font-semibold text-gray-700 mb-3">Skills to Learn</h3>                    Experience  const handleProfileUpdate = async (e) => {        };

                    <div className="flex flex-wrap gap-2">

                      {skillAnalysis.skill_gaps?.map((gap, index) => (                  </label>

                        <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">

                          {gap}                  <select    e.preventDefault();        setMessages(prev => [...prev, botMessage]);

                        </span>

                      ))}                    value={profile.experience_years}

                    </div>

                  </div>                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}    setProfileLoading(true);        setChatLoading(false);

                </div>

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                {/* Recommendations */}

                <div className="mt-6">                  >    try {      }, 1000);

                  <h3 className="font-semibold text-gray-700 mb-3">Recommendations</h3>

                  <ul className="space-y-2">                    <option value="0-1 years">0-1 years</option>

                    {skillAnalysis.recommendations?.map((rec, index) => (

                      <li key={index} className="flex items-start gap-2">                    <option value="2-5 years">2-5 years</option>      await profileAPI.updateProfile(profile);    } catch (error) {

                        <span className="text-blue-600 mt-1">•</span>

                        <span className="text-gray-700 text-sm">{rec}</span>                    <option value="5-10 years">5-10 years</option>

                      </li>

                    ))}                    <option value="10+ years">10+ years</option>      alert('Profile updated successfully!');      console.error('Chat error:', error);

                  </ul>

                </div>                  </select>

              </div>

            )}                </div>      loadCareerMatches(); // Reload matches with new profile      setMessages(prev => [...prev, { 

          </div>

        </div>

      </div>

    </div>                <div>      loadSkillAnalysis(); // Reload analysis with new profile        from: 'bot', 

  );

};                  <label className="block text-sm font-medium text-gray-700 mb-1">



export default Dashboard;                    Skills    } catch (error) {        text: 'Sorry, I encountered an error. Please try again.' 

                  </label>

                  <textarea      console.error('Error updating profile:', error);      }]);

                    value={profile.skills}

                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}      alert('Error updating profile. Please try again.');      setChatLoading(false);

                    rows="3"

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"    } finally {    }

                    placeholder="List your key skills"

                  />      setProfileLoading(false);  };

                </div>

    }

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">  };  return (

                    Career Interests

                  </label>    <div className="min-h-screen bg-gray-50">

                  <textarea

                    value={profile.interests}  const handleChatSubmit = async (e) => {      <Navbar />

                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}

                    rows="2"    e.preventDefault();      <div className="container mx-auto px-4 py-6">

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="What interests you?"    if (!chatMessage.trim()) return;        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  />

                </div>          



                <div>    const userMessage = chatMessage;          {/* Left Column - Your Profile */}

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Location    setChatMessage('');          <div className="lg:col-span-1">

                  </label>

                  <input    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);            <div className="bg-white rounded-lg shadow-sm border p-6">

                    type="text"

                    value={profile.location}    setIsLoading(true);              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>

                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"              

                    placeholder="City, Country"

                  />    try {              <div className="space-y-4">

                </div>

      const response = await chatAPI.sendMessage(userMessage);                <div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">      setChatHistory(prev => [...prev, { type: 'ai', message: response.data.response }]);                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>

                    Preferred Salary Range

                  </label>    } catch (error) {                  <input

                  <input

                    type="text"      console.error('Chat error:', error);                    type="text"

                    value={profile.preferred_salary}

                    onChange={(e) => setProfile({ ...profile, preferred_salary: e.target.value })}      setChatHistory(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);                    name="fullName"

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                    placeholder="e.g., 12-20 LPA"    } finally {                    value={formData.fullName}

                  />

                </div>      setIsLoading(false);                    onChange={handleInputChange}



                <button    }                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                  type="submit"

                  disabled={profileLoading}  };                  />

                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"

                >                </div>

                  {profileLoading ? 'Updating...' : 'Update Profile'}

                </button>  return (

              </form>

            </div>    <div className="min-h-screen bg-gray-50">                <div>

          </div>

      <Navbar />                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Education Level</label>

          {/* Right Panel */}

          <div className="lg:col-span-2 space-y-6">                        <select

            

            {/* AI Career Assistant */}      <div className="container mx-auto px-4 py-6">                    name="educationLevel"

            <div className="bg-white rounded-lg shadow-md p-6">

              <h2 className="text-xl font-bold text-gray-800 mb-4">        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">                    value={formData.educationLevel}

                Hi {profile.name.split(' ')[0]} 👋

              </h2>                              onChange={handleInputChange}

              <p className="text-gray-600 mb-4">

                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!          {/* Left Panel - Profile Form */}                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

              </p>

                        <div className="lg:col-span-1">                  >

              {/* Chat History */}

              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">            <div className="bg-white rounded-lg shadow-md p-6">                    <option value="High School">High School</option>

                {chatHistory.length === 0 ? (

                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>                    <option value="College / University">College / University</option>

                ) : (

                  <div className="space-y-3">                                  <option value="Graduate">Graduate</option>

                    {chatHistory.map((msg, index) => (

                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>              <form onSubmit={handleProfileUpdate} className="space-y-4">                    <option value="Post Graduate">Post Graduate</option>

                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${

                          msg.type === 'user'                 <div>                  </select>

                            ? 'bg-blue-600 text-white' 

                            : 'bg-white border border-gray-200 text-gray-800'                  <label className="block text-sm font-medium text-gray-700 mb-1">                </div>

                        }`}>

                          {msg.message}                    Full Name

                        </div>

                      </div>                  </label>                <div>

                    ))}

                  </div>                  <input                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills</label>

                )}

                {isLoading && (                    type="text"                  <div className="flex flex-wrap gap-2 mb-3">

                  <div className="flex justify-start">

                    <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg">                    value={profile.name}                    {profile.skills.map((skill, index) => (

                      Typing...

                    </div>                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}                      <span

                  </div>

                )}                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                        key={index}

              </div>

                    placeholder="Enter your full name"                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"

              {/* Chat Input */}

              <form onSubmit={handleChatSubmit} className="flex gap-2">                  />                      >

                <input

                  type="text"                </div>                        {skill}

                  value={chatMessage}

                  onChange={(e) => setChatMessage(e.target.value)}                      </span>

                  placeholder="Ask about your career path..."

                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                <div>                    ))}

                  disabled={isLoading}

                />                  <label className="block text-sm font-medium text-gray-700 mb-1">                  </div>

                <button

                  type="submit"                    Education Level                </div>

                  disabled={isLoading || !chatMessage.trim()}

                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"                  </label>

                >

                  Send                  <select                <div>

                </button>

              </form>                    value={profile.education_level}                  <label className="block text-sm font-medium text-gray-700 mb-1">What are your interests?</label>

            </div>

                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}                  <textarea

            {/* Career Matches */}

            <div className="bg-white rounded-lg shadow-md p-6">                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                    name="interests"

              <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>

                                >                    value={formData.interests}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                {careerMatches.map((match, index) => (                    <option value="High School">High School</option>                    onChange={handleInputChange}

                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                    <div className="flex justify-between items-start mb-2">                    <option value="College / University">College / University</option>                    rows={3}

                      <h3 className="font-semibold text-gray-800 text-sm">{match.title}</h3>

                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">                    <option value="Master's Degree">Master's Degree</option>                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"

                        {match.match_score}% match

                      </span>                    <option value="PhD">PhD</option>                    placeholder="Building scalable web applications, exploring machine learning"

                    </div>

                                      </select>                  />

                    <p className="text-gray-600 text-sm mb-2">{match.company}</p>

                    <p className="text-blue-600 font-semibold text-sm mb-2">{match.salary}</p>                </div>                </div>

                    <p className="text-gray-500 text-xs mb-3">{match.location}</p>

                    

                    <div className="flex flex-wrap gap-1">

                      {match.requirements?.slice(0, 3).map((req, idx) => (                <div>                <button

                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">

                          {req}                  <label className="block text-sm font-medium text-gray-700 mb-1">                  onClick={generateCareerInsights}

                        </span>

                      ))}                    Current Role                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"

                      {match.requirements?.length > 3 && (

                        <span className="text-gray-500 text-xs">+{match.requirements.length - 3} more</span>                  </label>                >

                      )}

                    </div>                  <input                  Generate Career Insights

                  </div>

                ))}                    type="text"                </button>

              </div>

            </div>                    value={profile.current_role}              </div>



            {/* Skill Analysis */}                    onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}            </div>

            {skillAnalysis && (

              <div className="bg-white rounded-lg shadow-md p-6">                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"          </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>

                                    placeholder="e.g., Software Engineer"

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Current Skills */}                  />          {/* Right Column */}

                  <div>

                    <h3 className="font-semibold text-gray-700 mb-3">Current Skills</h3>                </div>          <div className="lg:col-span-2 space-y-6">

                    <div className="flex flex-wrap gap-2">

                      {skillAnalysis.current_skills?.map((skill, index) => (            

                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">

                          {skill}                <div>            {/* AI Assistant */}

                        </span>

                      ))}                  <label className="block text-sm font-medium text-gray-700 mb-1">            <div className="bg-white rounded-lg shadow-sm border p-4">

                    </div>

                  </div>                    Experience              <div className="flex items-center space-x-2 mb-3">



                  {/* Skill Gaps */}                  </label>                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">

                  <div>

                    <h3 className="font-semibold text-gray-700 mb-3">Skills to Learn</h3>                  <select                  <span className="text-white text-sm font-bold">AI</span>

                    <div className="flex flex-wrap gap-2">

                      {skillAnalysis.skill_gaps?.map((gap, index) => (                    value={profile.experience_years}                </div>

                        <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">

                          {gap}                    onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}                <h3 className="font-semibold text-gray-900">AI Assistant</h3>

                        </span>

                      ))}                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"              </div>

                    </div>

                  </div>                  >              

                </div>

                    <option value="0-1 years">0-1 years</option>              <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">

                {/* Recommendations */}

                <div className="mt-6">                    <option value="2-5 years">2-5 years</option>                {messages.map((message, index) => (

                  <h3 className="font-semibold text-gray-700 mb-3">Recommendations</h3>

                  <ul className="space-y-2">                    <option value="5-10 years">5-10 years</option>                  <div key={index} className={`mb-2 ${message.from === 'user' ? 'text-right' : 'text-left'}`}>

                    {skillAnalysis.recommendations?.map((rec, index) => (

                      <li key={index} className="flex items-start gap-2">                    <option value="10+ years">10+ years</option>                    <div className={`inline-block px-3 py-1 rounded-lg text-sm ${

                        <span className="text-blue-600 mt-1">•</span>

                        <span className="text-gray-700 text-sm">{rec}</span>                  </select>                      message.from === 'user' 

                      </li>

                    ))}                </div>                        ? 'bg-blue-600 text-white' 

                  </ul>

                </div>                        : 'bg-white text-gray-800 border'

              </div>

            )}                <div>                    }`}>

          </div>

        </div>                  <label className="block text-sm font-medium text-gray-700 mb-1">                      {message.text}

      </div>

    </div>                    Skills                    </div>

  );

};                  </label>                  </div>



export default Dashboard;                  <textarea                ))}

                    value={profile.skills}                {chatLoading && (

                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}                  <div className="text-left">

                    rows="3"                    <div className="inline-block px-3 py-1 rounded-lg text-sm bg-white text-gray-800 border">

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                      <div className="flex space-x-1">

                    placeholder="List your key skills"                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>

                  />                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>

                </div>                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>

                      </div>

                <div>                    </div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  </div>

                    Career Interests                )}

                  </label>              </div>

                  <textarea              

                    value={profile.interests}              <form onSubmit={handleChatSubmit} className="flex space-x-2">

                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })}                <input

                    rows="2"                  type="text"

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                  value={chatInput}

                    placeholder="What interests you?"                  onChange={(e) => setChatInput(e.target.value)}

                  />                  placeholder="Ask a question..."

                </div>                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                />

                <div>                <button

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  type="submit"

                    Location                  disabled={chatLoading}

                  </label>                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"

                  <input                >

                    type="text"                  <span className="text-sm">→</span>

                    value={profile.location}                </button>

                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}              </form>

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"            </div>

                    placeholder="City, Country"

                  />            {/* Career Matches */}

                </div>            <div className="bg-white rounded-lg shadow-sm border p-6">

              <h2 className="text-xl font-semibold text-gray-900 mb-1">

                <div>                Hi {formData.fullName.split(' ')[0]}, Here Are Your Top Career Matches

                  <label className="block text-sm font-medium text-gray-700 mb-1">              </h2>

                    Preferred Salary Range              <p className="text-sm text-gray-600 mb-6">

                  </label>                Based on your interests, we recommend exploring these paths.

                  <input              </p>

                    type="text"              

                    value={profile.preferred_salary}              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    onChange={(e) => setProfile({ ...profile, preferred_salary: e.target.value })}                {careers.map((career, index) => (

                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                  <div

                    placeholder="e.g., 12-20 LPA"                    key={career.id}

                  />                    onClick={() => setSelectedCareer(career)}

                </div>                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${

                      selectedCareer?.id === career.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'

                <button                    }`}

                  type="submit"                  >

                  disabled={profileLoading}                    <h3 className="font-semibold text-gray-900 mb-1">{career.title}</h3>

                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"                    <p className="text-2xl font-bold text-blue-600 mb-1">{career.salary}</p>

                >                    <p className="text-sm text-gray-600 mb-2">{career.avgSalary}</p>

                  {profileLoading ? 'Updating...' : 'Update Profile'}                    <p className="text-sm text-gray-700 mb-3">{career.details}</p>

                </button>                    

              </form>                    <div className="flex items-center justify-between">

            </div>                      <span className="text-sm text-gray-600">Get Match</span>

          </div>                      <span className="font-semibold text-gray-900">{career.match}%</span>

                    </div>

          {/* Right Panel */}                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

          <div className="lg:col-span-2 space-y-6">                      <div 

                                    className="bg-blue-600 h-2 rounded-full" 

            {/* AI Career Assistant */}                        style={{ width: `${career.match}%` }}

            <div className="bg-white rounded-lg shadow-md p-6">                      ></div>

              <h2 className="text-xl font-bold text-gray-800 mb-4">                    </div>

                Hi {profile.name.split(' ')[0]} 👋                  </div>

              </h2>                ))}

              <p className="text-gray-600 mb-4">              </div>

                I'm your AI Career Assistant. Ask me anything about your career path, skills, or job opportunities!            </div>

              </p>

                          {/* Skill Analysis */}

              {/* Chat History */}            {selectedCareer && (

              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">              <div className="bg-white rounded-lg shadow-sm border p-6">

                {chatHistory.length === 0 ? (                <h2 className="text-xl font-semibold text-gray-900 mb-1">

                  <p className="text-gray-500 text-center">Start a conversation with your AI assistant!</p>                  Skill Analysis for <span className="text-blue-600">{selectedCareer.title}</span>

                ) : (                </h2>

                  <div className="space-y-3">                <p className="text-sm text-gray-600 mb-6">

                    {chatHistory.map((msg, index) => (                  Here is a detailed analysis of your skills for this career

                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>                </p>

                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${                

                          msg.type === 'user'                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            ? 'bg-blue-600 text-white'                   <div>

                            : 'bg-white border border-gray-200 text-gray-800'                    <h3 className="font-medium text-gray-900 mb-3">Skills You Have ({skillsYouHave.length})</h3>

                        }`}>                    <div className="space-y-2">

                          {msg.message}                      {skillsYouHave.map((skill, index) => (

                        </div>                        <div key={index} className="flex items-center space-x-2">

                      </div>                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>

                    ))}                          <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">

                  </div>                            {skill}

                )}                          </span>

                {isLoading && (                        </div>

                  <div className="flex justify-start">                      ))}

                    <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg">                    </div>

                      Typing...                  </div>

                    </div>                  

                  </div>                  <div>

                )}                    <h3 className="font-medium text-gray-900 mb-3">Skills to Develop ({skillsToDevelop.length})</h3>

              </div>                    <div className="space-y-2">

                      {skillsToDevelop.map((skill, index) => (

              {/* Chat Input */}                        <div key={index} className="flex items-center space-x-2">

              <form onSubmit={handleChatSubmit} className="flex gap-2">                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>

                <input                          <span className="text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm">

                  type="text"                            {skill}

                  value={chatMessage}                          </span>

                  onChange={(e) => setChatMessage(e.target.value)}                        </div>

                  placeholder="Ask about your career path..."                      ))}

                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"                    </div>

                  disabled={isLoading}                  </div>

                />                </div>

                <button

                  type="submit"                <div className="mt-6 pt-4 border-t border-gray-200">

                  disabled={isLoading || !chatMessage.trim()}                  <h3 className="font-medium text-gray-900 mb-3">Suggested Learning Resources</h3>

                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"                  <div className="space-y-2">

                >                    <div className="flex items-center space-x-2">

                  Send                      <div className="w-4 h-4 text-blue-600">📚</div>

                </button>                      <a href="#" className="text-blue-600 hover:underline text-sm">

              </form>                        Data Science Specialization by Johns Hopkins

            </div>                      </a>

                    </div>

            {/* Career Matches */}                    <div className="flex items-center space-x-2">

            <div className="bg-white rounded-lg shadow-md p-6">                      <div className="w-4 h-4 text-blue-600">🏆</div>

              <h2 className="text-xl font-bold text-gray-800 mb-4">Career Matches</h2>                      <a href="#" className="text-blue-600 hover:underline text-sm">

                                      Kaggle Tutorials & Competitions

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">                      </a>

                {careerMatches.map((match, index) => (                    </div>

                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">                  </div>

                    <div className="flex justify-between items-start mb-2">                </div>

                      <h3 className="font-semibold text-gray-800 text-sm">{match.title}</h3>              </div>

                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">            )}

                        {match.match_score}% match          </div>

                      </span>        </div>

                    </div>      </div>

                        </div>

                    <p className="text-gray-600 text-sm mb-2">{match.company}</p>  );

                    <p className="text-blue-600 font-semibold text-sm mb-2">{match.salary}</p>};

                    <p className="text-gray-500 text-xs mb-3">{match.location}</p>

                    export default Dashboard;

                    <div className="flex flex-wrap gap-1">      if (processedCareers.length > 0) {

                      {match.requirements?.slice(0, 3).map((req, idx) => (        setSelectedCareer(processedCareers[0]);

                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">      }

                          {req}

                        </span>    } catch (e) {

                      ))}      console.error('Dashboard load error:', e);

                      {match.requirements?.length > 3 && (      setError('Failed to load dashboard data');

                        <span className="text-gray-500 text-xs">+{match.requirements.length - 3} more</span>      

                      )}      // Fallback data

                    </div>      const fallbackCareers = [

                  </div>        {

                ))}          id: 'sw-dev',

              </div>          title: 'Software Developer',

            </div>          match: 85,

          description: 'Build applications and systems using various programming languages',

            {/* Skill Analysis */}          requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],

            {skillAnalysis && (          avgSalary: 850000,

              <div className="bg-white rounded-lg shadow-md p-6">          growthRate: '13%'

                <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Analysis</h2>        },

                        {

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">          id: 'data-sci',

                  {/* Current Skills */}          title: 'Data Scientist',

                  <div>          match: 78,

                    <h3 className="font-semibold text-gray-700 mb-3">Current Skills</h3>          description: 'Analyze complex data to derive business insights',

                    <div className="flex flex-wrap gap-2">          requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Tableau'],

                      {skillAnalysis.current_skills?.map((skill, index) => (          avgSalary: 950000,

                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">          growthRate: '22%'

                          {skill}        },

                        </span>        {

                      ))}          id: 'ui-ux',

                    </div>          title: 'UI/UX Designer',

                  </div>          match: 72,

          description: 'Design user interfaces and experiences',

                  {/* Skill Gaps */}          requiredSkills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],

                  <div>          avgSalary: 750000,

                    <h3 className="font-semibold text-gray-700 mb-3">Skills to Learn</h3>          growthRate: '13%'

                    <div className="flex flex-wrap gap-2">        }

                      {skillAnalysis.skill_gaps?.map((gap, index) => (      ];

                        <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">      setCareers(fallbackCareers);

                          {gap}      setSelectedCareer(fallbackCareers[0]);

                        </span>    } finally {

                      ))}      setLoading(false);

                    </div>    }

                  </div>  };

                </div>

  const handleCareerClick = (career) => {

                {/* Recommendations */}    setSelectedCareer(career);

                <div className="mt-6">  };

                  <h3 className="font-semibold text-gray-700 mb-3">Recommendations</h3>

                  <ul className="space-y-2">  const getSkillsAnalysis = () => {

                    {skillAnalysis.recommendations?.map((rec, index) => (    if (!selectedCareer || !profile?.skills) {

                      <li key={index} className="flex items-start gap-2">      return { matched: [], missing: [] };

                        <span className="text-blue-600 mt-1">•</span>    }

                        <span className="text-gray-700 text-sm">{rec}</span>

                      </li>    const userSkills = profile.skills || [];

                    ))}    const requiredSkills = selectedCareer.requiredSkills || [];

                  </ul>    

                </div>    const matched = requiredSkills.filter(skill => 

              </div>      userSkills.some(userSkill => 

            )}        userSkill.toLowerCase().includes(skill.toLowerCase()) ||

          </div>        skill.toLowerCase().includes(userSkill.toLowerCase())

        </div>      )

      </div>    );

    </div>    

  );    const missing = requiredSkills.filter(skill => !matched.includes(skill));

};    

    return { matched, missing };

export default Dashboard;  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { from: 'user', text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await chatAPI.sendMessage({ message: chatInput });
      const botMessage = { 
        from: 'bot', 
        text: response.data?.message?.content || response.data?.message || 'I\'m here to help with your career questions!' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const isSkillMatched = (skill) => {
    if (!profile?.skills || !selectedCareer) return false;
    return profile.skills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile + Career Matches + Analysis */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.name || user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-gray-600">
                    {profile?.field_of_study || 'Student'} • {profile?.location || 'India'}
                  </p>
                </div>
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Education Level</h3>
                  <p className="text-gray-600">{profile?.education_level || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Experience</h3>
                  <p className="text-gray-600">{profile?.experience_years ? `${profile.experience_years} years` : 'Fresher'}</p>
                </div>
              </div>

              {/* Skills Cloud */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSkillMatched(skill)
                            ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile?.interests && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Interests</h3>
                  <p className="text-gray-600">{profile.interests}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={loadDashboardData}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                🔄 Refresh Recommendations
              </button>
            </div>

            {/* Career Matches Section */}
            <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Hi {profile?.name?.split(' ')[0] || 'there'}! 👋 Here Are Your Top Career Matches
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {careers.slice(0, 3).map((career, index) => (
                  <div
                    key={career.id}
                    onClick={() => handleCareerClick(career)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedCareer?.id === career.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{career.title}</h3>
                      <span className="text-sm font-medium text-green-600">
                        {career.match}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹{(career.avgSalary / 100000).toFixed(1)}L avg</span>
                      <span>{career.growthRate} growth</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Analysis Panel */}
            {selectedCareer && (
              <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Skill Analysis for {selectedCareer.title}
                </h3>
                
                {(() => {
                  const { matched, missing } = getSkillsAnalysis();
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skills You Have */}
                      <div>
                        <h4 className="text-lg font-semibold text-green-700 mb-3">
                          ✅ Skills You Have ({matched.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {matched.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        {matched.length === 0 && (
                          <p className="text-gray-500 text-sm">No matching skills found. Consider starting your learning journey!</p>
                        )}
                      </div>

                      {/* Skills To Develop */}
                      <div>
                        <h4 className="text-lg font-semibold text-amber-700 mb-3">
                          📚 Skills To Develop ({missing.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {missing.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        {missing.length === 0 && (
                          <p className="text-green-600 text-sm font-medium">🎉 You have all the required skills!</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Learning Resources */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📖 Suggested Learning Resources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://coursera.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-blue-600 font-medium">Coursera - Professional Certificates</span>
                    </a>
                    <a
                      href="https://udemy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-blue-600 font-medium">Udemy - Practical Courses</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Assistant Chat */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border border-white/20 h-[calc(100vh-120px)] flex flex-col sticky top-6">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🤖 AI Career Assistant</h3>
                <p className="text-sm text-gray-600">Ask me anything about careers!</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.from === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about careers, skills, or advice..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
