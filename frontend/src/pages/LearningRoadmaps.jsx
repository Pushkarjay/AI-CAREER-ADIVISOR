import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { useData } from '../contexts/DataContext';
import { useLocation } from 'react-router-dom';

const LearningRoadmaps = () => {
  const { roadmaps, fetchRoadmaps, fetchRecommendedRoadmaps, learningProgress, toggleRoadmapStep } = useData();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!roadmaps.items?.length) fetchRoadmaps();
    fetchRecommendedRoadmaps();
  }, []);

  // Preselect via ?select=domain_id or by title
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const want = params.get('select');
    if (want && (roadmaps.items || []).length) {
      const byId = (roadmaps.items || []).find((r) => (r.domain_id || '').toLowerCase() === want.toLowerCase());
      const byTitle = (roadmaps.items || []).find((r) => (r.title || '').toLowerCase() === want.toLowerCase());
      setSelected(byId || byTitle || null);
    }
  }, [location.search, roadmaps.items]);

  const filtered = useMemo(() => {
    if (!query) return roadmaps.items || [];
    const q = query.toLowerCase();
    return (roadmaps.items || []).filter((r) =>
      r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || (r.learning_path || []).some(s => s.toLowerCase().includes(q))
    );
  }, [roadmaps.items, query]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Learning Roadmaps</h1>
            <p className="text-slate-600 text-sm">Universal Foundations + 70+ domains. Search and explore.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await fetchRecommendedRoadmaps();
                const top = (roadmaps.recommended || [])[0];
                if (top) setSelected(top);
              }}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Generate personalized path
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search domains or steps..."
            className="w-full md:w-1/2 border rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(filtered || []).map((r) => (
                <div key={r.domain_id} className="p-4 border rounded-xl bg-white hover:shadow" onClick={() => setSelected(r)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{r.title}</h3>
                    <span className="text-xs text-slate-500">{r.difficulty_level}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{r.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(r.related_domains || []).slice(0,3).map((d) => (
                      <span key={d} className="text-xs px-2 py-1 bg-slate-100 rounded">{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="p-4 border rounded-xl bg-white">
              <h3 className="font-semibold mb-2">Recommended for you</h3>
              <ul className="space-y-2">
                {(roadmaps.recommended || []).map((r) => (
                  <li key={r.domain_id} className="text-sm">
                    <button className="text-blue-600 hover:underline" onClick={() => setSelected(r)}>{r.title}</button>
                  </li>
                ))}
                {(!roadmaps.recommended || roadmaps.recommended.length === 0) && (
                  <li className="text-xs text-slate-500">No personalized recommendations yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {selected && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 border rounded-xl bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selected.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{selected.description}</p>
                  {selected.estimated_time && (
                    <p className="text-xs text-slate-500 mt-1">Estimated time: {selected.estimated_time}</p>
                  )}
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 border"
                >
                  Print this roadmap
                </button>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Universal Foundations</h4>
                <div className="flex flex-wrap gap-2">
                  {(selected.universal_foundations || []).map((f) => (
                    <span key={f} className="text-xs px-2 py-1 bg-slate-100 rounded">{f}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Learning Path</h4>
                <ol className="space-y-2">
                  {(selected.learning_path || []).map((step, idx) => {
                    const done = new Set(learningProgress[selected.domain_id] || []).has(idx);
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <input type="checkbox" checked={done} onChange={() => toggleRoadmapStep(selected.domain_id, idx)} className="mt-1" />
                        <span className={done ? 'line-through text-slate-400' : ''}>{step}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            <div className="p-5 border rounded-xl bg-white">
              <h3 className="font-semibold mb-3">Prerequisites</h3>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                {(selected.prerequisites || []).map((p, i) => (<li key={i}>{p}</li>))}
                {(!selected.prerequisites || selected.prerequisites.length === 0) && (
                  <li className="text-slate-500">None listed</li>
                )}
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Related Domains</h4>
                <div className="flex flex-wrap gap-2">
                  {(selected.related_domains || []).map((d) => (
                    <span key={d} className="text-xs px-2 py-1 bg-slate-100 rounded">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LearningRoadmaps;