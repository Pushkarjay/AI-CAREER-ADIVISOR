import React, { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';
import { useData } from '../contexts/DataContext';
import { calculateMatchScore } from '../services/matchUtils';
import Navbar from '../components/Navbar';
import CareerRecommendationsCard from '../components/CareerRecommendationsCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  HeartIcon,
  BookmarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const Careers = () => {
  const { roadmaps, fetchRoadmaps, profile } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [careers, setCareers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [realJobs, setRealJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    salary: '',
    industry: ''
  });
  const [jobSearchParams, setJobSearchParams] = useState({
    location: 'India',
    results_wanted: 20,
    hours_old: 72
  });
  const [savedCareers, setSavedCareers] = useState(new Set());
  const [likedCareers, setLikedCareers] = useState(new Set());
  const [generatingPersonalizedPath, setGeneratingPersonalizedPath] = useState(false);
  const [personalizedPathData, setPersonalizedPathData] = useState(null);
  const [showPersonalizedModal, setShowPersonalizedModal] = useState(false);
  const [selectedCareerDetails, setSelectedCareerDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchTrends();
    if (!roadmaps.items?.length) fetchRoadmaps();
  }, []);

  const fetchRecommendations = async () => {
    try {
      // Build recommendations from full careers catalog for consistency
      const allRes = await careerAPI.getCareers();
      const raw = Array.isArray(allRes?.data?.careers) ? allRes.data.careers : [];
      const userSkills = Array.isArray(profile?.data?.skills)
        ? profile.data.skills
        : String(profile?.data?.skills || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      const ranked = raw.map((c) => {
        const req = Array.isArray(c.requiredSkills) ? c.requiredSkills : [];
        const { score } = calculateMatchScore(userSkills, req);
        return {
          id: c.id,
          title: c.title,
          company: '—',
          location: 'Multiple Cities',
          salary_range: '—',
          experience: 'entry',
          required_skills: req,
          match_score: Math.round(score),
          description: c.description || '—',
        };
      });

      // Deduplicate titles like "Name (n)" and keep highest score
      const normalize = (t) => String(t).replace(/\s*\(\d+\)\s*$/, '').trim();
      const bestByTitle = new Map();
      for (const r of ranked) {
        const key = normalize(r.title);
        const ex = bestByTitle.get(key);
        if (!ex || (r.match_score || 0) > (ex.match_score || 0)) bestByTitle.set(key, { ...r, title: key });
      }
      let mapped = Array.from(bestByTitle.values())
        .filter((c) => (c.match_score || 0) > 0)
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      setRecommendations(mapped);
      // Auto-switch to Recommendations if we have results and currently on Search with nothing
      if (mapped.length > 0 && activeTab !== 'recommendations') {
        setActiveTab('recommendations');
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendations([]);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await careerAPI.getTrends();
      const data = response?.data || {};
      const topGrowing = data.top_growing_careers || [];
      setTrends(topGrowing.map((t) => ({
        field: t.title,
        growth: `+${t.growth_rate}%`,
        description: 'High demand role',
        avg_salary: '—',
      })));
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      setTrends([]);
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
      const list = Array.isArray(response?.data) ? response.data : response?.data || [];
      // Response from v1 is a list of CareerMatch
      const userSkills = Array.isArray(profile?.data?.skills)
        ? profile.data.skills
        : String(profile?.data?.skills || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      const mapped = list.map((m) => ({
        id: m.career?.id || m.id,
        title: m.career?.title || m.title,
        company: m.company || '—',
        location: m.career?.location || 'Multiple Cities',
        salary_range: m.career?.salary_range_min && m.career?.salary_range_max
          ? `${Math.round(m.career.salary_range_min/100000)}-${Math.round(m.career.salary_range_max/100000)} LPA`
          : '—',
        experience: m.career?.experience_level || 'entry',
        required_skills: m.career?.required_skills || [],
        match_score: Math.round(
          typeof m.match_score === 'number' ? m.match_score : (
            typeof m.skill_match_percentage === 'number' ? m.skill_match_percentage :
            calculateMatchScore(userSkills, m.career?.required_skills || []).score
          )
        ),
        description: m.career?.description || '—',
      }));
      mapped.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      setCareers(mapped);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search careers');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a job search term');
      return;
    }
    try {
      setLoading(true);
      const response = await careerAPI.searchJobs({
        search_term: searchQuery,
        location: jobSearchParams.location,
        results_wanted: jobSearchParams.results_wanted,
        hours_old: jobSearchParams.hours_old,
        country_indeed: jobSearchParams.location === 'India' ? 'India' : 'USA'
      });
      
      const jobsList = response?.data?.jobs || [];
      setRealJobs(jobsList);
      setActiveTab('jobs');
      toast.success(`Found ${jobsList.length} real job listings`);
    } catch (error) {
      console.error('Job search failed:', error);
      toast.error('Failed to search jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
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

  const handleGeneratePersonalizedPath = async (careerId, careerTitle) => {
    try {
      setGeneratingPersonalizedPath(true);
      toast.loading('Generating your personalized career path with AI...', { id: 'personalized-path' });
      
      const response = await careerAPI.generatePersonalizedPath(careerId);
      const data = response?.data || {};
      
      setPersonalizedPathData({
        ...data,
        careerTitle: careerTitle || data.career_title
      });
      setShowPersonalizedModal(true);
      
      toast.success('Personalized career path generated!', { id: 'personalized-path' });
    } catch (error) {
      console.error('Failed to generate personalized path:', error);
      toast.error('Failed to generate personalized path. Please try again.', { id: 'personalized-path' });
    } finally {
      setGeneratingPersonalizedPath(false);
    }
  };

  const handleViewDetails = async (careerId, careerTitle) => {
    try {
      // Try to fetch career details from API
      const response = await careerAPI.getCareerDetails(careerId);
      const details = response?.data || {};
      
      setSelectedCareerDetails({
        id: careerId,
        title: careerTitle,
        ...details
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch career details:', error);
      // Fallback to mock data
      setSelectedCareerDetails({
        id: careerId,
        title: careerTitle,
        description: 'Detailed career information',
        salary_range: '5-15 LPA',
        growth_potential: 8.5,
        required_skills: ['Skill 1', 'Skill 2', 'Skill 3'],
        responsibilities: ['Responsibility 1', 'Responsibility 2'],
        career_progression: ['Junior → Mid → Senior → Lead']
      });
      setShowDetailsModal(true);
    }
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
          <div className="mt-3 flex gap-2">
            <Link to="/roadmaps" className="text-xs text-blue-600 hover:underline">View related learning roadmaps</Link>
            <Link to={`/roadmaps?select=${encodeURIComponent(career.title || '')}`} className="text-xs text-slate-500 underline">Personalize path</Link>
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
          <div className="flex gap-2">
            <button 
              onClick={() => handleGeneratePersonalizedPath(career.id, career.title)}
              disabled={generatingPersonalizedPath}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPersonalizedPath ? 'Generating...' : 'AI Path'}
            </button>
            <button 
              onClick={() => handleViewDetails(career.id, career.title)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RealJobCard = ({ job }) => {
    const formatSalary = () => {
      if (job.min_amount && job.max_amount) {
        return `${job.currency || '₹'} ${Math.round(job.min_amount / 1000)}k - ${Math.round(job.max_amount / 1000)}k ${job.interval || ''}`;
      }
      return 'Not specified';
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Recently';
      try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
      } catch {
        return 'Recently';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              {job.is_remote && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Remote
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-2 font-medium">{job.company}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4 flex-wrap">
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                {formatSalary()}
              </div>
              {job.job_type && (
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  {job.job_type}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {job.site}
              </span>
              <span className="text-gray-500">{formatDate(job.date_posted)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleLiked(job.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {likedCareers.has(job.id) ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => toggleSaved(job.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {savedCareers.has(job.id) ? (
                <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {job.description && (
          <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                View on {job.site}
              </a>
            )}
            {job.job_url_direct && job.job_url !== job.job_url_direct && (
              <a
                href={job.job_url_direct}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Apply Direct
              </a>
            )}
          </div>
          {job.company_url && (
            <a
              href={job.company_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Company Info
            </a>
          )}
        </div>
      </div>
    );
  };

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
    { id: 'jobs', name: 'Real Jobs', count: realJobs.length },
    { id: 'search', name: 'Career Paths', count: careers.length },
    { id: 'recommendations', name: 'Recommendations', count: recommendations.length },
    { id: 'trends', name: 'Market Trends', count: trends.length },
  ];

  return (
    <>
      <Navbar />
      {/* Desktop Layout - Full Window Width with 1:2 Grid */}
      <div className="hidden lg:block px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Career Recommendations (1 part) */}
          <div className="col-span-1">
            <CareerRecommendationsCard totalDomains={(roadmaps.items || []).length} />
          </div>
          
          {/* Right Column - Career Content (2 parts) */}
          <div className="col-span-2 space-y-6">
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

                  <button
                    onClick={handleJobSearch}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search Real Jobs'}
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
            {activeTab === 'jobs' && (
              <div>
                {realJobs.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-600">
                      Found {realJobs.length} real job listings from Indeed, LinkedIn, ZipRecruiter, and Google Jobs
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {realJobs.map((job) => (
                        <RealJobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Click "Search Real Jobs" to find current job openings from multiple job boards.
                    </p>
                  </div>
                )}
              </div>
            )}

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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((career) => (
                      <CareerCard key={career.id} career={career} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching recommendations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add more skills to your profile to get personalized career recommendations with match scores above 0%.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Try the "All Domains" tab to explore career paths regardless of current match score.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trends' && (
              <div>
                {trends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-4 py-6 space-y-6">
        {/* Career Recommendations Card - Mobile */}
        <CareerRecommendationsCard />
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Explorer</h1>
          <p className="mt-1 text-gray-600">
            Discover opportunities tailored to your skills
          </p>
        </div>
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

          <button
            onClick={handleJobSearch}
            disabled={loading}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search Real Jobs'}
          </button>
        </div>
      </div>

      {/* Personalized Path Modal */}
      {showPersonalizedModal && personalizedPathData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Your Personalized Career Path
              </h2>
              <button
                onClick={() => setShowPersonalizedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {personalizedPathData.careerTitle}
                </h3>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-600 font-medium">
                    Match Score: {personalizedPathData.match_score}%
                  </span>
                  <span className="text-blue-600">
                    Powered by Google Gemini AI
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                {personalizedPathData.personalized_plan?.plan ? (
                  <div className="whitespace-pre-wrap text-gray-700">
                    {personalizedPathData.personalized_plan.plan}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(personalizedPathData.personalized_plan || {}).map(([key, value]) => {
                      // Skill Gap Analysis
                      if (key === 'skill_gap_analysis') {
                        return (
                          <div key={key} className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                              🎯 Skill Gap Analysis
                            </h4>
                            <div className="space-y-3">
                              {value.skills_you_have && (
                                <div className="bg-green-50 p-3 rounded">
                                  <p className="font-medium text-green-900 mb-2">✅ Skills You Have:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {value.skills_you_have.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {value.critical_missing_skills && (
                                <div className="bg-orange-50 p-3 rounded">
                                  <p className="font-medium text-orange-900 mb-2">🎓 Skills to Develop:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {value.critical_missing_skills.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-orange-600 text-white text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      // Learning Roadmap
                      if (key === 'learning_roadmap' && Array.isArray(value)) {
                        return (
                          <div key={key} className="border-l-4 border-purple-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 capitalize text-lg">
                              📚 Learning Roadmap
                            </h4>
                            <div className="space-y-4">
                              {value.map((resource, idx) => (
                                <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h5 className="font-semibold text-blue-900">{resource.skill}</h5>
                                      {resource.phase && <p className="text-xs text-blue-600">{resource.phase}</p>}
                                    </div>
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                      Priority: {resource.priority}
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {resource.resources?.map((r, ridx) => (
                                      <div key={ridx} className="bg-white p-3 rounded border">
                                        <a 
                                          href={r.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline font-medium block mb-1"
                                        >
                                          {r.title} ↗
                                        </a>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">{r.platform}</span> • 
                                          {r.duration} • {r.cost}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{r.why}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // Hands-on Projects
                      if (key === 'hands_on_projects' && Array.isArray(value)) {
                        return (
                          <div key={key} className="border-l-4 border-green-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 capitalize text-lg">
                              🚀 Hands-On Projects
                            </h4>
                            <div className="grid gap-4">
                              {value.map((project, idx) => (
                                <div key={idx} className="bg-green-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-green-900">{project.title}</h5>
                                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                      {project.difficulty} • {project.duration}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mb-2">{project.description}</p>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {project.skills_practiced?.map((skill, sidx) => (
                                      <span key={sidx} className="px-2 py-1 bg-white text-green-700 text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  {(project.tutorial_url || project.github_examples) && (
                                    <div className="mt-2 space-y-1">
                                      {project.tutorial_url && (
                                        <a 
                                          href={project.tutorial_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-sm block"
                                        >
                                          📖 Tutorial ↗
                                        </a>
                                      )}
                                      {project.github_examples?.map((link, lidx) => (
                                        <a 
                                          key={lidx}
                                          href={link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-sm block"
                                        >
                                          💻 GitHub Example {lidx + 1} ↗
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // Certifications
                      if (key === 'certifications' && Array.isArray(value)) {
                        return (
                          <div key={key} className="border-l-4 border-yellow-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                              🏆 Certifications
                            </h4>
                            <div className="space-y-3">
                              {value.map((cert, idx) => (
                                <div key={idx} className="bg-yellow-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h5 className="font-semibold text-yellow-900">{cert.name}</h5>
                                      <p className="text-sm text-gray-600">{cert.provider}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                                      Priority: {cert.priority}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 space-y-1">
                                    <p>💰 Cost: {cert.cost}</p>
                                    <p>⏱️ Prep Time: {cert.prep_time}</p>
                                    <p className="text-gray-600 italic">{cert.why_valuable || cert.value}</p>
                                  </div>
                                  {cert.url && (
                                    <a 
                                      href={cert.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                    >
                                      View Certification ↗
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // Networking
                      if (key === 'networking') {
                        return (
                          <div key={key} className="border-l-4 border-indigo-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                              🤝 Networking & Community
                            </h4>
                            <div className="space-y-3">
                              {value.communities && (
                                <div className="bg-indigo-50 p-3 rounded">
                                  <p className="font-medium text-indigo-900 mb-2">Communities to Join:</p>
                                  {value.communities.map((comm, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded mb-2">
                                      <a 
                                        href={comm.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium"
                                      >
                                        {comm.name} ({comm.platform}) ↗
                                      </a>
                                      <p className="text-sm text-gray-600">{comm.benefit}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {value.linkedin_strategy && (
                                <div className="bg-blue-50 p-3 rounded">
                                  <p className="font-medium text-blue-900">LinkedIn Strategy:</p>
                                  <p className="text-sm text-gray-700">{value.linkedin_strategy}</p>
                                </div>
                              )}
                              {value.mentorship && (
                                <div className="bg-purple-50 p-3 rounded">
                                  <p className="font-medium text-purple-900">Mentorship:</p>
                                  <p className="text-sm text-gray-700">{value.mentorship}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      // Timeline
                      if (key === 'timeline') {
                        return (
                          <div key={key} className="border-l-4 border-pink-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                              📅 Timeline & Milestones
                            </h4>
                            <div className="space-y-3">
                              {Object.entries(value).map(([period, details]) => (
                                <div key={period} className="bg-pink-50 p-3 rounded">
                                  <h5 className="font-medium text-pink-900 capitalize mb-1">
                                    {period.replace(/_/g, ' ')}
                                  </h5>
                                  {typeof details === 'object' ? (
                                    <div className="text-sm text-gray-700 space-y-1">
                                      {details.focus && <p>🎯 Focus: {details.focus}</p>}
                                      {details.milestone && <p>🏁 Milestone: {details.milestone}</p>}
                                      {details.goal && <p>🎯 Goal: {details.goal}</p>}
                                      {details.deliverables && (
                                        <ul className="list-disc list-inside ml-2">
                                          {details.deliverables.map((d, idx) => (
                                            <li key={idx}>{d}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {details.tasks && (
                                        <ul className="list-disc list-inside ml-2">
                                          {details.tasks.map((t, idx) => (
                                            <li key={idx}>{t}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700">{details}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // Default rendering for other sections
                      return (
                        <div key={key} className="border-l-4 border-gray-400 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2 capitalize text-lg">
                            {key.replace(/_/g, ' ')}
                          </h4>
                          {typeof value === 'string' ? (
                            <p className="text-gray-700">{value}</p>
                          ) : Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.map((item, idx) => (
                                <li key={idx} className="text-gray-700">
                                  {typeof item === 'string' ? item : (
                                    item.url ? (
                                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {item.name || item.title} ↗
                                      </a>
                                    ) : JSON.stringify(item)
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : typeof value === 'object' ? (
                            <div className="bg-gray-50 p-3 rounded space-y-2">
                              {Object.entries(value).map(([k, v]) => (
                                <div key={k}>
                                  <span className="font-medium text-gray-700 capitalize">{k.replace(/_/g, ' ')}: </span>
                                  {Array.isArray(v) ? (
                                    <ul className="list-disc list-inside ml-4">
                                      {v.map((item, idx) => (
                                        <li key={idx} className="text-gray-600 text-sm">{item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-600">{String(v)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-700">{String(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(personalizedPathData, null, 2));
                    toast.success('Copied to clipboard!');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowPersonalizedModal(false)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Details Modal */}
      {showDetailsModal && selectedCareerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCareerDetails.title}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700">{selectedCareerDetails.description}</p>
              </div>

              {selectedCareerDetails.salary_range_min && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Salary Range</h3>
                  <p className="text-gray-700">
                    ₹{Math.round(selectedCareerDetails.salary_range_min/100000)} - 
                    ₹{Math.round(selectedCareerDetails.salary_range_max/100000)} LPA
                  </p>
                </div>
              )}

              {selectedCareerDetails.required_skills && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareerDetails.required_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCareerDetails.preferred_skills && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareerDetails.preferred_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCareerDetails.typical_responsibilities && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Key Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {selectedCareerDetails.typical_responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCareerDetails.career_progression && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Career Progression</h3>
                  <div className="space-y-2">
                    {selectedCareerDetails.career_progression.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <span className="font-medium text-blue-600">{stage.level || stage}</span>
                        {stage.years && <span className="text-gray-600">({stage.years})</span>}
                        {stage.salary_range && <span className="text-green-600 ml-auto">{stage.salary_range}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCareerDetails.growth_potential && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Growth Potential</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${selectedCareerDetails.growth_potential * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700 font-medium">{selectedCareerDetails.growth_potential}/10</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleGeneratePersonalizedPath(selectedCareerDetails.id, selectedCareerDetails.title);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Generate AI Learning Path
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
};

export default Careers;