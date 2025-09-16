import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkillGapChart = ({ skills }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Skill Gap Analysis</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis />
          <Radar name="Your Skills" dataKey="user" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="Required Skills" dataKey="required" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
