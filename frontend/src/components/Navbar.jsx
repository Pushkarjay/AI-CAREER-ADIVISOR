import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon,
  ChartBarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  MapIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigation = [
    { name: 'Education in India', href: '/education-india', icon: AcademicCapIcon },
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Career Roadmap', href: '/roadmap', icon: MapIcon },
    { name: 'Learning Roadmaps', href: '/roadmaps', icon: MapIcon },
    { name: 'Careers', href: '/careers', icon: BriefcaseIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Resume', href: '/resume', icon: DocumentTextIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      {/* Desktop Layout - Full Width */}
      <div className="hidden lg:flex items-center h-14 px-3 xl:px-4">
        {/* Logo - Extreme Left */}
        <div className="flex items-center flex-shrink-0 mr-2">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
              <span className="text-white font-bold text-xs">🎓</span>
            </div>
            <span className="text-sm xl:text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              Career Advisor
            </span>
          </Link>
        </div>

        {/* Desktop navigation - Center */}
        <div className="flex-1 flex justify-center overflow-x-auto">
          <div className="flex items-center space-x-0.5 xl:space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 xl:px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-700 bg-blue-50 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1 xl:mr-1.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User menu - Extreme Right */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <div className="flex items-center text-xs xl:text-sm text-gray-700">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-1.5">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-gray-600" />
              )}
            </div>
            <span className="mr-2 max-w-24 xl:max-w-32 truncate hidden xl:inline">
              {user?.displayName || user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs xl:text-sm py-1.5 px-3 xl:px-4 rounded-md transition-colors duration-200 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden max-w-7xl mx-auto pl-2 pr-3 sm:pl-3 sm:pr-4">
        <div className="flex items-center h-14">
          {/* Logo - Mobile */}
          <div className="flex items-center flex-shrink-0 mr-4">
            <Link to="/dashboard" className="flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                <span className="text-white font-bold text-xs">🎓</span>
              </div>
              <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Career Advisor
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? (
                <XMarkIcon className="block h-5 w-5" />
              ) : (
                <Bars3Icon className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile user menu */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-800 truncate">
                    {user?.displayName || 'User'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
