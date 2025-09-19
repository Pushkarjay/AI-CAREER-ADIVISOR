import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { profileAPI, chatAPI, careerAPI } from '../services/api';
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
  }
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
    } else {
      dispatch({ type: ActionTypes.RESET_ALL });
    }
  }, [user]);

  // Profile methods
  const fetchProfile = async () => {
    try {
      dispatch({ type: ActionTypes.PROFILE_FETCH_START });
      const response = await profileAPI.fetch();
      
      const profileData = {
        name: response.data?.name || user?.email?.split('@')[0] || 'User',
        education_level: response.data?.education_level || '',
        current_role: response.data?.current_role || '',
        experience_years: response.data?.experience_years || '',
        skills: response.data?.skills || '',
        interests: response.data?.interests || '',
        location: response.data?.location || '',
        preferred_salary: response.data?.preferred_salary || '',
        field_of_study: response.data?.field_of_study || '',
        current_year: response.data?.current_year || '',
        career_goals: response.data?.career_goals || '',
        ...response.data
      };
      
      dispatch({ type: ActionTypes.PROFILE_FETCH_SUCCESS, payload: profileData });
    } catch (error) {
      console.log('Profile fetch error:', error);
      // For 404 errors (new users), set default profile
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
        dispatch({ type: ActionTypes.PROFILE_FETCH_SUCCESS, payload: defaultProfile });
      } else {
        dispatch({ type: ActionTypes.PROFILE_FETCH_ERROR, payload: error.message });
      }
    }
  };

  const updateProfile = async (profileData) => {
    try {
      await profileAPI.save(profileData);
      dispatch({ type: ActionTypes.PROFILE_UPDATE_SUCCESS, payload: profileData });
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
      const response = await careerAPI.getRecommendations();
      
      if (response.data && response.data.length > 0) {
        dispatch({ type: ActionTypes.CAREERS_FETCH_SUCCESS, payload: response.data });
      } else {
        // Fallback data if API doesn't return results
        const fallbackCareers = [
          {
            title: 'Software Developer',
            company: 'Tech Companies',
            salary: '12-25 LPA',
            match_score: 85,
            requirements: ['JavaScript', 'React', 'Node.js', 'Python'],
            location: 'Multiple Cities'
          },
          {
            title: 'Data Analyst',
            company: 'Analytics Firms',
            salary: '10-20 LPA',
            match_score: 78,
            requirements: ['Python', 'SQL', 'Excel', 'Statistics'],
            location: 'Multiple Cities'
          },
          {
            title: 'Product Manager',
            company: 'Product Companies',
            salary: '15-30 LPA',
            match_score: 72,
            requirements: ['Communication', 'Strategy', 'Analytics', 'Leadership'],
            location: 'Multiple Cities'
          }
        ];
        dispatch({ type: ActionTypes.CAREERS_FETCH_SUCCESS, payload: fallbackCareers });
      }
    } catch (error) {
      console.error('Career recommendations error:', error);
      dispatch({ type: ActionTypes.CAREERS_FETCH_ERROR, payload: error.message });
    }
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
      
      if (response.data?.extracted_data) {
        dispatch({ type: ActionTypes.RESUME_UPLOAD_SUCCESS, payload: response.data });
        
        // Update profile with extracted skills
        if (response.data.extracted_data.skills?.length && state.profile.data) {
          const currentSkills = state.profile.data.skills ? 
            state.profile.data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
          
          const newSkills = Array.from(new Set([
            ...currentSkills,
            ...response.data.extracted_data.skills
          ]));
          
          const updatedProfile = {
            ...state.profile.data,
            skills: newSkills.join(', ')
          };
          
          dispatch({ type: ActionTypes.PROFILE_UPDATE_SUCCESS, payload: updatedProfile });
        }
        
        toast.success('Resume processed successfully');
        return response.data;
      }
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
    
    // Utility methods
    refreshAll: () => {
      fetchProfile();
      fetchCareerRecommendations();
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;