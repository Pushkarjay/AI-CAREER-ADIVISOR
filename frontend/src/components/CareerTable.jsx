import React from 'react';

const CareerTable = ({ careers }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Top Career Recommendations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Rank</th>
              <th className="py-2 px-4 border-b">Career</th>
              <th className="py-2 px-4 border-b">Match Score</th>
            </tr>
          </thead>
          <tbody>
            {careers && careers.map((career, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                <td className="py-2 px-4 border-b">{career.title}</td>
                <td className="py-2 px-4 border-b text-center">{career.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CareerTable;
