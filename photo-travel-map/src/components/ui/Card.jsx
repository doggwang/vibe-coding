import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  hoverable = false,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-200 overflow-hidden';
  const hoverStyles = hoverable ? 'hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer' : '';
  const shadowStyles = 'shadow-sm';

  const combinedClassName = `${baseStyles} ${hoverStyles} ${shadowStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;