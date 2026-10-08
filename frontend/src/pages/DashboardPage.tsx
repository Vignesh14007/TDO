import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Target,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { dashboardService, taskService, goalService } from '../services/api';
import { DashboardData, Goal } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Task Creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('General');
  const [newDuration, setNewDuration] = useState<string>('30');
  const [newGoalId, setNewGoalId] = useState<string>('');
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.get();
      setData(res.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openCreateModal = async () => {
    try {
      const res = await goalService.list('active');
      setAvailableGoals(res.data);
    } catch {
      // optional fallback
    }
    setIsModalOpen(true);
  };

  const handleToggleTask = async (taskId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'completed') {
        await taskService.uncomplete(taskId);
      } else {
        await taskService.complete(taskId);
      }
      fetchDashboard();
    } catch {
      // error handled silently
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await taskService.create({
        title: newTitle.trim(),
        task_date: today,
        priority: newPriority,
        category: newCategory.trim() || 'General',
        duration: newDuration ? parseInt(newDuration, 10) : undefined,
        goal_id: newGoalId ? parseInt(newGoalId, 10) : undefined,
      });
      setIsModalOpen(false);
      setNewTitle('');
      fetchDashboard();
    } catch (err) {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-tdo-secondary dark:text-tdo-dark-secondary">
        <span className="w-4 h-4 border-2 border-tdo-primary dark:border-white border-t-transparent rounded-full animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="text-center py-8">
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error || 'Unable to display dashboard'}</p>
        <Button size="sm" onClick={fetchDashboard}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
            Today’s Overview
          </h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Focus on what matters today. Keep your momentum going.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Today’s Task
        </Button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
            <span>Today's Progress</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-tdo-primary dark:text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
            {data.today.completion_percentage}%
          </div>
          <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">
            {data.today.completed} of {data.today.total} completed
          </p>
          <div className="w-full bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-tdo-primary dark:bg-white h-full transition-all duration-300"
              style={{ width: `${data.today.completion_percentage}%` }}
            />
          </div>
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
          <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">
            Consistency: {data.streak.consistency_percentage}%
          </p>
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
          <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">All-time personal record</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
            <span>Active Goals</span>
            <Target className="w-3.5 h-3.5 text-tdo-primary dark:text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-tdo-primary dark:text-white tracking-tight">
            {data.active_goals.length}
          </div>
          <p className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary mt-1">In progress right now</p>
        </Card>
      </div>

      {/* Main Grid: Today's Tasks & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-tdo-primary dark:text-white">Today’s Schedule</h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white flex items-center transition-colors"
            >
              All Tasks <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <Card className="p-0 divide-y divide-tdo-border dark:divide-tdo-dark-border">
            {data.today_tasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-3">No tasks scheduled for today.</p>
                <Button size="sm" variant="secondary" onClick={openCreateModal}>
                  Schedule a task for today
                </Button>
              </div>
            ) : (
              data.today_tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 hover:bg-tdo-surface dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-3">
                    <button
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="mt-0.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white flex-shrink-0 transition-colors"
                      title={task.status === 'completed' ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          task.status === 'completed'
                            ? 'line-through text-tdo-secondary dark:text-tdo-dark-secondary'
                            : 'text-tdo-primary dark:text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {task.duration && (
                      <span className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary hidden sm:flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {task.duration}m
                      </span>
                    )}
                    <StatusBadge type="priority" value={task.priority} />
                    <span className="text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-2 py-0.5 rounded capitalize hidden sm:inline-block">
                      {task.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Active Goals Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-tdo-primary dark:text-white">Active Goals</h2>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white flex items-center transition-colors"
            >
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <Card className="p-0 divide-y divide-tdo-border dark:divide-tdo-dark-border">
            {data.active_goals.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-3">No active goals yet.</p>
                <Button size="sm" variant="secondary" onClick={() => onNavigate('goals')}>
                  Create Goal
                </Button>
              </div>
            ) : (
              data.active_goals.map((goal) => (
                <div key={goal.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-tdo-primary dark:text-white truncate">{goal.title}</p>
                    <span className="text-[11px] font-mono text-tdo-secondary dark:text-tdo-dark-secondary">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tdo-primary dark:bg-white h-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  {goal.end_date && (
                    <p className="text-[10px] text-tdo-secondary dark:text-tdo-dark-secondary">Target: {goal.end_date}</p>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Quick Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Task for Today">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Complete chapter 3 review"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">Category</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                placeholder="Study, Work, Health"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              min="5"
              max="1440"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                Link to Goal (Optional)
              </label>
              <select
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                value={newGoalId}
                onChange={(e) => setNewGoalId(e.target.value)}
              >
                <option value="">None</option>
                {availableGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-tdo-border dark:border-tdo-dark-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
