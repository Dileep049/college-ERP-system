import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockDB, isFirebaseConfigured, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || localStorage.getItem('acad_theme');
    if (savedTheme) return savedTheme;
    return 'dark';
  });

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    localStorage.setItem('acad_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast Notifications Helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Loads user profile given a Firebase UID or cached user state
   */
  const loadUserProfile = async (uid, fallbackEmail = null) => {
    console.log('[AUTH] Loading profile for UID:', uid);
    setProfileLoading(true);
    setProfileError(null);

    try {
      let profile = await mockDB.getUserProfileByUid(uid);
      
      if (!profile && fallbackEmail) {
        profile = await mockDB.getUserProfileByUid(fallbackEmail);
      }

      if (profile) {
        setUser(profile);
        localStorage.setItem('acad_user', JSON.stringify(profile));
        localStorage.setItem('acad_current_user', JSON.stringify(profile));
        console.log('[AUTH] Profile loaded successfully:', profile.fullName || profile.email, `(Role: ${profile.role})`);
      } else {
        console.warn('[AUTH] Profile loading failed: Profile record not found for UID:', uid);
        setProfileError('Unable to load your profile. Please try again.');
        setUser(null);
      }
    } catch (err) {
      console.error('[AUTH] Profile loading failed:', err);
      setProfileError(err.message || 'Unable to load your profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * AUTH INITIALIZATION EFFECT
   */
  useEffect(() => {
    console.log('[AUTH] Initialization started');
    setLoading(true);
    setAuthError(null);
    let unsub = null;

    // Safety fallback timer to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.warn('[AUTH] Initialization safety timeout reached (7s). Forcing loading = false.');
      setLoading(false);
    }, 7000);

    const initAuth = async () => {
      try {
        if (isFirebaseConfigured && auth) {
          unsub = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              console.log('[AUTH] Firebase user detected:', fbUser.uid, fbUser.email);
              await loadUserProfile(fbUser.uid, fbUser.email);
            } else {
              console.log('[AUTH] Firebase user not detected');
              // Clear stale session
              localStorage.removeItem('acad_user');
              localStorage.removeItem('acad_current_user');
              setUser(null);
            }
            setLoading(false);
            console.log('[AUTH] Initialization completed');
            clearTimeout(safetyTimeout);
          }, (error) => {
            console.error('[AUTH] Firebase onAuthStateChanged error:', error);
            setAuthError(error.message);
            setLoading(false);
            clearTimeout(safetyTimeout);
          });
        } else {
          console.log('[AUTH] Firebase Auth not configured, checking stored session...');
          const storedStr = localStorage.getItem('acad_user') || localStorage.getItem('acad_current_user');
          if (storedStr) {
            try {
              const parsed = JSON.parse(storedStr);
              setUser(parsed);
              console.log('[AUTH] Restored session from local storage:', parsed.email);
            } catch (_) {
              localStorage.removeItem('acad_user');
            }
          }
          setLoading(false);
          console.log('[AUTH] Initialization completed');
          clearTimeout(safetyTimeout);
        }
      } catch (err) {
        console.error('[AUTH] Initialization failed:', err);
        setAuthError(err.message);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    initAuth();

    return () => {
      if (unsub) unsub();
      clearTimeout(safetyTimeout);
    };
  }, []);

  /**
   * Flexible Login Function
   */
  const login = async (userDataOrEmail, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      setProfileError(null);
      let loggedUser = null;

      if (typeof userDataOrEmail === 'object' && userDataOrEmail !== null) {
        loggedUser = userDataOrEmail;
      } else if (typeof userDataOrEmail === 'string') {
        loggedUser = await mockDB.login(userDataOrEmail, password);
      }

      if (loggedUser) {
        setUser(loggedUser);
        localStorage.setItem('acad_user', JSON.stringify(loggedUser));
        localStorage.setItem('acad_current_user', JSON.stringify(loggedUser));
        showToast(`Welcome back, ${loggedUser.fullName || loggedUser.full_name || 'User'}!`, 'success');
        return loggedUser;
      } else {
        throw new Error("Invalid user credentials or profile not found.");
      }
    } catch (error) {
      console.error("[AUTH] Login error:", error);
      setAuthError(error.message || 'Login failed');
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout Function
   */
  const logout = async () => {
    try {
      await mockDB.logout();
    } catch (_) {}
    localStorage.removeItem('acad_user');
    localStorage.removeItem('acad_current_user');
    localStorage.removeItem('acad_token');
    sessionStorage.clear();
    setUser(null);
    setAuthError(null);
    setProfileError(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateProfilePhoto = async (photoUrlOrFile) => {
    if (!user) return;
    try {
      let finalPhotoUrl = photoUrlOrFile;
      if (photoUrlOrFile && typeof photoUrlOrFile !== 'string' && (photoUrlOrFile instanceof Blob || photoUrlOrFile instanceof File)) {
        console.log(`[Cloudinary] Uploading profile photo for user ${user.uid || user.id}`);
        const uploadRes = await mockDB.uploadProfilePhoto(user.uid || user.id, photoUrlOrFile);
        finalPhotoUrl = uploadRes.url;
      } else if (typeof photoUrlOrFile === 'string') {
        await mockDB.updateUserProfilePhoto(user.uid || user.id, photoUrlOrFile);
      }

      const updated = { ...user, profilePhotoUrl: finalPhotoUrl || null, photo: finalPhotoUrl || null };
      setUser(updated);
      localStorage.setItem('acad_user', JSON.stringify(updated));
      localStorage.setItem('acad_current_user', JSON.stringify(updated));
      showToast(finalPhotoUrl ? 'Profile photo updated successfully!' : 'Profile photo removed.', 'success');
    } catch (err) {
      console.error("Profile photo update error:", err);
      showToast('Could not update profile photo.', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      profileLoading,
      profileError,
      loadUserProfile,
      login,
      logout,
      updateProfilePhoto,
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
    console.warn("useAuth called outside AuthProvider or during HMR reload. Returning safe fallback.");
    return {
      user: null,
      loading: false,
      authError: null,
      profileLoading: false,
      profileError: null,
      loadUserProfile: async () => {},
      login: async () => {},
      logout: async () => {},
      updateProfilePhoto: async () => {},
      theme: 'light',
      toggleTheme: () => {},
      toasts: [],
      showToast: (msg) => console.log("[Toast Fallback]:", msg),
      removeToast: () => {}
    };
  }
  return context;
};
