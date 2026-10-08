import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide your name.');
          setLoading(false);
          return;
        }
        await register(email, name, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || 'An error occurred during authentication. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-tdo-surface dark:bg-tdo-dark-bg text-tdo-primary dark:text-tdo-dark-primary relative transition-colors">
      {/* Corner Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-tdo-border dark:border-tdo-dark-border bg-white dark:bg-tdo-dark-surface text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-tdo-primary dark:text-white">TDO</h1>
          <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-1 tracking-wider uppercase font-mono">
            Task • Do • Optimize
          </p>
        </div>

        <Card className="shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-tdo-primary dark:text-white">
              {isRegister ? 'Create an account' : 'Sign in to your account'}
            </h2>
            <p className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary mt-0.5">
              {isRegister
                ? 'Start organizing goals and building consistency.'
                : 'Welcome back. Let’s make progress today.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded text-xs text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              {isRegister ? 'Register' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-tdo-border dark:border-tdo-dark-border text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
