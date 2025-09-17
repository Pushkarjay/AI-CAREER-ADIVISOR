import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CareerTable from '../components/CareerTable';
import SkillGapChart from '../components/SkillGapChart';
import { careerAPI } from '../services/api';

const Dashboard = () => {
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await careerAPI.getRecommendations();
        // Expected shape from backend: { recommended_careers: [{ career: { title }, match_score, ...}] }
        const recommended = res.data?.recommended_careers || [];
        const mappedCareers = recommended.map((item) => ({
          title: item?.career?.title || item?.title || 'Career',
          score: Math.round(item?.match_score || item?.score || 80),
        }));
        setCareers(mappedCareers);
        // Minimal placeholder skill data for chart — real gap endpoint is available via /api/v1/profiles/skill-gap-analysis
        setSkills([
          { skill: 'Python', user: 70, required: 90 },
          { skill: 'React', user: 60, required: 85 },
          { skill: 'SQL', user: 65, required: 80 },
          { skill: 'Git', user: 75, required: 85 },
          { skill: 'Communication', user: 90, required: 90 },
        ]);
      } catch (e) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Personalized Dashboard</h1>
          <p className="text-slate-600 mt-2">Insights tailored to your skills and goals</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CareerTable careers={careers} />
            <SkillGapChart skills={skills} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
