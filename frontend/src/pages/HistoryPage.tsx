import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { historyService } from '../services/api';
import { HistoryResponse } from '../types';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';

export const HistoryPage: React.FC = () => {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month' | 'all'>('this_month');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await historyService.get({
        period,
        status: statusFilter || undefined,
      });
      setData(res.data);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [period, statusFilter]);

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
          Activity History
        </h1>
        <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
          Review your completed track record, focus durations, and consistency log.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tdo-border dark:border-tdo-dark-border pb-3">
        <div className="flex items-center space-x-1.5 text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                period === tab.id
                  ? 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary shadow-sm'
                  : 'text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white hover:bg-tdo-surface dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="pending">Pending Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4">
            <span className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Total Scheduled</span>
            <div className="text-xl sm:text-2xl font-bold text-tdo-primary dark:text-white mt-1">
              {data.summary.total_tasks}
            </div>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Completed</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {data.summary.completed_tasks}
            </div>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Pending / Missed</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {data.summary.pending_tasks}
            </div>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Time Invested</span>
            <div className="text-xl sm:text-2xl font-bold text-tdo-primary dark:text-white mt-1">
              {formatHours(data.summary.total_duration_minutes)}
            </div>
          </Card>
        </div>
      )}

      {/* Task Log Timeline */}
      <Card className="p-0 divide-y divide-tdo-border dark:divide-tdo-dark-border">
        {loading ? (
          <div className="p-8 text-center text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Loading history log...</div>
        ) : !data || data.tasks.length === 0 ? (
          <div className="p-10 text-center">
            <HistoryIcon className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-tdo-primary dark:text-white mb-1">No activity in this period</p>
            <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">
              Completed and scheduled tasks will show up in this timeline.
            </p>
          </div>
        ) : (
          data.tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex items-center justify-between hover:bg-tdo-surface dark:hover:bg-neutral-800/60 transition-colors gap-3"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="mt-0.5">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-tdo-primary dark:text-white truncate">{task.title}</p>
                    <StatusBadge type="status" value={task.status} />
                  </div>
                  {task.description && (
                    <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Date: {task.task_date}
                    </span>
                    {task.completed_at && (
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                        Finished: {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {task.duration && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.duration}m
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-2 py-0.5 rounded capitalize">
                  {task.category}
                </span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
