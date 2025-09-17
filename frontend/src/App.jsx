import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from './services/api';

// --- Mock Data ---
// Based on common Indian career paths and your provided documents.
const allSkills = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'react', name: 'React.js' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'sql', name: 'SQL' },
    { id: 'nosql', name: 'NoSQL' },
    { id: 'machine_learning', name: 'Machine Learning' },
    { id: 'data_analysis', name: 'Data Analysis' },
    { id: 'statistics', name: 'Statistics' },
    { id: 'cloud_computing', name: 'Cloud Computing (AWS/GCP)' },
    { id: 'devops', name: 'DevOps' },
    { id: 'cybersecurity', name: 'Cyber Security' },
    { id: 'ui_ux_design', name: 'UI/UX Design' },
    { id: 'project_management', name: 'Project Management' },
    { id: 'communication', name: 'Communication' },
    { id: 'problem_solving', name: 'Problem Solving' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
];

const careersData = [
    {
        id: 'data_scientist',
        title: 'Data Scientist',
        description: 'Analyze and interpret complex data to help organizations make better decisions. Uses machine learning and statistical methods.',
        avgSalary: '₹12 - 25 LPA',
        requiredSkills: ['python', 'sql', 'machine_learning', 'data_analysis', 'statistics', 'problem_solving'],
        suggestedCourses: [
            { name: 'Data Science Specialization by Johns Hopkins', url: '#' },
            { name: 'Kaggle Tutorials & Competitions', url: '#' }
        ]
    },
    {
        id: 'full_stack_developer',
        title: 'Full Stack Developer',
        description: 'Works on both the front-end and back-end of a web application, handling everything from user interfaces to databases.',
        avgSalary: '₹8 - 20 LPA',
        requiredSkills: ['javascript', 'react', 'nodejs', 'sql', 'nosql', 'devops', 'problem_solving'],
        suggestedCourses: [
            { name: 'The Odin Project', url: '#' },
            { name: 'Full-Stack Open by University of Helsinki', url: '#' }
        ]
    },
    {
        id: 'cloud_architect',
        title: 'Cloud Architect',
        description: 'Designs and oversees an organization\'s cloud computing strategy, including cloud adoption plans and cloud management.',
        avgSalary: '₹15 - 30+ LPA',
        requiredSkills: ['cloud_computing', 'devops', 'cybersecurity', 'project_management', 'communication'],
        suggestedCourses: [
            { name: 'AWS Certified Solutions Architect - Associate', url: '#' },
            { name: 'Google Cloud Professional Cloud Architect Certification', url: '#' }
        ]
    },
    {
        id: 'cybersecurity_analyst',
        title: 'Cyber Security Analyst',
        description: 'Protects computer networks and systems from security breaches by identifying vulnerabilities and monitoring for threats.',
        avgSalary: '₹7 - 18 LPA',
        requiredSkills: ['cybersecurity', 'devops', 'python', 'problem_solving', 'communication'],
        suggestedCourses: [
            { name: 'CompTIA Security+ Certification', url: '#' },
            { name: 'Google Cybersecurity Professional Certificate', url: '#' }
        ]
    },
    {
        id: 'ui_ux_designer',
        title: 'UI/UX Designer',
        description: 'Focuses on creating user-friendly interfaces and ensuring a positive user experience. Involves research, wireframing, and prototyping.',
        avgSalary: '₹6 - 15 LPA',
        requiredSkills: ['ui_ux_design', 'problem_solving', 'communication', 'project_management'],
        suggestedCourses: [
            { name: 'Google UX Design Professional Certificate', url: '#' },
            { name: 'Interaction Design Foundation Courses', url: '#' }
        ]
    }
];

// --- SVG Icons ---
const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a3.375 3.375 0 00-3.375 3.375c0 1.863 1.512 3.375 3.375 3.375s3.375-1.512 3.375-3.375c0-1.863-1.512-3.375-3.375-3.375zm8.25 0a3.375 3.375 0 00-3.375 3.375c0 1.863 1.512 3.375 3.375 3.375s3.375-1.512 3.375-3.375c0-1.863-1.512-3.375-3.375-3.375zM12 15.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H12z" clipRule="evenodd" />
        <path d="M14.121 19.344c.39.39 1.023.39 1.414 0l2.121-2.121a1.06 1.06 0 00-1.414-1.414l-2.121 2.12a1.06 1.06 0 000 1.414zM8.464 19.344a1.06 1.06 0 010-1.414l-2.12-2.121a1.061 1.061 0 01-1.415 1.414l2.121 2.121a1.06 1.06 0 011.414 0z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423l1.188.398-1.188.398a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);


// --- Components ---

function Header() {
    return (
        <header className="glass-effect shadow-lg fixed top-0 left-0 right-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center space-x-3">
                       <SparklesIcon />
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Career Advisor</span>
                            <div className="text-xs text-slate-500 font-medium">Personalized Career Guidance</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-600 hidden sm:block">v1.0</span>
                         <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            🎓
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function ProfileForm({ onProfileUpdate }) {
    const [name, setName] = useState('');
    const [education, setEducation] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [interests, setInterests] = useState('');
    const [error, setError] = useState('');

    const handleSkillToggle = (skillId) => {
        setSelectedSkills(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!name.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!education) {
            setError('Please select your education level');
            return;
        }
        if (selectedSkills.length === 0) {
            setError('Please select at least one skill');
            return;
        }
        
        setError('');
        onProfileUpdate({ name, education, skills: selectedSkills, interests });
    };

    return (
        <div className="glass-effect p-8 rounded-2xl shadow-xl border border-white/20 card-hover">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="input-field" autoComplete="name" />
                </div>
                <div>
                    <label htmlFor="education" className="block text-sm font-semibold text-slate-700 mb-2">Current Education Level</label>
                    <select id="education" value={education} onChange={e => setEducation(e.target.value)} className="input-field" autoComplete="off">
                        <option value="">Select your education level</option>
                        <option value="highschool">High School</option>
                        <option value="college">College / University</option>
                        <option value="graduate">Fresh Graduate</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Skills</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border-2 border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-white">
                        {allSkills.map(skill => (
                            <button key={skill.id} type="button" onClick={() => handleSkillToggle(skill.id)}
                                className={`skill-tag transition-all duration-300 ${selectedSkills.includes(skill.id) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400 shadow-md scale-105' : 'hover:bg-blue-50 hover:border-blue-300 hover:scale-105'}`}>
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="interests" className="block text-sm font-semibold text-slate-700 mb-2">What are your interests?</label>
                    <textarea id="interests" value={interests} onChange={e => setInterests(e.target.value)} rows="3"
                        className="input-field resize-none"
                        placeholder="e.g., Gaming, AI, sustainable technology..." autoComplete="off"></textarea>
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                <button type="submit" className="btn-primary w-full">
                    🚀 Generate Career Insights
                </button>
            </form>
        </div>
    );
}

function CareerCard({ career, userSkills, onSelect }) {
    const userSkillSet = new Set(userSkills);
    const requiredSkillSet = new Set(career.requiredSkills);
    
    const matchedSkills = career.requiredSkills.filter(skill => userSkillSet.has(skill));
    const matchPercentage = Math.round((matchedSkills.length / requiredSkillSet.size) * 100);

    return (
        <div onClick={() => onSelect(career)} className="glass-effect p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:border-blue-300/50 cursor-pointer card-hover group">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">{career.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{career.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-emerald-600">{career.avgSalary}</p>
                    <p className="text-xs text-slate-500">Avg. Salary</p>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-700">Skill Match</span>
                    <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">{matchPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${matchPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
}

function SkillGapAnalysis({ selectedCareer, userSkills }) {
    if (!selectedCareer) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex items-center justify-center h-full text-slate-500">
                <p>Select a career recommendation to see your skill gap analysis.</p>
            </div>
        );
    }

    const userSkillSet = new Set(userSkills);
    const requiredSkills = selectedCareer.requiredSkills.map(id => allSkills.find(s => s.id === id));
    const missingSkills = requiredSkills.filter(skill => !userSkillSet.has(skill.id));
    const possessedSkills = requiredSkills.filter(skill => userSkillSet.has(skill.id));

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Skill Analysis for <span className="text-blue-600">{selectedCareer.title}</span></h3>
            <p className="text-sm text-slate-500 mb-6">Here's a breakdown of your skills for this role.</p>
            
            <div className="mb-6">
                <h4 className="font-semibold text-slate-700 mb-3">Skills You Have ({possessedSkills.length})</h4>
                <div className="flex flex-wrap gap-2">
                    {possessedSkills.length > 0 ? possessedSkills.map(skill => (
                        <span key={skill.id} className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">{skill.name}</span>
                    )) : <p className="text-sm text-slate-400">No matching skills identified.</p>}
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-slate-700 mb-3">Skills to Develop ({missingSkills.length})</h4>
                <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? missingSkills.map(skill => (
                        <span key={skill.id} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">{skill.name}</span>
                    )) : <p className="text-sm text-slate-400">You have all the required skills!</p>}
                </div>
            </div>
            
            {missingSkills.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Suggested Learning Resources</h4>
                    <ul className="space-y-2">
                        {selectedCareer.suggestedCourses.map(course => (
                            <li key={course.name}>
                                <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                    {course.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function Dashboard({ profile }) {
    const [recommendations, setRecommendations] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState(null);

    useEffect(() => {
        if (profile) {
            // Simple matching logic: score based on skill overlap
            const userSkillSet = new Set(profile.skills);
            const scoredCareers = careersData.map(career => {
                const matchedSkills = career.requiredSkills.filter(skill => userSkillSet.has(skill));
                const score = matchedSkills.length;
                return { ...career, score };
            });

            scoredCareers.sort((a, b) => b.score - a.score);
            setRecommendations(scoredCareers.slice(0, 3));
            setSelectedCareer(scoredCareers[0] || null);
        }
    }, [profile]);
    
    if (!profile) {
        return (
            <div className="glass-effect p-12 rounded-2xl shadow-xl border border-white/20 text-center">
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">🎯</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome!</h2>
                    <p className="text-slate-600 text-lg">Please fill out your profile to get personalized career recommendations.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Hi {profile.name}! 👋</h2>
                <h3 className="text-2xl font-semibold text-slate-700">Here Are Your Top Career Matches</h3>
                <p className="text-slate-600 text-lg">Based on your skills and interests, we recommend exploring these paths.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {recommendations.map((career, index) => (
                    <div key={career.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <CareerCard career={career} userSkills={profile.skills} onSelect={setSelectedCareer} />
                    </div>
                ))}
            </div>
            <div className="animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <SkillGapAnalysis selectedCareer={selectedCareer} userSkills={profile.skills} />
            </div>
        </div>
    );
}

function Chatbot() {
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hello! I'm your AI Career Assistant powered by Google Gemini. Ask me about career paths, skills, or any professional guidance you need!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Call the real API
            const response = await chatAPI.sendMessage({
                message: input,
                session_id: null // Will create a new session
            });

            const botMessage = { 
                from: 'bot', 
                text: response.data?.message?.content || response.data?.message || 'I am here to help with your career questions.',
                confidence: response.data?.confidence_score 
            };
            setMessages(prev => [...prev, botMessage]);

            // Add suggestions if available
            if (response.data.suggestions && response.data.suggestions.length > 0) {
                const suggestionsMessage = {
                    from: 'bot',
                    text: `Here are some follow-up questions you might ask:\n${response.data.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                };
                setMessages(prev => [...prev, suggestionsMessage]);
            }

        } catch (error) {
            console.error('Chat API error:', error);
            
            // Fallback to mock response on error
            let botResponseText = "I'm experiencing some technical difficulties. Let me try to help with a general response.";
            const lowerInput = input.toLowerCase();

            const careerMatch = careersData.find(c => lowerInput.includes(c.title.toLowerCase().split(' ')[0]));
            
            if (careerMatch) {
                botResponseText = `A ${careerMatch.title} typically ${careerMatch.description} The average salary is around ${careerMatch.avgSalary}. Key skills include ${careerMatch.requiredSkills.map(s => allSkills.find(sk => sk.id === s).name).join(', ')}.`;
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botResponseText = "Hi there! How can I assist you with your career questions today?";
            } else if (lowerInput.includes('skill')) {
                botResponseText = "To see a skill gap analysis, please select a career from your recommendations on the main dashboard.";
            }

            const botMessage = { from: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }

        setInput('');
    };

    return (
        <div className="glass-effect h-full flex flex-col rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    🤖 AI Assistant
                </h3>
                <p className="text-xs text-slate-500 mt-1">Powered by Google Gemini</p>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white/50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''} animate-fadeInUp`} style={{animationDelay: `${index * 0.1}s`}}>
                        {msg.from === 'bot' && <div className="flex-shrink-0 text-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-full shadow-sm"><BotIcon /></div>}
                        <div className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-sm ${msg.from === 'bot' ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none shadow-lg'}`}>
                            <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                            {msg.confidence && (
                                <p className="text-xs mt-2 opacity-70 bg-white/10 px-2 py-1 rounded-full inline-block">Confidence: {(msg.confidence * 100).toFixed(0)}%</p>
                            )}
                        </div>
                         {msg.from === 'user' && <div className="flex-shrink-0 text-slate-500 bg-gradient-to-br from-slate-100 to-slate-200 p-2 rounded-full shadow-sm"><UserIcon /></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 animate-fadeInUp">
                        <div className="flex-shrink-0 text-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-full shadow-sm"><BotIcon /></div>
                        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
                            <div className="flex items-center space-x-1">
                                <div className="animate-bounce bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-2 h-2"></div>
                                <div className="animate-bounce bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-2 h-2" style={{animationDelay: '0.1s'}}></div>
                                <div className="animate-bounce bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-2 h-2" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-white/20 bg-gradient-to-r from-slate-50/50 to-white/50">
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={isLoading ? "AI is thinking..." : "Ask about careers, skills..."}
                        disabled={isLoading}
                        className="flex-grow px-4 py-3 bg-white border-2 border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 shadow-sm transition-all duration-300"
                        autoComplete="off"
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.546l4.949-1.414a.75.75 0 00.546-.95L8.204 3.11a.75.75 0 00-.95-.821l-4.14 1.182zM10 2a.75.75 0 01.75.75v.007c0 .414-.336.75-.75.75h-.007a.75.75 0 01-.75-.75V2.75A.75.75 0 0110 2z" />
                            <path d="M10 10.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" />
                            <path d="M10 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4.02 12.04a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM12.98 4.96a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [userProfile, setUserProfile] = useState(null);

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen font-sans">
            <Header />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Profile & Dashboard */}
                        <div className="lg:col-span-8 space-y-8 animate-fadeInUp">
                            <ProfileForm onProfileUpdate={setUserProfile} />
                            <Dashboard profile={userProfile} />
                        </div>
                        {/* Right Column: Chatbot */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 h-[85vh] animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                           <Chatbot />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}