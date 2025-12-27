import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding = false }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        rounded-lg sm:rounded-xl
        shadow-sm
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${noPadding ? '' : 'p-3 sm:p-4 lg:p-6'}
        ${className}
      `}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};

