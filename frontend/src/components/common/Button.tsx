import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded',
    md: 'text-sm px-3.5 py-2 rounded',
    lg: 'text-base px-5 py-2.5 rounded',
  };

  const variantStyles = {
    primary: 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary hover:bg-black dark:hover:bg-neutral-200 border border-transparent shadow-sm',
    secondary: 'bg-white dark:bg-tdo-dark-card text-tdo-primary dark:text-tdo-dark-primary border border-tdo-border dark:border-tdo-dark-border hover:bg-tdo-surface dark:hover:bg-neutral-800',
    ghost: 'bg-transparent text-tdo-primary dark:text-tdo-dark-primary hover:bg-tdo-surface dark:hover:bg-neutral-800',
    danger: 'bg-white dark:bg-tdo-dark-card text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
