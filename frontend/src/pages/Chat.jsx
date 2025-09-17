import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { chatAPI } from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hello! I'm your AI Career Assistant powered by Google Gemini. Ask me about career paths, skills, or any professional guidance you need!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage({ message: userMsg.text });
      const botText = res.data?.message?.content || res.data?.message || 'How can I help you further?';
      const botMsg = { from: 'bot', text: botText };
      setMessages((m) => [...m, botMsg]);
    } catch (e) {
      setMessages((m) => [...m, { from: 'bot', text: 'Sorry, I could not get a response right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto p-6 flex flex-col h-[calc(100vh-64px)]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chat with your Career Advisor</h1>
          <p className="text-slate-600 mt-2">Ask anything about careers, skills, and learning paths</p>
        </div>
        <div className="flex-grow glass-effect p-6 rounded-2xl shadow-xl overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`${m.from === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-tl-none'} rounded-2xl py-2 px-4 max-w-xs shadow`}> 
                {m.text}
              </div>
            </div>
          ))}
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
          />
          <button className="btn-primary" onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
