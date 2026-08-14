import React, { useState, useEffect } from 'react';
import { auth, db, isFirebaseConfigured, mockDB } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { X, UserCheck, Mail, Lock } from 'lucide-react';

export const AssignWardCounsellorModal = ({
  isOpen,
  onClose,
  onAssignSubmit,
  hod,
  deptList = [],
  initialFormData = {}
}) => {
  const [formData, setFormData] = useState({
    department: initialFormData.department || hod?.department || 'B.Sc. Computer Science (CS)',
    wardCounsellorId: initialFormData.wardCounsellorId || '',
    wardCounsellorName: initialFormData.wardCounsellorName || '',
    email: initialFormData.email || '',
    password: initialFormData.password || '',
    semester: initialFormData.semester || 'Semester 6',
    section: initialFormData.section || 'Section A',
    academicYear: initialFormData.academicYear || '2026-2027'
  });

  const [facultyUsers, setFacultyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hod?.department && !formData.department) {
      setFormData(prev => ({
        ...prev,
        department: hod.department
      }));
    }
  }, [hod]);

  // 1. Dynamic Fetching: Triggered whenever formData.department (selected branch) changes
  useEffect(() => {
    const fetchDepartmentFaculty = async () => {
      if (!isOpen) return;
      if (!formData.department) {
        setFacultyUsers([]);
        return;
      }

      setLoading(true);
      const facultyList = [];
      const seenUids = new Set();
      const targetDept = formData.department;

      try {
        // Query Firestore 'users' collection where role === 'faculty' AND department === targetDept
        if (isFirebaseConfigured && db) {
          try {
            const usersRef = collection(db, 'users');
            const qUsers = query(
              usersRef,
              where('role', '==', 'faculty'),
              where('department', '==', targetDept)
            );
            const usersSnapshot = await getDocs(qUsers);
            usersSnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const uid = docSnap.id || data.uid;
              if (uid && !seenUids.has(uid)) {
                seenUids.add(uid);
                const rawName = data.name || data.fullName || data.displayName || 'Faculty Member';
                facultyList.push({
                  uid,
                  name: rawName,
                  fullName: rawName,
                  email: data.email || '',
                  department: data.department,
                  role: data.role
                });
              }
            });

            // Query Firestore 'profiles' collection fallback
            const profilesRef = collection(db, 'profiles');
            const qProfiles = query(
              profilesRef,
              where('role', '==', 'faculty'),
              where('department', '==', targetDept)
            );
            const profilesSnapshot = await getDocs(qProfiles);
            profilesSnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const uid = docSnap.id || data.uid;
              if (uid && !seenUids.has(uid)) {
                seenUids.add(uid);
                const rawName = data.name || data.fullName || data.displayName || 'Faculty Member';
                facultyList.push({
                  uid,
                  name: rawName,
                  fullName: rawName,
                  email: data.email || '',
                  department: data.department,
                  role: data.role
                });
              }
            });
          } catch (firestoreErr) {
            console.warn("[Firestore] Error fetching faculty for branch:", firestoreErr);
          }
        }

        // Fetch from Local Database / mockDB with department filter fallback
        const localUsers = JSON.parse(localStorage.getItem('acad_users') || '[]');
        const mockFaculty = await mockDB.getFacultyByDepartment(targetDept);

        mockFaculty.forEach(f => {
          const uid = f.uid || f.id;
          const fDept = f.department || '';
          if (uid && !seenUids.has(uid) && (fDept === targetDept || fDept === 'All')) {
            seenUids.add(uid);
            const rawName = f.name || f.fullName || 'Faculty Member';
            facultyList.push({
              uid,
              name: rawName,
              fullName: rawName,
              email: f.email || `${rawName.toLowerCase().replace(/\s+/g, '.')}@kbn.edu`,
              department: fDept,
              role: f.role || 'faculty'
            });
          }
        });

        localUsers.forEach(u => {
          const uid = u.uid || u.id;
          const role = (u.role || '').toLowerCase();
          const uDept = u.department || '';
          if (uid && !seenUids.has(uid) && (role === 'faculty' || role === 'counsellor') && uDept === targetDept) {
            seenUids.add(uid);
            const rawName = u.name || u.fullName || 'Faculty Member';
            facultyList.push({
              uid,
              name: rawName,
              fullName: rawName,
              email: u.email || `${rawName.toLowerCase().replace(/\s+/g, '.')}@kbn.edu`,
              department: uDept,
              role: u.role
            });
          }
        });

      } catch (err) {
        console.error("Error fetching department faculty users:", err);
      } finally {
        setFacultyUsers(facultyList);
        setLoading(false);
      }
    };

    fetchDepartmentFaculty();
  }, [isOpen, formData.department]);

  // Synchronize default selected faculty and auto-fill email when facultyList updates
  useEffect(() => {
    if (facultyUsers.length > 0) {
      const exists = facultyUsers.find(f => f.uid === formData.wardCounsellorId);
      if (!exists) {
        const first = facultyUsers[0];
        setFormData(prev => ({
          ...prev,
          wardCounsellorId: first.uid,
          wardCounsellorName: first.name || first.fullName,
          email: prev.email || first.email || `${(first.name || first.fullName || 'counsellor').toLowerCase().replace(/\s+/g, '.')}@kbn.edu`
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        wardCounsellorId: '',
        wardCounsellorName: ''
      }));
    }
  }, [facultyUsers]);

  // Auto-fill Email field when a Faculty member is selected from the dropdown
  const handleUserSelect = (e) => {
    const selectedUid = e.target.value;
    const found = facultyUsers.find(u => u.uid === selectedUid);
    if (found) {
      const defaultEmail = found.email || `${(found.name || found.fullName || 'counsellor').toLowerCase().replace(/\s+/g, '.')}@kbn.edu`;
      setFormData(prev => ({
        ...prev,
        wardCounsellorId: found.uid,
        wardCounsellorName: found.name || found.fullName,
        email: defaultEmail
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        wardCounsellorId: selectedUid,
        wardCounsellorName: ''
      }));
    }
  };

  // 2. FIREBASE AUTH & FIRESTORE LOGIC: Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wardCounsellorId || !formData.department || !formData.email || !formData.password) return;

    setSubmitting(true);
    let finalUid = formData.wardCounsellorId;

    try {
      if (isFirebaseConfigured && auth && db) {
        // Step A: Attempt createUserWithEmailAndPassword
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          if (userCredential?.user) {
            finalUid = userCredential.user.uid;
          }
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            console.log("[Auth] Email already registered. Updating Firestore user document for ward_counsellor role.");
          } else {
            console.warn("[Auth] Create user warning:", authError);
          }
        }

        // Step B: Save user details in Firestore 'users' collection with role: "ward_counsellor" and assigned scope
        try {
          const userDocRef = doc(db, 'users', finalUid);
          await setDoc(userDocRef, {
            uid: finalUid,
            name: formData.wardCounsellorName,
            fullName: formData.wardCounsellorName,
            email: formData.email,
            role: 'ward_counsellor',
            department: formData.department,
            assignedBranch: formData.department,
            assignedSemester: formData.semester,
            assignedSection: formData.section,
            assignedAcademicYear: formData.academicYear,
            updatedAt: serverTimestamp()
          }, { merge: true });

          // Step C: Save to 'wardCounsellorAssignments' collection
          await addDoc(collection(db, 'wardCounsellorAssignments'), {
            wardCounsellorId: finalUid,
            facultyId: finalUid,
            wardCounsellorName: formData.wardCounsellorName,
            facultyName: formData.wardCounsellorName,
            email: formData.email,
            department: formData.department,
            assignedBranch: formData.department,
            assignedSemester: formData.semester,
            assignedSection: formData.section,
            academicYear: formData.academicYear,
            status: 'active',
            assignedBy: hod?.uid || 'hod-1',
            assignedByName: hod?.fullName || 'HOD',
            assignedAt: new Date().toISOString(),
            createdAt: serverTimestamp()
          });
        } catch (fsErr) {
          console.warn("[Firestore] User or Assignment document save warning:", fsErr);
        }
      }

      // Step D: Update local storage / mockDB fallback store
      const localUsers = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const userIdx = localUsers.findIndex(u => (u.uid || u.id) === finalUid || u.email === formData.email);
      if (userIdx !== -1) {
        localUsers[userIdx].role = 'ward_counsellor';
        localUsers[userIdx].assignedBranch = formData.department;
        localUsers[userIdx].assignedSemester = formData.semester;
        localUsers[userIdx].assignedSection = formData.section;
      } else {
        localUsers.push({
          uid: finalUid,
          id: finalUid,
          name: formData.wardCounsellorName,
          email: formData.email,
          role: 'ward_counsellor',
          assignedBranch: formData.department,
          assignedSemester: formData.semester,
          assignedSection: formData.section
        });
      }
      localStorage.setItem('acad_users', JSON.stringify(localUsers));

      const payload = {
        wardCounsellorId: finalUid,
        wardCounsellorName: formData.wardCounsellorName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        branch: formData.department,
        semester: formData.semester,
        section: formData.section,
        academicYear: formData.academicYear,
        status: 'active'
      };

      if (onAssignSubmit) {
        await onAssignSubmit(payload);
      }
    } catch (err) {
      console.error("[Assign Ward Counsellor Submit Error]:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Assign Ward Counsellor
            </h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              Set Department, Counsellor & Login Credentials
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Field 1: Primary Trigger — Select Branch / Department */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              1. Select Branch / Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            >
              <option value="">[ Select Department First ]</option>
              {deptList && deptList.length > 0 ? (
                deptList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))
              ) : (
                <>
                  <option value="B.Sc. Computer Science (CS)">B.Sc. Computer Science (CS)</option>
                  <option value="B.Sc. Artificial Intelligence & Machine Learning (AI & ML)">B.Sc. Artificial Intelligence & Machine Learning (AI & ML)</option>
                  <option value="B.Sc. Electronics & Communication (ECE)">B.Sc. Electronics & Communication (ECE)</option>
                </>
              )}
            </select>
          </div>

          {/* Field 2: Dynamically Filtered — Select Ward Counsellor */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              2. Select Ward Counsellor ({formData.department ? formData.department : 'Select Branch First'}) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.wardCounsellorId}
              onChange={handleUserSelect}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
              disabled={!formData.department || loading || facultyUsers.length === 0}
            >
              {!formData.department ? (
                <option value="" disabled>Select branch first</option>
              ) : loading ? (
                <option value="" disabled>Loading faculty for {formData.department}...</option>
              ) : facultyUsers.length === 0 ? (
                <option value="" disabled>No faculty found for {formData.department}</option>
              ) : (
                <>
                  <option value="">[ Select Faculty Member ]</option>
                  {facultyUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name || u.fullName}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* 3. STYLING & UI FIELDS: Email Address & Password Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail size={13} className="text-purple-500" />
                3. Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="counsellor@kbn.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Lock size={13} className="text-purple-500" />
                4. Login Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="•••••••• (Min 6 chars)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-gray-400 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Field 5 & 6: Select Semester & Select Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                5. Select Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                6. Select Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
                <option value="Section D">Section D</option>
              </select>
            </div>
          </div>

          {/* Field 7: Select Academic Year */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              7. Select Academic Year <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.department || facultyUsers.length === 0}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20"
          >
            {submitting ? 'Creating Credential...' : 'Save Assignment & Credentials'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignWardCounsellorModal;
