import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { calculateMatchScore } from '../services/matchUtils';
import { careerAPI } from '../services/api';

const CareerTable = ({ careers }) => {
  const { profile } = useData();
  const [rows, setRows] = useState([]);

  const userSkills = useMemo(() => (
    Array.isArray(profile?.data?.skills)
      ? profile.data.skills
      : String(profile?.data?.skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
  ), [profile?.data?.skills]);

  useEffect(() => {
    const mapIncoming = (list) =>
      (list || [])
        .map((c, idx) => ({
          title: c.title || c.career || 'Unknown',
          score: Math.round(c.score ?? c.match_score ?? c.skill_match_percentage ?? 0),
          _rank: idx + 1,
        }))
        .sort((a, b) => (b.score || 0) - (a.score || 0));

    const loadFallback = async () => {
      try {
        const res = await careerAPI.getCareers();
        const list = Array.isArray(res?.data?.careers) ? res.data.careers : [];
        const ranked = list
          .map((c) => {
            const req = Array.isArray(c.requiredSkills) ? c.requiredSkills : [];
            const { score } = calculateMatchScore(userSkills, req);
            return { title: c.title, score: Math.round(score) };
          })
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        setRows(ranked);
      } catch {
        setRows([]);
      }
    };

    if (Array.isArray(careers) && careers.length > 0) {
      setRows(mapIncoming(careers));
    } else {
      // Fallback to full catalog ranked by match
      loadFallback();
    }
  }, [careers, userSkills]);

  return (
    <div className="mt-8 glass-effect rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        Top Career Recommendations
      </h2>
      <div className="overflow-x-auto rounded-xl border border-white/20">
        <table className="min-w-full bg-white/70">
          <thead className="bg-slate-100/70">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Rank</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">Career</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-slate-700">Match Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {(rows || []).map((career, index) => (
              <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                <td className="py-3 px-4 text-slate-700">{index + 1}</td>
                <td className="py-3 px-4 text-slate-800 font-medium">{career.title}</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    {career.score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CareerTable;
