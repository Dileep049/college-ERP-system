import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading, showToast } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a premium glassmorphic loading screen
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <div className="absolute h-8 w-8 rounded-full bg-blue-500/20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  // Get base path for redirection based on route path
  const getLoginRedirectPath = (path) => {
    if (path.startsWith('/student')) return '/student/login';
    if (path.startsWith('/faculty')) return '/faculty/login';
    if (path.startsWith('/hod')) return '/hod/login';
    if (path.startsWith('/principal')) return '/principal/login';
    if (path.startsWith('/placement')) return '/placement/login';
    if (path.startsWith('/counsellor')) return '/counsellor/login';
    if (path.startsWith('/librarian')) return '/librarian/login';
    if (path.startsWith('/admin')) return '/admin/login';
    return '/student/login'; // fallback
  };

  // If not logged in, redirect to login
  if (!user) {
    const redirectLogin = getLoginRedirectPath(location.pathname);
    return <Navigate to={redirectLogin} replace />;
  }

  // If role doesn't match, block and redirect to their own dashboard
  if (allowedRole && user.role !== allowedRole) {
    // Show warning toast for illegal access
    showToast(`Access Denied: You cannot view ${allowedRole} pages.`, 'error');
    
    // Redirect user to their own dashboard
    const roleDashboardMap = {
      student: '/student/dashboard',
      faculty: '/faculty/dashboard',
      hod: '/hod/dashboard',
      principal: '/principal/dashboard',
      placement: '/placement/dashboard',
      counsellor: '/counsellor/dashboard',
      librarian: '/librarian/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={roleDashboardMap[user.role] || '/student/dashboard'} replace />;
  }

  return children;
};
