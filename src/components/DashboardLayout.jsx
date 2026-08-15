import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Briefcase,
  CheckSquare,
  Users,
  FileText,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Building2,
  Settings,
  User,
  CreditCard,
  Library,
  UserCheck,
  Award,
  Lock,
  Ticket,
  Home,
  MessageSquare,
  ClipboardList,
  FileCheck,
  Clock,
  Upload,
  TrendingUp,
  Activity,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout, theme, toggleTheme, updateProfilePhoto } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentDateString, setCurrentDateString] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    setCurrentDateString(new Date().toLocaleDateString('en-US', options));
  }, []);

  // Lock body scroll when mobile sidebar is open (Sidebar Scroll Bleed Fix)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return alert('Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.');
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('File size exceeds maximum limit of 5 MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) return;
    try {
      setIsUploading(true);
      await updateProfilePhoto(photoPreview);
      setShowPhotoModal(false);
      setPhotoPreview(null);
    } catch (_) {
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreDefaultAvatar = async () => {
    if (confirm('Are you sure you want to restore the default initial avatar?')) {
      try {
        setIsUploading(true);
        await updateProfilePhoto(null);
        setShowPhotoModal(false);
        setPhotoPreview(null);
      } catch (_) {
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!user) return null;

  // Define sidebar menu options by role
  const menuConfig = {
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/student/profile', icon: UserCheck },
      { label: 'Academic Overview', path: '/student/academic-overview', icon: TrendingUp },
      { label: 'Course Registration', path: '/student/course-registration', icon: BookOpen },
      { label: 'Attendance', path: '/student/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/student/marks', icon: FileText },
      { label: 'Semester Results', path: '/student/results', icon: Award },
      { label: 'Assignments', path: '/student/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/student/notes', icon: ClipboardList },
      { label: 'Leave', path: '/student/leaves', icon: Calendar },
      { label: 'My Ward Counsellor', path: '/student/counsellor', icon: UserCheck },
      { label: 'Faculty', path: '/student/faculty', icon: Users },
      { label: 'Placements', path: '/student/placements', icon: Briefcase },
      { label: 'Counselling', path: '/student/counselling', icon: Activity },
      { label: 'Notifications', path: '/student/notifications', icon: Bell }
    ],
    faculty: [
      { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
      { label: 'My Classes', path: '/faculty/classes', icon: BookOpen },
      { label: 'My Students', path: '/faculty/students', icon: Users },
      { label: 'Attendance', path: '/faculty/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/faculty/marks', icon: FileText },
      { label: 'Assignments', path: '/faculty/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/faculty/notes', icon: ClipboardList },
      { label: 'Academic Performance', path: '/faculty/academic-performance', icon: TrendingUp },
      { label: 'Student Progress', path: '/faculty/student-progress', icon: Activity },
      { label: 'Leave', path: '/faculty/leaves', icon: Calendar },
      { label: 'Reports', path: '/faculty/reports', icon: FileText },
      { label: 'Profile', path: '/faculty/profile', icon: UserCheck }
    ],
    hod: [
      { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
      { label: 'Department Overview', path: '/hod/overview', icon: Building2 },
      { label: 'Faculty Directory', path: '/hod/faculty-directory', icon: Users },
      { label: 'Ward Counsellors', path: '/hod/ward-counsellors', icon: UserCheck },
      { label: 'Faculty Workload', path: '/hod/workload', icon: Briefcase },
      { label: 'Attendance Monitoring', path: '/hod/attendance-monitoring', icon: CheckSquare },
      { label: 'Attendance Unlocks', path: '/hod/attendance-unlocks', icon: Lock },
      { label: 'Faculty Leaves', path: '/hod/faculty-leaves', icon: Calendar },
      { label: 'Academic Performance', path: '/hod/academic-performance', icon: Award },
      { label: 'Curriculum Progress', path: '/hod/curriculum', icon: ClipboardList },
      { label: 'Department Announcements', path: '/hod/announcements', icon: Bell },
      { label: 'Reports', path: '/hod/reports', icon: FileText },
      { label: 'Audit Logs', path: '/hod/audit-logs', icon: Clock },
      { label: 'Settings', path: '/hod/settings', icon: Settings }
    ],
    principal: [
      { label: 'Executive Console', path: '/principal/dashboard', icon: LayoutDashboard },
      { label: 'Branch Analytics', path: '/principal/branches', icon: Building2 },
      { label: 'Semester Results', path: '/principal/results', icon: Award },
      { label: 'Academic Performance', path: '/principal/performance', icon: TrendingUp },
      { label: 'Faculty Overview', path: '/principal/faculty', icon: Users },
      { label: 'Attendance Analytics', path: '/principal/attendance', icon: CheckSquare },
      { label: 'Academic Calendar', path: '/principal/calendar', icon: Clock },
      { label: 'Compile Reports', path: '/principal/reports', icon: FileText },
      { label: 'Leaves Review', path: '/principal/leaves', icon: Calendar },
      { label: 'Document Dispatch', path: '/principal/documents', icon: FileCheck },
      { label: 'Placement Analytics', path: '/principal/placements', icon: Briefcase },
      { label: 'Settings', path: '/principal/settings', icon: Settings }
    ],
    placement: [
      { label: 'Command Board', path: '/placement/dashboard', icon: LayoutDashboard },
      { label: 'Placement Drives', path: '/placement/drives', icon: Briefcase },
      { label: 'Upcoming Drives', path: '/placement/upcoming-drives', icon: Calendar },
      { label: 'Applications', path: '/placement/applications', icon: ClipboardList },
      { label: 'Eligible Candidates', path: '/placement/students', icon: Users },
      { label: 'Shortlisted Students', path: '/placement/shortlisted', icon: UserCheck },
      { label: 'Interview Schedule', path: '/placement/interviews', icon: Clock },
      { label: 'Selected Students', path: '/placement/selected', icon: ShieldCheck },
      { label: 'Companies', path: '/placement/partners', icon: Building2 },
      { label: 'Training & Mock Tests', path: '/placement/training', icon: BookOpen },
      { label: 'Placement Analytics', path: '/placement/analytics', icon: TrendingUp },
      { label: 'Placement Reports', path: '/placement/reports', icon: FileText },
      { label: 'Notifications', path: '/placement/notifications', icon: Bell },
      { label: 'Settings', path: '/placement/settings', icon: Settings }
    ],
    counsellor: [
      { label: 'Counsellor Panel', path: '/counsellor/dashboard', icon: LayoutDashboard },
      { label: 'Parent Meetings', path: '/counsellor/parent-meetings', icon: Users },
      { label: 'Counselling Wards', path: '/counsellor/wards', icon: UserCheck },
      { label: 'Student Leaves', path: '/counsellor/student-leaves', icon: Calendar },
      { label: 'Analytics Reports', path: '/counsellor/reports', icon: FileText },
      { label: 'Profile Settings', path: '/ward-counsellor/profile', icon: User }
    ],
    ward_counsellor: [
      { label: 'Counsellor Panel', path: '/counsellor/dashboard', icon: LayoutDashboard },
      { label: 'Parent Meetings', path: '/counsellor/parent-meetings', icon: Users },
      { label: 'Counselling Wards', path: '/counsellor/wards', icon: UserCheck },
      { label: 'Student Leaves', path: '/counsellor/student-leaves', icon: Calendar },
      { label: 'Analytics Reports', path: '/counsellor/reports', icon: FileText },
      { label: 'Profile Settings', path: '/ward-counsellor/profile', icon: User }
    ],
    librarian: [
      { label: 'Library Analytics', path: '/librarian/analytics', icon: LayoutDashboard },
      { label: 'Books Inventory', path: '/librarian/dashboard', icon: Library },
      { label: 'Circulation Board', path: '/librarian/circulation', icon: CheckSquare },
      { label: 'Digital E-Resources', path: '/librarian/eresources', icon: BookOpen },
      { label: 'Fines & Clearance', path: '/librarian/fines', icon: CreditCard }
    ],
    superadmin: [
      { label: 'System Control Board', path: '/admin/dashboard', icon: Settings },
      { label: 'Bulk Student Import', path: '/admin/bulk-import', icon: Upload },
      { label: 'Institutional Analytics', path: '/admin/reports', icon: FileText }
    ],
    admin: [
      { label: 'Admin Panel', path: '/admin/dashboard', icon: Settings },
      { label: 'Bulk Student Import', path: '/admin/bulk-import', icon: Upload },
      { label: 'Analytics Reports', path: '/admin/reports', icon: FileText }
    ],
    vice_principal: [
      { label: 'Vice Principal Board', path: '/principal/dashboard', icon: LayoutDashboard },
      { label: 'Branch Analytics', path: '/principal/branches', icon: Building2 },
      { label: 'Compile Reports', path: '/principal/reports', icon: FileText }
    ],
    lab_faculty: [
      { label: 'Lab Attendance', path: '/faculty/attendance', icon: CheckSquare },
      { label: 'Lab Workload', path: '/faculty/dashboard', icon: LayoutDashboard }
    ],
    accounts: [
      { label: 'Fee Management', path: '/admin/dashboard', icon: CreditCard },
      { label: 'Collection Reports', path: '/admin/reports', icon: FileText }
    ],
    exam_cell: [
      { label: 'Internal Marks Entry', path: '/faculty/marks', icon: FileText },
      { label: 'Semester Results', path: '/admin/dashboard', icon: Award }
    ],
    transport: [
      { label: 'Transport & Fleet', path: '/admin/dashboard', icon: Home }
    ],
    parent: [
      { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { label: 'My Ward', path: '/parent/my-ward', icon: UserCheck },
      { label: 'Academic Overview', path: '/parent/academic-overview', icon: TrendingUp },
      { label: 'Attendance', path: '/parent/attendance', icon: CheckSquare },
      { label: 'Internal Marks', path: '/parent/marks', icon: FileText },
      { label: 'Semester Results', path: '/parent/results', icon: Award },
      { label: 'Assignments', path: '/parent/assignments', icon: Briefcase },
      { label: 'Study Notes', path: '/parent/notes', icon: ClipboardList },
      { label: 'Leave', path: '/parent/leaves', icon: Calendar },
      { label: 'Ward Counsellor', path: '/parent/counsellor', icon: UserCheck },
      { label: 'Faculty', path: '/parent/faculty', icon: Users },
      { label: 'Counselling', path: '/parent/counselling', icon: Activity },
      { label: 'Parent Meetings', path: '/parent/meetings', icon: MessageSquare },
      { label: 'Placements', path: '/parent/placements', icon: Briefcase },
      { label: 'Monthly Report', path: '/parent/monthly-report', icon: FileText },
      { label: 'Notifications', path: '/parent/notifications', icon: Bell },
      { label: 'Profile', path: '/parent/profile', icon: UserCheck }
    ]
  };

  const currentMenu = menuConfig[user.role] || [];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/', { replace: true });
  };

  // Get active role tag styling with 3D depth
  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return 'badge-3d badge-3d-danger';
      case 'parent':
        return 'badge-3d badge-3d-purple';
      case 'principal':
      case 'vice_principal':
        return 'badge-3d badge-3d-warning';
      case 'hod':
        return 'badge-3d badge-3d-purple';
      case 'faculty':
      case 'lab_faculty':
        return 'badge-3d badge-3d-success';
      case 'placement':
        return 'badge-3d badge-3d-info';
      case 'counsellor':
      case 'ward_counsellor':
        return 'badge-3d badge-3d-info';
      case 'librarian':
        return 'badge-3d badge-3d-success';
      default:
        return 'badge-3d badge-3d-neutral';
    }
  };

  const userName = user.fullName || user.name || user.displayName || 'User';
  const userInitials = userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const userEmail = user.email || '';
  const firstName = userName.split(' ')[0] || 'User';
  const currentPathSegment = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] transition-colors duration-200 font-sans">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3D Sidebar for desktop & mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-screen h-[100dvh] overflow-y-auto bg-[var(--surface)] border-r border-[var(--border)] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:h-screen lg:flex lg:flex-col shadow-xl`}>
        
        {/* Brand header */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-[var(--text-primary)]">ACADEMIA</span>
              <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider -mt-0.5 flex items-center gap-1">
                <span>Portal Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3D Profile Card in Sidebar */}
        <div className="p-3.5 mx-3.5 my-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={userName} className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500/40 shadow-md shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-white/20">
                {userInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{userName}</p>
              <p className="text-[10.5px] font-medium text-[var(--text-muted)] truncate">{userEmail}</p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className={getRoleBadgeClasses(user.role)}>
              {user.role}
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[95px]">
              {user.department && user.department !== 'N/A' ? user.department : 'KBN Campus'}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-1">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-3d-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-[var(--text-muted)] opacity-90'} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:h-screen">
        
        {/* Floating 3D Navbar */}
        <header className="navbar-3d h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold font-display text-[var(--text-primary)] capitalize truncate max-w-[160px] xs:max-w-[240px] sm:max-w-none">
                {currentPathSegment || 'Dashboard'}
              </h1>
              <p className="text-[10.5px] font-semibold text-[var(--text-muted)] hidden sm:block">
                KBN University Smart ERP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-muted)] font-semibold shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-2"></span>
              <span>{currentDateString}</span>
            </div>

            {/* Dark/Light mode toggle */}
            <ThemeToggle />

            {/* Notifications panel button */}
            <div className="relative">
              <button className="p-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] transition-all shadow-sm">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full pulse-glow"></span>
              </button>
            </div>

            <div className="h-6 w-[1px] bg-[var(--border)] hidden sm:block"></div>

            {/* Quick Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-[var(--surface-elevated)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] p-1.5 pr-3 rounded-xl transition-all shadow-sm"
              >
                {user.profilePhotoUrl ? (
                  <img src={user.profilePhotoUrl} alt="User Avatar" className="w-8 h-8 rounded-lg object-cover border border-blue-500/40" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {userInitials}
                  </div>
                )}
                <div className="text-left hidden md:block select-none">
                  <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{firstName}</p>
                  <p className="text-[9.5px] font-semibold text-[var(--accent)] uppercase">{user.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-highlight)] shadow-2xl z-50 p-2 animate-fade-in text-xs font-semibold">
                    <div className="px-3.5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
                      {user.profilePhotoUrl ? (
                        <img src={user.profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {userInitials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[var(--text-primary)] truncate">{userName}</p>
                        <p className="text-[10px] text-[var(--accent)] font-bold uppercase truncate">{user.role === 'hod' ? `HOD • ${user.department || 'CSE'}` : user.role}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1.5 border-b border-[var(--border-subtle)] space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowPhotoModal(true);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--accent)] hover:bg-[var(--accent-subtle)] rounded-xl transition-colors font-bold"
                      >
                        <Upload size={14} />
                        <span>Change Profile Photo</span>
                      </button>

                      {user.role === 'hod' && (
                        <>
                          <Link
                            to="/hod/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors font-bold"
                          >
                            <UserCheck size={14} />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/hod/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors font-bold"
                          >
                            <Building2 size={14} />
                            <span>Department Settings</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="p-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[var(--bg-primary)] min-w-0 w-full">
          <div className="max-w-7xl mx-auto animate-fade-in min-w-0 w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Change Profile Photo 3D Modal */}
      {showPhotoModal && (
        <div className="modal-3d-backdrop">
          <div className="modal-3d-content max-w-sm p-6 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-black text-[var(--text-primary)]">Change Profile Photo</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo Preview */}
            <div className="relative w-28 h-28 mx-auto">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-28 h-28 rounded-3xl object-cover border-4 border-blue-500 shadow-xl" />
              ) : user.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="Current Profile" className="w-28 h-28 rounded-3xl object-cover border-4 border-blue-500 shadow-xl" />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-blue-400 shadow-xl">
                  {userInitials}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Supported formats: JPG, PNG, WEBP (Max 5 MB)
            </p>

            <div className="space-y-2.5 pt-1">
              <label className="btn-3d btn-3d-primary w-full py-2.5 text-xs cursor-pointer">
                <Upload size={14} />
                <span>Select New Photo</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
              </label>

              {photoPreview && (
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="btn-3d btn-3d-success w-full py-2.5 text-xs"
                >
                  {isUploading ? 'Saving Photo...' : 'Confirm & Save Photo'}
                </button>
              )}

              {user.profilePhotoUrl && (
                <button
                  onClick={handleRestoreDefaultAvatar}
                  disabled={isUploading}
                  className="btn-3d btn-3d-secondary w-full py-2 text-xs"
                >
                  Restore Default Avatar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
