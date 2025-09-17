import React from 'react';

const CareerTable = ({ careers }) => {
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
            {careers && careers.map((career, index) => (
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
