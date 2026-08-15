import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../services/firebase';
import { Building2, Mail, Lock, Award, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

// Unified 3D Base Auth Form Layout
const AuthContainer = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-primary)] px-4 py-8 sm:py-12 transition-colors duration-200 relative">
      {/* 3D Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="btn-3d btn-3d-secondary py-2 px-3.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={14} />
          <span>All Portals</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Center 3D Auth Modal */}
      <div className="w-full max-w-md mx-auto card-3d-elevated p-6 sm:p-8 relative z-10 my-auto">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-black font-display text-[var(--text-primary)] tracking-tight">{title}</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)] mt-1.5">{subtitle}</p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-semibold text-[var(--text-muted)] mt-6">
        <p>ACADEMIA ERP Secure Authentication • Multi-Role Access Control</p>
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
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 font-bold text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Direct Email & Password Login Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={prefillEmail}
              required
              className="input-3d pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-3d pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-3d btn-3d-primary w-full py-3 text-sm mt-6"
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
      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center">
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Quick One-Click Demo Access
        </p>
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="btn-3d btn-3d-secondary w-full py-2.5 text-xs text-[var(--accent)] font-bold flex items-center justify-center gap-2 border-dashed border-[var(--accent)]/40 hover:border-[var(--accent)]"
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

// 9. PARENT LOGIN
export const ParentLogin = () => (
  <CommonPortalLogin roleLabel="Parent" roleFilter="parent" prefillEmail="parent@kbn.edu" dashboardPath="/parent/dashboard" />
);
