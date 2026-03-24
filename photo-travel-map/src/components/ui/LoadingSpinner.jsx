import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-t-blue-500',
    success: 'border-t-green-500',
    warning: 'border-t-yellow-500',
    danger: 'border-t-red-500',
    info: 'border-t-cyan-500',
  };

  return (
    <div
      className={`animate-spin rounded-full border-gray-300 ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;