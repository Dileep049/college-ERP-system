import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDB, auth, db, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
    let unsubscribe = null;
    
    if (isFirebaseConfigured && auth && db) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const docRef = doc(db, 'profiles', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const profile = docSnap.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...profile
              });
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'student',
                fullName: firebaseUser.displayName || 'Firebase User',
                department: 'CSE'
              });
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Auth state observer error:", err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
    } else {
      const currentUser = mockDB.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
    setTheme(prev => prev === 'light' ? 'dark' : 'dark');
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
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
      if (isFirebaseConfigured && auth && db) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          const docRef = doc(db, 'profiles', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data();
            const loggedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...profile
            };
            setUser(loggedUser);
            showToast(`Welcome back, ${loggedUser.fullName || loggedUser.full_name}!`, 'success');
            return loggedUser;
          }
        } catch (fbError) {
          // Fallback to local profile database if Firebase Auth account is not yet created online
          console.warn("Firebase Auth sign-in failed, attempting ERP profile fallback:", fbError.code || fbError.message);
          const loggedUser = await mockDB.login(email, password);
          setUser(loggedUser);
          showToast(`Welcome back, ${loggedUser.fullName || loggedUser.full_name}!`, 'success');
          return loggedUser;
        }
      }
      
      const loggedUser = await mockDB.login(email, password);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.fullName || loggedUser.full_name}!`, 'success');
      return loggedUser;
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        try {
          await signOut(auth);
        } catch (_) {}
      }
      await mockDB.logout();
      localStorage.removeItem('acad_user');
      localStorage.removeItem('acad_token');
      sessionStorage.clear();
      setUser(null);
      showToast('Logged out successfully.', 'info');
    } catch (error) {
      setUser(null);
      showToast('Logged out successfully.', 'info');
    }
  };

  const updateProfilePhoto = async (photoUrl) => {
    if (!user) return;
    try {
      await mockDB.updateUserProfilePhoto(user.uid, photoUrl);
      setUser(prev => prev ? { ...prev, profilePhotoUrl: photoUrl || null } : null);
      showToast(photoUrl ? 'Profile photo updated successfully!' : 'Profile photo removed.', 'success');
    } catch (err) {
      showToast('Could not update profile photo.', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
