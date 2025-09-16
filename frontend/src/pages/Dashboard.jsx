import React from 'react';
import Navbar from '../components/Navbar';
import CareerTable from '../components/CareerTable';
import SkillGapChart from '../components/SkillGapChart';

const Dashboard = () => {
  // Mock data - replace with API data
  const careers = [
    { title: 'AI/ML Engineer', score: 95 },
    { title: 'Data Scientist', score: 88 },
    { title: 'Cloud Solutions Architect', score: 82 },
  ];

  const skills = [
    { skill: 'Python', user: 90, required: 95 },
    { skill: 'TensorFlow', user: 70, required: 90 },
    { skill: 'GCP', user: 60, required: 85 },
    { skill: 'SQL', user: 85, required: 80 },
    { skill: 'Communication', user: 95, required: 90 },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Your Personalized Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CareerTable careers={careers} />
          <SkillGapChart skills={skills} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
