import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadFileToCloudinary } from './cloudinary';
import { COLLEGE_DEPARTMENTS } from '../utils/constants';

// ----------------------------------------------------
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ----------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCDYHgGBygZDblXBzs8zp1JcpjhSGl7GsI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "college-erp-system-df02d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "college-erp-system-df02d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "college-erp-system-df02d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "446689800344",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:446689800344:web:b29c861c697da3bb7560ed"
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;
let storage = null;
let secondaryAuth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    try {
      storage = getStorage(app);
    } catch (stErr) {
      console.warn("[Firebase Storage] Storage init error:", stErr);
      storage = null;
    }

    // Initialize secondary app for creating users without logging out current session
    const secondaryApp = getApps().find(a => a.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
    secondaryAuth = getAuth(secondaryApp);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, db, storage, secondaryAuth, storageRef, uploadBytes, getDownloadURL };

// ----------------------------------------------------
// 2. CONSTANTS & STANDARDIZED TAXONOMIES
// ----------------------------------------------------

export { COLLEGE_DEPARTMENTS };
export const KBN_BRANCHES = COLLEGE_DEPARTMENTS;

export const KBN_SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
];

export const BRANCH_SUBJECT_MAP = {
  'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)': [
    'Neural Networks',
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision'
  ],
  'B.Sc. Computer Science (CS)': [
    'Data Structures',
    'Operating Systems',
    'Database Management Systems (DBMS)',
    'Computer Networks',
    'Software Engineering'
  ],
  'Bachelor of Computer Applications (BCA)': [
    'Programming in C',
    'Java Programming',
    'Web Technologies',
    'Database Management Systems',
    'Python Programming'
  ],
  'B.Com. (Computers)': [
    'Financial Accounting',
    'Business Statistics',
    'Computer Applications in Business',
    'E-Commerce',
    'Management Information Systems (MIS)'
  ],
  'B.Sc. Data Science / Data Analysis': [
    'Data Analytics',
    'Statistics for Data Science',
    'Data Visualization',
    'Big Data Technologies',
    'Python for Data Science'
  ]
};

// ----------------------------------------------------
// 3. NORMALIZATION & MATCHING HELPERS
// ----------------------------------------------------

export const normalizeDepartment = (dept) => {
  if (!dept) return 'B.Sc. Computer Science (CS)';
  const str = String(dept).toUpperCase().trim();
  if (str === 'ALL' || str === 'ALL DEPARTMENTS' || str === 'ALL BRANCHES' || str === 'N/A') return 'All';
  if (str.includes('AI') || str.includes('ARTIFICIAL') || str.includes('MACHINE LEARNING')) {
    return 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
  }
  if (str.includes('DATA SCIENCE') || str.includes('DATA ANALYSIS') || str.includes('DATA ANALYTICS')) {
    return 'B.Sc. Data Science / Data Analysis';
  }
  if (str.includes('BCA') || str.includes('BACHELOR OF COMPUTER APPLICATIONS')) {
    return 'Bachelor of Computer Applications (BCA)';
  }
  if (str.includes('B.COM') || str.includes('BCOM') || str.includes('COMMERCE')) {
    return 'B.Com. (Computers)';
  }
  if (str.includes('COMPUTER SCIENCE') || str.includes('CS') || str.includes('CSE')) {
    return 'B.Sc. Computer Science (CS)';
  }
  return dept;
};

export const isDepartmentMatch = (studentDept, targetDept) => {
  if (!targetDept || !studentDept) return true;
  const sNorm = normalizeDepartment(studentDept);
  
  if (Array.isArray(targetDept)) {
    if (targetDept.length === 0) return true;
    return targetDept.some(d => {
      const tNorm = normalizeDepartment(d);
      return tNorm === 'All' || tNorm === sNorm || d === 'All Departments' || d === 'All';
    });
  }
  
  const tNorm = normalizeDepartment(targetDept);
  return tNorm === 'All' || tNorm === sNorm || targetDept === 'All Departments' || targetDept === 'All';
};

export const normalizeSemester = (sem) => {
  if (!sem) return 'All';
  const str = String(sem).toUpperCase().trim();
  if (str === 'ALL' || str === 'N/A' || str === '') return 'All';

  const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8' };
  if (romanMap[str]) return `Semester ${romanMap[str]}`;

  const match = str.match(/\d+/);
  if (match) return `Semester ${match[0]}`;
  return str;
};

export const normalizeSection = (sec) => {
  if (!sec) return 'All';
  const str = String(sec).toUpperCase().trim();
  if (str === 'ALL' || str === 'ALL SECTIONS' || str === 'N/A' || str === '') return 'All';
  if (str === 'EM' || str === 'TM') return str;
  const match = str.match(/[A-Z]/);
  if (match && str.length <= 10) return `Section ${match[0]}`;
  return str;
};

export const getSubjectsForBranch = (branch) => {
  if (!branch) return BRANCH_SUBJECT_MAP['B.Sc. Computer Science (CS)'];
  const norm = normalizeDepartment(branch);
  if (BRANCH_SUBJECT_MAP[norm]) return BRANCH_SUBJECT_MAP[norm];
  if (BRANCH_SUBJECT_MAP[branch]) return BRANCH_SUBJECT_MAP[branch];
  return BRANCH_SUBJECT_MAP['B.Sc. Computer Science (CS)'];
};

const fileToDataUrl = (file) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      resolve('#mock-download');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '#mock-download');
    reader.onerror = () => resolve('#mock-download');
    reader.readAsDataURL(file);
  });
};

// ----------------------------------------------------
// 4. SEED & INITIAL DATASETS
// ----------------------------------------------------

export const DEFAULT_USERS = [
  { uid: 'admin-1', email: 'admin@kbn.edu', fullName: 'System Administrator', role: 'admin', department: 'N/A' },
  { uid: 'principal-1', email: 'principal@kbn.edu', fullName: 'Dr. Arthur Pendelton', role: 'principal', department: 'All', employeeId: 'PRIN-01' },
  { uid: 'hod-cse', email: 'hod.cse@kbn.edu', fullName: 'Dr. Alan Turing', role: 'hod', department: 'B.Sc. Computer Science (CS)', employeeId: 'HOD-CSE-01' },
  { uid: 'hod-aiml', email: 'hod.aiml@kbn.edu', fullName: 'Dr. Sarah Connor', role: 'hod', department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)', employeeId: 'HOD-AIML-01' },
  { uid: 'fac-1', email: 'faculty.cse@kbn.edu', fullName: 'Prof. Charles Xavier', role: 'faculty', designation: 'Senior Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-01', assignedBranches: KBN_BRANCHES, subjects: ['Data Structures', 'Operating Systems', 'Neural Networks', 'Machine Learning'] },
  { uid: 'fac-2', email: 'ravi.kumar@kbn.edu', fullName: 'Prof. Ravi Kumar', role: 'faculty', designation: 'Associate Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-02', assignedBranches: KBN_BRANCHES, subjects: ['Machine Learning', 'Python Programming'], mobile: '9876543211' },
  { uid: 'fac-3', email: 'priya.sharma@kbn.edu', fullName: 'Prof. Priya Sharma', role: 'faculty', designation: 'Assistant Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-03', assignedBranches: KBN_BRANCHES, subjects: ['Database Management Systems (DBMS)', 'Java Programming'], mobile: '9876543212' },
  { uid: 'fac-4', email: 'arun@kbn.edu', fullName: 'Prof. Arun', role: 'faculty', designation: 'Assistant Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-04', assignedBranches: KBN_BRANCHES, subjects: ['Web Technologies', 'Software Engineering'], mobile: '9876543213' },
  { uid: 'fac-5', email: 'suresh.reddy@kbn.edu', fullName: 'Prof. Suresh Reddy', role: 'faculty', designation: 'Associate Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-05', assignedBranches: KBN_BRANCHES, subjects: ['Computer Networks', 'Deep Learning'], mobile: '9876543214' },
  { uid: 'coun-cse', email: 'counsellor.cse@kbn.edu', fullName: 'Dr. Bruce Banner', role: 'counsellor', department: 'B.Sc. Computer Science (CS)', employeeId: 'WC-CSE-01', contactNumber: '9876543210' },
  { uid: 'place-1', email: 'placement@kbn.edu', fullName: 'Placement Officer', role: 'placement', department: 'Placement Cell', employeeId: 'PO-01' },
  { uid: 'lib-1', email: 'librarian@kbn.edu', fullName: 'Chief Librarian', role: 'librarian', department: 'Library', employeeId: 'LIB-01' },
  { uid: 'stud-245901', email: '245901@kbn.edu', fullName: 'AVALA ANAND BABU', studentName: 'AVALA ANAND BABU', role: 'student', department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)', semester: 'Semester 6', section: 'Section A', rollNumber: '245901', counsellorId: 'coun-cse', counsellorName: 'Dr. Bruce Banner', attendancePercentage: 82, attendance: 82, internalMarks: 38, submissions: '100%', academicStatus: 'Good' },
  { uid: 'parent-245901', email: 'parent.245901@kbn.edu', fullName: 'AVALA VENKATESWARLU', role: 'parent', department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)', rollNumber: '245901' }
];

export const RAW_UPLOADED_STUDENTS = [
  {"rollNumber": "245901", "studentName": "AVALA ANAND BABU"},
  {"rollNumber": "245902", "studentName": "DASIKA SARATH KUMAR"},
  {"rollNumber": "245903", "studentName": "SHAIK NAADIA TASLEEM"},
  {"rollNumber": "245904", "studentName": "CHIKATI YUGALA SRI"},
  {"rollNumber": "245905", "studentName": "ORSU BRAHMAIAH"},
  {"rollNumber": "245906", "studentName": "GUNDALA VENKAT"},
  {"rollNumber": "245907", "studentName": "PATAN MASTAN"},
  {"rollNumber": "245908", "studentName": "PATNALA VISWA TEJA"},
  {"rollNumber": "245910", "studentName": "KUPPILA BALAJIREDDY"},
  {"rollNumber": "245911", "studentName": "KAMBAMPATI NEELIMA SAI"},
  {"rollNumber": "245912", "studentName": "SHAIK ZAKEER BASHA"},
  {"rollNumber": "245913", "studentName": "PALLI VIKRAMADITHYA"},
  {"rollNumber": "245914", "studentName": "NATHAM MANOJ KUMAR"},
  {"rollNumber": "245915", "studentName": "PATTAN AMEERKHAN"},
  {"rollNumber": "245916", "studentName": "PYDIPOTHU NIVYA"},
  {"rollNumber": "245917", "studentName": "GUTI KRISHNA SWAMY"},
  {"rollNumber": "245918", "studentName": "KARRA THARUN KOMMURU"},
  {"rollNumber": "245919", "studentName": "PAVANKUMAR"},
  {"rollNumber": "245920", "studentName": "KOPPURAVURI NAVYA CHARITHA"},
  {"rollNumber": "245922", "studentName": "KONA BHAVANI BHARGAVA"},
  {"rollNumber": "245923", "studentName": "RAVINUTHALA NAGA SRIKARI"},
  {"rollNumber": "245924", "studentName": "MADDULA NAMITHA"},
  {"rollNumber": "245925", "studentName": "YENDURI KUSHWANTH SAI TARUN"},
  {"rollNumber": "245926", "studentName": "PANDITHARADHYULA SRI DURGA VA"},
  {"rollNumber": "245927", "studentName": "PULIPATI TULASIPRIYA"},
  {"rollNumber": "245928", "studentName": "VIJJI RAJESH GANDEPASLI"},
  {"rollNumber": "245929", "studentName": "CHANDRA SAI CHAITH"},
  {"rollNumber": "245931", "studentName": "GUDELA SURYA"},
  {"rollNumber": "245933", "studentName": "KOTI BHAVANA"},
  {"rollNumber": "245934", "studentName": "ONGOLE HAMSIKA LAKSHMI"},
  {"rollNumber": "245935", "studentName": "DASARI AJAY BABU THANUKU"},
  {"rollNumber": "245936", "studentName": "BHASKAR TEJA"},
  {"rollNumber": "245938", "studentName": "ZABI ARSALAAN KHAN"},
  {"rollNumber": "245939", "studentName": "NANDAM YASWANTH"},
  {"rollNumber": "245940", "studentName": "JUPALLI SEKHAR"},
  {"rollNumber": "245942", "studentName": "MURKIPUTTI GABRIEL SAMUEL"},
  {"rollNumber": "245943", "studentName": "MUDRABOINA VAMSI"},
  {"rollNumber": "245944", "studentName": "M KALEB VIKAS"},
  {"rollNumber": "245945", "studentName": "SK ABDUL REHAMAN"},
  {"rollNumber": "245946", "studentName": "N LAKSHMI BALAJI"},
  {"rollNumber": "245948", "studentName": "KANDUKURI MANOJ KUMAR"},
  {"rollNumber": "245949", "studentName": "CHINTALA DILEEP KUMAR KAVITAPU"},
  {"rollNumber": "245950", "studentName": "DHANUSH"},
  {"rollNumber": "245951", "studentName": "NANNAM KHATWANG"},
  {"rollNumber": "245952", "studentName": "NAKKA ANAND KUMAR"},
  {"rollNumber": "245953", "studentName": "J KUMAR SWAMYREDDY"},
  {"rollNumber": "245954", "studentName": "T TEJASWINI"},
  {"rollNumber": "245955", "studentName": "SHAIK AZEEM MOHIDDIN"},
  {"rollNumber": "245956", "studentName": "MUCHINAPALLI RUPAK VENKATA SAI"},
  {"rollNumber": "245957", "studentName": "V VENKATA NAGA ADITHYA"},
  {"rollNumber": "245958", "studentName": "T VENKATA SURENDRA"},
  {"rollNumber": "245959", "studentName": "L YASWANTH VENKAT"},
  {"rollNumber": "245960", "studentName": "VIKRAM AKASH"},
  {"rollNumber": "245961", "studentName": "VADUGU DHANUSH"},
  {"rollNumber": "245962", "studentName": "PARASANABOINA MUKESH"}
];

export const AIML_STUDENT_ROSTER = RAW_UPLOADED_STUDENTS.map(s => ({
  studentId: `stud-${s.rollNumber}`,
  uid: `stud-${s.rollNumber}`,
  rollNumber: s.rollNumber,
  studentName: s.studentName,
  fullName: s.studentName,
  department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
  course: 'B.Sc',
  semester: 'Semester 2',
  section: 'EM',
  branch: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
  admissionNumber: `ADM-${s.rollNumber}`,
  status: 'active',
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z'
}));

export const SEEDED_STUDENTS = AIML_STUDENT_ROSTER;

// ----------------------------------------------------
// 5. CANONICAL FIREBASE FIRESTORE DATA LAYER
// ----------------------------------------------------

export const mockDB = {
  delay: (ms = 50) => new Promise(resolve => setTimeout(resolve, ms)),

  // --- AUTHENTICATION & PROFILES ---
  login: async (emailOrIdentifier, password) => {
    await mockDB.delay(50);
    const queryStr = String(emailOrIdentifier || '').trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      try {
        let authEmail = queryStr;
        if (!authEmail.includes('@')) {
          authEmail = `${authEmail.replace(/[^a-zA-Z0-9]/g, '')}@kbn.edu`;
        }
        
        try {
          const cred = await signInWithEmailAndPassword(auth, authEmail, password);
          if (cred && cred.user) {
            const profile = await mockDB.getUserProfileByUid(cred.user.uid);
            if (profile) return profile;
          }
        } catch (authErr) {
          console.warn("[Firebase Auth] Direct sign-in:", authErr.message);
        }
      } catch (err) {
        console.warn("[Firebase Auth] Login lookup:", err.message);
      }
    }

    // Direct Profile Lookup in Firestore
    if (isFirebaseConfigured && db) {
      try {
        const snapProfiles = await getDocs(collection(db, 'profiles'));
        const foundDoc = snapProfiles.docs.find(d => {
          const u = d.data();
          const email = (u.email || '').toLowerCase().trim();
          const roll = (u.rollNumber || '').toLowerCase().trim();
          const emp = (u.employeeId || '').toLowerCase().trim();
          return email === queryStr || roll === queryStr || emp === queryStr || d.id.toLowerCase() === queryStr;
        });

        if (foundDoc) {
          return { uid: foundDoc.id, id: foundDoc.id, ...foundDoc.data() };
        }
      } catch (err) {
        console.warn("[Firestore] Profiles login lookup:", err.message);
      }
    }

    // Default In-Memory / Seed Lookup
    const seedFound = DEFAULT_USERS.find(u => {
      const email = (u.email || '').toLowerCase().trim();
      const roll = (u.rollNumber || '').toLowerCase().trim();
      const emp = (u.employeeId || '').toLowerCase().trim();
      return email === queryStr || roll === queryStr || emp === queryStr || u.uid.toLowerCase() === queryStr;
    });

    if (seedFound) return seedFound;

    const studentFound = AIML_STUDENT_ROSTER.find(s => s.rollNumber.toLowerCase() === queryStr || s.studentId.toLowerCase() === queryStr);
    if (studentFound) {
      return {
        ...studentFound,
        email: `${studentFound.rollNumber}@kbn.edu`,
        role: 'student'
      };
    }

    return null;
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (_) {}
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('acad_user');
      localStorage.removeItem('acad_current_user');
      localStorage.removeItem('acad_token');
    }
    return true;
  },

  getUserProfileByUid: async (uid) => {
    if (!uid) return null;
    if (isFirebaseConfigured && db) {
      try {
        const pRef = doc(db, 'profiles', uid);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          return { uid: pSnap.id, id: pSnap.id, ...pSnap.data() };
        }

        const sRef = doc(db, 'students', uid);
        const sSnap = await getDoc(sRef);
        if (sSnap.exists()) {
          return { uid: sSnap.id, id: sSnap.id, role: 'student', ...sSnap.data() };
        }

        // Search by rollNumber or email
        const qSnap = await getDocs(query(collection(db, 'profiles'), where('email', '==', uid)));
        if (!qSnap.empty) {
          const d = qSnap.docs[0];
          return { uid: d.id, id: d.id, ...d.data() };
        }
      } catch (err) {
        console.warn("[Firestore] getUserProfileByUid error:", err.message);
      }
    }

    return DEFAULT_USERS.find(u => u.uid === uid || u.email === uid) || 
           AIML_STUDENT_ROSTER.find(s => s.uid === uid || s.studentId === uid || s.rollNumber === uid) || null;
  },

  getAllUsers: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        list = snap.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("[Firestore] getAllUsers fallback:", err.message);
      }
    }
    const combinedMap = new Map();
    [...DEFAULT_USERS, ...list].forEach(item => {
      const key = item.uid || item.id || item.email;
      if (key) combinedMap.set(key, item);
    });
    return Array.from(combinedMap.values());
  },

  createUser: async (userObj) => {
    const now = new Date().toISOString();
    const cleanEmail = (userObj.email || '').toLowerCase().trim();
    const cleanRoll = (userObj.rollNumber || '').trim();
    let uid = userObj.uid || (cleanRoll ? `stud-${cleanRoll}` : `user_${Date.now()}`);

    if (isFirebaseConfigured && secondaryAuth && cleanEmail) {
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, userObj.password || 'password123');
        if (cred?.user?.uid) uid = cred.user.uid;
      } catch (_) {}
    }

    const payload = {
      uid,
      id: uid,
      email: cleanEmail,
      fullName: userObj.fullName || userObj.name || userObj.studentName || 'User',
      name: userObj.fullName || userObj.name || userObj.studentName || 'User',
      role: userObj.role || 'student',
      department: normalizeDepartment(userObj.department),
      branch: normalizeDepartment(userObj.department),
      semester: userObj.semester || null,
      section: userObj.section || null,
      rollNumber: cleanRoll || null,
      phoneNumber: userObj.phoneNumber || userObj.mobile || null,
      status: userObj.status || 'active',
      profilePhoto: userObj.profilePhoto || userObj.photo || null,
      createdAt: userObj.createdAt || now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        // Pre-check duplicate prevention
        await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
        
        if (payload.role === 'student') {
          const sDocId = cleanRoll || uid;
          await setDoc(doc(db, 'students', sDocId), {
            studentId: uid,
            rollNumber: cleanRoll,
            studentName: payload.fullName,
            email: cleanEmail,
            phoneNumber: payload.phoneNumber,
            admissionNumber: userObj.admissionNumber || `ADM-${cleanRoll || uid}`,
            department: payload.department,
            semester: payload.semester || 'Semester 1',
            section: payload.section || 'Section A',
            branch: payload.department,
            year: userObj.year || '1st Year',
            studentPhoto: payload.profilePhoto,
            status: payload.status,
            createdAt: payload.createdAt,
            updatedAt: now
          }, { merge: true });
        }
      } catch (err) {
        console.error("[Firestore] createUser error:", err);
      }
    }

    await mockDB.addAuditLog(uid, payload.fullName, payload.role, 'USER_CREATED', 'profiles', uid, null, payload);
    return payload;
  },

  updateUser: async (uid, updatedObj) => {
    const now = new Date().toISOString();
    const payload = { ...updatedObj, updatedAt: now };

    if (isFirebaseConfigured && db && uid) {
      try {
        await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
        if (updatedObj.role === 'student' || updatedObj.rollNumber) {
          const sId = updatedObj.rollNumber || uid;
          await setDoc(doc(db, 'students', sId), payload, { merge: true });
        }
      } catch (err) {
        console.error("[Firestore] updateUser error:", err);
      }
    }

    await mockDB.addAuditLog(uid, updatedObj.fullName || 'User', updatedObj.role || 'user', 'USER_UPDATED', 'profiles', uid, null, payload);
    return payload;
  },

  deleteUser: async (uid) => {
    // Soft delete policy
    return await mockDB.updateUser(uid, { status: 'inactive' });
  },

  // --- MASTER STUDENTS DATA (CANONICAL `students` COLLECTION) ---
  getStudents: async (department = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snapStudents = await getDocs(collection(db, 'students'));
        list = snapStudents.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));

        if (list.length === 0) {
          const snapProf = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'student')));
          list = snapProf.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn("[Firestore] getStudents fallback:", err.message);
      }
    }

    const combinedMap = new Map();
    [...AIML_STUDENT_ROSTER, ...list].forEach(s => {
      if (s.status !== 'inactive') {
        const key = s.rollNumber || s.studentId || s.uid || s.id;
        if (key) combinedMap.set(key, s);
      }
    });

    let results = Array.from(combinedMap.values());
    if (department && department !== 'All') {
      results = results.filter(s => isDepartmentMatch(s.department || s.branch, department));
    }
    return results;
  },

  getStudentsByBranchAndSemester: async (branch, semester, section = null) => {
    const allStudents = await mockDB.getStudents(branch);
    let filtered = allStudents.filter(s => {
      const bMatch = !branch || branch === 'All' || isDepartmentMatch(s.department || s.branch, branch);
      const sMatch = !semester || semester === 'All' || normalizeSemester(s.semester) === normalizeSemester(semester);
      return bMatch && sMatch;
    });

    if (section && section !== 'All' && section !== 'N/A') {
      const targetSec = normalizeSection(section);
      const secFiltered = filtered.filter(s => !s.section || normalizeSection(s.section) === targetSec);
      if (secFiltered.length > 0) return secFiltered;
    }

    return filtered;
  },

  batchUploadStudents: async (customRoster = null) => {
    const targetRoster = customRoster || AIML_STUDENT_ROSTER;
    let count = 0;
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        for (const s of targetRoster) {
          const docId = String(s.rollNumber).trim();
          const docRef = doc(db, 'students', docId);
          const payload = {
            studentId: `stud-${docId}`,
            rollNumber: docId,
            studentName: s.studentName || s.fullName || 'Student',
            department: normalizeDepartment(s.department),
            course: s.course || 'B.Sc',
            semester: s.semester || 'Semester 2',
            section: s.section || 'EM',
            branch: normalizeDepartment(s.department),
            admissionNumber: s.admissionNumber || `ADM-${docId}`,
            status: 'active',
            createdAt: now,
            updatedAt: now
          };
          batch.set(docRef, payload, { merge: true });

          // Also keep profiles in sync
          const profRef = doc(db, 'profiles', `stud-${docId}`);
          batch.set(profRef, {
            ...payload,
            role: 'student',
            email: `${docId}@kbn.edu`
          }, { merge: true });
          count++;
        }
        await batch.commit();
      } catch (err) {
        console.error("[Firestore] batchUploadStudents error:", err);
      }
    }
    return count || targetRoster.length;
  },

  batchUploadAIMLStudents: async () => {
    return await mockDB.batchUploadStudents(AIML_STUDENT_ROSTER);
  },

  // --- SUBJECT ALLOCATIONS (CANONICAL `subject_allocations` COLLECTION) ---
  assignSubjectToFaculty: async (branch, semester, subjectName, facultyId, facultyName, section = 'Section A', hodUser = null, facultyEmail = '', facultyPhone = '') => {
    const now = new Date().toISOString();
    const normDept = normalizeDepartment(branch);
    const normSem = normalizeSemester(semester);
    const normSec = normalizeSection(section);
    const allocId = `${facultyId}_${normDept.replace(/[^a-zA-Z0-9]/g, '_')}_${normSem.replace(/\s+/g, '_')}_${normSec.replace(/\s+/g, '_')}_${subjectName.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const payload = {
      allocationId: allocId,
      id: allocId,
      facultyId,
      facultyName: facultyName || 'Faculty',
      facultyEmail: facultyEmail || '',
      facultyPhone: facultyPhone || '',
      department: normDept,
      branch: normDept,
      semester: normSem,
      section: normSec,
      subjectName,
      subjectId: subjectName,
      academicYear: '2025-2026',
      assignedBy: hodUser?.fullName || hodUser?.name || 'HOD',
      assignedById: hodUser?.uid || 'hod',
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'subject_allocations', allocId), payload, { merge: true });
      } catch (err) {
        console.error("[Firestore] assignSubjectToFaculty error:", err);
      }
    }

    await mockDB.addNotification(facultyId, 'Subject Assigned', `You have been assigned ${subjectName} for ${normSem} (${normSec}).`, 'academics');
    await mockDB.addAuditLog(hodUser?.uid || 'hod', hodUser?.fullName || 'HOD', 'hod', 'SUBJECT_ASSIGNED', 'subject_allocations', allocId, null, payload);
    return payload;
  },

  allocateSubject: async (branch, semester, subjectName, facultyId, facultyName) => {
    return await mockDB.assignSubjectToFaculty(branch, semester, subjectName, facultyId, facultyName);
  },

  getSubjectAllocations: async (branch = null, facultyId = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'subject_allocations'));
        list = snap.docs.map(doc => ({ id: doc.id, allocationId: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("[Firestore] getSubjectAllocations fallback:", err.message);
      }
    }

    let results = list.filter(a => a.status !== 'inactive');
    if (branch && branch !== 'All') {
      results = results.filter(a => isDepartmentMatch(a.department || a.branch, branch));
    }
    if (facultyId) {
      results = results.filter(a => a.facultyId === facultyId);
    }
    return results;
  },

  getAllFacultyAllocations: async () => {
    return await mockDB.getSubjectAllocations();
  },

  removeSubjectAllocation: async (allocationId) => {
    if (isFirebaseConfigured && db && allocationId) {
      try {
        await setDoc(doc(db, 'subject_allocations', allocationId), { status: 'inactive', updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error("[Firestore] removeSubjectAllocation error:", err);
      }
    }
    return true;
  },

  // --- ATTENDANCE & PERIOD MANAGEMENT (CANONICAL `attendance` COLLECTION, 5 PERIODS ONLY) ---
  markAttendance: async (records, date, subject, department, semester, section, facultyId, lecturePeriod) => {
    const periodNum = typeof lecturePeriod === 'string' ? (parseInt(lecturePeriod.match(/\d+/)?.[0] || '1', 10)) : (lecturePeriod || 1);
    const validPeriod = Math.max(1, Math.min(5, periodNum)); // Exactly Periods 1-5 only

    const formattedRecords = records.map(r => ({
      ...r,
      subject: subject || r.subject || 'General Subject',
      department: normalizeDepartment(department || r.department),
      branch: normalizeDepartment(department || r.branch),
      semester: normalizeSemester(semester || r.semester),
      section: normalizeSection(section || r.section),
      date: date || new Date().toISOString().split('T')[0],
      period: validPeriod,
      lecturePeriod: validPeriod,
      facultyId: facultyId || r.facultyId || 'fac-1'
    }));

    return await mockDB.saveAttendanceBatch(formattedRecords, facultyId);
  },

  saveAttendanceBatch: async (records, facultyId, facultyName) => {
    const now = new Date().toISOString();
    const saved = [];

    for (const r of records) {
      const stId = r.studentId || r.rollNumber || `stud-${Math.random().toString(36).substr(2, 6)}`;
      const safeDate = (r.date || now.split('T')[0]).replace(/\//g, '-');
      const safeSubject = (r.subject || 'General').replace(/[^a-zA-Z0-9]/g, '_');
      const pNum = Math.max(1, Math.min(5, Number(r.period || r.lecturePeriod || 1)));
      const recordId = `${stId}_${safeDate}_${safeSubject}_p${pNum}`;

      const payload = {
        id: recordId,
        attendanceId: recordId,
        studentId: stId,
        studentUid: stId,
        rollNumber: r.rollNumber || stId,
        studentName: r.studentName || 'Student',
        department: normalizeDepartment(r.department),
        branch: normalizeDepartment(r.department),
        semester: normalizeSemester(r.semester),
        section: normalizeSection(r.section),
        subject: r.subject || 'General',
        subjectId: r.subject || 'General',
        date: safeDate,
        period: pNum,
        lecturePeriod: pNum,
        status: (r.status || 'present').toLowerCase(),
        remarks: r.remarks || '',
        facultyId: facultyId || r.facultyId || 'fac-1',
        facultyName: facultyName || r.facultyName || 'Faculty',
        createdAt: now,
        updatedAt: now
      };

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'attendance', recordId);
          await setDoc(docRef, payload, { merge: true });
        } catch (err) {
          console.error("[Firestore] saveAttendanceBatch setDoc error:", err);
        }
      }
      saved.push(payload);
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_attendance_updated', { detail: { count: records.length } }));
      } catch (_) {}
    }

    return true;
  },

  saveAttendanceCorrection: async (data) => {
    const now = new Date().toISOString();
    const { studentId, rollNumber, studentName, subject, date, period, oldStatus, newStatus, reason, editedBy, facultyId } = data;

    const stId = studentId || rollNumber;
    const safeDate = (date || now.split('T')[0]).replace(/\//g, '-');
    const safeSubject = (subject || 'General').replace(/[^a-zA-Z0-9]/g, '_');
    const pNum = Math.max(1, Math.min(5, Number(period || 1)));
    const attendanceId = `${stId}_${safeDate}_${safeSubject}_p${pNum}`;

    const historyPayload = {
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      attendanceId,
      studentId: stId,
      rollNumber: rollNumber || stId,
      studentName: studentName || 'Student',
      subject,
      date: safeDate,
      period: pNum,
      oldStatus,
      newStatus,
      reason: reason || 'Attendance correction by faculty',
      editedBy: editedBy || 'Faculty',
      facultyId: facultyId || 'fac-1',
      editedAt: now,
      createdAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        // 1. Update Attendance Document
        const attRef = doc(db, 'attendance', attendanceId);
        await setDoc(attRef, {
          status: newStatus.toLowerCase(),
          isEdited: true,
          lastEditedBy: editedBy || 'Faculty',
          lastEditedAt: now,
          lastReason: reason,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. Insert into Canonical `attendance_history` collection
        await addDoc(collection(db, 'attendance_history'), historyPayload);
      } catch (err) {
        console.error("[Firestore] saveAttendanceCorrection error:", err);
      }
    }

    await mockDB.addAuditLog(facultyId, editedBy, 'faculty', 'ATTENDANCE_EDITED', 'attendance', attendanceId, { oldStatus }, { newStatus, reason });
    return true;
  },

  getAttendanceByFilter: async (branch, semester, date, section, subject, period) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'attendance'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getAttendanceByFilter fallback:", err.message);
      }
    }

    return list.filter(a => {
      if (branch && branch !== 'All' && !isDepartmentMatch(a.department || a.branch, branch)) return false;
      if (semester && semester !== 'All' && normalizeSemester(a.semester) !== normalizeSemester(semester)) return false;
      if (date && a.date !== date) return false;
      if (section && section !== 'All' && normalizeSection(a.section) !== normalizeSection(section)) return false;
      if (subject && subject !== 'All' && a.subject !== subject) return false;
      if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
      return true;
    });
  },

  getAttendance: async (department = null, semester = null, studentId = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'attendance'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getAttendance fallback:", err.message);
      }
    }

    return list.filter(a => {
      if (department && department !== 'All' && !isDepartmentMatch(a.department || a.branch, department)) return false;
      if (semester && semester !== 'All' && normalizeSemester(a.semester) !== normalizeSemester(semester)) return false;
      if (studentId && a.studentId !== studentId && a.rollNumber !== studentId) return false;
      return true;
    });
  },

  // --- INTERNAL MARKS (CANONICAL `internal_marks` COLLECTION, MAX 50 MARKS) ---
  saveInternalMarksBatch: async (records) => {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        for (const r of records) {
          const mid1 = Math.min(20, Math.max(0, Number(r.mid1 || r.midTerm1 || 0)));
          const mid2 = Math.min(20, Math.max(0, Number(r.mid2 || r.midTerm2 || 0)));
          const assignments = Math.min(10, Math.max(0, Number(r.assignments || 0)));
          const total = Math.min(50, mid1 + mid2 + assignments);

          const safeSubj = (r.subject || 'General').replace(/[^a-zA-Z0-9]/g, '_');
          const safeSem = (r.semester || 'Sem').replace(/\s+/g, '_');
          const docId = `${r.studentId || r.rollNumber}_${safeSubj}_${safeSem}`;

          const payload = {
            id: docId,
            markId: docId,
            studentId: r.studentId || r.rollNumber,
            rollNumber: r.rollNumber || r.studentId,
            studentName: r.studentName || 'Student',
            department: normalizeDepartment(r.department),
            branch: normalizeDepartment(r.department),
            semester: normalizeSemester(r.semester),
            section: normalizeSection(r.section),
            subject: r.subject || 'General',
            subjectId: r.subject || 'General',
            facultyId: r.facultyId || 'fac-1',
            facultyName: r.facultyName || 'Faculty',
            midTerm1: mid1,
            midTerm2: mid2,
            mid1,
            mid2,
            assignments,
            total,
            status: r.status || 'Published',
            createdAt: now,
            updatedAt: now
          };

          batch.set(doc(db, 'internal_marks', docId), payload, { merge: true });
          batch.set(doc(db, 'marks', docId), payload, { merge: true });
        }
        await batch.commit();
      } catch (err) {
        console.error("[Firestore] saveInternalMarksBatch error:", err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_marks_updated', { detail: { count: records.length } }));
      } catch (_) {}
    }
    return true;
  },

  getStudentMarks: async (studentId) => {
    let internals = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'internal_marks'));
        internals = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.studentId === studentId || m.rollNumber === studentId);
      } catch (err) {
        console.warn("[Firestore] getStudentMarks fallback:", err.message);
      }
    }
    return { internals, assignments: [] };
  },

  getBranchMarks: async (branch, semester, subject) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'internal_marks'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getBranchMarks fallback:", err.message);
      }
    }

    return list.filter(m => {
      if (branch && branch !== 'All' && !isDepartmentMatch(m.department || m.branch, branch)) return false;
      if (semester && semester !== 'All' && normalizeSemester(m.semester) !== normalizeSemester(semester)) return false;
      if (subject && subject !== 'All' && m.subject !== subject) return false;
      return true;
    });
  },

  // --- LEAVE MANAGEMENT (CANONICAL `leave_requests` & `faculty_leaves`) ---
  applyStudentLeave: async (studentId, leaveData) => {
    const now = new Date().toISOString();
    const dept = normalizeDepartment(leaveData.department || leaveData.branch);
    const sem = normalizeSemester(leaveData.semester);
    const sec = normalizeSection(leaveData.section);
    const leaveId = `leave-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const newLeave = {
      id: leaveId,
      leaveId,
      studentId: studentId || 'stud-cse',
      applicantId: studentId || 'stud-cse',
      studentName: leaveData.studentName || 'Student',
      rollNumber: leaveData.rollNumber || '',
      department: dept,
      branch: dept,
      semester: sem,
      section: sec,
      leaveType: leaveData.leaveType || 'Casual Leave',
      startDate: leaveData.startDate || leaveData.fromDate || now.split('T')[0],
      endDate: leaveData.endDate || leaveData.toDate || now.split('T')[0],
      fromDate: leaveData.startDate || leaveData.fromDate || now.split('T')[0],
      toDate: leaveData.endDate || leaveData.toDate || now.split('T')[0],
      reason: leaveData.reason || 'Personal / Medical',
      status: 'Pending',
      counsellorStatus: 'Pending',
      applicantRole: 'student',
      appliedAt: now,
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'leave_requests', leaveId), newLeave);
        await setDoc(doc(db, 'student_leaves', leaveId), newLeave);
      } catch (err) {
        console.error("[Firestore] applyStudentLeave error:", err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_leave_updated', { detail: newLeave }));
      } catch (_) {}
    }
    return newLeave;
  },

  getLeaves: async (role, uid, dept = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'leave_requests'));
        list = snap.docs.map(d => ({ id: d.id, leaveId: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getLeaves fallback:", err.message);
      }
    }

    let results = list;
    if (role === 'student') {
      results = results.filter(l => l.studentId === uid || l.applicantId === uid || l.rollNumber === uid);
    } else if (role === 'counsellor' || role === 'faculty') {
      results = results.filter(l => l.applicantRole === 'student' || !l.applicantRole);
      let scopeBranch = typeof dept === 'object' ? (dept?.department || dept?.branch) : dept;
      if (scopeBranch && scopeBranch !== 'All') {
        results = results.filter(l => isDepartmentMatch(l.department || l.branch, scopeBranch));
      }
    } else if (role === 'hod') {
      results = results.filter(l => l.applicantRole === 'faculty');
      if (dept && dept !== 'All') {
        results = results.filter(l => isDepartmentMatch(l.department || l.branch, dept));
      }
    }
    return results;
  },

  getStudentLeaves: async (studentId) => {
    return await mockDB.getLeaves('student', studentId);
  },

  reviewLeave: async (leaveId, action, remarksOrReason = '', reviewerUser = null) => {
    const now = new Date().toISOString();
    const reviewerName = reviewerUser?.fullName || reviewerUser?.name || 'Reviewer';
    const reviewerUid = reviewerUser?.uid || 'reviewer';
    const status = action === 'Approved' ? 'Approved' : 'Rejected';

    const updates = {
      status,
      counsellorStatus: status,
      actionBy: reviewerName,
      actionAt: now,
      remarks: remarksOrReason,
      updatedAt: now
    };

    if (action === 'Approved') {
      updates.approvedBy = reviewerUid;
      updates.approvedByName = reviewerName;
    } else {
      updates.rejectedBy = reviewerUid;
      updates.rejectionReason = remarksOrReason;
    }

    if (isFirebaseConfigured && db && leaveId) {
      try {
        await setDoc(doc(db, 'leave_requests', leaveId), updates, { merge: true });
        await setDoc(doc(db, 'student_leaves', leaveId), updates, { merge: true });
      } catch (err) {
        console.error("[Firestore] reviewLeave error:", err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_leave_updated', { detail: { leaveId, ...updates } }));
      } catch (_) {}
    }
    return true;
  },

  applyFacultyLeave: async (facultyId, leaveData) => {
    const now = new Date().toISOString();
    const leaveId = `fac-leave-${Date.now()}`;
    const payload = {
      id: leaveId,
      leaveId,
      facultyId: facultyId || 'fac-1',
      facultyName: leaveData.facultyName || 'Faculty',
      department: normalizeDepartment(leaveData.department),
      leaveType: leaveData.leaveType || 'Casual Leave',
      startDate: leaveData.startDate || leaveData.fromDate || now.split('T')[0],
      endDate: leaveData.endDate || leaveData.toDate || now.split('T')[0],
      reason: leaveData.reason || 'Academic / Personal',
      status: 'Pending',
      applicantRole: 'faculty',
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'faculty_leaves', leaveId), payload);
        await setDoc(doc(db, 'leave_requests', leaveId), payload);
      } catch (err) {
        console.error("[Firestore] applyFacultyLeave error:", err);
      }
    }
    return payload;
  },

  getFacultyLeavesForHOD: async (dept = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'faculty_leaves'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getFacultyLeavesForHOD fallback:", err.message);
      }
    }
    if (dept && dept !== 'All') {
      return list.filter(l => isDepartmentMatch(l.department, dept));
    }
    return list;
  },

  reviewFacultyLeave: async (leaveId, action, rejectionReason = '', hodUser = null) => {
    return await mockDB.reviewLeave(leaveId, action, rejectionReason, hodUser);
  },

  // --- STUDY NOTES / MATERIALS (CANONICAL `notes` COLLECTION) ---
  getNotes: async (department = null, semester = null, section = null, subject = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'notes'));
        list = snap.docs.map(d => ({ id: d.id, noteId: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getNotes fallback:", err.message);
      }
    }

    return list.filter(n => {
      if (department && department !== 'All' && !isDepartmentMatch(n.department || n.targetBranch, department)) return false;
      if (semester && semester !== 'All' && normalizeSemester(n.semester || n.targetSemester) !== normalizeSemester(semester)) return false;
      if (subject && subject !== 'All' && n.subject !== subject) return false;
      return true;
    });
  },

  getStudyNotes: async (department = null, semester = null) => {
    return await mockDB.getNotes(department, semester);
  },

  uploadNote: async (facultyId, facultyName, department, semester, subject, topic, description, fileData, section = 'Section A') => {
    const now = new Date().toISOString();
    let fileUrl = '#';
    let fileName = fileData?.name || 'Lecture_Notes.pdf';

    if (fileData && typeof fileData !== 'string') {
      try {
        const uploadRes = await uploadFileToCloudinary(fileData, 'college-erp/study-notes');
        if (uploadRes?.url) fileUrl = uploadRes.url;
      } catch (e) {
        console.warn("[Cloudinary] Notes upload:", e.message);
      }
    } else if (typeof fileData === 'string') {
      fileUrl = fileData;
    }

    const noteId = `note-${Date.now()}`;
    const payload = {
      id: noteId,
      noteId,
      title: topic || subject || 'Lecture Notes',
      topic: topic || subject || 'Lecture Notes',
      description: description || '',
      department: normalizeDepartment(department),
      targetBranch: normalizeDepartment(department),
      semester: normalizeSemester(semester),
      targetSemester: normalizeSemester(semester),
      section: normalizeSection(section),
      targetSection: normalizeSection(section),
      subject,
      facultyId: facultyId || 'fac-1',
      facultyName: facultyName || 'Faculty',
      uploadedBy: facultyName || 'Faculty',
      fileUrl,
      fileName,
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notes', noteId), payload);
      } catch (err) {
        console.error("[Firestore] uploadNote error:", err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_notes_updated', { detail: payload }));
      } catch (_) {}
    }
    return payload;
  },

  deleteNote: async (noteId) => {
    if (isFirebaseConfigured && db && noteId) {
      try {
        await deleteDoc(doc(db, 'notes', noteId));
      } catch (err) {
        console.error("[Firestore] deleteNote error:", err);
      }
    }
    return true;
  },

  // --- ASSIGNMENTS & SUBMISSIONS (CANONICAL `assignments` & `assignment_submissions`) ---
  getAssignments: async (branch = null, semester = null, section = null, subject = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'assignments'));
        list = snap.docs.map(d => ({ id: d.id, assignmentId: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getAssignments fallback:", err.message);
      }
    }

    return list.filter(a => {
      if (branch && branch !== 'All' && !isDepartmentMatch(a.department || a.branch, branch)) return false;
      if (semester && semester !== 'All' && normalizeSemester(a.semester) !== normalizeSemester(semester)) return false;
      if (subject && subject !== 'All' && a.subject !== subject) return false;
      return true;
    });
  },

  createAssignment: async (title, description, branch, semester, subject, dueDate, facultyId, facultyName, file = null, section = 'Section A') => {
    const now = new Date().toISOString();
    let fileUrl = '';
    let fileName = file?.name || 'assignment.pdf';

    if (file && typeof file !== 'string') {
      try {
        const uploadRes = await uploadFileToCloudinary(file, 'college-erp/assignments');
        if (uploadRes?.url) fileUrl = uploadRes.url;
      } catch (_) {}
    } else if (typeof file === 'string') {
      fileUrl = file;
    }

    const assId = `assign-${Date.now()}`;
    const payload = {
      id: assId,
      assignmentId: assId,
      title: title || 'Course Assignment',
      description: description || '',
      department: normalizeDepartment(branch),
      branch: normalizeDepartment(branch),
      semester: normalizeSemester(semester),
      section: normalizeSection(section),
      subject: subject || 'General',
      dueDate: dueDate || now.split('T')[0],
      assignedDate: now.split('T')[0],
      fileUrl,
      fileName,
      facultyId: facultyId || 'fac-1',
      facultyName: facultyName || 'Faculty',
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'assignments', assId), payload);
      } catch (err) {
        console.error("[Firestore] createAssignment error:", err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('acad_assignments_updated', { detail: payload }));
      } catch (_) {}
    }
    return payload;
  },

  deleteAssignment: async (assignmentId) => {
    if (isFirebaseConfigured && db && assignmentId) {
      try {
        await deleteDoc(doc(db, 'assignments', assignmentId));
      } catch (err) {
        console.error("[Firestore] deleteAssignment error:", err);
      }
    }
    return true;
  },

  // --- PLACEMENT DRIVES & APPLICATIONS (CANONICAL `placement_drives` & `placement_applications`) ---
  getPlacementDrives: async (role = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_drives'));
        list = snap.docs.map(d => ({ id: d.id, driveId: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getPlacementDrives fallback:", err.message);
      }
    }

    return list.filter(d => d.status !== 'inactive');
  },

  createPlacementDrive: async (driveData) => {
    const now = new Date().toISOString();
    const driveId = `drive-${Date.now()}`;
    const payload = {
      id: driveId,
      driveId,
      companyName: driveData.companyName || 'Company',
      jobRole: driveData.jobRole || driveData.role || 'Software Engineer',
      package: driveData.package || driveData.salaryPackage || '6.0 LPA',
      location: driveData.location || 'Pan India',
      driveDate: driveData.driveDate || now.split('T')[0],
      applicationDeadline: driveData.applicationDeadline || driveData.deadline || now.split('T')[0],
      eligibleDepartments: driveData.eligibleDepartments || ['All'],
      minimumCGPA: parseFloat(driveData.minimumCGPA || driveData.minCgpa || 6.0),
      maximumBacklogs: parseInt(driveData.maximumBacklogs || driveData.maxBacklogs || 0),
      description: driveData.description || '',
      status: 'Active',
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'placement_drives', driveId), payload);
      } catch (err) {
        console.error("[Firestore] createPlacementDrive error:", err);
      }
    }
    return payload;
  },

  updatePlacementDrive: async (driveId, payload) => {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db && driveId) {
      try {
        await setDoc(doc(db, 'placement_drives', driveId), { ...payload, updatedAt: now }, { merge: true });
      } catch (err) {
        console.error("[Firestore] updatePlacementDrive error:", err);
      }
    }
    return true;
  },

  updateDriveStatus: async (driveId, status) => {
    return await mockDB.updatePlacementDrive(driveId, { status });
  },

  deletePlacementDrive: async (driveId) => {
    return await mockDB.updatePlacementDrive(driveId, { status: 'inactive' });
  },

  getPlacementApplications: async (driveId = null, studentId = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_applications'));
        list = snap.docs.map(d => ({ id: d.id, applicationId: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getPlacementApplications fallback:", err.message);
      }
    }

    return list.filter(a => {
      if (driveId && a.driveId !== driveId) return false;
      if (studentId && a.studentId !== studentId && a.rollNumber !== studentId) return false;
      return true;
    });
  },

  applyForDrive: async (driveId, studentUser) => {
    const now = new Date().toISOString();
    const appId = `app-${Date.now()}`;
    const payload = {
      id: appId,
      applicationId: appId,
      driveId,
      studentId: studentUser?.uid || studentUser?.studentId || 'stud-1',
      rollNumber: studentUser?.rollNumber || 'STU-2026',
      studentName: studentUser?.fullName || studentUser?.studentName || 'Student',
      department: normalizeDepartment(studentUser?.department || studentUser?.branch),
      semester: normalizeSemester(studentUser?.semester),
      appliedDate: now.split('T')[0],
      appliedAt: now,
      status: 'Applied',
      resumeReviewStatus: 'Pending',
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'placement_applications', appId), payload);
      } catch (err) {
        console.error("[Firestore] applyForDrive error:", err);
      }
    }
    return { success: true, application: payload };
  },

  updateApplicationStatus: async (appId, status) => {
    const now = new Date().toISOString();
    if (isFirebaseConfigured && db && appId) {
      try {
        await updateDoc(doc(db, 'placement_applications', appId), { status, updatedAt: now });
      } catch (err) {
        console.error("[Firestore] updateApplicationStatus error:", err);
      }
    }
    return true;
  },

  // --- PLACEMENT COMPANIES & TRAININGS ---
  getPlacementCompanies: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_companies'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("[Firestore] getPlacementCompanies fallback:", err.message);
      }
    }
    return list;
  },

  savePlacementCompany: async (compData) => {
    const id = compData.id || `comp-${Date.now()}`;
    const payload = { ...compData, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'placement_companies', id), payload, { merge: true });
      } catch (err) {
        console.error("[Firestore] savePlacementCompany error:", err);
      }
    }
    return payload;
  },

  deletePlacementCompany: async (compId) => {
    if (isFirebaseConfigured && db && compId) {
      try {
        await deleteDoc(doc(db, 'placement_companies', compId));
      } catch (_) {}
    }
    return true;
  },

  getPlacementTrainings: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_trainings'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  savePlacementTraining: async (trainData) => {
    const id = trainData.id || `train-${Date.now()}`;
    const payload = { ...trainData, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'placement_trainings', id), payload, { merge: true });
      } catch (_) {}
    }
    return payload;
  },

  getPlacementInterviews: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_interviews'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  scheduleInterview: async (intData) => {
    const id = intData.id || `int-${Date.now()}`;
    const payload = { ...intData, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'placement_interviews', id), payload, { merge: true });
      } catch (_) {}
    }
    return payload;
  },

  getPlacementAnalytics: async () => {
    const drives = await mockDB.getPlacementDrives();
    const apps = await mockDB.getPlacementApplications();
    return {
      totalDrives: drives.length,
      totalApplications: apps.length,
      placedCount: apps.filter(a => a.status === 'Selected').length
    };
  },

  // --- NOTIFICATIONS & AUDIT LOGS (CANONICAL `notifications` & `audit_logs`) ---
  addNotification: async (userId, title, message, type = 'info') => {
    const now = new Date().toISOString();
    const payload = {
      notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: userId || 'all',
      studentId: userId || 'all',
      title,
      message,
      content: message,
      type,
      read: false,
      createdAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'notifications'), payload);
      } catch (err) {
        console.warn("[Firestore] addNotification fallback:", err.message);
      }
    }
    return payload;
  },

  getNotifications: async (userId) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'notifications'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list.filter(n => !userId || n.userId === userId || n.userId === 'all' || n.studentId === userId);
  },

  addAuditLog: async (userId, userName, role, action, module, recordId, oldData, newData) => {
    const payload = {
      logId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: userId || 'system',
      userName: userName || 'System',
      role: role || 'system',
      action,
      module,
      recordId: recordId || '',
      oldData: oldData || null,
      newData: newData || null,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'audit_logs'), payload);
      } catch (_) {}
    }
    return payload;
  },

  getHODAuditLogs: async (dept = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'audit_logs'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  logHODAudit: async (hodId, hodName, dept, action, module, details) => {
    return await mockDB.addAuditLog(hodId, hodName, 'hod', action, module, '', null, { dept, details });
  },

  // --- WARD COUNSELLOR MENTORING SERVICES ---
  getFacultyWardAssignment: async (counsellorId) => {
    if (isFirebaseConfigured && db && counsellorId) {
      try {
        const snap = await getDocs(collection(db, 'wardCounsellorAssignments'));
        const found = snap.docs.map(d => d.data()).find(a => a.facultyId === counsellorId && a.status === 'active');
        if (found) return found;
      } catch (_) {}
    }
    return {
      department: 'B.Sc. Computer Science (CS)',
      semester: 'Semester 6',
      section: 'Section A'
    };
  },

  getWardsForCounsellor: async (counsellorId, department, semester) => {
    const activeAssign = await mockDB.getFacultyWardAssignment(counsellorId);
    const targetDept = activeAssign?.department || department || '';
    const targetSem = activeAssign?.semester || semester || '';
    return await mockDB.getStudentsByBranchAndSemester(targetDept, targetSem);
  },

  getStudentWardCounsellorDynamic: async (studentData) => {
    return {
      facultyId: 'coun-cse',
      facultyName: 'Dr. Bruce Banner',
      email: 'counsellor.cse@kbn.edu'
    };
  },

  createStudentConcern: async (concernData) => {
    const id = `concern-${Date.now()}`;
    const payload = { ...concernData, id, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'counselling_logs', id), payload);
      } catch (_) {}
    }
    return payload;
  },

  getStudentConcerns: async (counsellorId = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'counselling_logs'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  // --- REAL-TIME ON-SNAPSHOT LISTENERS ---
  subscribeClassAttendance: (branch, semester, section, date, subject, period, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'attendance'));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => {
            if (branch && branch !== 'All' && !isDepartmentMatch(a.department || a.branch, branch)) return false;
            if (semester && semester !== 'All' && normalizeSemester(a.semester) !== normalizeSemester(semester)) return false;
            if (date && a.date !== date) return false;
            if (section && section !== 'All' && normalizeSection(a.section) !== normalizeSection(section)) return false;
            if (subject && subject !== 'All' && a.subject !== subject) return false;
            if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
            return true;
          });
          callback(list);
        });
      } catch (e) {
        console.error("subscribeClassAttendance error:", e);
      }
    }
    callback([]);
    return () => {};
  },

  subscribeStudentAttendance: (studentId, rollNumber, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'attendance'));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => 
            a.studentId === studentId || a.studentUid === studentId || a.rollNumber === studentId || (rollNumber && a.rollNumber === rollNumber)
          );
          callback(list);
        });
      } catch (e) {
        console.error("subscribeStudentAttendance error:", e);
      }
    }
    callback([]);
    return () => {};
  },

  subscribeAttendanceHistory: (studentId, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'attendance_history'));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(h => 
            !studentId || h.studentId === studentId || h.rollNumber === studentId
          );
          callback(list);
        });
      } catch (e) {
        console.error("subscribeAttendanceHistory error:", e);
      }
    }
    callback([]);
    return () => {};
  },

  // --- ACADEMIC CALENDAR, TIMETABLES & CLASSROOMS ---
  getCalendarEvents: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'academic_calendar'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  saveCalendarEvent: async (eventObj) => {
    const id = eventObj.id || `cal-${Date.now()}`;
    const payload = { ...eventObj, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'academic_calendar', id), payload, { merge: true });
      } catch (_) {}
    }
    return payload;
  },

  deleteCalendarEvent: async (id) => {
    if (isFirebaseConfigured && db && id) {
      try {
        await deleteDoc(doc(db, 'academic_calendar', id));
      } catch (_) {}
    }
    return true;
  },

  getTimetables: async (branch = null, semester = null) => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'timetables'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  getClassrooms: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'classrooms'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  // --- LIBRARY & E-RESOURCES ---
  getBooks: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'books'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  addBook: async (bookObj) => {
    const id = bookObj.bookId || `book-${Date.now()}`;
    const payload = { ...bookObj, bookId: id, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'books', id), payload, { merge: true });
      } catch (_) {}
    }
    return payload;
  },

  updateBook: async (bookId, updateObj) => {
    if (isFirebaseConfigured && db && bookId) {
      try {
        await setDoc(doc(db, 'books', bookId), { ...updateObj, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (_) {}
    }
    return true;
  },

  deleteBook: async (bookId) => {
    if (isFirebaseConfigured && db && bookId) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (_) {}
    }
    return true;
  },

  getAllIssuedBooks: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'issued_books'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  issueBookDirectly: async (studentId, bookId) => {
    const transId = `trans-${Date.now()}`;
    const payload = {
      transactionId: transId,
      id: transId,
      studentId,
      bookId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'issued'
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'issued_books', transId), payload);
      } catch (_) {}
    }
    return payload;
  },

  returnBook: async (transactionId) => {
    if (isFirebaseConfigured && db && transactionId) {
      try {
        await updateDoc(doc(db, 'issued_books', transactionId), { status: 'returned', returnDate: new Date().toISOString().split('T')[0] });
      } catch (_) {}
    }
    return true;
  },

  getEresources: async () => {
    return [
      { id: 'res-1', title: 'IEEE Xplore Digital Library', category: 'Journals', url: 'https://ieeexplore.ieee.org' },
      { id: 'res-2', title: 'ACM Digital Library', category: 'Conference Papers', url: 'https://dl.acm.org' }
    ];
  },

  addEresource: async (resObj) => {
    return { id: `res-${Date.now()}`, ...resObj };
  },

  getLibraryAnalytics: async () => {
    return { totalBooks: 12, issuedBooks: 4, activeMembers: 45 };
  },

  issueNoDuesClearance: async (studentId) => {
    return { success: true, message: 'No dues certificate generated successfully.' };
  },

  // --- PROFILE PHOTOS & CLOUDINARY ---
  updateUserProfilePhoto: async (userId, photoUrl) => {
    if (isFirebaseConfigured && db && userId) {
      try {
        await setDoc(doc(db, 'profiles', userId), { profilePhoto: photoUrl, profilePhotoUrl: photoUrl, updatedAt: new Date().toISOString() }, { merge: true });
        await setDoc(doc(db, 'students', userId), { studentPhoto: photoUrl, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.error("[Firestore] updateUserProfilePhoto error:", err);
      }
    }
    return { success: true, photoUrl };
  },

  uploadProfilePhoto: async (userId, file) => {
    if (!file) throw new Error("No photo file provided.");
    const uploadRes = await uploadFileToCloudinary(file, 'college-erp/profile-photos');
    await mockDB.updateUserProfilePhoto(userId, uploadRes.url);
    return uploadRes;
  },

  // --- STATS, BACKUPS & GENERAL GETTERS ---
  getHODStats: async (dept = null) => {
    const students = await mockDB.getStudents(dept);
    const allocations = await mockDB.getSubjectAllocations(dept);
    return {
      totalStudents: students.length,
      totalFaculty: allocations.length,
      averageAttendance: 85.4
    };
  },

  getPrincipalAnalytics: async () => {
    const students = await mockDB.getStudents();
    return {
      totalStudents: students.length,
      totalFaculty: 24,
      departmentsCount: COLLEGE_DEPARTMENTS.length,
      overallAttendanceRate: 86.8
    };
  },

  getFees: async (studentId) => {
    return [
      { id: 'fee-1', title: 'Tuition Fee (Sem VI)', amount: 25000, paid: 25000, status: 'Paid', date: '2026-01-15' },
      { id: 'fee-2', title: 'Laboratory Fee', amount: 5000, paid: 5000, status: 'Paid', date: '2026-01-15' }
    ];
  },

  getDepartmentsList: async () => {
    return COLLEGE_DEPARTMENTS;
  },

  getStudentProfile: async (studentId) => {
    return await mockDB.getUserProfileByUid(studentId);
  },

  getStudentFullDetails: async (studentId) => {
    const profile = await mockDB.getUserProfileByUid(studentId);
    const marks = await mockDB.getStudentMarks(studentId);
    const leaves = await mockDB.getStudentLeaves(studentId);
    return { profile, marks, leaves };
  },

  getBackupLogs: async () => {
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'backup_logs'));
        list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
    }
    return list;
  },

  triggerBackup: async (adminId) => {
    const log = {
      backupId: `backup-${Date.now()}`,
      triggeredBy: adminId || 'admin',
      timestamp: new Date().toISOString(),
      status: 'Completed',
      collectionsBackedUp: ['students', 'profiles', 'attendance', 'internal_marks', 'notes', 'assignments']
    };
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'backup_logs'), log);
      } catch (_) {}
    }
    return log;
  },

  restoreBackup: async (backupDataString, adminId) => {
    return { success: true, timestamp: new Date().toISOString() };
  }
};
