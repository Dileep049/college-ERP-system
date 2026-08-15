import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  X, 
  LogOut 
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, menuItems = [], user, onLogout }) => {
  const location = useLocation();

  // Prevent background body scrolling when mobile sidebar is open (Sidebar Scroll Bleed Fix)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
      case 'admin': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'principal': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'hod': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'student': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen h-[100dvh] bg-black/40 backdrop-blur-md border-r border-white/10 shadow-xl transition-transform duration-300 flex flex-col overflow-y-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static text-white`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl text-white shadow-md shadow-blue-500/20 border border-white/20">
              <Building2 size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight font-display text-white drop-shadow">
                ACADEMIA
              </span>
              <p className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider -mt-0.5">
                Portal Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        {user && (() => {
          const userName = user.fullName || user.name || user.displayName || 'User';
          const userInitials = userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
          return (
            <div className="p-4 mx-4 my-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shrink-0">
              <div className="flex items-center gap-3">
                {user.profilePhotoUrl || user.photo ? (
                  <img
                    src={user.profilePhotoUrl || user.photo}
                    alt={userName}
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-md border border-white/20">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate drop-shadow">
                    {userName}
                  </p>
                  <p className="text-[10.5px] font-medium text-white/70 truncate mt-0.5">
                    {user.email || ''}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-white/10 text-cyan-300 border border-white/20`}>
                  {user.role}
                </span>
                <span className="text-[10px] font-semibold text-white/70 truncate max-w-[110px]">
                  {user.department && user.department !== 'N/A' ? user.department : ''}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md drop-shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {Icon && <Icon size={18} className={isActive ? 'scale-110 text-cyan-300 shrink-0' : 'opacity-80 text-white/70 shrink-0'} />}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at Bottom */}
        {onLogout && (
          <div className="p-4 border-t border-white/10 shrink-0 mt-auto">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
