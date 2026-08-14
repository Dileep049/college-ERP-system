import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAuth();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-2 focus:outline-none"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <>
          <Sun size={18} className="text-amber-400 transition-transform transform hover:rotate-45" />
          <span className="text-xs font-extrabold text-amber-400 hidden md:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={18} className="text-slate-700 dark:text-slate-300 transition-transform transform hover:-rotate-12" />
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hidden md:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
};
