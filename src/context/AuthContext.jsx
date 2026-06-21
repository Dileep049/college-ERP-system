import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDB } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('acad_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Check initial user from localStorage or Firebase
    const currentUser = mockDB.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Update theme in DOM when state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('acad_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'theme-dark' && 'dark');
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Automatically clear toast after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Authentication operations
  const login = async (email, password) => {
    try {
      const loggedUser = await mockDB.login(email, password);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.fullName}!`, 'success');
      return loggedUser;
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await mockDB.logout();
      showToast('Logged out successfully.', 'info');
      setUser(null);
    } catch (error) {
      showToast('Logout failed', 'error');
    }
  };

  const register = async (email, fullName, branch, semester, rollNumber) => {
    try {
      const registeredUser = await mockDB.registerStudent(email, fullName, branch, semester, rollNumber);
      setUser(registeredUser);
      showToast(`Registration successful! Welcome ${fullName}.`, 'success');
      return registeredUser;
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      theme,
      toggleTheme,
      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
