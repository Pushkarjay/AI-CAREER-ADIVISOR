import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <div className="text-white">AI Career Advisor</div>
        <div>
          <a href="/dashboard" className="text-gray-300 hover:text-white px-3">Dashboard</a>
          <a href="/profile" className="text-gray-300 hover:text-white px-3">Profile</a>
          <a href="/chat" className="text-gray-300 hover:text-white px-3">Chat</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
