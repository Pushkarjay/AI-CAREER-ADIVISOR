import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profileAPI, chatAPI, careerAPI, roadmapAPI } from '../services/api';
import { calculateMatchScore } from '../services/matchUtils';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  profile: {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  careers: {
    recommendations: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  chat: {
    sessions: [],
    currentSession: null,
    messages: [],
    loading: false,
    error: null
  },
  resume: {
    data: null,
    processing: false,
    error: null
  },
  roadmaps: {
    items: [],
    recommended: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  learningProgress: {}
};

// UI-only fields not persisted to backend profile schema
const UI_ONLY_FIELDS = ['name', 'current_role', 'preferred_salary'];

const getUiStorageKey = (user) => `profileUi::${user?.uid || user?.email || 'guest'}`;

const loadUiOnlyFields = (user) => {
  try {
    const raw = localStorage.getItem(getUiStorageKey(user));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUiOnlyFields = (user, data) => {
  try {
    const existing = loadUiOnlyFields(user);
    const next = { ...existing, ...data };
    localStorage.setItem(getUiStorageKey(user), JSON.stringify(next));
  } catch {}
};

// Action types
const ActionTypes = {
  // Profile actions
  PROFILE_FETCH_START: 'PROFILE_FETCH_START',
  PROFILE_FETCH_SUCCESS: 'PROFILE_FETCH_SUCCESS',
  PROFILE_FETCH_ERROR: 'PROFILE_FETCH_ERROR',
  PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS',
  
  // Career actions
  CAREERS_FETCH_START: 'CAREERS_FETCH_START',
  CAREERS_FETCH_SUCCESS: 'CAREERS_FETCH_SUCCESS',
  CAREERS_FETCH_ERROR: 'CAREERS_FETCH_ERROR',
  
  // Chat actions
  CHAT_SET_MESSAGES: 'CHAT_SET_MESSAGES',
  CHAT_ADD_MESSAGE: 'CHAT_ADD_MESSAGE',
  CHAT_SET_LOADING: 'CHAT_SET_LOADING',
  CHAT_SET_ERROR: 'CHAT_SET_ERROR',
  
  // Resume actions
  RESUME_UPLOAD_START: 'RESUME_UPLOAD_START',
  RESUME_UPLOAD_SUCCESS: 'RESUME_UPLOAD_SUCCESS',
  RESUME_UPLOAD_ERROR: 'RESUME_UPLOAD_ERROR',
  
  // Roadmaps actions
  ROADMAPS_FETCH_START: 'ROADMAPS_FETCH_START',
  ROADMAPS_FETCH_SUCCESS: 'ROADMAPS_FETCH_SUCCESS',
  ROADMAPS_FETCH_ERROR: 'ROADMAPS_FETCH_ERROR',
  ROADMAPS_RECO_SUCCESS: 'ROADMAPS_RECO_SUCCESS',
  
  // General
  RESET_ALL: 'RESET_ALL'
};

// Reducer
function dataReducer(state, action) {
  switch (action.type) {
    case ActionTypes.PROFILE_FETCH_START:
      return {
        ...state,
        profile: { ...state.profile, loading: true, error: null }
      };
    
    case ActionTypes.PROFILE_FETCH_SUCCESS:
      return {
        ...state,
        profile: {
          data: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }
      };
    
    case ActionTypes.PROFILE_FETCH_ERROR:
      return {
        ...state,
        profile: { ...state.profile, loading: false, error: action.payload }
      };
    
    case ActionTypes.PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        profile: {
          ...state.profile,
          data: { ...state.profile.data, ...action.payload },
          lastUpdated: new Date().toISOString()
        }
      };
    
    case ActionTypes.CAREERS_FETCH_START:
      return {
        ...state,
        careers: { ...state.careers, loading: true, error: null }
      };
    
    case ActionTypes.CAREERS_FETCH_SUCCESS:
      return {
        ...state,
        careers: {
          recommendations: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }
      };
    
    case ActionTypes.CAREERS_FETCH_ERROR:
      return {
        ...state,
        careers: { ...state.careers, loading: false, error: action.payload }
      };
    
    case ActionTypes.CHAT_SET_MESSAGES:
      return {
        ...state,
        chat: { ...state.chat, messages: action.payload, loading: false }
      };
    
    case ActionTypes.CHAT_ADD_MESSAGE:
      return {
        ...state,
        chat: { 
          ...state.chat, 
          messages: [...state.chat.messages, action.payload],
          loading: false 
        }
      };
    
    case ActionTypes.CHAT_SET_LOADING:
      return {
        ...state,
        chat: { ...state.chat, loading: action.payload }
      };
    
    case ActionTypes.CHAT_SET_ERROR:
      return {
        ...state,
        chat: { ...state.chat, error: action.payload, loading: false }
      };
    
    case ActionTypes.RESUME_UPLOAD_START:
      return {
        ...state,
        resume: { ...state.resume, processing: true, error: null }
      };
    
    case ActionTypes.RESUME_UPLOAD_SUCCESS:
      return {
        ...state,
        resume: {
          data: action.payload,
          processing: false,
          error: null
        }
      };
    
    case ActionTypes.RESUME_UPLOAD_ERROR:
      return {
        ...state,
        resume: { ...state.resume, processing: false, error: action.payload }
      };
    
    // Roadmaps
    case ActionTypes.ROADMAPS_FETCH_START:
      return { 
        ...state, 
        roadmaps: { ...state.roadmaps, loading: true, error: null } 
      };
    case ActionTypes.ROADMAPS_FETCH_SUCCESS:
      return {
        ...state,
        roadmaps: {
          ...state.roadmaps,
          items: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }
      };
    case ActionTypes.ROADMAPS_FETCH_ERROR:
      return {
        ...state,
        roadmaps: { ...state.roadmaps, loading: false, error: action.payload }
      };
    case ActionTypes.ROADMAPS_RECO_SUCCESS:
      return {
        ...state,
        roadmaps: {
          ...state.roadmaps,
          recommended: action.payload,
          lastUpdated: new Date().toISOString()
        }
      };
    
    case ActionTypes.RESET_ALL:
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user } = useAuth();

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCareerRecommendations();
      fetchRoadmaps();
      fetchRecommendedRoadmaps();
      // Load learning progress from storage
      loadLearningProgress();
    } else {
      dispatch({ type: ActionTypes.RESET_ALL });
    }
  }, [user]);

  // Ensure recommendations load after profile is available/updated (e.g., skills set)
  useEffect(() => {
    if (user && state.profile?.data) {
      fetchCareerRecommendations();
    }
  }, [user, state.profile?.data?.skills]);

  // Profile methods
  const fetchProfile = async () => {
    try {
      dispatch({ type: ActionTypes.PROFILE_FETCH_START });
      const response = await profileAPI.fetch();
      const pdata = response?.data || {};
      const profileData = {
        name: pdata?.name || user?.email?.split('@')[0] || 'User',
        education_level: pdata?.education_level || '',
        current_role: pdata?.current_role || '',
        experience_years: pdata?.experience_years || '',
        skills: pdata?.skills || '',
        interests: pdata?.interests || '',
        location: pdata?.location || '',
        preferred_salary: pdata?.preferred_salary || '',
        field_of_study: pdata?.field_of_study || '',
        current_year: pdata?.current_year || '',
        career_goals: pdata?.career_goals || '',
        ...pdata,
      };
      // Merge UI-only fields from local storage
      const uiOnly = loadUiOnlyFields(user);
      for (const k of UI_ONLY_FIELDS) {
        if (uiOnly[k] !== undefined) profileData[k] = uiOnly[k];
      }
      dispatch({ type: ActionTypes.PROFILE_FETCH_SUCCESS, payload: profileData });
    } catch (error) {
  // Profile fetch error
      if (error.response?.status === 404) {
        const defaultProfile = {
          name: user?.email?.split('@')[0] || 'User',
          education_level: '',
          current_role: '',
          experience_years: '',
          skills: '',
          interests: '',
          location: '',
          preferred_salary: '',
          field_of_study: '',
          current_year: '',
          career_goals: ''
        };
        const uiOnly = loadUiOnlyFields(user);
        for (const k of UI_ONLY_FIELDS) {
          if (uiOnly[k] !== undefined) defaultProfile[k] = uiOnly[k];
        }
        dispatch({ type: ActionTypes.PROFILE_FETCH_SUCCESS, payload: defaultProfile });
      } else {
        dispatch({ type: ActionTypes.PROFILE_FETCH_ERROR, payload: error.message });
      }
    }
  };

  // Helper: filter payload to backend-allowed keys
  const filterProfilePayload = (data) => {
    const allowed = [
      'education_level',
      'field_of_study',
      'current_year',
      'location',
      'interests',
      'skills',
      'experience_years',
      'preferred_industries',
      'career_goals',
      'resume',
      'certifications',
      'projects',
      'internships',
      'languages',
    ];
    const out = {};
    for (const k of allowed) if (k in (data || {})) out[k] = data[k];
    return out;
  };

  const updateProfile = async (profileData) => {
    try {
      const filtered = filterProfilePayload(profileData);
      // Extract UI-only fields and persist locally
      const uiOnly = {};
      for (const k of UI_ONLY_FIELDS) {
        if (k in (profileData || {})) uiOnly[k] = profileData[k];
      }

      if (Object.keys(filtered).length) {
        await profileAPI.save(filtered);
      }
      if (Object.keys(uiOnly).length) {
        saveUiOnlyFields(user, uiOnly);
      }

      dispatch({ type: ActionTypes.PROFILE_UPDATE_SUCCESS, payload: { ...filtered, ...uiOnly } });
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      dispatch({ type: ActionTypes.PROFILE_FETCH_ERROR, payload: error.message });
      return false;
    }
  };

  // Career methods
  const fetchCareerRecommendations = async () => {
    try {
      dispatch({ type: ActionTypes.CAREERS_FETCH_START });
      // IMPORTANT: Build recommendations exactly like Careers page
      // Fetch full careers catalog and compute match scores from user profile skills
      const allRes = await careerAPI.getCareers();
      const catalog = Array.isArray(allRes?.data?.careers) ? allRes.data.careers : [];

      // Normalize user skills from profile
      const userSkills = Array.isArray(state?.profile?.data?.skills)
        ? state.profile.data.skills
        : String(state?.profile?.data?.skills || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      // Compute ranked list: title + match_score + requirements
      const ranked = catalog.map((c) => {
        const req = Array.isArray(c.requiredSkills) ? c.requiredSkills : [];
        const { score } = calculateMatchScore(userSkills, req);
        return {
          id: c.id || `career-${c.title || 'unknown'}`,
          title: c.title || 'Unknown Career',
          company: '—',
          salary: '—',
          match_score: Math.round(score || 0),
          requirements: req,
          location: 'Multiple Cities',
          description: c.description || '',
          experience_level: c.experience || 'entry'
        };
      });

      // Deduplicate titles like "Name (n)" keep highest score, filter > 0, sort desc
      const normalizeTitle = (t) => String(t).replace(/\s*\(\d+\)\s*$/, '').trim();
      const bestByTitle = new Map();
      for (const r of ranked) {
        const key = normalizeTitle(r.title);
        const ex = bestByTitle.get(key);
        if (!ex || (r.match_score || 0) > (ex.match_score || 0)) {
          bestByTitle.set(key, { ...r, title: key });
        }
      }
      const mapped = Array.from(bestByTitle.values())
        .filter((c) => (c.match_score || 0) > 0)
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      // If nothing matches yet (e.g., no profile skills), provide a friendly fallback
      if (mapped.length === 0) {
        const fallbackCareers = [
          { id: 'sw-dev-001', title: 'Software Developer', company: 'Tech Companies', salary: '12-25 LPA', match_score: 75, requirements: ['JavaScript', 'React', 'Node.js', 'Python'], location: 'Multiple Cities' },
          { id: 'data-sci-001', title: 'Data Analyst', company: 'Analytics Firms', salary: '10-20 LPA', match_score: 72, requirements: ['Python', 'SQL', 'Excel', 'Statistics'], location: 'Multiple Cities' },
          { id: 'pm-001', title: 'Product Manager', company: 'Product Companies', salary: '15-30 LPA', match_score: 68, requirements: ['Communication', 'Strategy', 'Analytics', 'Leadership'], location: 'Multiple Cities' },
        ];
        dispatch({ type: ActionTypes.CAREERS_FETCH_SUCCESS, payload: fallbackCareers });
      } else {
        // Dispatch full ranked list; Dashboard will slice top 3
        dispatch({ type: ActionTypes.CAREERS_FETCH_SUCCESS, payload: mapped });
      }
    } catch (error) {
      console.error('Career recommendations error:', error);
      // Always provide fallback data on error
      const fallbackCareers = [
        { id: 'sw-dev-001', title: 'Software Developer', company: 'Tech Companies', salary: '12-25 LPA', match_score: 85, requirements: ['JavaScript', 'React', 'Node.js', 'Python'], location: 'Multiple Cities' },
        { id: 'data-sci-001', title: 'Data Analyst', company: 'Analytics Firms', salary: '10-20 LPA', match_score: 78, requirements: ['Python', 'SQL', 'Excel', 'Statistics'], location: 'Multiple Cities' },
        { id: 'pm-001', title: 'Product Manager', company: 'Product Companies', salary: '15-30 LPA', match_score: 72, requirements: ['Communication', 'Strategy', 'Analytics', 'Leadership'], location: 'Multiple Cities' },
      ];
      dispatch({ type: ActionTypes.CAREERS_FETCH_SUCCESS, payload: fallbackCareers });
      dispatch({ type: ActionTypes.CAREERS_FETCH_ERROR, payload: error.message });
    }
  };

  // Roadmaps methods
  const fetchRoadmaps = async () => {
    try {
      dispatch({ type: ActionTypes.ROADMAPS_FETCH_START });
      const res = await roadmapAPI.list();
      
      // Handle different response structures
      let items = [];
      if (res?.data?.items) {
        items = res.data.items;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (res?.data) {
        items = [res.data];
      }
      
      dispatch({ type: ActionTypes.ROADMAPS_FETCH_SUCCESS, payload: items });
    } catch (e) {
      console.error('Roadmaps fetch error:', e);
      dispatch({ type: ActionTypes.ROADMAPS_FETCH_ERROR, payload: e.message });
    }
  };

  const fetchRecommendedRoadmaps = async () => {
    try {
      const res = await roadmapAPI.recommend();
      dispatch({ type: ActionTypes.ROADMAPS_RECO_SUCCESS, payload: res.data || [] });
    } catch (e) {
      // Prototype-friendly: just ignore and show empty recommended list
      dispatch({ type: ActionTypes.ROADMAPS_RECO_SUCCESS, payload: [] });
    }
  };

  // Learning progress persistence (per-user, per-domain)
  const progressKey = () => `learningProgress::${user?.uid || user?.email || 'guest'}`;
  const loadLearningProgress = () => {
    try {
      const raw = localStorage.getItem(progressKey());
      const parsed = raw ? JSON.parse(raw) : {};
      // Sync into state
      state.learningProgress = parsed; // minimal mutation; UI derives from value spread below
    } catch {}
  };
  const saveLearningProgress = (next) => {
    try {
      localStorage.setItem(progressKey(), JSON.stringify(next));
      state.learningProgress = next;
    } catch {}
  };
  const toggleRoadmapStep = (domainId, stepIndex) => {
    const current = state.learningProgress || {};
    const set = new Set(current[domainId] || []);
    if (set.has(stepIndex)) set.delete(stepIndex); else set.add(stepIndex);
    const next = { ...current, [domainId]: Array.from(set).sort((a,b)=>a-b) };
    saveLearningProgress(next);
  };

  // Chat methods
  const sendChatMessage = async (message) => {
    try {
      dispatch({ type: ActionTypes.CHAT_SET_LOADING, payload: true });
      
      // Add user message immediately
      const userMessage = { from: 'user', text: message };
      dispatch({ type: ActionTypes.CHAT_ADD_MESSAGE, payload: userMessage });
      
      // Send to API
      const response = await chatAPI.sendMessage({ message });
      const botText = response.data?.message?.content || response.data?.message || 'How can I help you further?';
      const botMessage = { from: 'bot', text: botText };
      
      dispatch({ type: ActionTypes.CHAT_ADD_MESSAGE, payload: botMessage });
      return true;
    } catch (error) {
      console.error('Chat message error:', error);
      const errorMessage = { from: 'bot', text: 'Sorry, I could not get a response right now.' };
      dispatch({ type: ActionTypes.CHAT_ADD_MESSAGE, payload: errorMessage });
      dispatch({ type: ActionTypes.CHAT_SET_ERROR, payload: error.message });
      return false;
    }
  };

  const initializeChat = () => {
    if (state.chat.messages.length === 0) {
      const welcomeMessage = {
        from: 'bot',
        text: "Hello! I'm your AI Career Assistant powered by Google Gemini. Ask me about career paths, skills, or any professional guidance you need!"
      };
      dispatch({ type: ActionTypes.CHAT_SET_MESSAGES, payload: [welcomeMessage] });
    }
  };

  // Resume methods
  const uploadResume = async (file) => {
    try {
      dispatch({ type: ActionTypes.RESUME_UPLOAD_START });
      const response = await profileAPI.uploadResume(file);
      const res = response?.data || {};
      if (res?.extracted_data) {
        dispatch({ type: ActionTypes.RESUME_UPLOAD_SUCCESS, payload: res });

        const current = state.profile.data || {};
        const currentSkills = current.skills
          ? (Array.isArray(current.skills) ? current.skills : String(current.skills).split(',').map((s) => s.trim()).filter(Boolean))
          : [];
        const newSkills = res.extracted_data.skills?.length
          ? Array.from(new Set([...currentSkills, ...res.extracted_data.skills]))
          : currentSkills;

        const resumeMeta = res.resume || {
          url: res.resume_url || '',
          filename: file.name,
          uploadedAt: new Date().toISOString(),
          confidence_score: res.confidence_score || 0,
        };
        // Attach parsed to resume meta for UI
        const resumeField = { ...resumeMeta, parsed: res.extracted_data };

        const updatedProfile = { ...current, skills: newSkills, resume: resumeField };
        dispatch({ type: ActionTypes.PROFILE_UPDATE_SUCCESS, payload: updatedProfile });

        try {
          const filtered = filterProfilePayload(updatedProfile);
          if (Object.keys(filtered).length) await profileAPI.save(filtered);
        } catch (updateError) {
          console.error('Failed to persist profile after resume upload', updateError);
        }

        toast.success('Resume processed successfully');
        return res;
      }
      return null;
    } catch (error) {
      console.error('Resume upload error:', error);
      dispatch({ type: ActionTypes.RESUME_UPLOAD_ERROR, payload: error.message });
      toast.error('Failed to process resume');
      return null;
    }
  };

  const value = {
    // State
    ...state,
    // Profile methods
    fetchProfile,
    updateProfile,
    // Career methods
    fetchCareerRecommendations,
    // Chat methods
    sendChatMessage,
    initializeChat,
    // Resume methods
    uploadResume,
    // Roadmaps
    fetchRoadmaps,
    fetchRecommendedRoadmaps,
    // Learning progress
    toggleRoadmapStep,
    // Utility methods
    refreshAll: () => { fetchProfile(); fetchCareerRecommendations(); },
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;