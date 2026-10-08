import React, { useState } from 'react';
import { User as UserIcon, Shield, Calendar, LogOut, Check, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await userService.updateProfile({
        name: name.trim() || undefined,
        password: password || undefined,
      });
      await refreshUser();
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">
          User Profile & Preferences
        </h1>
        <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
          Manage your personal details, visual theme, and account credentials.
        </p>
      </div>

      {/* Account Overview Card */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-tdo-primary dark:text-white">{user?.name}</h2>
              <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary">{user?.email}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Active Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-tdo-border dark:border-tdo-dark-border text-xs text-tdo-secondary dark:text-tdo-dark-secondary">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-tdo-primary dark:text-white" />
            <span>User ID: #{user?.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-tdo-primary dark:text-white" />
            <span>Database: Isolated</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-tdo-primary dark:text-white" />
            <span>
              Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Theme Preference Card */}
      <Card className="p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-tdo-primary dark:text-white">Interface Theme</h3>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Choose between classic clean light monochrome and sleek obsidian dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded border text-left flex items-center justify-between transition-colors ${
              theme === 'light'
                ? 'border-tdo-primary bg-gray-50 ring-1 ring-tdo-primary text-tdo-primary'
                : 'border-tdo-border bg-white text-tdo-secondary hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-semibold">Light Mode</p>
                <p className="text-[10px] text-tdo-secondary">Clean white & minimal gray</p>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-tdo-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded border text-left flex items-center justify-between transition-colors ${
              theme === 'dark'
                ? 'border-white bg-neutral-900 ring-1 ring-white text-white'
                : 'border-tdo-border dark:border-tdo-dark-border bg-neutral-800 text-tdo-dark-secondary hover:border-neutral-500'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Moon className="w-4 h-4 text-neutral-300" />
              <div>
                <p className="text-xs font-semibold">Dark Mode</p>
                <p className="text-[10px] text-tdo-dark-secondary">Deep black & subtle borders</p>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-white" />}
          </button>
        </div>
      </Card>

      {/* Update Credentials Card */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-tdo-primary dark:text-white">Update Profile Details</h3>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
            Modify your display name or update your account password.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-center">
            <Check className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded text-xs text-red-700 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-tdo-border dark:border-tdo-dark-border">
            <Input
              label="New Password (optional)"
              type="password"
              placeholder="Leave blank to keep unchanged"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" size="sm" isLoading={submitting}>
              Save Profile Changes
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={logout}
              className="flex items-center"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
