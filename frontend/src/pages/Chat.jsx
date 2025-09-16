import React from 'react';
import Navbar from '../components/Navbar';

const Chat = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
        <h1 className="text-3xl font-bold mb-6">Chat with your Career Advisor</h1>
        <div className="flex-grow bg-gray-100 p-4 rounded-lg overflow-y-auto">
          {/* Chat messages will go here */}
          <div className="flex justify-end mb-4">
            <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-xs">
              This is a user message.
            </div>
          </div>
          <div className="flex justify-start mb-4">
            <div className="bg-gray-300 rounded-lg py-2 px-4 max-w-xs">
              This is a bot response.
            </div>
          </div>
        </div>
        <div className="mt-4">
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
