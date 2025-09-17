import React, { useState, useEffect, useRef } from 'react';

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
        <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                       <SparklesIcon />
                        <span className="text-xl font-bold text-slate-800">AI Career Advisor</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-600">Prototype</span>
                         <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            DB
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function ProfileForm({ onProfileUpdate }) {
    const [name, setName] = useState('Deepak Bansal');
    const [education, setEducation] = useState('college');
    const [selectedSkills, setSelectedSkills] = useState(['python', 'sql', 'javascript']);
    const [interests, setInterests] = useState('Building scalable web applications, exploring machine learning.');

    const handleSkillToggle = (skillId) => {
        setSelectedSkills(prev =>
            prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onProfileUpdate({ name, education, skills: selectedSkills, interests });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="education" className="block text-sm font-medium text-slate-700">Current Education Level</label>
                    <select id="education" value={education} onChange={e => setEducation(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="highschool">High School</option>
                        <option value="college">College / University</option>
                        <option value="graduate">Fresh Graduate</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Your Skills</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                        {allSkills.map(skill => (
                            <button key={skill.id} type="button" onClick={() => handleSkillToggle(skill.id)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedSkills.includes(skill.id) ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-slate-700">What are your interests?</label>
                    <textarea id="interests" value={interests} onChange={e => setInterests(e.target.value)} rows="3"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Gaming, AI, sustainable technology..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Generate Career Insights
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
        <div onClick={() => onSelect(career)} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{career.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{career.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <p className="text-lg font-bold text-green-600">{career.avgSalary}</p>
                    <p className="text-xs text-slate-500 text-right">Avg. Salary</p>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-700">Skill Match</span>
                    <span className="text-sm font-bold text-blue-700">{matchPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${matchPercentage}%` }}></div>
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
            <div className="text-center text-slate-500 py-10">
                <h2 className="text-2xl font-semibold">Welcome!</h2>
                <p>Please fill out your profile to get personalized career recommendations.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Hi {profile.name}, Here Are Your Top Career Matches</h2>
                <p className="text-slate-600 mt-2">Based on your skills and interests, we recommend exploring these paths.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {recommendations.map(career => (
                    <CareerCard key={career.id} career={career} userSkills={profile.skills} onSelect={setSelectedCareer} />
                ))}
            </div>
            <div>
                <SkillGapAnalysis selectedCareer={selectedCareer} userSkills={profile.skills} />
            </div>
        </div>
    );
}

function Chatbot() {
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hello! I'm your AI Career Assistant. Ask me about any career path to learn more." }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);

        // Simple hardcoded bot responses for prototype
        setTimeout(() => {
            let botResponseText = "I can provide general information. For personalized advice, please use the main dashboard.";
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
        }, 1000);

        setInput('');
    };

    return (
        <div className="bg-white h-full flex flex-col rounded-xl shadow-md border border-slate-200">
            <div className="p-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">AI Assistant</h3>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                        {msg.from === 'bot' && <div className="flex-shrink-0 text-blue-500 bg-blue-100 p-1 rounded-full"><BotIcon /></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.from === 'bot' ? 'bg-slate-200 text-slate-800 rounded-tl-none' : 'bg-blue-500 text-white rounded-br-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                         {msg.from === 'user' && <div className="flex-shrink-0 text-slate-500 bg-slate-200 p-1 rounded-full"><UserIcon /></div>}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-grow px-4 py-2 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
    const [initialProfileSet, setInitialProfileSet] = useState(false);
    
    // Set an initial profile to demonstrate the dashboard on first load.
    useEffect(() => {
        if (!initialProfileSet) {
            setUserProfile({
                name: 'Deepak Bansal',
                education: 'college',
                skills: ['python', 'sql', 'javascript'],
                interests: 'Building scalable web applications, exploring machine learning.'
            });
            setInitialProfileSet(true);
        }
    }, [initialProfileSet]);

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Header />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Profile & Dashboard */}
                        <div className="lg:col-span-8 space-y-8">
                            <ProfileForm onProfileUpdate={setUserProfile} />
                            <Dashboard profile={userProfile} />
                        </div>
                        {/* Right Column: Chatbot */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 h-[85vh]">
                           <Chatbot />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}