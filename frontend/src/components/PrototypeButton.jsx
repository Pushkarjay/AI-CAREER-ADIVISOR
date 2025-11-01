import React from 'react';
import { notifications, getPrototypeBadge } from '../utils/prototypeNotifications';

/**
 * PrototypeButton Component
 * 
 * A button wrapper that automatically shows appropriate prototype notifications
 * when clicked, if the feature is not fully functional
 * 
 * @param {string} featureType - Type of feature (maps to notifications object)
 * @param {string} label - Button text
 * @param {function} onClick - Optional custom onClick handler (called after notification)
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional CSS classes
 * @param {boolean} showBadge - Show prototype badge on button
 * @param {string} badgeType - Badge type (demo, prototype, beta, comingSoon)
 * @param {object} customNotification - Custom notification config
 */
const PrototypeButton = ({ 
  featureType,
  label = 'Click Me',
  onClick,
  disabled = false,
  className = '',
  showBadge = false,
  badgeType = 'prototype',
  customNotification = null,
  variant = 'secondary', // primary, secondary, tertiary, danger
  size = 'md', // sm, md, lg
  icon = null,
  ...props
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show notification based on feature type
    if (customNotification) {
      const { status, message } = customNotification;
      showPrototypeNotification(status, message);
    } else if (featureType && notifications[featureType]) {
      notifications[featureType]();
    } else {
      notifications.notImplemented();
    }
    
    // Call custom onClick if provided
    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
    tertiary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  };
  
  const badge = showBadge ? getPrototypeBadge(badgeType) : null;
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-md border transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {showBadge && badge && (
        <span className={`
          ${badge.color}
          px-1.5 py-0.5 text-[10px] rounded border
          font-semibold tracking-wide
        `}>
          {badge.text}
        </span>
      )}
    </button>
  );
};

export default PrototypeButton;
