import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { careerAPI } from '../services/api';

const CareerRecommendationsCard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareerRecommendations();
  }, []);

  const fetchCareerRecommendations = async () => {
    try {
      setLoading(true);
      const response = await careerAPI.getRecommendations();
      
      // If we have real data, use it, otherwise use mock data
      if (response?.data?.careers && response.data.careers.length > 0) {
        setRecommendations(response.data.careers.slice(0, 10)); // Top 10
      } else {
        // Mock data based on your specification
        setRecommendations([
          { rank: 1, career: 'Software Developer', matchScore: 86 },
          { rank: 2, career: 'Data Scientist', matchScore: 82 },
          { rank: 3, career: 'Product Manager', matchScore: 78 },
          { rank: 4, career: 'UX Designer', matchScore: 75 },
          { rank: 5, career: 'DevOps Engineer', matchScore: 73 },
          { rank: 6, career: 'Machine Learning Engineer', matchScore: 71 },
          { rank: 7, career: 'Frontend Developer', matchScore: 69 },
          { rank: 8, career: 'Business Analyst', matchScore: 67 },
          { rank: 9, career: 'Cybersecurity Specialist', matchScore: 65 },
          { rank: 10, career: 'Cloud Architect', matchScore: 63 }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch career recommendations:', error);
      // Fallback data
      setRecommendations([
        { rank: 1, career: 'Software Developer', matchScore: 86 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 3) return 'bg-blue-100 text-blue-800';
    if (rank <= 5) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrophyIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Career Recommendations</h2>
            <p className="text-sm text-gray-600">Based on your profile analysis</p>
          </div>
        </div>

        {/* Table Header */}
        <div className="border-b border-gray-200 pb-3">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Career</div>
            <div className="col-span-4 text-right">Match Score</div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Rank */}
              <div className="col-span-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankBadgeColor(rec.rank)}`}>
                  {rec.rank}
                </span>
              </div>
              
              {/* Career Name */}
              <div className="col-span-6">
                <span className="text-sm font-medium text-gray-900 leading-tight">
                  {rec.career}
                </span>
              </div>
              
              {/* Match Score */}
              <div className="col-span-4 text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getMatchScoreColor(rec.matchScore)}`}>
                  {rec.matchScore}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Best Match</span>
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {recommendations[0]?.career || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Avg. Score</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {recommendations.length > 0 
                ? Math.round(recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendations.length)
                : 0}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BriefcaseIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Total Options</span>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {recommendations.length} careers
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
          Explore All Recommendations
        </button>
      </div>
    </div>
  );
};

export default CareerRecommendationsCard;