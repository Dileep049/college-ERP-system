import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Lock, 
  User, 
  Mail, 
  Shield, 
  Phone, 
  PhoneCall, 
  FileText, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  BookOpen, 
  Layers, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const WardCounsellorProfile = () => {
  const { user, showToast, updateProfilePhoto } = useAuth();

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Editable Form States
  const [phone, setPhone] = useState('');
  const [alternateContact, setAlternateContact] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');

  // UI States
  const [photoInputMode, setPhotoInputMode] = useState('file'); // 'file' | 'url'
  const [fileError, setFileError] = useState('');

  // Fetch Ward Counsellor Profile from Firestore 'users' collection
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const uid = user?.uid || user?.id;
      if (!uid) {
        setIsLoading(false);
        return;
      }

      let fetched = null;

      if (isFirebaseConfigured && db) {
        try {
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            fetched = userDocSnap.data();
          } else {
            // Try fallback to 'profiles' collection
            const profileDocRef = doc(db, 'profiles', uid);
            const profileSnap = await getDoc(profileDocRef);
            if (profileSnap.exists()) {
              fetched = profileSnap.data();
            }
          }
        } catch (err) {
          console.warn('[Firestore] Profile fetch error, falling back to auth context/mockDB:', err);
        }
      }

      // Merge with auth context user if fallback needed
      const current = fetched ? { ...user, ...fetched } : user;
      setProfileData(current);

      // Populate Editable Fields
      setPhone(current?.phoneNumber || current?.phone || '');
      setAlternateContact(current?.alternateContact || current?.altPhone || current?.emergencyContact || '');
      setPhotoUrl(current?.profilePhotoUrl || current?.photo || current?.photoURL || '');
      setBio(current?.bio || current?.about || '');

    } catch (error) {
      console.error('[WardCounsellorProfile] Error loading profile:', error);
      showToast?.('Failed to load profile details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Handle Photo File Selection & Conversion to Data URL
  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please upload a valid JPG, PNG, or WEBP image.');
      showToast?.('Invalid file type. Select JPG, PNG, or WEBP.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds maximum limit of 5 MB.');
      showToast?.('File size exceeds 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
      showToast?.('Profile picture preview updated. Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Profile Changes to Firestore
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const uid = user?.uid || user?.id;

    if (!uid) {
      showToast?.('User session not found. Please log in again.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const updatePayload = {
        phoneNumber: phone.trim(),
        phone: phone.trim(),
        alternateContact: alternateContact.trim(),
        altPhone: alternateContact.trim(),
        profilePhotoUrl: photoUrl,
        photo: photoUrl,
        photoURL: photoUrl,
        bio: bio.trim(),
        about: bio.trim(),
        updatedAt: new Date().toISOString()
      };

      let firestoreUpdated = false;

      // 1. Update Firestore 'users' collection
      if (isFirebaseConfigured && db) {
        try {
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, updatePayload);
          firestoreUpdated = true;
        } catch (err) {
          console.warn('[Firestore] updateDoc failed on users collection, merging with setDoc:', err);
          try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, updatePayload, { merge: true });
            firestoreUpdated = true;
          } catch (setErr) {
            console.error('[Firestore] setDoc failed on users:', setErr);
          }
        }

        // 2. Also update 'profiles' collection for backwards compatibility
        try {
          const profileRef = doc(db, 'profiles', uid);
          await setDoc(profileRef, updatePayload, { merge: true });
        } catch (_) {}
      }

      // 3. Fallback / Sync to mockDB local storage
      try {
        await mockDB.updateUserProfile?.(uid, updatePayload);
      } catch (_) {}

      // 4. Sync profile photo with AuthContext state so header/sidebar updates
      if (updateProfilePhoto && photoUrl !== user?.profilePhotoUrl) {
        await updateProfilePhoto(photoUrl);
      }

      // 5. Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('acad_user') || '{}');
      const updatedUserObj = {
        ...storedUser,
        ...user,
        ...updatePayload
      };
      localStorage.setItem('acad_user', JSON.stringify(updatedUserObj));
      localStorage.setItem('acad_current_user', JSON.stringify(updatedUserObj));
      setProfileData(updatedUserObj);

      showToast?.('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('[WardCounsellorProfile] Save error:', error);
      showToast?.(error.message || 'Failed to update profile changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Locked Fields Data Extraction
  const email = profileData?.email || user?.email || 'N/A';
  const role = 'Ward Counsellor';
  const department = profileData?.assignedDepartment || profileData?.wardCounsellorDepartment || profileData?.department || user?.wardCounsellorDepartment || user?.assignedBranch || user?.department || 'B.Sc. Computer Science (CS)';
  const semester = profileData?.assignedSemester || profileData?.semester || user?.assignedSemester || user?.semester || 'Semester V';
  const section = profileData?.assignedSection || profileData?.section || user?.assignedSection || user?.section || 'Section A';
  const displayName = profileData?.fullName || profileData?.name || user?.fullName || user?.name || 'Ward Counsellor';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Fetching Ward Counsellor profile data from Firestore...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border border-white/10 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Display */}
          <div className="relative group">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/10 backdrop-blur-md border-4 border-white/20 text-white flex items-center justify-center font-black text-3xl shadow-2xl">
                {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'WC'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-xl border-2 border-white/40 shadow-md">
              <User size={16} />
            </div>
          </div>

          {/* User Details Header */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
              <Sparkles size={14} className="text-amber-300" />
              <span>Institutional Faculty Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{displayName}</h1>
            <p className="text-xs sm:text-sm font-medium text-purple-200/90">{email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-black uppercase">
                {role}
              </span>
              <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-semibold">
                {department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveChanges} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Strict Field Permissions (LOCKED / READ-ONLY) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-6 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <span>Academic Scope</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Locked system attributes managed by HOD
                </p>
              </div>
              <span className="p-2 bg-amber-500/10 text-amber-300 rounded-xl border border-amber-500/20 font-bold text-xs flex items-center gap-1">
                🔒 Locked
              </span>
            </div>

            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle size={15} className="shrink-0" />
                <span>Strict Security Scope Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/80">
                Your assigned email, role, department, semester, and section are locked to ensure system integrity. Contact your Head of Department (HOD) for modifications.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Locked Email */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-400" /> Email Address
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">🔒 Read-Only</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 text-gray-200 rounded-xl border border-white/10 font-medium">
                  <span className="truncate">{email}</span>
                  <Lock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </div>

              {/* Locked Role */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" /> System Role
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">🔒 Read-Only</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 text-gray-200 rounded-xl border border-white/10 font-medium">
                  <span>{role}</span>
                  <Lock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </div>

              {/* Locked Department */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-gray-400" /> Assigned Department
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">🔒 Read-Only</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 text-gray-200 rounded-xl border border-white/10 font-medium">
                  <span className="truncate">{department}</span>
                  <Lock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </div>

              {/* Locked Semester */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-gray-400" /> Assigned Semester
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">🔒 Read-Only</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 text-gray-200 rounded-xl border border-white/10 font-medium">
                  <span>{semester}</span>
                  <Lock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </div>

              {/* Locked Section */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-gray-400" /> Assigned Section
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">🔒 Read-Only</span>
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 text-gray-200 rounded-xl border border-white/10 font-medium">
                  <span>{section}</span>
                  <Lock size={14} className="text-gray-400 shrink-0 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Editable Fields (Phone, Alternate Contact, Photo, Bio) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg space-y-6 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <User size={18} className="text-purple-400" />
                  <span>Personal Details & Contact Settings</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your contact details, bio, and profile picture
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20 font-bold text-xs">
                Editable
              </span>
            </div>

            <div className="space-y-5 text-xs">
              
              {/* Profile Picture Upload / URL */}
              <div className="space-y-3">
                <label className="block text-gray-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera size={15} className="text-purple-400" /> Profile Picture
                  </span>
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('file')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        photoInputMode === 'file'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Upload size={12} className="inline mr-1" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('url')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        photoInputMode === 'url'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon size={12} className="inline mr-1" /> Image URL
                    </button>
                  </div>
                </label>

                {photoInputMode === 'file' ? (
                  <div className="border-2 border-dashed border-white/15 bg-white/5 rounded-2xl p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="profile-photo-file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-photo-file"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 text-purple-300 flex items-center justify-center">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-white">
                        Click to select profile picture
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Supports PNG, JPG, WEBP (Max 5 MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/profile-avatar.jpg"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                    />
                  </div>
                )}

                {fileError && (
                  <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle size={13} /> {fileError}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-purple-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none font-medium transition-all"
                />
              </div>

              {/* Alternate Contact */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <PhoneCall size={14} className="text-purple-400" /> Alternate Contact / Emergency Number
                </label>
                <input
                  type="tel"
                  value={alternateContact}
                  onChange={(e) => setAlternateContact(e.target.value)}
                  placeholder="+91 91234 56789"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none font-medium transition-all"
                />
              </div>

              {/* Bio / About Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-gray-300 font-bold flex items-center gap-1.5">
                    <FileText size={14} className="text-purple-400" /> Bio / About Ward Counsellor
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {bio.length} / 300 characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio, counselling hours, or advisory notes for students and parents..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:ring-1 focus:ring-blue-400 outline-none font-medium transition-all resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all disabled:opacity-50"
              >
                Reset Changes
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 border border-purple-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Updating Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
