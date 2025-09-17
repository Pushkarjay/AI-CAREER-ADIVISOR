import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [form, setForm] = useState({
    education_level: '',
    field_of_study: '',
    current_year: '',
    location: '',
    interests: '',
    skills: '',
    career_goals: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileAPI.fetch();
        const p = res.data || {};
        setForm({
          education_level: p.education_level || '',
          field_of_study: p.field_of_study || '',
          current_year: p.current_year || '',
          location: p.location || '',
          interests: (p.interests || []).join(', '),
          skills: (p.skills || []).join(', '),
          career_goals: p.career_goals || '',
        });
      } catch {}
    };
    load();
  }, []);

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const payload = {
        education_level: form.education_level || null,
        field_of_study: form.field_of_study || null,
        current_year: form.current_year ? Number(form.current_year) : null,
        location: form.location || null,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        career_goals: form.career_goals || null,
      };
      await profileAPI.save(payload);
      toast.success('Profile saved');
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const onResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await profileAPI.uploadResume(file);
      if (res.data?.extracted_data?.skills?.length) {
        const nextSkills = Array.from(new Set([
          ...form.skills.split(',').map(s => s.trim()).filter(Boolean),
          ...res.data.extracted_data.skills
        ]));
        setForm((f) => ({ ...f, skills: nextSkills.join(', ') }));
      }
      toast.success('Resume processed');
    } catch (e) {
      toast.error('Resume upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Profile</h1>
          <p className="text-slate-600 mt-2">Keep your details up to date</p>
        </div>
        <form className="w-full max-w-3xl mx-auto glass-effect rounded-2xl shadow-xl p-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="first-name">
                Field of Study
              </label>
              <input className="input-field" id="field_of_study" type="text" placeholder="Computer Science" value={form.field_of_study} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="last-name">
                Education Level
              </label>
              <input className="input-field" id="education_level" type="text" placeholder="Bachelor" value={form.education_level} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="current_year">
                Current Year
              </label>
              <input className="input-field" id="current_year" type="number" min="1" max="6" placeholder="2" value={form.current_year} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="location">
                Location
              </label>
              <input className="input-field" id="location" type="text" placeholder="Pune, IN" value={form.location} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="skills">
                Skills (comma separated)
              </label>
              <input className="input-field" id="skills" type="text" placeholder="Python, React, SQL" value={form.skills} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="interests">
                Interests (comma separated)
              </label>
              <input className="input-field" id="interests" type="text" placeholder="AI, Cloud" value={form.interests} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="resume">
                Resume
              </label>
              <input id="resume" type="file" onChange={onResume} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              <p className="text-slate-600 text-xs mt-2">Upload your resume for automated skill extraction.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="career_goals">
                Career Goals
              </label>
              <textarea id="career_goals" className="input-field" rows="3" placeholder="What do you want to achieve?" value={form.career_goals} onChange={onChange} />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button className="btn-primary" type="button" onClick={onSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
