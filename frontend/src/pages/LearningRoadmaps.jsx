import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { useData } from '../contexts/DataContext';
import { useLocation, Link } from 'react-router-dom';
import { 
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const LearningRoadmaps = () => {
  const { roadmaps, fetchRoadmaps, fetchRecommendedRoadmaps, learningProgress, toggleRoadmapStep } = useData();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('roadmaps');

  useEffect(() => {
    if (!roadmaps.items?.length && !roadmaps.loading) {
      fetchRoadmaps();
    }
    if (!roadmaps.recommended?.length) {
      fetchRecommendedRoadmaps();
    }
  }, []); // Empty dependency array to run only once on mount

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
    const items = roadmaps.items || [];
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((r) =>
      (r.title || '').toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) || 
      (r.learning_path || []).some(s => (s || '').toLowerCase().includes(q))
    );
  }, [roadmaps.items, query]);

  const tabs = [
    { id: 'roadmaps', name: 'Learning Roadmaps', count: filtered?.length || 0 },
    { id: 'domains', name: 'All Domains', count: (roadmaps.items || []).length },
  ];

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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'roadmaps' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(filtered || []).map((r) => (
                  <div key={r.domain_id || Math.random()} className="p-4 border rounded-xl bg-white hover:shadow cursor-pointer" onClick={() => setSelected(r)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{r.title || 'Unknown Domain'}</h3>
                      <span className="text-xs text-slate-500">{r.difficulty_level || 'intermediate'}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">{r.description || 'No description available'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(r.related_domains || []).slice(0,3).map((d) => (
                        <span key={d} className="text-xs px-2 py-1 bg-slate-100 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No roadmaps found. Try a different search term.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="p-4 border rounded-xl bg-white">
                <h3 className="font-semibold mb-2">Recommended for you</h3>
                <ul className="space-y-2">
                  {(roadmaps.recommended || []).map((r) => (
                    <li key={r.domain_id || Math.random()} className="text-sm">
                      <button className="text-blue-600 hover:underline" onClick={() => setSelected(r)}>{r.title || 'Unknown'}</button>
                    </li>
                  ))}
                  {(!roadmaps.recommended || roadmaps.recommended.length === 0) && (
                    <li className="text-xs text-slate-500">No personalized recommendations yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <div>
            {(roadmaps.items || []).length > 0 ? (
              <div className="space-y-4">
                {/* Domain count and description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Explore {(roadmaps.items || []).length} Career Domains
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Discover comprehensive learning paths across data science, engineering, design, and more.
                    Each domain includes detailed roadmaps, skill requirements, and career progression paths.
                  </p>
                </div>
                
                {/* Domains grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(roadmaps.items || []).map((d, idx) => (
                    <div key={d.domain_id || idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{d.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">{d.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          d.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                          d.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          d.difficulty_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {d.difficulty_level || 'intermediate'}
                        </span>
                      </div>
                      
                      {/* Learning path preview */}
                      {d.learning_path && d.learning_path.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Path:</h4>
                          <div className="flex flex-wrap gap-1">
                            {d.learning_path.slice(0, 3).map((step, stepIdx) => (
                              <span key={stepIdx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {step}
                              </span>
                            ))}
                            {d.learning_path.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{d.learning_path.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Duration and match score */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {d.estimated_completion || '6-12 months'}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          Match: {typeof d.match_score === 'number' ? Math.round(d.match_score) : 0}%
                        </div>
                      </div>
                      
                      {/* Related domains */}
                      {d.related_domains && d.related_domains.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {d.related_domains.slice(0, 3).map((r) => (
                              <span key={r} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {r.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelected(d);
                            setActiveTab('roadmaps');
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          View Roadmap
                        </button>
                        <button 
                          onClick={() => {
                            setSelected(d);
                            setActiveTab('roadmaps');
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm transition-colors"
                        >
                          Personalize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Load more message if there are many domains */}
                {(roadmaps.items || []).length >= 50 && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-2">Showing all {(roadmaps.items || []).length} available domains</p>
                    <p className="text-sm text-gray-500">
                      Use the search feature to find specific domains or skills
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading domains</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Discover 85+ career domains to explore learning paths.
                </p>
              </div>
            )}
          </div>
        )}

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