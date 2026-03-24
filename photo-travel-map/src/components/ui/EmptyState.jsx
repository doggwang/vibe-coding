import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-500 text-center mb-6 max-w-sm">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;