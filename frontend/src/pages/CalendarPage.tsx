import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { taskService } from '../services/api';
import { Task } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('General');
  const [newDuration, setNewDuration] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const fetchMonthTasks = async () => {
    try {
      setLoading(true);
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const res = await taskService.list({ start_date: start, end_date: end });
      setTasks(res.data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthTasks();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (!tasksByDate[t.task_date]) tasksByDate[t.task_date] = [];
    tasksByDate[t.task_date].push(t);
  });

  const selectedTasks = tasksByDate[selectedDateStr] || [];

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === 'completed') {
        await taskService.uncomplete(task.id);
      } else {
        await taskService.complete(task.id);
      }
      fetchMonthTasks();
    } catch {
      // no-op
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await taskService.create({
        title: newTitle.trim(),
        task_date: selectedDateStr,
        priority: newPriority,
        category: newCategory.trim() || 'General',
        duration: newDuration ? parseInt(newDuration, 10) : undefined,
      });
      setIsModalOpen(false);
      setNewTitle('');
      fetchMonthTasks();
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
            Calendar & Schedule
          </h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Visualize your scheduled workload across days and weeks.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="secondary" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center border border-tdo-border dark:border-tdo-dark-border rounded bg-white dark:bg-tdo-dark-surface">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-tdo-primary dark:text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-tdo-secondary dark:text-tdo-dark-secondary mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-24 bg-gray-50/50 dark:bg-neutral-900/40 rounded" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const dayTasks = tasksByDate[dateStr] || [];
              const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 sm:h-24 p-1.5 sm:p-2 rounded border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-tdo-primary dark:border-white bg-gray-50 dark:bg-neutral-800 font-semibold'
                      : 'border-tdo-border dark:border-tdo-dark-border bg-white dark:bg-tdo-dark-card hover:border-gray-400 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-block w-5 h-5 leading-5 text-center rounded-full ${
                        isToday
                          ? 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary font-bold'
                          : 'text-tdo-primary dark:text-white'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-tdo-secondary dark:text-tdo-dark-secondary font-mono">
                        {completedCount}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task indicators */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] truncate px-1 py-0.2 rounded ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through'
                            : 'bg-gray-100 dark:bg-neutral-800 text-tdo-primary dark:text-neutral-300'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-tdo-secondary dark:text-tdo-dark-secondary text-right">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-tdo-primary dark:text-white">
              Tasks for {selectedDateStr}
            </h2>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>

          <Card className="p-0 divide-y divide-tdo-border dark:divide-tdo-dark-border">
            {selectedTasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mb-3">
                  No tasks scheduled for this date.
                </p>
                <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
                  Schedule Task
                </Button>
              </div>
            ) : (
              selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 flex items-start justify-between gap-2 hover:bg-tdo-surface dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <button
                      onClick={() => handleToggleTask(t)}
                      className="mt-0.5 text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white flex-shrink-0"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          t.status === 'completed'
                            ? 'line-through text-tdo-secondary dark:text-tdo-dark-secondary'
                            : 'text-tdo-primary dark:text-white'
                        }`}
                      >
                        {t.title}
                      </p>
                      {t.duration && (
                        <p className="text-[10px] text-tdo-secondary dark:text-tdo-dark-secondary flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {t.duration}m
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge type="priority" value={t.priority} />
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Task Creation Modal for Selected Date */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Task for ${selectedDateStr}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Read technical specification"
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
                placeholder="Study, Work"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            min="1"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />

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
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
