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
    certifications: [],
    projects: [],
    internships: [],
    languages: '',
  });
  const [loading, setLoading] = useState(false);
  const [dataSources, setDataSources] = useState({});

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
        certifications: profile.data.certifications || [],
        projects: profile.data.projects || [],
        internships: profile.data.internships || [],
        languages: Array.isArray(profile.data.languages)
          ? profile.data.languages.join(', ')
          : profile.data.languages || '',
      });
      
      // Track data sources from resume
      setDataSources(profile.data.data_sources || {});
    }
  }, [profile.data]);

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const renderFieldLabel = (label, fieldName) => {
    const source = dataSources[fieldName];
    const isFromResume = source === 'resume' || source === 'resume_merged';
    
    return (
      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2" htmlFor={fieldName}>
        {label}
        {isFromResume && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            From Resume
          </span>
        )}
      </label>
    );
  };

  const addCertification = () => {
    setForm(f => ({
      ...f,
      certifications: [...f.certifications, { name: '', issuer: '', year: '', url: '' }]
    }));
  };

  const removeCertification = (index) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index, field, value) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const addProject = () => {
    setForm(f => ({
      ...f,
      projects: [...f.projects, { name: '', description: '', technologies: [], url: '' }]
    }));
  };

  const removeProject = (index) => {
    setForm(f => ({
      ...f,
      projects: f.projects.filter((_, i) => i !== index)
    }));
  };

  const updateProject = (index, field, value) => {
    setForm(f => ({
      ...f,
      projects: f.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addInternship = () => {
    setForm(f => ({
      ...f,
      internships: [...f.internships, { company: '', role: '', duration: '', description: '', location: '' }]
    }));
  };

  const removeInternship = (index) => {
    setForm(f => ({
      ...f,
      internships: f.internships.filter((_, i) => i !== index)
    }));
  };

  const updateInternship = (index, field, value) => {
    setForm(f => ({
      ...f,
      internships: f.internships.map((intern, i) => 
        i === index ? { ...intern, [field]: value } : intern
      )
    }));
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
        certifications: form.certifications || [],
        projects: form.projects || [],
        internships: form.internships || [],
        languages: form.languages ? form.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
        
        {/* Resume Info Banner */}
        {profile.data?.resume && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Resume uploaded</p>
                  <p className="text-xs text-blue-700">
                    Some fields below were auto-filled from your resume. You can edit them anytime.
                  </p>
                </div>
              </div>
              <a href="/resume" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Resume →
              </a>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <form className="w-full max-w-4xl glass-effect rounded-2xl shadow-xl p-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderFieldLabel('Full Name', 'name')}
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
                {renderFieldLabel('Education Level', 'education_level')}
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
                {renderFieldLabel('Skills (comma separated)', 'skills')}
                <input className="input-field" id="skills" type="text" placeholder="Python, React, SQL" value={form.skills} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="interests">
                  Interests (comma separated)
                </label>
                <input className="input-field" id="interests" type="text" placeholder="AI, Cloud" value={form.interests} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                {renderFieldLabel('Years of Experience', 'experience_years')}
                <input className="input-field" id="experience_years" type="number" min="0" step="1" placeholder="0" value={form.experience_years} onChange={onChange} autoComplete="off" />
              </div>
              <div className="md:col-span-2">
                {renderFieldLabel('Languages (comma separated)', 'languages')}
                <input className="input-field" id="languages" type="text" placeholder="English, Hindi, Spanish" value={form.languages} onChange={onChange} autoComplete="off" />
                <p className="text-xs text-slate-500 mt-1">Spoken languages you're proficient in</p>
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

              {/* Certifications Section */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  {renderFieldLabel('Certifications', 'certifications')}
                  <button type="button" onClick={addCertification} className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    + Add Certification
                  </button>
                </div>
                {form.certifications && form.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {form.certifications.map((cert, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Certification Name *"
                            value={cert.name || ''}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Issuing Organization"
                            value={cert.issuer || ''}
                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Year"
                            value={cert.year || ''}
                            onChange={(e) => updateCertification(index, 'year', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Certificate URL (optional)"
                            value={cert.url || ''}
                            onChange={(e) => updateCertification(index, 'url', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No certifications added yet.</p>
                )}
              </div>

              {/* Projects Section */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  {renderFieldLabel('Projects', 'projects')}
                  <button type="button" onClick={addProject} className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    + Add Project
                  </button>
                </div>
                {form.projects && form.projects.length > 0 ? (
                  <div className="space-y-3">
                    {form.projects.map((proj, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Project Name *"
                            value={proj.name || ''}
                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                            className="input-field text-sm"
                          />
                          <textarea
                            placeholder="Project Description"
                            value={proj.description || ''}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            className="input-field text-sm"
                            rows="2"
                          />
                          <input
                            type="text"
                            placeholder="Technologies Used (comma separated)"
                            value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                            className="input-field text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Project URL (optional)"
                            value={proj.url || ''}
                            onChange={(e) => updateProject(index, 'url', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No projects added yet.</p>
                )}
              </div>

              {/* Internships Section */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  {renderFieldLabel('Internships', 'internships')}
                  <button type="button" onClick={addInternship} className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    + Add Internship
                  </button>
                </div>
                {form.internships && form.internships.length > 0 ? (
                  <div className="space-y-3">
                    {form.internships.map((intern, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Company Name *"
                            value={intern.company || ''}
                            onChange={(e) => updateInternship(index, 'company', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Role/Position"
                            value={intern.role || ''}
                            onChange={(e) => updateInternship(index, 'role', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g., Jun 2023 - Aug 2023)"
                            value={intern.duration || ''}
                            onChange={(e) => updateInternship(index, 'duration', e.target.value)}
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Location"
                            value={intern.location || ''}
                            onChange={(e) => updateInternship(index, 'location', e.target.value)}
                            className="input-field text-sm"
                          />
                          <textarea
                            placeholder="Description of responsibilities and achievements"
                            value={intern.description || ''}
                            onChange={(e) => updateInternship(index, 'description', e.target.value)}
                            className="input-field text-sm"
                            rows="2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInternship(index)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No internships added yet.</p>
                )}
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
