import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading, profileError, loadUserProfile, logout, showToast } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a premium glassmorphic loading screen
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.85)),url('/nature-bg.png')] bg-cover bg-center bg-fixed text-white p-6">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent shadow-lg"></div>
          <div className="absolute h-8 w-8 rounded-full bg-cyan-400/20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-cyan-200 font-semibold animate-pulse tracking-wide text-xs">Verifying credentials & session...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.85)),url('/nature-bg.png')] bg-cover bg-center bg-fixed p-6 text-center text-white">
        <div className="max-w-md w-full p-8 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h3 className="text-lg font-black text-white">Profile Loading Error</h3>
          <p className="text-xs text-gray-300 font-medium">{profileError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => user?.uid ? loadUserProfile(user.uid) : window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Retry Profile
            </button>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get base path for redirection based on route path
  const getLoginRedirectPath = (path) => {
    if (path.startsWith('/student')) return '/student/login';
    if (path.startsWith('/parent')) return '/parent/login';
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
  const isAllowed = allowedRole === user.role || (user.role === 'superadmin' && (allowedRole === 'admin' || allowedRole === 'principal' || allowedRole === 'hod')) || (user.role === 'vice_principal' && allowedRole === 'principal') || (user.role === 'lab_faculty' && allowedRole === 'faculty');
  
  if (allowedRole && !isAllowed) {
    // Show warning toast for illegal access
    showToast(`Access Denied: You cannot view ${allowedRole} pages.`, 'error');
    
    // Redirect user to their own dashboard
    const roleDashboardMap = {
      superadmin: '/admin/dashboard',
      admin: '/admin/dashboard',
      principal: '/principal/dashboard',
      vice_principal: '/principal/dashboard',
      hod: '/hod/dashboard',
      faculty: '/faculty/dashboard',
      lab_faculty: '/faculty/dashboard',
      counsellor: '/counsellor/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard',
      placement: '/placement/dashboard',
      librarian: '/librarian/dashboard',
      accounts: '/admin/dashboard',
      exam_cell: '/admin/dashboard',
      transport: '/admin/dashboard'
    };
    return <Navigate to={roleDashboardMap[user.role] || '/student/dashboard'} replace />;
  }

  return children;
};
