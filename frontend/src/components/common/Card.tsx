import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-tdo-dark-surface border border-tdo-border dark:border-tdo-dark-border text-tdo-primary dark:text-tdo-dark-primary rounded p-4 sm:p-5 transition-colors ${
        onClick ? 'cursor-pointer hover:border-gray-400 dark:hover:border-neutral-600' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
