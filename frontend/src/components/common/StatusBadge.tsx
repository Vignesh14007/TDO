import React from 'react';

interface StatusBadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  const normalized = value.toLowerCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';

  if (type === 'status') {
    if (normalized === 'completed') {
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    } else if (normalized === 'pending') {
      styles = 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-300 dark:border-neutral-700';
    } else if (normalized === 'cancelled' || normalized === 'archived') {
      styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    } else if (normalized === 'active') {
      styles = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
    }
  } else if (type === 'priority') {
    if (normalized === 'high') {
      styles = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    } else if (normalized === 'medium') {
      styles = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    } else if (normalized === 'low') {
      styles = 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-400 dark:border-neutral-700';
    }
  }

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${styles}`}
    >
      {value}
    </span>
  );
};
