import React, { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Careers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [careers, setCareers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    salary: '',
    industry: ''
  });
  const [savedCareers, setSavedCareers] = useState(new Set());
  const [likedCareers, setLikedCareers] = useState(new Set());

  useEffect(() => {
    fetchRecommendations();
    fetchTrends();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await careerAPI.getRecommendations();
      setRecommendations(response.data.careers || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await careerAPI.getTrends();
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      const response = await careerAPI.search(searchQuery, filters);
      setCareers(response.data.careers || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search careers');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSaved = (careerId) => {
    const newSaved = new Set(savedCareers);
    if (newSaved.has(careerId)) {
      newSaved.delete(careerId);
      toast.success('Removed from saved careers');
    } else {
      newSaved.add(careerId);
      toast.success('Added to saved careers');
    }
    setSavedCareers(newSaved);
  };

  const toggleLiked = (careerId) => {
    const newLiked = new Set(likedCareers);
    if (newLiked.has(careerId)) {
      newLiked.delete(careerId);
    } else {
      newLiked.add(careerId);
    }
    setLikedCareers(newLiked);
  };

  const CareerCard = ({ career, showActions = true }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{career.title}</h3>
          <p className="text-gray-600 mb-2">{career.company}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {career.location}
            </div>
            <div className="flex items-center">
              <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
              {career.salary_range}
            </div>
            <div className="flex items-center">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              {career.experience}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => toggleLiked(career.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {likedCareers.has(career.id) ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => toggleSaved(career.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {savedCareers.has(career.id) ? (
                <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{career.description}</p>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {career.required_skills?.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {career.required_skills?.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{career.required_skills.length - 5} more
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <ChartBarIcon className="w-4 h-4 mr-1" />
            Match: {career.match_score}%
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const TrendCard = ({ trend }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{trend.field}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          trend.growth.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend.growth}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
      <div className="text-sm text-gray-500">
        <span className="font-medium">Avg Salary:</span> {trend.avg_salary}
      </div>
    </div>
  );

  const tabs = [
    { id: 'search', name: 'Search Results', count: careers.length },
    { id: 'recommendations', name: 'Recommendations', count: recommendations.length },
    { id: 'trends', name: 'Market Trends', count: trends.length },
  ];

  return (
    <>
      <Navbar />
      {/* Desktop Layout - Full Window Width */}
      <div className="hidden lg:block px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Explorer</h1>
          <p className="mt-2 text-gray-600">
            Discover career opportunities tailored to your skills and interests
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' ? handleSearch() : null}
                placeholder="Search for careers, roles, or companies..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="off"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Experience Level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Location</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="pune">Pune</option>
                <option value="hyderabad">Hyderabad</option>
              </select>

              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Salary Range</option>
                <option value="0-5">₹0-5 LPA</option>
                <option value="5-10">₹5-10 LPA</option>
                <option value="10-15">₹10-15 LPA</option>
                <option value="15+">₹15+ LPA</option>
              </select>

              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="consulting">Consulting</option>
              </select>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Careers'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'search' && (
          <div>
            {careers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {careers.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your profile to get personalized career recommendations.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div>
            {trends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trends.map((trend, index) => (
                  <TrendCard key={index} trend={trend} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading trends</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Market trends data will be available shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? handleSearch() : null}
              placeholder="Search for careers, roles, or companies..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Experience Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Location</option>
              <option value="bangalore">Bangalore</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi</option>
              <option value="pune">Pune</option>
              <option value="hyderabad">Hyderabad</option>
            </select>

            <select
              value={filters.salary}
              onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Salary Range</option>
              <option value="0-5">₹0-5 LPA</option>
              <option value="5-10">₹5-10 LPA</option>
              <option value="10-15">₹10-15 LPA</option>
              <option value="15+">₹15+ LPA</option>
            </select>

            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search Careers'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Search Results */}
        {activeTab === 'search' && (
          <div>
            {careers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {careers.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No search results</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try searching for careers or adjusting your filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Building recommendations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete your profile to get personalized career recommendations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Market Trends */}
        {activeTab === 'trends' && (
          <div>
            {trends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trends.map((trend, index) => (
                  <TrendCard key={index} trend={trend} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading trends</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Market trends data will be available shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Explorer</h1>
          <p className="mt-2 text-gray-600">
            Discover career opportunities tailored to your skills and interests
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' ? handleSearch() : null}
                placeholder="Search for careers, roles, or companies..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="off"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Experience Level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="pune">Pune</option>
              </select>

              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Salary Range</option>
                <option value="0-5">0-5 LPA</option>
                <option value="5-10">5-10 LPA</option>
                <option value="10-20">10-20 LPA</option>
                <option value="20+">20+ LPA</option>
              </select>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'search' && (
          <div>
            {careers.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {careers.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {recommendations.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your profile to get personalized career recommendations.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div>
            {trends.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {trends.map((trend, index) => (
                  <TrendCard key={index} trend={trend} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading trends</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Market trends data will be available shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Careers;