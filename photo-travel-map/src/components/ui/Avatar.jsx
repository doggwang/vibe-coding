import React from 'react';

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const combinedClassName = `${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-medium text-primary-700 ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        {...props}
      />
    );
  }

  return (
    <div className={combinedClassName} {...props}>
      {fallback || alt.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;