import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, Edit2, Trash2 } from 'lucide-react';
import { goalService } from '../services/api';
import { Goal } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [formProgress, setFormProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.list(statusFilter || undefined);
      setGoals(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormDescription('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormStatus('active');
    setFormProgress(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDescription(goal.description || '');
    setFormStartDate(goal.start_date || '');
    setFormEndDate(goal.end_date || '');
    setFormStatus(goal.status);
    setFormProgress(goal.progress);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this goal? Linked tasks will not be deleted.'))
      return;
    try {
      await goalService.delete(id);
      fetchGoals();
    } catch {
      // handle error
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);

    try {
      const payload: Partial<Goal> = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        start_date: formStartDate || null,
        end_date: formEndDate || null,
        status: formStatus,
        progress: formProgress,
      };

      if (editingGoal) {
        await goalService.update(editingGoal.id, payload);
      } else {
        await goalService.create(payload);
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
            Goals & Milestones
          </h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Define high-level objectives and measure your overarching progress.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Goal
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-tdo-border dark:border-tdo-dark-border pb-2 text-xs">
        {['', 'active', 'completed', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded transition-colors font-medium capitalize ${
              statusFilter === status
                ? 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary shadow-sm'
                : 'text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white hover:bg-tdo-surface dark:hover:bg-neutral-800'
            }`}
          >
            {status || 'All Goals'}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Loading goals...</div>
      ) : goals.length === 0 ? (
        <Card className="p-10 text-center">
          <Target className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-tdo-primary dark:text-white mb-1">No goals found</p>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-4">
            Setting clear goals creates a foundation for daily task execution.
          </p>
          <Button size="sm" variant="secondary" onClick={handleOpenCreate}>
            Create your first goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-tdo-primary dark:text-white">{goal.title}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <StatusBadge type="status" value={goal.status} />
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white rounded hover:bg-tdo-surface dark:hover:bg-neutral-800"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-red-700 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary line-clamp-2 mb-3">
                    {goal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-tdo-secondary dark:text-tdo-dark-secondary">Progress</span>
                    <span className="font-semibold text-tdo-primary dark:text-white">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-tdo-primary dark:bg-white h-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary pt-3 border-t border-tdo-border dark:border-tdo-dark-border">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Start: {goal.start_date || 'N/A'}
                </span>
                <span>Target: {goal.end_date || 'N/A'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g., Build and ship TDO V1"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-tdo-primary dark:focus:border-white"
              placeholder="What are the success criteria and motivations?"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">Status</label>
              <select
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                Progress ({formProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formProgress}
                onChange={(e) => setFormProgress(parseInt(e.target.value, 10))}
                className="w-full accent-tdo-primary dark:accent-white mt-2"
              />
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
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
