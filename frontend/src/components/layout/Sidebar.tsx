import React from 'react';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Calendar,
  History,
  BarChart3,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const content = (
    <nav className="p-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile();
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded font-medium transition-colors ${
              isActive
                ? 'bg-tdo-primary dark:bg-white text-white dark:text-tdo-primary shadow-sm'
                : 'text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white hover:bg-tdo-surface dark:hover:bg-neutral-800'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-56 border-r border-tdo-border dark:border-tdo-dark-border min-h-[calc(100vh-3.5rem)] bg-white dark:bg-tdo-dark-surface flex-shrink-0 transition-colors">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80%] bg-white dark:bg-tdo-dark-surface h-full shadow-xl flex flex-col z-10 border-r border-tdo-border dark:border-tdo-dark-border">
            <div className="px-5 py-4 border-b border-tdo-border dark:border-tdo-dark-border">
              <span className="font-bold text-base text-tdo-primary dark:text-white">TDO Navigation</span>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};
