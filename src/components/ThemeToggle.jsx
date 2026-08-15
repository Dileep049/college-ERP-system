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
      className="p-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] transition-all flex items-center gap-2 shadow-sm focus:outline-none cursor-pointer"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <>
          <Sun size={17} className="text-amber-400 transition-transform duration-300 transform hover:rotate-45" />
          <span className="text-xs font-bold text-amber-400 hidden md:inline">Light</span>
        </>
      ) : (
        <>
          <Moon size={17} className="text-blue-600 transition-transform duration-300 transform hover:-rotate-12" />
          <span className="text-xs font-bold text-[var(--text-primary)] hidden md:inline">Dark</span>
        </>
      )}
    </button>
  );
};
