import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useData } from '../contexts/DataContext';

const Chat = () => {
  const { chat, sendChatMessage, initializeChat } = useData();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [chat.messages]);

  // Initialize chat when component loads
  useEffect(() => {
    initializeChat();
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    const message = input;
    setInput('');
    
    await sendChatMessage(message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Desktop Layout - Full Window Width */}
      <div className="hidden lg:block px-6 pt-6 pb-4">
        <div className="flex flex-col h-[calc(100vh-80px)]">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chat with your Career Advisor</h1>
            <p className="text-slate-600 mt-2">Ask anything about careers, skills, and learning paths</p>
          </div>
          <div className="flex-grow glass-effect p-6 rounded-2xl shadow-xl overflow-y-auto">
            {chat.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`${m.from === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-tl-none'} rounded-2xl py-2 px-4 max-w-lg shadow`}> 
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-slate-200 rounded-tl-none rounded-2xl py-2 px-4 max-w-lg shadow">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <input
              type="text"
              className="input-field"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? send() : null}
              autoComplete="off"
            />
            <button className="btn-primary" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden container mx-auto p-6 flex flex-col h-[calc(100vh-64px)]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chat with your Career Advisor</h1>
          <p className="text-slate-600 mt-2">Ask anything about careers, skills, and learning paths</p>
        </div>
        <div className="flex-grow glass-effect p-6 rounded-2xl shadow-xl overflow-y-auto">
          {chat.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`${m.from === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-tl-none'} rounded-2xl py-2 px-4 max-w-xs shadow`}> 
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-slate-200 rounded-tl-none rounded-2xl py-2 px-4 max-w-xs shadow">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="mt-4 flex items-center space-x-3">
          <input
            type="text"
            className="input-field"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? send() : null}
            autoComplete="off"
          />
          <button className="btn-primary" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
