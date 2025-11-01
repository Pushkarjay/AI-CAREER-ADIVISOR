/**
 * Prototype Notifications Utility
 * 
 * Provides consistent messaging for prototype features across the application.
 * This helps users understand which features are:
 * - Fully functional in production
 * - Partially functional in prototype
 * - Using mock/demo data
 * - Not yet implemented
 */

import toast from 'react-hot-toast';

/**
 * Feature status types
 */
export const FeatureStatus = {
  // Feature is fully functional in both prototype and production
  FULLY_FUNCTIONAL: 'fully_functional',
  
  // Feature works but uses mock/demo data in prototype
  PARTIALLY_FUNCTIONAL: 'partially_functional',
  
  // Feature is not available in prototype but will be in production
  NOT_AVAILABLE_PROTOTYPE: 'not_available_prototype',
  
  // Feature is planned but not yet implemented
  COMING_SOON: 'coming_soon',
};

/**
 * Show a prototype notification based on feature status
 */
export const showPrototypeNotification = (status, customMessage = null) => {
  switch (status) {
    case FeatureStatus.PARTIALLY_FUNCTIONAL:
      toast(
        customMessage || 
        '⚠️ This feature is partially functional in the prototype. Some data shown is demo/mock data. Full functionality will be available in production.',
        {
          duration: 4000,
          icon: '🔬',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
          },
        }
      );
      break;
      
    case FeatureStatus.NOT_AVAILABLE_PROTOTYPE:
      toast(
        customMessage || 
        '🚧 This feature is not available in the prototype. It will be fully functional in the production release.',
        {
          duration: 3500,
          icon: '🔒',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #EF4444',
          },
        }
      );
      break;
      
    case FeatureStatus.COMING_SOON:
      toast(
        customMessage || 
        '🎯 This feature is coming soon! It will be available in a future release.',
        {
          duration: 3000,
          icon: '⏳',
          style: {
            background: '#E0E7FF',
            color: '#3730A3',
            border: '1px solid #6366F1',
          },
        }
      );
      break;
      
    case FeatureStatus.FULLY_FUNCTIONAL:
      // No notification needed for fully functional features
      break;
      
    default:
      toast(
        '🔬 This feature is in prototype mode.',
        {
          duration: 2500,
          icon: 'ℹ️',
        }
      );
  }
};

/**
 * Specific prototype notifications for common features
 */

export const notifications = {
  // Download/Export features
  downloadPDF: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '📄 PDF download will be fully functional in production. Currently showing demo notification.'
  ),
  
  exportData: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '💾 Data export will be fully functional in production.'
  ),
  
  // Market data features
  marketTrends: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '📊 Market trends are powered by AI but may use cached/demo data in prototype. Production will have real-time data.'
  ),
  
  realJobSearch: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '💼 Job search uses live data from multiple job boards, but may have limited results in prototype mode.'
  ),
  
  // AI-powered features
  aiPersonalization: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🤖 AI personalization is active but may use demo data in prototype. Full AI capabilities available in production.'
  ),
  
  chatbot: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '💬 AI chatbot is functional but may have limited responses in prototype. Enhanced capabilities in production.'
  ),
  
  // Social/Sharing features
  shareFeature: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '🔗 Sharing features will be fully functional in production.'
  ),
  
  socialConnect: () => showPrototypeNotification(
    FeatureStatus.COMING_SOON,
    '👥 Social networking features coming in future release!'
  ),
  
  // Payment/Premium features
  premiumFeature: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '⭐ Premium features will be available in production with subscription.'
  ),
  
  // Notifications/Email features
  emailNotifications: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '📧 Email notifications will be fully functional in production.'
  ),
  
  pushNotifications: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '🔔 Push notifications will be available in production.'
  ),
  
  // Saved/Bookmarked items
  savedItems: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🔖 Saved items work locally in prototype. Cloud sync available in production.'
  ),
  
  // Calendar/Scheduling
  calendar: () => showPrototypeNotification(
    FeatureStatus.COMING_SOON,
    '📅 Calendar and scheduling features coming soon!'
  ),
  
  // Mentorship/Community
  mentorship: () => showPrototypeNotification(
    FeatureStatus.COMING_SOON,
    '🎓 Mentorship matching coming in future release!'
  ),
  
  community: () => showPrototypeNotification(
    FeatureStatus.COMING_SOON,
    '👨‍👩‍👧‍👦 Community features coming soon!'
  ),
  
  // Generic features
  mockData: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🎭 This feature uses demo/mock data in prototype. Real data in production.'
  ),
  
  notImplemented: () => showPrototypeNotification(
    FeatureStatus.NOT_AVAILABLE_PROTOTYPE,
    '🚧 This feature is not yet available in the prototype.'
  ),
  
  comingSoon: () => showPrototypeNotification(
    FeatureStatus.COMING_SOON,
    '⏳ This feature is coming soon in a future update!'
  ),
  
  // Specific feature messages
  personalizedPath: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🎯 AI-powered personalized paths are functional using Google Gemini. Some recommendations may be generic in prototype.'
  ),
  
  skillGapAnalysis: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '📈 Skill gap analysis uses AI but may have limited accuracy in prototype mode.'
  ),
  
  careerMatching: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🎯 Career matching uses AI algorithms but may show demo careers in prototype.'
  ),
  
  resumeUpload: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '📄 Resume parsing is functional but may have limited accuracy in prototype.'
  ),
  
  learningResources: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '📚 Learning resources shown include real and demo data. Full catalog in production.'
  ),
  
  setGoals: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '🎯 Goal setting works locally in prototype. Full tracking available in production.'
  ),
  
  trackProgress: () => showPrototypeNotification(
    FeatureStatus.PARTIALLY_FUNCTIONAL,
    '📊 Progress tracking works locally. Cloud sync and analytics in production.'
  ),
};

/**
 * Helper to check if a button/feature should show prototype badge
 */
export const isPrototypeFeature = (featureName) => {
  // Add feature names that should be marked as prototype
  const prototypeFeatures = [
    'download',
    'export',
    'share',
    'social',
    'premium',
    'email',
    'push',
    'calendar',
    'mentorship',
    'community',
  ];
  
  return prototypeFeatures.some(pf => 
    featureName.toLowerCase().includes(pf)
  );
};

/**
 * Prototype Badge Component (to be used in React)
 */
export const getPrototypeBadge = (type = 'default') => {
  const badges = {
    demo: { text: 'DEMO', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    prototype: { text: 'PROTOTYPE', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    beta: { text: 'BETA', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    comingSoon: { text: 'COMING SOON', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    default: { text: 'PREVIEW', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  };
  
  return badges[type] || badges.default;
};

export default {
  FeatureStatus,
  showPrototypeNotification,
  notifications,
  isPrototypeFeature,
  getPrototypeBadge,
};
