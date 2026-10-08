import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
} from 'lucide-react';
import { taskService, goalService } from '../services/api';
import { Task, Goal } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formCategory, setFormCategory] = useState('General');
  const [formDuration, setFormDuration] = useState('30');
  const [formGoalId, setFormGoalId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.list({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      });
      setTasks(res.data);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await goalService.list('active');
      setGoals(res.data);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormPriority('medium');
    setFormCategory('General');
    setFormDuration('30');
    setFormGoalId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormDate(task.task_date);
    setFormDueDate(task.due_date || '');
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormDuration(task.duration ? task.duration.toString() : '');
    setFormGoalId(task.goal_id ? task.goal_id.toString() : '');
    setIsModalOpen(true);
  };

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === 'completed') {
        await taskService.uncomplete(task.id);
      } else {
        await taskService.complete(task.id);
      }
      fetchTasks();
    } catch {
      // handle error
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.delete(id);
      fetchTasks();
    } catch {
      // handle error
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);

    try {
      const payload: Partial<Task> = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        task_date: formDate,
        due_date: formDueDate || null,
        priority: formPriority,
        category: formCategory.trim() || 'General',
        duration: formDuration ? parseInt(formDuration, 10) : null,
        goal_id: formGoalId ? parseInt(formGoalId, 10) : null,
      };

      if (editingTask) {
        await taskService.update(editingTask.id, payload);
      } else {
        await taskService.create(payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch {
      // error handle
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
            Task Management
          </h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Organize, prioritize, and track all your scheduled responsibilities.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-tdo-primary dark:focus:border-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-tdo-primary dark:focus:border-white"
            />
          </div>
        </div>
      </Card>

      {/* Task List */}
      <Card className="p-0 divide-y divide-tdo-border dark:divide-tdo-dark-border">
        {loading ? (
          <div className="p-8 text-center text-xs text-tdo-secondary dark:text-tdo-dark-secondary">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-tdo-primary dark:text-white mb-1">No tasks found</p>
            <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-4">
              Try adjusting your filters or create a new task to get started.
            </p>
            <Button size="sm" variant="secondary" onClick={handleOpenCreate}>
              Create Task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 hover:bg-tdo-surface dark:hover:bg-neutral-800/60 transition-colors gap-3"
            >
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <button
                  onClick={() => handleToggleTask(task)}
                  className="mt-0.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white flex-shrink-0 transition-colors"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.status === 'completed'
                          ? 'line-through text-tdo-secondary dark:text-tdo-dark-secondary'
                          : 'text-tdo-primary dark:text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    <StatusBadge type="priority" value={task.priority} />
                    <StatusBadge type="status" value={task.status} />
                  </div>
                  {task.description && (
                    <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-tdo-secondary dark:text-tdo-dark-secondary">
                    <span className="flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {task.task_date}
                    </span>
                    {task.duration && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.duration} mins
                      </span>
                    )}
                    <span className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-1.5 py-0.5 rounded text-[10px] capitalize">
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-red-700 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Finalize project report"
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
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-tdo-primary dark:focus:border-white"
              placeholder="Additional notes or subtasks..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
            <Input
              label="Due Date (Optional)"
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
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
                placeholder="Work, Study, Personal"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              max="1440"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-1">
                Link to Goal (Optional)
              </label>
              <select
                className="w-full px-3 py-2 text-sm bg-white dark:bg-tdo-dark-card border border-tdo-border dark:border-tdo-dark-border rounded text-tdo-primary dark:text-tdo-dark-primary focus:outline-none focus:border-tdo-primary dark:focus:border-white"
                value={formGoalId}
                onChange={(e) => setFormGoalId(e.target.value)}
              >
                <option value="">None</option>
                {goals.map((g) => (
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
