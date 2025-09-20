import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const Resume = () => {
  const { user } = useAuth();
  const { profile, uploadResume, updateProfile } = useData();
  const [resumeData, setResumeData] = useState(null);
  const [parsedFields, setParsedFields] = useState({
    full_name: '',
    skills: [],
    education_history: [],
    experience_years: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, [profile.data]);

  const loadProfile = async () => {
    try {
      console.log('🔄 Loading profile for resume data...');
      const profileData = profile.data;
      console.log('📊 Profile data:', profileData);
      
      if (profileData?.resume) {
        console.log('📄 Resume data found:', profileData.resume);
        setResumeData(profileData.resume);
        setParsedFields(profileData.resume.parsed || {});
        console.log('✅ Resume state updated');
      } else {
        console.log('ℹ️ No resume data found in profile');
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    console.log('Starting upload process...');
    
    try {
      console.log('Calling uploadResume from DataContext...');
      const success = await uploadResume(file);
      console.log('Upload result:', success);
      
      if (success) {
        toast.success('Resume uploaded successfully!');
        // Reload profile to get updated resume data
        loadProfile();
      } else {
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please upload a smaller file.');
      } else if (error.response?.data?.error) {
        toast.error(`Upload failed: ${error.response.data.error}`);
      } else {
        toast.error('Failed to upload resume. Please try again.');
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update profile with manually edited fields, mapping to allowed backend fields
      const allowed = {
        // Keep only supported fields
        skills: Array.isArray(editForm.skills)
          ? editForm.skills
          : (Array.isArray(parsedFields.skills) ? parsedFields.skills : []),
        experience_years: typeof editForm.experience_years === 'number'
          ? editForm.experience_years
          : (parsedFields.experience_years || 0),
      };

      const success = await updateProfile(allowed);
      if (!success) throw new Error('Save failed');
      
      // Update local state
      setParsedFields({
        ...parsedFields,
        ...editForm
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const startEditing = () => {
    setEditForm(parsedFields);
    setIsEditing(true);
  };

  const renderResumePreview = () => {
    const url = resumeData?.url || '/What-Next.pdf';
    const filename = resumeData?.filename || 'What-Next.pdf';
    const uploadedAt = resumeData?.uploadedAt || Date.now();
    const isPdf = filename.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Preview</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={url}
              width="100%"
              height="100%"
              title="Resume Preview"
              className="border-0"
            />
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Last Updated: {new Date(uploadedAt).toLocaleDateString()}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume File</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-gray-700 font-medium">{filename}</p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: {new Date(uploadedAt).toLocaleDateString()}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open File
          </a>
        </div>
      </div>
    );
  };

  const renderParsedFields = () => {
    if (!parsedFields || Object.keys(parsedFields).length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
          <button
            onClick={startEditing}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Details
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
              <textarea
                value={Array.isArray(editForm.skills) ? editForm.skills.join(', ') : ''}
                onChange={(e) => setEditForm({...editForm, skills: e.target.value.split(',').map(s => s.trim())})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                value={editForm.experience_years || 0}
                onChange={(e) => setEditForm({...editForm, experience_years: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {parsedFields.full_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{parsedFields.full_name}</p>
              </div>
            )}

            {parsedFields.skills && parsedFields.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {parsedFields.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedFields.education_history && parsedFields.education_history.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <div className="space-y-2">
                  {parsedFields.education_history.map((edu, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{edu.degree || 'Degree'}</p>
                      <p className="text-sm text-gray-600">{edu.institution || 'Institution'}</p>
                      {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedFields.experience_years > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <p className="text-gray-900">{parsedFields.experience_years} years</p>
              </div>
            )}
          </div>
        )}

        {resumeData?.confidence_score && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Parsing Confidence: <span className="font-medium">{Math.round(resumeData.confidence_score * 100)}%</span>
            </p>
            {resumeData.confidence_score < 0.7 && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Low confidence detected. Please review and edit the extracted information above.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      {/* Desktop Layout - Full Window Width with 1:2 grid */}
      <div className="hidden lg:block px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume Management
            </h1>
            <p className="text-slate-600 mt-2">Upload and manage your resume for better career recommendations</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your resume</h3>
              <p className="text-gray-600 mb-4">PDF or DOCX files up to 10MB</p>
              
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="resume-upload"
              />
              
              <label
                htmlFor="resume-upload"
                className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>

          {/* Content with 1:2 split */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column (1) - Upload + Parsed Fields */}
            <div className="col-span-1 space-y-8">
              {renderParsedFields()}
            </div>
            {/* Right Column (2) - PDF Preview */}
            <div className="col-span-2">
              {renderResumePreview()}
            </div>
          </div>

          {/* Empty State */}
          {!resumeData && !isUploading && (
            <div className="text-center py-8 text-gray-600">
              Showing sample PDF (What-Next.pdf) on the right as a placeholder.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Container */}
      <div className="lg:hidden container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume Management
            </h1>
            <p className="text-slate-600 mt-2">Upload and manage your resume for better career recommendations</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your resume</h3>
              <p className="text-gray-600 mb-4">PDF or DOCX files up to 10MB</p>
              
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="resume-upload"
                className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  isUploading
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-8">
            {/* Left Column - Resume and parsed info */}
            <div className="space-y-8">
              {renderResumePreview()}
              {renderParsedFields()}
            </div>
          </div>

          {/* Empty State */}
          {!resumeData && !isUploading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📄</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No resume uploaded</h3>
              <p className="text-gray-600">Upload your resume to get started with automatic skill extraction and better career recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;