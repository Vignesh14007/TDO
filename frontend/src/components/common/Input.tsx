import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border rounded text-tdo-primary dark:text-tdo-dark-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-tdo-primary dark:focus:border-white transition-colors ${
          error ? 'border-red-400 focus:border-red-500 dark:border-red-700' : 'border-tdo-border dark:border-tdo-dark-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-tdo-secondary dark:text-tdo-dark-secondary">{helperText}</p>}
    </div>
  );
};
