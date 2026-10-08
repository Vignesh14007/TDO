import React, { useState, useEffect } from 'react';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { analyticsService } from '../services/api';
import { AnalyticsData } from '../types';
import { Card } from '../components/common/Card';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState<number>(14);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.get(days);
      setData(res.data);
    } catch {
      // error handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <div className="space-y-6 w-full">
      {/* Header and Window Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Objective metrics answering how consistently and effectively you execute tasks.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs border border-tdo-border dark:border-tdo-dark-border p-1 rounded bg-white dark:bg-tdo-dark-surface">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded transition-colors font-medium ${
                days === d
                  ? 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary shadow-sm'
                  : 'text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white hover:bg-tdo-surface dark:hover:bg-neutral-800'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="p-12 text-center text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Calculating metrics...</div>
      ) : !data ? (
        <Card className="p-8 text-center text-xs text-red-600 dark:text-red-400">Failed to load analytics.</Card>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                <span>Completion Rate</span>
                <Percent className="w-3.5 h-3.5 text-tdo-primary dark:text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
                {data.overall_completion_rate}%
              </div>
              <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">
                {data.completed_tasks} completed of {data.total_tasks}
              </p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                <span>Consistency Index</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
                {data.streak.consistency_percentage}%
              </div>
              <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">
                Active in {data.streak.total_active_days} recorded days
              </p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                <span>Current Streak</span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
                {data.streak.current_streak}{' '}
                <span className="text-xs font-normal text-tdo-secondary dark:text-tdo-dark-secondary">days</span>
              </div>
              <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">Ongoing active chain</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                <span>Longest Streak</span>
                <Trophy className="w-3.5 h-3.5 text-tdo-primary dark:text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
                {data.streak.longest_streak}{' '}
                <span className="text-xs font-normal text-tdo-secondary dark:text-tdo-dark-secondary">days</span>
              </div>
              <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">Peak consecutive consistency</p>
            </Card>
          </div>

          {/* Daily Activity Bar Chart */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-tdo-primary dark:text-white">
                Daily Completion Distribution (Last {days} Days)
              </h2>
              <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
                Shows volume of completed vs. pending tasks per calendar date.
              </p>
            </div>

            <div className="h-52 pt-8 pb-3 flex items-end justify-between gap-1 sm:gap-2 border-b border-tdo-border dark:border-tdo-dark-border overflow-x-auto">
              {data.daily_metrics.map((day) => {
                const maxDay = Math.max(
                  ...data.daily_metrics.map((d) => d.total),
                  5
                );
                const completedHeight = (day.completed / maxDay) * 100;
                const pendingHeight = (day.pending / maxDay) * 100;

                const dayLabel = day.date.slice(5); // MM-DD

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full min-w-[22px] group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary text-[10px] px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                        <p className="font-semibold">{day.date}</p>
                        <p>Completed: {day.completed}</p>
                        <p>Pending: {day.pending}</p>
                        <p>Rate: {day.completion_rate}%</p>
                      </div>
                    </div>

                    {/* Stacked Bar */}
                    <div className="w-full max-w-[20px] flex flex-col justify-end bg-gray-100 dark:bg-neutral-800 rounded-t overflow-hidden">
                      <div
                        className="w-full bg-gray-300 dark:bg-neutral-600 transition-all duration-300"
                        style={{ height: `${pendingHeight}%` }}
                      />
                      <div
                        className="w-full bg-tdo-primary dark:bg-white transition-all duration-300"
                        style={{ height: `${completedHeight}%` }}
                      />
                    </div>

                    <span className="text-[9px] text-tdo-secondary dark:text-tdo-dark-secondary mt-2 transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-4 text-xs text-tdo-secondary dark:text-tdo-dark-secondary pt-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-tdo-primary dark:bg-white rounded-sm" />
                <span>Completed Tasks</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-gray-300 dark:bg-neutral-600 rounded-sm" />
                <span>Pending Tasks</span>
              </div>
            </div>
          </Card>

          {/* Category & Priority Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-tdo-primary dark:text-white">Performance by Category</h3>
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
                  Which categories do you complete most reliably?
                </p>
              </div>

              {data.category_breakdown.length === 0 ? (
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary py-4 text-center">
                  No categorized tasks recorded yet.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {data.category_breakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-tdo-primary dark:text-white capitalize">
                          {cat.category}
                        </span>
                        <span className="text-tdo-secondary dark:text-tdo-dark-secondary text-[11px]">
                          {cat.completed}/{cat.total} ({cat.completion_rate}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-tdo-primary dark:bg-white h-full transition-all duration-300"
                          style={{ width: `${cat.completion_rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Priority Breakdown */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-tdo-primary dark:text-white">Performance by Priority</h3>
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
                  How effectively do you tackle high vs. low priority tasks?
                </p>
              </div>

              <div className="space-y-3.5">
                {data.priority_breakdown.map((prio) => (
                  <div key={prio.priority} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-tdo-primary dark:text-white capitalize">
                        {prio.priority} Priority
                      </span>
                      <span className="text-tdo-secondary dark:text-tdo-dark-secondary text-[11px]">
                        {prio.completed}/{prio.total} ({prio.completion_rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-tdo-primary dark:bg-white h-full transition-all duration-300"
                        style={{ width: `${prio.completion_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
