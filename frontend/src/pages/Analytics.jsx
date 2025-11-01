import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import SkillsAnalysisCard from '../components/SkillsAnalysisCard';
import PrototypeButton from '../components/PrototypeButton';
import { notifications } from '../utils/prototypeNotifications';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon,
  AcademicCapIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);
  const [skillAnalytics, setSkillAnalytics] = useState(null);
  const [careerJourney, setCareerJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [dashboard, trends, skills, journey] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getMarketTrends(),
        analyticsAPI.getSkillAnalytics(),
        analyticsAPI.getCareerJourney()
      ]);

      setDashboardData(dashboard.data);
      setMarketTrends(trends.data);
      setSkillAnalytics(skills.data);
      setCareerJourney(journey.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshMarketTrends = async () => {
    try {
      setLoadingTrends(true);
      toast.loading('Fetching latest market trends with AI...', { id: 'market-trends' });
      // Show notification about AI-powered trends
      notifications.marketTrends();
      const trends = await analyticsAPI.getMarketTrends();
      setMarketTrends(trends.data);
      toast.success('Market trends updated!', { id: 'market-trends' });
    } catch (error) {
      console.error('Failed to refresh market trends:', error);
      toast.error('Failed to refresh market trends', { id: 'market-trends' });
    } finally {
      setLoadingTrends(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
      },
      slate: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
      }
    };
    const chosen = colorClasses[color] || colorClasses.blue;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change.startsWith('+') ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {change}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${chosen.bg}`}>
            <Icon className={`w-6 h-6 ${chosen.text}`} />
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'trends', name: 'Market Trends', icon: ArrowTrendingUpIcon },
    { id: 'skills', name: 'Skills Analysis', icon: AcademicCapIcon },
    { id: 'journey', name: 'Career Journey', icon: UsersIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* Desktop Layout - Full Window Width with 1:2 Grid */}
      <div className="hidden lg:block px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Skills Analysis (1 part) */}
          <div className="col-span-1">
            <SkillsAnalysisCard />
          </div>
          
          {/* Right Column - Analytics Content (2 parts) */}
          <div className="col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track your progress and explore career insights
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Chat Sessions"
              value={dashboardData?.user_stats?.chat_sessions || 0}
              icon={ChartBarIcon}
              color="blue"
            />
            <StatCard
              title="Messages Sent"
              value={dashboardData?.user_stats?.messages_sent || 0}
              icon={ArrowTrendingUpIcon}
              color="green"
            />
            <StatCard
              title="Career Recommendations"
              value={dashboardData?.user_stats?.career_recommendations || 0}
              icon={UsersIcon}
              color="purple"
            />
            <StatCard
              title="Profile Completion"
              value={`${dashboardData?.user_stats?.profile_completion || 0}%`}
              icon={AcademicCapIcon}
              color="orange"
            />
          </div>

          {/* Skill Progress Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.skill_progress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current_level" fill="#3B82F6" name="Current Level" />
                <Bar dataKey="target_level" fill="#E5E7EB" name="Target Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activities & Career Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {(dashboardData?.recent_activities || []).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Readiness</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                  <span>Overall Score</span>
                  <span>{dashboardData?.career_readiness?.overall_score || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${dashboardData?.career_readiness?.overall_score || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Next Steps:</h4>
                {(dashboardData?.career_readiness?.next_steps || []).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Trends Tab */}
      {activeTab === 'trends' && marketTrends && (
        <div className="space-y-6">
          {/* Header with Refresh Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Market Trends & Insights</h2>
            <button
              onClick={refreshMarketTrends}
              disabled={loadingTrends}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loadingTrends ? 'Refreshing...' : 'Refresh Trends'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Demand */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Demand Trends</h3>
              <div className="space-y-3">
                {(marketTrends?.skill_demand || []).map((skill, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{skill.skill}</span>
                      {skill.trend && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          skill.trend === 'rising' ? 'bg-green-100 text-green-700' :
                          skill.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {skill.trend}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold">{skill.demand_change}</span>
                      <div className="text-sm text-gray-500">{skill.avg_salary}</div>
                      {skill.job_openings && (
                        <div className="text-xs text-gray-400">{skill.job_openings.toLocaleString()} jobs</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Growth */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketTrends.industry_growth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="industry" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="job_openings" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Location Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cities for Career Growth</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(marketTrends?.location_insights || []).map((location, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900">{location.city}</h4>
                  <p className="text-sm text-gray-600">Avg Salary: {location.avg_salary}</p>
                  <p className="text-sm text-gray-600">Jobs: {(location.job_count || 0).toLocaleString()}</p>
                  {location.growth_rate && (
                    <p className="text-sm text-green-600 font-medium">Growth: {location.growth_rate}</p>
                  )}
                  {location.cost_of_living && (
                    <p className="text-xs text-gray-500 mt-1">Cost of Living: {location.cost_of_living}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emerging Roles */}
          {marketTrends?.emerging_roles && marketTrends.emerging_roles.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emerging & Hot Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketTrends.emerging_roles.map((role, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4 p-3 bg-purple-50 rounded">
                    <h4 className="font-semibold text-gray-900">{role.role}</h4>
                    <p className="text-sm text-green-600 font-medium">Growth: {role.growth}</p>
                    <p className="text-sm text-gray-700">Avg Salary: {role.avg_salary}</p>
                    {role.demand_score && (
                      <p className="text-sm text-blue-600">Demand Score: {role.demand_score}/10</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights Summary */}
          {marketTrends?.insights && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketTrends.insights.opportunities && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Opportunities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {marketTrends.insights.opportunities.map((opp, idx) => (
                        <li key={idx}>{opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {marketTrends.insights.recommendations && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {marketTrends.insights.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generation timestamp */}
          {marketTrends?.generated_at && (
            <p className="text-xs text-gray-500 text-center">
              Data generated: {new Date(marketTrends.generated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Skills Analysis Tab */}
      {activeTab === 'skills' && skillAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Gaps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Skill Gaps</h3>
              <div className="space-y-4">
                {(skillAnalytics?.skill_gaps || []).map((gap, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4">
                    <h4 className="font-semibold text-gray-900">{gap.missing_skill}</h4>
                    <p className="text-sm text-gray-600">Market Demand: {gap.market_demand}</p>
                    <p className="text-sm text-gray-600">Learning Time: {gap.learning_time}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      gap.importance === 'High' ? 'bg-red-100 text-red-800' :
                      gap.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.importance} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Skills</h3>
              <div className="space-y-4">
                {(skillAnalytics?.skill_recommendations || []).map((rec, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-gray-900">{rec.skill}</h4>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                    <p className="text-sm text-green-600 font-medium">{rec.market_value}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {rec.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{skillAnalytics?.competitive_analysis?.percentile || 0}th</div>
                <div className="text-sm text-gray-600">Percentile</div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {(skillAnalytics?.competitive_analysis?.strengths || []).map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Areas to Improve</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {(skillAnalytics?.competitive_analysis?.improvement_areas || []).map((area, index) => (
                    <li key={index}>• {area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Journey Tab */}
      {activeTab === 'journey' && careerJourney && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Journey Progress</h3>
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                <span>Overall Progress</span>
                <span>{careerJourney.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" 
                  style={{ width: `${careerJourney.progress_percentage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-600">Current Stage: <span className="font-semibold">{careerJourney.current_stage}</span></p>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Milestones</h3>
            <div className="space-y-4">
              {(careerJourney?.milestones || []).map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    milestone.status === 'completed' ? 'bg-green-500' :
                    milestone.status === 'in_progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{milestone.stage}</h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    {milestone.completion_date && (
                      <p className="text-xs text-gray-500">Completed: {milestone.completion_date}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                    milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(milestone.status || '').replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline & Next Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Estimated Job Ready:</span>
                  <span className="ml-2 text-gray-600">{careerJourney?.timeline?.estimated_job_ready || 'Not set'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Next Milestone:</span>
                  <span className="ml-2 text-gray-600">{careerJourney?.timeline?.next_milestone || 'Not set'}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Weekly Goals:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(careerJourney?.timeline?.weekly_goals || []).map((goal, index) => (
                      <li key={index}>• {goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Actions</h3>
              <div className="space-y-2">
                {(careerJourney?.next_actions || []).map((action, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track your progress and explore career insights
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Chat Sessions"
                value={dashboardData?.user_stats?.chat_sessions || 0}
                icon={ChartBarIcon}
                color="blue"
              />
              <StatCard
                title="Messages Sent"
                value={dashboardData?.user_stats?.messages_sent || 0}
                icon={ArrowTrendingUpIcon}
                color="green"
              />
              <StatCard
                title="Career Recommendations"
                value={dashboardData?.user_stats?.career_recommendations || 0}
                icon={UsersIcon}
                color="purple"
              />
              <StatCard
                title="Profile Completion"
                value={`${dashboardData?.user_stats?.profile_completion || 0}%`}
                icon={AcademicCapIcon}
                color="orange"
              />
            </div>

            {/* Skill Progress Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.skill_progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current_level" fill="#3B82F6" name="Current Level" />
                  <Bar dataKey="target_level" fill="#E5E7EB" name="Target Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activities & Career Readiness */}
            <div className="grid grid-cols-1 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {(dashboardData?.recent_activities || []).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Readiness */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Readiness</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className="text-sm text-gray-500">{dashboardData?.career_readiness?.overall_score || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${dashboardData?.career_readiness?.overall_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {(dashboardData?.career_readiness?.next_steps || []).map((step, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && marketTrends && (
          <div className="space-y-6">
            {/* Market Trends Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Market Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marketTrends.market_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="job_openings" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Skills in Demand */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills in Demand</h3>
              <div className="space-y-3">
                {(marketTrends?.top_skills || []).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.demand}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{skill.demand}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && skillAnalytics && (
          <div className="space-y-6">
            {/* Skills Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillAnalytics.distribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(skillAnalytics?.distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Skills to Learn</h3>
              <div className="grid grid-cols-1 gap-4">
                {(skillAnalytics?.recommendations || []).map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{skill.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Market Demand: {skill.market_demand}%</span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Learn More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Journey Tab */}
        {activeTab === 'journey' && careerJourney && (
          <div className="space-y-6">
            {/* Career Path Visualization */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Career Journey</h3>
                <div className="flex gap-3">
                  <a href="/roadmaps" className="text-sm text-blue-600 hover:underline">Explore roadmaps</a>
                  <PrototypeButton
                    featureType="setGoals"
                    label="Set domain goals"
                    variant="tertiary"
                    size="sm"
                    className="text-sm text-slate-500 underline"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {(careerJourney?.milestones || []).map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.stage || milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{milestone.completion_date || milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
              <div className="space-y-3">
                {(careerJourney?.next_actions || careerJourney?.next_steps || []).map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-4 py-6 space-y-6">
        {/* Skills Analysis Card - Mobile */}
        <SkillsAnalysisCard />
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Track your progress and insights
          </p>
        </div>

        {/* Mobile content would go here - simplified version */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Mobile analytics view coming soon...</p>
        </div>
      </div>
    </>
  );
};

export default Analytics;