import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { profile, updateProfile } = useData();
  
  const [form, setForm] = useState({
    name: '',
    current_role: '',
    education_level: '',
    field_of_study: '',
    current_year: '',
    location: '',
    preferred_salary: '',
    interests: '',
    skills: '',
    experience_years: '',
    career_goals: '',
    internships_experience: '',
    additional_info: '',
  });
  const [loading, setLoading] = useState(false);

  // Sync form with profile data when it changes
  useEffect(() => {
    if (profile.data) {
      setForm({
        name: profile.data.name || '',
        current_role: profile.data.current_role || '',
        education_level: profile.data.education_level || '',
        field_of_study: profile.data.field_of_study || '',
        current_year: profile.data.current_year || '',
        location: profile.data.location || '',
        preferred_salary: profile.data.preferred_salary || '',
        interests: Array.isArray(profile.data.interests) 
          ? profile.data.interests.join(', ') 
          : profile.data.interests || '',
        skills: Array.isArray(profile.data.skills)
          ? profile.data.skills.join(', ')
          : profile.data.skills || '',
        experience_years: profile.data.experience_years ?? '',
        career_goals: profile.data.career_goals || '',
        internships_experience: profile.data.internships_experience || '',
        additional_info: profile.data.additional_info || '',
      });
    }
  }, [profile.data]);

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const payload = {
        name: form.name || null,
        current_role: form.current_role || null,
        education_level: form.education_level || null,
        field_of_study: form.field_of_study || null,
        current_year: form.current_year ? Number(form.current_year) : null,
        location: form.location || null,
        preferred_salary: form.preferred_salary || null,
        interests: form.interests ? form.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        experience_years: form.experience_years !== '' ? Number(form.experience_years) : null,
        career_goals: form.career_goals || null,
        internships_experience: form.internships_experience || null,
        additional_info: form.additional_info || null,
      };
      
      const success = await updateProfile(payload);
      if (success) {
        // Profile already updated via context, toast already shown
      }
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
      const result = await uploadResume(file);
      
      if (result?.extracted_data?.skills?.length) {
        // Skills are automatically updated in the context
        // Update local form to reflect the changes
        const currentSkills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
        const newSkills = Array.from(new Set([
          ...currentSkills,
          ...result.extracted_data.skills
        ]));
        setForm((f) => ({ ...f, skills: newSkills.join(', ') }));
      }
    } catch (e) {
      // Error already handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Desktop Layout - Full Window Width */}
      <div className="hidden lg:block px-6 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Profile</h1>
          <p className="text-slate-600 mt-2">Keep your details up to date</p>
        </div>
        <div className="flex justify-center">
          <form className="w-full max-w-4xl glass-effect rounded-2xl shadow-xl p-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="name">
                  Full Name
                </label>
                <input className="input-field" id="name" type="text" placeholder="John Doe" value={form.name} onChange={onChange} autoComplete="name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="current_role">
                  Current Role
                </label>
                <input className="input-field" id="current_role" type="text" placeholder="Software Engineer" value={form.current_role} onChange={onChange} autoComplete="organization-title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="field_of_study">
                  Field of Study
                </label>
                <input className="input-field" id="field_of_study" type="text" placeholder="Computer Science" value={form.field_of_study} onChange={onChange} autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="education_level">
                  Education Level
                </label>
                <input className="input-field" id="education_level" type="text" placeholder="Bachelor" value={form.education_level} onChange={onChange} autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="current_year">
                  Current Year
                </label>
                <input className="input-field" id="current_year" type="number" min="1" max="6" placeholder="2" value={form.current_year} onChange={onChange} autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="location">
                  Location
                </label>
                <input className="input-field" id="location" type="text" placeholder="Pune, IN" value={form.location} onChange={onChange} autoComplete="address-level2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="preferred_salary">
                  Preferred Salary Range
                </label>
                <input className="input-field" id="preferred_salary" type="text" placeholder="12-20 LPA" value={form.preferred_salary} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="skills">
                  Skills (comma separated)
                </label>
                <input className="input-field" id="skills" type="text" placeholder="Python, React, SQL" value={form.skills} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="interests">
                  Interests (comma separated)
                </label>
                <input className="input-field" id="interests" type="text" placeholder="AI, Cloud" value={form.interests} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="experience_years">
                  Years of Experience
                </label>
                <input className="input-field" id="experience_years" type="number" min="0" step="1" placeholder="0" value={form.experience_years} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="career_goals">
                  Career Goals
                </label>
                <textarea id="career_goals" className="input-field" rows="3" placeholder="What do you want to achieve?" value={form.career_goals} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="internships_experience">
                  Internships & Experience
                </label>
                <textarea id="internships_experience" className="input-field" rows="3" placeholder="Describe your internships, work experience, or relevant projects..." value={form.internships_experience} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="additional_info">
                  Additional Milestones & Information
                </label>
                <textarea id="additional_info" className="input-field" rows="3" placeholder="Any extra achievements, certifications, or personal information to help personalize your experience..." value={form.additional_info} onChange={onChange} autoComplete="off" />
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

  {/* Mobile Layout - Container */}
      <div className="lg:hidden container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Profile</h1>
          <p className="text-slate-600 mt-2">Keep your details up to date</p>
        </div>
        <form className="w-full max-w-3xl mx-auto glass-effect rounded-2xl shadow-xl p-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="field_of_study">
                Field of Study
              </label>
              <input className="input-field" id="field_of_study" type="text" placeholder="Computer Science" value={form.field_of_study} onChange={onChange} autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="education_level">
                Education Level
              </label>
              <input className="input-field" id="education_level" type="text" placeholder="Bachelor" value={form.education_level} onChange={onChange} autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="current_year">
                Current Year
              </label>
              <input className="input-field" id="current_year" type="number" min="1" max="6" placeholder="2" value={form.current_year} onChange={onChange} autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="location">
                Location
              </label>
              <input className="input-field" id="location" type="text" placeholder="Pune, IN" value={form.location} onChange={onChange} autoComplete="address-level2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="skills">
                Skills (comma separated)
              </label>
              <input className="input-field" id="skills" type="text" placeholder="Python, React, SQL" value={form.skills} onChange={onChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="interests">
                Interests (comma separated)
              </label>
              <input className="input-field" id="interests" type="text" placeholder="AI, Cloud" value={form.interests} onChange={onChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="experience_years">
                Years of Experience
              </label>
              <input className="input-field" id="experience_years" type="number" min="0" step="1" placeholder="0" value={form.experience_years} onChange={onChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="career_goals">
                Career Goals
              </label>
              <textarea id="career_goals" className="input-field" rows="3" placeholder="What do you want to achieve?" value={form.career_goals} onChange={onChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="internships_experience">
                Internships & Experience
              </label>
              <textarea id="internships_experience" className="input-field" rows="3" placeholder="Describe your internships, work experience, or relevant projects..." value={form.internships_experience} onChange={onChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="additional_info">
                Additional Milestones & Information
              </label>
              <textarea id="additional_info" className="input-field" rows="3" placeholder="Any extra achievements, certifications, or personal information to help personalize your experience..." value={form.additional_info} onChange={onChange} autoComplete="off" />
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
