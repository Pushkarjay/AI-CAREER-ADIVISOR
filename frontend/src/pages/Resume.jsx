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
    experience_years: 0,
    certifications: [],
    projects: [],
    languages: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadConfirmation, setUploadConfirmation] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, [profile.data]);

  const loadProfile = async () => {
    try {
      const profileData = profile.data;
      
      if (profileData?.resume) {
        console.log('📄 Resume data loaded:', {
          hasUrl: !!profileData.resume.url,
          hasResumeUrl: !!profileData.resume.resume_url,
          hasUploadedAt: !!profileData.resume.uploadedAt,
          hasUploadedAtSnake: !!profileData.resume.uploaded_at,
          hasParsed: !!profileData.resume.parsed,
          hasParsedData: !!profileData.resume.parsed_data,
          filename: profileData.resume.filename,
          url: profileData.resume.url || profileData.resume.resume_url || 'MISSING'
        });
        
        setResumeData(profileData.resume);
        setParsedFields(profileData.resume.parsed || profileData.resume.parsed_data || {});
      } else {
        console.log('📄 No resume data in profile');
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    setShowConfirmation(false);
    
    try {
      const result = await uploadResume(file);
      
      if (result) {
        console.log('✅ Resume upload result:', result);
        
        // Show comprehensive upload confirmation
        setUploadConfirmation({
          success: result.success !== false,
          upload_confirmed: result.upload_confirmed,
          parsing_successful: result.parsing_successful,
          storage_location: result.storage_location,
          resume: result.resume,
          extracted_data: result.extracted_data,
          fields_updated: result.fields_updated || [],
          data_sources: result.data_sources || {}
        });
        setShowConfirmation(true);
        
        toast.success('Resume uploaded and parsed successfully!');
        
        // Reload profile to get updated resume data
        await loadProfile();
      } else {
        console.error('❌ Resume upload returned null result');
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      
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
    if (!resumeData) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center h-[600px]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Uploaded</h3>
          <p className="text-gray-600 text-center max-w-xs">Upload your resume to preview it here and unlock personalized career recommendations.</p>
        </div>
      );
    }
    
    // Get resume data with fallbacks
    const url = resumeData.url || resumeData.resume_url || null;
    const filename = resumeData.filename || 'resume.pdf';
    const uploadedAt = resumeData.uploadedAt || resumeData.uploaded_at || null;
    const isPdf = filename && filename.toLowerCase().endsWith('.pdf');

    // Check if URL is missing
    if (!url) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Upload Issue</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-gray-700 font-medium mb-2">Resume file could not be loaded</p>
            <p className="text-sm text-gray-500 mb-4">
              The resume was uploaded but the file URL is missing. Please try uploading again.
            </p>
            <p className="text-xs text-gray-400">
              Filename: {filename}<br />
              {uploadedAt && `Uploaded: ${new Date(uploadedAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      );
    }

    if (isPdf) {
      // Ensure URL is absolute - if it starts with /, prepend the backend URL
      let absoluteUrl = url;
      let isFirebaseUrl = false;
      
      if (url.startsWith('/uploads/')) {
        // Local storage - need to point to backend server
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        absoluteUrl = `${backendUrl}${url}`;
      } else if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
        // Firebase Storage URL
        isFirebaseUrl = true;
        absoluteUrl = url;
      }
      
      console.log('📄 PDF URL:', { 
        original: url, 
        absolute: absoluteUrl, 
        isFirebase: isFirebaseUrl,
        source: isFirebaseUrl ? 'Firebase Storage' : 'Local Backend'
      });
      
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-lg font-semibold text-gray-900">Preview Resume (PDF)</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {isFirebaseUrl ? '☁️ Cloud Storage' : '💾 Local Storage'}
            </span>
          </div>
          <div style={{ height: '80vh' }} className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <iframe
              src={absoluteUrl}
              className="w-full h-full border-0"
              title="Resume Preview"
              onLoad={() => console.log('✅ PDF loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load PDF:', absoluteUrl, e);
              }}
            />
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Last Updated: {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : 'Unknown'}</span>
            <div className="flex gap-4">
              <a
                href={absoluteUrl}
                download={filename}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                📥 Download
              </a>
              <a
                href={absoluteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                🔗 Open in New Tab
              </a>
            </div>
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
            Last Updated: {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : 'Unknown'}
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

            {parsedFields.certifications && parsedFields.certifications.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                <div className="space-y-2">
                  {parsedFields.certifications.map((cert, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">{cert.name}</p>
                      {cert.year && <p className="text-sm text-green-700">{cert.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedFields.projects && parsedFields.projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
                <div className="space-y-2">
                  {parsedFields.projects.map((project, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900">{project.name}</p>
                      {project.description && <p className="text-sm text-purple-700">{project.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedFields.languages && parsedFields.languages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {parsedFields.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {resumeData?.confidence_score !== undefined && (
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

  const renderUploadConfirmation = () => {
    if (!showConfirmation || !uploadConfirmation) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-green-900">Upload Successful!</h3>
            <div className="mt-2 text-sm text-green-700 space-y-2">
              <p>✓ File uploaded to {uploadConfirmation.storage_location === 'firebase' ? 'Firebase Storage' : 'local storage'}</p>
              <p>✓ Resume parsed {uploadConfirmation.parsing_successful ? 'successfully' : 'with basic extraction'}</p>
              {uploadConfirmation.fields_updated && uploadConfirmation.fields_updated.length > 0 && (
                <p>✓ Profile updated with: {uploadConfirmation.fields_updated.join(', ')}</p>
              )}
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <p className="font-medium text-green-900">File Details:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>Filename: {uploadConfirmation.resume?.filename}</li>
                  <li>Size: {(uploadConfirmation.resume?.file_size / 1024).toFixed(2)} KB</li>
                  <li>Confidence: {Math.round((uploadConfirmation.resume?.confidence_score || 0) * 100)}%</li>
                  <li>Version: {uploadConfirmation.resume?.version || 1}</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmation(false)}
              className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
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
            {renderUploadConfirmation()}
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
          {/* Removed sample PDF placeholder message */}
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
            {renderUploadConfirmation()}
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