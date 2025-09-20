import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrophyIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { careerAPI } from '../services/api';
import { calculateMatchScore } from '../services/matchUtils';
import { useData } from '../contexts/DataContext';

const CareerRecommendationsCard = ({ totalDomains }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [optionsCount, setOptionsCount] = useState(null);
  const [lowMatchesTooltip, setLowMatchesTooltip] = useState('');
  const [loading, setLoading] = useState(true);
  const { roadmaps, fetchRoadmaps, profile } = useData();
  const navigate = useNavigate();

  // Compute full 1..N ranking from careers catalog based on user's skills
  const computeRanking = async () => {
    try {
      setLoading(true);
      const res = await careerAPI.getCareers();
      const list = Array.isArray(res?.data?.careers) ? res.data.careers : [];

      const userSkills = Array.isArray(profile?.data?.skills)
        ? profile.data.skills
        : String(profile?.data?.skills || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      // Rank all careers by match score
      const ranked = list
        .map((c) => {
          const req = Array.isArray(c.requiredSkills) ? c.requiredSkills : [];
          const { score } = calculateMatchScore(userSkills, req);
          return {
            career: c.title || c.career?.title || 'Unknown',
            matchScore: Math.round(score || 0),
          };
        })
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      // Deduplicate titles like "Data Analytics (46)" → "Data Analytics"
      const normalizeTitle = (t) => String(t).replace(/\s*\(\d+\)\s*$/, '').trim();
      const byTitle = new Map();
      for (const r of ranked) {
        const key = normalizeTitle(r.career);
        const existing = byTitle.get(key);
        if (!existing || (r.matchScore || 0) > (existing.matchScore || 0)) {
          byTitle.set(key, { ...r, career: key });
        }
      }
      const deduped = Array.from(byTitle.values())
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .filter((item) => (item.matchScore || 0) > 0)  // Only show >0% matches
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      // Compute >=40 count and low-match tooltip from the de-duplicated set
      const ge40 = deduped.filter((r) => (r.matchScore || 0) >= 40).length;
      const lessThan40 = deduped.filter((r) => (r.matchScore || 0) < 40).map((r) => `${r.career} (${r.matchScore}%)`);

      setRecommendations(deduped);
      setOptionsCount(ge40);
      setLowMatchesTooltip(lessThan40.length ? `Below 40%: ${lessThan40.join(', ')}` : '');
    } catch (error) {
      console.error('Failed to compute ranking:', error);
      setRecommendations([]);
      setOptionsCount(null);
      setLowMatchesTooltip('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    computeRanking();
    if (!roadmaps?.items?.length) {
      fetchRoadmaps?.();
    }
  }, []);

  useEffect(() => {
    // Recompute when profile skills change so scores update
    computeRanking();
  }, [profile?.data?.skills]);

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

  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Top Career Recommendations</h2>
        <p className="text-sm text-gray-600 mb-3">Add skills to your profile to see personalized matches.</p>
        <p className="text-xs text-gray-500">All careers scoring 0% are hidden. Update your profile to get relevant recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3" title={lowMatchesTooltip || undefined}
          onMouseEnter={() => {
            try {
              const lows = (recommendations || []).filter((r) => (r.matchScore || 0) < 40).map((r) => `${r.career} (${r.matchScore}%)`);
              setLowMatchesTooltip(lows.length ? `Below 40%: ${lows.join(', ')}` : '');
            } catch {}
          }}
        >
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

        {/* Recommendations List (no limit) */}
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
                ? Math.round(recommendations.reduce((sum, rec) => sum + (rec.matchScore || 0), 0) / recommendations.length)
                : 0}%
            </span>
          </div>

          <div className="flex items-center justify-between" title={lowMatchesTooltip || undefined}
            onMouseEnter={() => {
              try {
                // Build tooltip of < 40% from current recommendations
                const lows = (recommendations || []).filter((r) => (r.matchScore || 0) < 40).map((r) => `${r.career} (${r.matchScore}%)`);
                setLowMatchesTooltip(lows.length ? `Below 40%: ${lows.join(', ')}` : '');
              } catch {}
            }}
          >
            <div className="flex items-center space-x-2">
              <BriefcaseIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Total Options</span>
            </div>
            {(() => {
              // Prefer explicit optionsCount if large set available, else fall back to roadmaps size or recs
              const domainsCount = typeof totalDomains === 'number' ? totalDomains : (roadmaps?.items?.length || 0);
              // If we computed a >=40 count, show that; else fallback to size hints
              const base = typeof optionsCount === 'number' ? optionsCount : (domainsCount > 0 ? domainsCount : recommendations.length);
              const label = typeof optionsCount === 'number' ? `${base} options ≥ 40%` : (base >= 70 ? '70+ careers' : `${base} careers`);
              return (
                <span className="text-sm font-semibold text-green-600">{label}</span>
              );
            })()}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/careers')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Explore All Recommendations
        </button>
      </div>
    </div>
  );
};

export default CareerRecommendationsCard;