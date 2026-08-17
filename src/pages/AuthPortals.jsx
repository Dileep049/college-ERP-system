import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { Building2, Mail, Lock, Award, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

// Unified Futuristic Glass Auth Form Layout
const AuthContainer = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between campus-hero-bg px-4 py-8 sm:py-12 relative overflow-hidden font-sans">
      {/* Aurora Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="bg-black/20 backdrop-blur-sm border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all text-white rounded-full px-4 py-2 text-xs flex items-center gap-1.5 shadow-md"
        >
          <ArrowLeft size={14} />
          <span>All Portals</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Center Maximum Transparency Glass Auth Modal */}
      <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-6 sm:p-8 relative z-10 my-auto">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl text-white shadow-lg shadow-cyan-500/25 border border-white/30 mb-4">
            <ShieldCheck size={28} className="text-white drop-shadow" />
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{title}</h2>
          <p className="text-xs font-semibold text-slate-200 mt-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{subtitle}</p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-medium text-white/70 drop-shadow mt-6">
        <p>© 2026 ACADEMIA ERP • Multi-Role Autonomous Campus Intelligence</p>
      </div>
    </div>
  );
};

// Generic Clean Email/Password Portal Login
const CommonPortalLogin = ({ roleLabel, roleFilter, prefillEmail, dashboardPath }) => {
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast(`Welcome back to ${roleLabel} Portal!`, 'success');
      navigate(dashboardPath);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Invalid email or password. Please try again.');
      showToast('Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      const all = await mockDB.getAllUsers();
      const found = all.find(u => u.email === prefillEmail || (roleFilter && u.role === roleFilter)) || all[0];
      await login(found);
      showToast(`Logged in with One-Click Access as ${roleLabel}`, 'success');
      navigate(dashboardPath);
    } catch (err) {
      console.error("Demo Login Error:", err);
      showToast('Could not sign in with demo access.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title={`${roleLabel} Portal`} subtitle={`Sign in to access your administrative and academic portal`}>

      {error && (
        <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 backdrop-blur-sm rounded-2xl text-rose-200 font-bold text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-300" />
          <span>{error}</span>
        </div>
      )}

      {/* Direct Email & Password Login Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 drop-shadow">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={prefillEmail}
              required
              className="w-full bg-black/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/70 focus:outline-none focus:border-cyan-400 focus:bg-black/20 focus:ring-1 focus:ring-cyan-400 transition-all text-sm shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 drop-shadow">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-white/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-black/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/70 focus:outline-none focus:border-cyan-400 focus:bg-black/20 focus:ring-1 focus:ring-cyan-400 transition-all text-sm shadow-inner"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 w-full py-3 text-sm mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Verifying credentials...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Quick One-Click Demo Access */}
      <div className="mt-6 pt-5 border-t border-white/15 text-center">
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-3">
          Quick One-Click Demo Access
        </p>
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-xl py-2.5 text-xs w-full flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-bold shadow-sm"
        >
          <Award size={15} />
          <span>One-Click Access as {roleLabel}</span>
        </button>
      </div>

    </AuthContainer>
  );
};

// 1. STUDENT LOGIN
export const StudentLogin = () => (
  <CommonPortalLogin roleLabel="Student" roleFilter="student" prefillEmail="student.cse@kbn.edu" dashboardPath="/student/dashboard" />
);

// 2. FACULTY LOGIN
export const FacultyLogin = () => (
  <CommonPortalLogin roleLabel="Faculty" roleFilter="faculty" prefillEmail="faculty.cse@kbn.edu" dashboardPath="/faculty/dashboard" />
);

// 3. HOD LOGIN
export const HODLogin = () => (
  <CommonPortalLogin roleLabel="HOD" roleFilter="hod" prefillEmail="hod.cse@kbn.edu" dashboardPath="/hod/dashboard" />
);

// 4. PRINCIPAL LOGIN
export const PrincipalLogin = () => (
  <CommonPortalLogin roleLabel="Principal" roleFilter="principal" prefillEmail="principal@kbn.edu" dashboardPath="/principal/dashboard" />
);

// 5. PLACEMENT LOGIN
export const PlacementLogin = () => (
  <CommonPortalLogin roleLabel="Placement Officer" roleFilter="placement" prefillEmail="placement@kbn.edu" dashboardPath="/placement/dashboard" />
);

// 6. WARD COUNSELLOR LOGIN
export const CounsellorLogin = () => (
  <CommonPortalLogin roleLabel="Ward Counsellor" roleFilter="counsellor" prefillEmail="counsellor.cse@kbn.edu" dashboardPath="/counsellor/dashboard" />
);

// 7. LIBRARIAN LOGIN
export const LibrarianLogin = () => (
  <CommonPortalLogin roleLabel="Librarian" roleFilter="librarian" prefillEmail="librarian@kbn.edu" dashboardPath="/librarian/dashboard" />
);

// 8. ADMIN LOGIN
export const AdminLogin = () => (
  <CommonPortalLogin roleLabel="Administrator" roleFilter="admin" prefillEmail="admin@kbn.edu" dashboardPath="/admin/dashboard" />
);
