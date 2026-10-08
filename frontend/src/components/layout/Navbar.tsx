import React from 'react';
import { Menu, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onSelectTab,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-tdo-dark-surface border-b border-tdo-border dark:border-tdo-dark-border transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white hover:bg-tdo-surface dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              onClick={() => onSelectTab('dashboard')}
              className="cursor-pointer flex items-baseline space-x-2"
            >
              <span className="font-bold text-lg tracking-tight text-tdo-primary dark:text-white">
                TDO
              </span>
              <span className="text-xs text-tdo-secondary dark:text-tdo-dark-secondary hidden sm:inline font-mono">
                Task • Do • Optimize
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white p-2 rounded hover:bg-tdo-surface dark:hover:bg-neutral-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline font-medium text-white">Light</span>
                </>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center space-x-2 text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white px-2.5 py-1.5 rounded hover:bg-tdo-surface dark:hover:bg-neutral-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-tdo-primary dark:text-white" />
              <span className="font-medium hidden sm:inline">{user?.name}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-xs text-tdo-secondary dark:text-tdo-dark-secondary hover:text-red-700 dark:hover:text-red-400 px-2.5 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
