import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if Firebase is configured in env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app, auth, db, storage;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock DB:", error);
  }
}

// ----------------------------------------------------
// MOCK DATABASE & AUTH ENGINE (LOCAL STORAGE FALLBACK)
// ----------------------------------------------------

const SIMULATION_DELAY = 300; // ms to simulate network delay

// Branches and Semesters list
export const KBN_BRANCHES = [
  'CSE',
  'CSE (AI & ML)',
  'CSE (Data Science)',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'BCA',
  'BBA',
  'MBA',
  'MCA'
];

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

// Pre-seeded users for KBN College ERP
const DEFAULT_USERS = [
  // Admin
  { uid: 'admin-1', email: 'admin@kbn.edu', fullName: 'System Administrator', role: 'admin', department: 'N/A' },
  // Principal
  { uid: 'principal-1', email: 'principal@kbn.edu', fullName: 'Dr. Arthur Pendelton', role: 'principal', department: 'All', employeeId: 'PRIN-01' },
  // HODs
  { uid: 'hod-cse', email: 'hod.cse@kbn.edu', fullName: 'Dr. Alan Turing', role: 'hod', department: 'CSE', employeeId: 'HOD-CSE-01' },
  { uid: 'hod-aiml', email: 'hod.aiml@kbn.edu', fullName: 'Dr. Sarah Connor', role: 'hod', department: 'CSE (AI & ML)', employeeId: 'HOD-AIML-01' },
  { uid: 'hod-ds', email: 'hod.ds@kbn.edu', fullName: 'Dr. Grace Hopper', role: 'hod', department: 'CSE (Data Science)', employeeId: 'HOD-DS-01' },
  // Faculty
  { uid: 'fac-1', email: 'faculty.cse@kbn.edu', fullName: 'Prof. Charles Xavier', role: 'faculty', department: 'CSE', employeeId: 'FAC-CSE-01', assignedBranches: ['CSE', 'CSE (AI & ML)'], subjects: ['Neural Networks', 'Operating Systems'] },
  { uid: 'fac-2', email: 'faculty.aiml@kbn.edu', fullName: 'Prof. Albert Einstein', role: 'faculty', department: 'CSE (AI & ML)', employeeId: 'FAC-AIML-01', assignedBranches: ['CSE (AI & ML)', 'CSE (Data Science)'], subjects: ['Machine Learning', 'Artificial Intelligence'] },
  // Ward Counsellors
  { uid: 'coun-cse', email: 'counsellor.cse@kbn.edu', fullName: 'Dr. Bruce Banner', role: 'counsellor', department: 'CSE', employeeId: 'WC-CSE-01', contactNumber: '9876543210' },
  { uid: 'coun-aiml', email: 'counsellor.aiml@kbn.edu', fullName: 'Dr. Reed Richards', role: 'counsellor', department: 'CSE (AI & ML)', employeeId: 'WC-AIML-01', contactNumber: '9876543211' },
  { uid: 'coun-ds', email: 'counsellor.ds@kbn.edu', fullName: 'Dr. Hank Pym', role: 'counsellor', department: 'CSE (Data Science)', employeeId: 'WC-DS-01', contactNumber: '9876543212' },
  { uid: 'coun-ece', email: 'counsellor.ece@kbn.edu', fullName: 'Dr. Stephen Strange', role: 'counsellor', department: 'ECE', employeeId: 'WC-ECE-01', contactNumber: '9876543213' },
  { uid: 'coun-eee', email: 'counsellor.eee@kbn.edu', fullName: 'Dr. Barry Allen', role: 'counsellor', department: 'EEE', employeeId: 'WC-EEE-01', contactNumber: '9876543214' },
  { uid: 'coun-mech', email: 'counsellor.mech@kbn.edu', fullName: 'Dr. Otto Octavius', role: 'counsellor', department: 'Mechanical', employeeId: 'WC-MECH-01', contactNumber: '9876543215' },
  { uid: 'coun-civil', email: 'counsellor.civil@kbn.edu', fullName: 'Dr. Victor Doom', role: 'counsellor', department: 'Civil', employeeId: 'WC-CIVIL-01', contactNumber: '9876543216' },
  { uid: 'coun-bca', email: 'counsellor.bca@kbn.edu', fullName: 'Dr. Peter Parker', role: 'counsellor', department: 'BCA', employeeId: 'WC-BCA-01', contactNumber: '9876543217' },
  { uid: 'coun-bba', email: 'counsellor.bba@kbn.edu', fullName: 'Dr. Clark Kent', role: 'counsellor', department: 'BBA', employeeId: 'WC-BBA-01', contactNumber: '9876543218' },
  { uid: 'coun-mba', email: 'counsellor.mba@kbn.edu', fullName: 'Dr. Bruce Wayne', role: 'counsellor', department: 'MBA', employeeId: 'WC-MBA-01', contactNumber: '9876543219' },
  { uid: 'coun-mca', email: 'counsellor.mca@kbn.edu', fullName: 'Dr. Diana Prince', role: 'counsellor', department: 'MCA', employeeId: 'WC-MCA-01', contactNumber: '9876543220' },
  // Librarians
  { uid: 'lib-1', email: 'librarian@kbn.edu', fullName: 'Madam Pince', role: 'librarian', department: 'N/A', employeeId: 'LIB-01' },
  // Placement Officer
  { uid: 'placement-1', email: 'placement@kbn.edu', fullName: 'Tony Stark', role: 'placement', department: 'N/A', employeeId: 'PLACE-01' },
  // Students
  { uid: 'stud-cse', email: 'student.cse@kbn.edu', fullName: 'John Doe', role: 'student', department: 'CSE', semester: 'Semester 6', rollNumber: 'CSE-2023-001', counsellorId: 'coun-cse', counsellorName: 'Dr. Bruce Banner' },
  { uid: 'stud-aiml', email: 'student.aiml@kbn.edu', fullName: 'Peter Parker', role: 'student', department: 'CSE (AI & ML)', semester: 'Semester 6', rollNumber: 'AIML-2023-042', counsellorId: 'coun-aiml', counsellorName: 'Dr. Reed Richards' }
];

const DEFAULT_STUDENTS = [
  { studentId: 'stud-cse', branch: 'CSE', attendancePercentage: 88, totalClasses: 120, attendedClasses: 106, cgpa: 8.9 },
  { studentId: 'stud-aiml', branch: 'CSE (AI & ML)', attendancePercentage: 92, totalClasses: 110, attendedClasses: 101, cgpa: 9.1 }
];

const DEFAULT_FACULTY = [
  { facultyId: 'fac-1', department: 'CSE', subjects: ['Neural Networks', 'Operating Systems'] },
  { facultyId: 'fac-2', department: 'CSE (AI & ML)', subjects: ['Machine Learning', 'Artificial Intelligence'] }
];

const DEFAULT_ACADEMIC_YEAR = '2026-2027';

const DEFAULT_FEE_STRUCTURE = [
  { branch: 'CSE', semester: 'Semester 6', semesterFee: 45000, examFee: 2000, busFee: 15000, hostelFee: 30000 },
  { branch: 'CSE (AI & ML)', semester: 'Semester 6', semesterFee: 48000, examFee: 2200, busFee: 15000, hostelFee: 32000 }
];

const DEFAULT_FEES = [
  { invoiceId: 'inv-1', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', department: 'CSE', semester: 'Semester 6', feeType: 'Semester Fee', amount: 45000, dueDate: '2026-06-30', status: 'unpaid', paidAt: null, paymentMethod: null },
  { invoiceId: 'inv-2', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', department: 'CSE', semester: 'Semester 6', feeType: 'Exam Fee', amount: 2000, dueDate: '2026-06-28', status: 'paid', paidAt: '2026-06-05T10:30:00.000Z', paymentMethod: 'UPI' },
  { invoiceId: 'inv-3', studentId: 'stud-aiml', studentName: 'Peter Parker', rollNumber: 'AIML-2023-042', department: 'CSE (AI & ML)', semester: 'Semester 6', feeType: 'Semester Fee', amount: 48000, dueDate: '2026-06-30', status: 'unpaid', paidAt: null, paymentMethod: null },
  { invoiceId: 'inv-4', studentId: 'stud-aiml', studentName: 'Peter Parker', rollNumber: 'AIML-2023-042', department: 'CSE (AI & ML)', semester: 'Semester 6', feeType: 'Hostel Fee', amount: 32000, dueDate: '2026-06-30', status: 'paid', paidAt: '2026-06-01T09:15:00.000Z', paymentMethod: 'Card' }
];

const DEFAULT_BOOKS = [
  { bookId: 'book-1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'CSE', totalCopies: 10, availableCopies: 8 },
  { bookId: 'book-2', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', isbn: '978-0136086208', category: 'CSE (AI & ML)', totalCopies: 8, availableCopies: 7 },
  { bookId: 'book-3', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'CSE', totalCopies: 6, availableCopies: 6 }
];

const DEFAULT_ISSUED_BOOKS = [
  { transactionId: 'issue-1', bookId: 'book-1', bookTitle: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', borrowerType: 'student', issueDate: '2026-06-01', dueDate: '2026-06-15', returnDate: null, status: 'issued', fine: 0 },
  { transactionId: 'issue-2', bookId: 'book-2', bookTitle: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', studentId: 'stud-aiml', studentName: 'Peter Parker', rollNumber: 'AIML-2023-042', borrowerType: 'student', issueDate: '2026-06-05', dueDate: '2026-06-20', returnDate: null, status: 'issued', fine: 0 }
];

const DEFAULT_SUBJECT_ALLOCATIONS = [
  { allocationId: 'alloc-1', branch: 'CSE', semester: 'Semester 6', subjectName: 'Neural Networks', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier' },
  { allocationId: 'alloc-2', branch: 'CSE', semester: 'Semester 6', subjectName: 'Operating Systems', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier' },
  { allocationId: 'alloc-3', branch: 'CSE (AI & ML)', semester: 'Semester 6', subjectName: 'Machine Learning', facultyId: 'fac-2', facultyName: 'Prof. Albert Einstein' }
];

const DEFAULT_ASSIGNMENTS = [
  {
    assignmentId: 'assign-1',
    title: 'Operating Systems - Deadlock Avoidance',
    description: 'Implement Bankers algorithm and explain resource allocation graph concepts.',
    branch: 'CSE',
    semester: 'Semester 6',
    subject: 'Operating Systems',
    dueDate: '2026-06-25',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    submissions: [
      { studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', fileUrl: 'Bankers_Algo_Report.pdf', submittedAt: '2026-06-20T14:30:00Z', grade: 'Pending' }
    ]
  }
];

const DEFAULT_MARKS = [
  { markId: 'mark-1', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', branch: 'CSE', semester: 'Semester 6', subject: 'Operating Systems', mid1: 18, mid2: 17, assignments: 9, total: 44 },
  { markId: 'mark-2', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', branch: 'CSE', semester: 'Semester 6', subject: 'Neural Networks', mid1: 15, mid2: 16, assignments: 8, total: 39 }
];

const DEFAULT_ATTENDANCE = [
  { attendanceId: 'att-1', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', date: '2026-06-05', status: 'present', branch: 'CSE', semester: 'Semester 6' },
  { attendanceId: 'att-2', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', date: '2026-06-06', status: 'present', branch: 'CSE', semester: 'Semester 6' },
  { attendanceId: 'att-3', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', date: '2026-06-07', status: 'present', branch: 'CSE', semester: 'Semester 6' },
  { attendanceId: 'att-4', studentId: 'stud-aiml', studentName: 'Peter Parker', rollNumber: 'AIML-2023-042', date: '2026-06-05', status: 'present', branch: 'CSE (AI & ML)', semester: 'Semester 6' },
  { attendanceId: 'att-5', studentId: 'stud-aiml', studentName: 'Peter Parker', rollNumber: 'AIML-2023-042', date: '2026-06-06', status: 'absent', branch: 'CSE (AI & ML)', semester: 'Semester 6' }
];

const DEFAULT_COUNSELING_LOGS = [
  {
    logId: 'log-1',
    studentId: 'stud-cse',
    studentName: 'John Doe',
    counsellorId: 'coun-cse',
    counsellorName: 'Dr. Bruce Banner',
    date: '2026-06-10',
    topic: 'Stress Management & Technical Projects',
    notes: 'Discussed minor project load. Advised him to break down the development steps and maintain regular breaks.',
    actionItems: '1. Complete system architecture schema.\n2. Dedicate at least 30 minutes daily to light sports.'
  }
];

const DEFAULT_COUNSELING_MEETINGS = [
  { meetingId: 'meet-1', studentId: 'stud-cse', studentName: 'John Doe', counsellorId: 'coun-cse', counsellorName: 'Dr. Bruce Banner', title: 'Project Outline Review', date: '2026-06-25', time: '14:00', status: 'approved' }
];

const DEFAULT_PARENT_MEETINGS = [
  { meetingId: 'pm-1', counsellorId: 'coun-cse', studentId: 'stud-cse', studentName: 'John Doe', parentName: 'Richard Doe', date: '2026-06-12', notes: 'Discussed John\'s performance. Parents were satisfied with progress but requested monitoring on lab schedules.' }
];

const DEFAULT_PLACEMENT_DRIVES = [
  { driveId: 'drive-1', companyName: 'Google', role: 'Associate Software Engineer', salaryPackage: '18 LPA', eligibility: 'CGPA > 8.0, CSE / CSE (AI & ML)', driveDate: '2026-06-25', status: 'upcoming', applicants: ['stud-cse'], selectedStudents: [] },
  { driveId: 'drive-2', companyName: 'Meta', role: 'Data Analyst Intern', salaryPackage: '12 LPA', eligibility: 'CGPA > 7.5, CSE (Data Science)', driveDate: '2026-06-28', status: 'upcoming', applicants: [], selectedStudents: [] }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'KBN College Final Assessment Calendar', content: 'Final exams for all semesters will begin on July 5th, 2026. Hall tickets can be collected from academic counters from next Monday.', date: '2026-06-08', author: 'Principal Desk' },
  { id: 'ann-2', title: 'CSE Department Research Symposium', content: 'CSE department hosts national symposium on Applied AI on June 29th. Registrations open.', date: '2026-06-07', author: 'CSE HOD Office' }
];

const DEFAULT_LEAVES = [
  {
    leaveId: 'leave-1',
    studentId: 'stud-cse',
    studentName: 'John Doe',
    rollNumber: 'CSE-2023-001',
    branch: 'CSE',
    semester: 'Semester 6',
    counsellorId: 'coun-cse',
    reason: 'Attending sibling marriage conference.',
    startDate: '2026-06-22',
    endDate: '2026-06-24',
    status: 'pending',
    remarks: '',
    createdAt: new Date().toISOString()
  }
];

const initLocalStorage = () => {
  // DB Auto-Upgrade Check: Wipe old structures if they do not match KBN College structure
  const oldUsers = localStorage.getItem('acad_users');
  if (oldUsers && (!oldUsers.includes('kbn.edu') || !oldUsers.includes('WC-CIVIL-01') || !oldUsers.includes('assignedBranches'))) {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('acad_')) localStorage.removeItem(k);
    });
  }

  if (!localStorage.getItem('acad_users')) localStorage.setItem('acad_users', JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem('acad_students')) localStorage.setItem('acad_students', JSON.stringify(DEFAULT_STUDENTS));
  if (!localStorage.getItem('acad_faculty')) localStorage.setItem('acad_faculty', JSON.stringify(DEFAULT_FACULTY));
  
  if (!localStorage.getItem('acad_academic_year')) localStorage.setItem('acad_academic_year', DEFAULT_ACADEMIC_YEAR);
  if (!localStorage.getItem('acad_fee_structure')) localStorage.setItem('acad_fee_structure', JSON.stringify(DEFAULT_FEE_STRUCTURE));
  if (!localStorage.getItem('acad_fees')) localStorage.setItem('acad_fees', JSON.stringify(DEFAULT_FEES));
  if (!localStorage.getItem('acad_books')) localStorage.setItem('acad_books', JSON.stringify(DEFAULT_BOOKS));
  if (!localStorage.getItem('acad_issued_books')) localStorage.setItem('acad_issued_books', JSON.stringify(DEFAULT_ISSUED_BOOKS));
  if (!localStorage.getItem('acad_subject_allocations')) localStorage.setItem('acad_subject_allocations', JSON.stringify(DEFAULT_SUBJECT_ALLOCATIONS));
  
  if (!localStorage.getItem('acad_assignments')) localStorage.setItem('acad_assignments', JSON.stringify(DEFAULT_ASSIGNMENTS));
  if (!localStorage.getItem('acad_marks')) localStorage.setItem('acad_marks', JSON.stringify(DEFAULT_MARKS));
  if (!localStorage.getItem('acad_attendance')) localStorage.setItem('acad_attendance', JSON.stringify(DEFAULT_ATTENDANCE));
  
  if (!localStorage.getItem('acad_counseling_logs')) localStorage.setItem('acad_counseling_logs', JSON.stringify(DEFAULT_COUNSELING_LOGS));
  if (!localStorage.getItem('acad_counseling_meetings')) localStorage.setItem('acad_counseling_meetings', JSON.stringify(DEFAULT_COUNSELING_MEETINGS));
  if (!localStorage.getItem('acad_parent_meetings')) localStorage.setItem('acad_parent_meetings', JSON.stringify(DEFAULT_PARENT_MEETINGS));
  
  if (!localStorage.getItem('acad_drives')) localStorage.setItem('acad_drives', JSON.stringify(DEFAULT_PLACEMENT_DRIVES));
  if (!localStorage.getItem('acad_announcements')) localStorage.setItem('acad_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  if (!localStorage.getItem('acad_leaves')) localStorage.setItem('acad_leaves', JSON.stringify(DEFAULT_LEAVES));
};

initLocalStorage();

// Pub-Sub Event system for reactivity
const pubSub = {
  events: {},
  subscribe(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
};

export const mockDB = {
  delay: (ms = SIMULATION_DELAY) => new Promise(resolve => setTimeout(resolve, ms)),

  // --- AUTH SERVICES ---
  login: async (email, password) => {
    await mockDB.delay(200);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error(`Account not found. Valid test logins include: admin@kbn.edu, principal@kbn.edu, hod.cse@kbn.edu, faculty.cse@kbn.edu, student.cse@kbn.edu, counsellor.cse@kbn.edu, librarian@kbn.edu, placement@kbn.edu.`);
    }
    localStorage.setItem('acad_current_user', JSON.stringify(user));
    return user;
  },

  logout: async () => {
    await mockDB.delay(100);
    localStorage.removeItem('acad_current_user');
    return true;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('acad_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // --- ADMIN CRUD & SETUP SERVICES ---
  getAllUsers: async () => {
    await mockDB.delay(150);
    return JSON.parse(localStorage.getItem('acad_users') || '[]');
  },

  createUser: async (userObj) => {
    await mockDB.delay(200);
    let users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === userObj.email.toLowerCase())) {
      throw new Error('Email address already registered.');
    }

    const uid = userObj.role + '-' + Math.random().toString(36).substr(2, 9);
    
    // Automatically assign counsellor for student additions
    let extraFields = {};
    if (userObj.role === 'student') {
      const counsellors = users.filter(u => u.role === 'counsellor' && u.department === userObj.department);
      if (councellors.length > 0) {
        extraFields.counsellorId = counsellors[0].uid;
        extraFields.counsellorName = counsellors[0].fullName;
      } else {
        // Find any counsellor or default to placeholder
        const anyCounsellor = users.find(u => u.role === 'counsellor');
        extraFields.counsellorId = anyCounsellor ? anyCounsellor.uid : 'coun-cse';
        extraFields.counsellorName = anyCounsellor ? anyCounsellor.fullName : 'Dr. Bruce Banner';
      }
    }

    const newUser = { uid, ...userObj, ...extraFields };
    users.push(newUser);

    // If we create a counsellor, map them to students of their branch
    if (userObj.role === 'counsellor') {
      users = users.map(u => {
        if (u.role === 'student' && u.department === userObj.department) {
          return { ...u, counsellorId: uid, counsellorName: userObj.fullName };
        }
        return u;
      });
    }

    localStorage.setItem('acad_users', JSON.stringify(users));

    if (userObj.role === 'student') {
      const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
      students.push({
        studentId: uid,
        branch: userObj.department,
        attendancePercentage: 100,
        totalClasses: 0,
        attendedClasses: 0,
        cgpa: 8.0
      });
      localStorage.setItem('acad_students', JSON.stringify(students));

      // Seed Initial Fees
      const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
      const feeStruc = JSON.parse(localStorage.getItem('acad_fee_structure') || '[]');
      const struc = feeStruc.find(f => f.branch === userObj.department && f.semester === userObj.semester) || {
        semesterFee: 45000, examFee: 2000, busFee: 12000, hostelFee: 25000
      };

      fees.push(
        { invoiceId: 'inv-' + Math.random().toString(36).substr(2, 9), studentId: uid, studentName: userObj.fullName, rollNumber: userObj.rollNumber, department: userObj.department, semester: userObj.semester, feeType: 'Semester Fee', amount: struc.semesterFee, dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], status: 'unpaid', paidAt: null, paymentMethod: null },
        { invoiceId: 'inv-' + Math.random().toString(36).substr(2, 9), studentId: uid, studentName: userObj.fullName, rollNumber: userObj.rollNumber, department: userObj.department, semester: userObj.semester, feeType: 'Exam Fee', amount: struc.examFee, dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], status: 'unpaid', paidAt: null, paymentMethod: null }
      );
      localStorage.setItem('acad_fees', JSON.stringify(fees));
    } else if (userObj.role === 'faculty') {
      const faculty = JSON.parse(localStorage.getItem('acad_faculty') || '[]');
      faculty.push({
        facultyId: uid,
        department: userObj.department,
        subjects: ['Introduction Course']
      });
      localStorage.setItem('acad_faculty', JSON.stringify(faculty));
    }

    pubSub.publish('users_changed', users);
    return newUser;
  },

  updateUser: async (uid, updatedObj) => {
    await mockDB.delay(150);
    let users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx === -1) throw new Error('User not found.');
    
    users[idx] = { ...users[idx], ...updatedObj };

    // If a counsellor is updated, update all students belonging to their branch
    if (users[idx].role === 'counsellor') {
      users = users.map(u => {
        if (u.role === 'student' && u.department === users[idx].department) {
          return { ...u, counsellorId: users[idx].uid, counsellorName: users[idx].fullName };
        }
        return u;
      });
    }

    // If a student's branch is updated, re-evaluate their counsellor
    if (users[idx].role === 'student' && updatedObj.department) {
      const counsellor = users.find(c => c.role === 'counsellor' && c.department === updatedObj.department);
      if (counsellor) {
        users[idx].counsellorId = counsellor.uid;
        users[idx].counsellorName = counsellor.fullName;
      }
    }

    localStorage.setItem('acad_users', JSON.stringify(users));
    pubSub.publish('users_changed', users);
    return users[idx];
  },

  deleteUser: async (uid) => {
    await mockDB.delay(150);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const filtered = users.filter(u => u.uid !== uid);
    localStorage.setItem('acad_users', JSON.stringify(filtered));

    // Also clean up sub-role lists
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    localStorage.setItem('acad_students', JSON.stringify(students.filter(s => s.studentId !== uid)));

    const faculty = JSON.parse(localStorage.getItem('acad_faculty') || '[]');
    localStorage.setItem('acad_faculty', JSON.stringify(faculty.filter(f => f.facultyId !== uid)));

    pubSub.publish('users_changed', filtered);
    return true;
  },

  resetPassword: async (uid, newPass = 'password123') => {
    await mockDB.delay(100);
    return true;
  },

  getAcademicSetup: () => {
    return {
      academicYear: localStorage.getItem('acad_academic_year') || DEFAULT_ACADEMIC_YEAR,
      feeStructures: JSON.parse(localStorage.getItem('acad_fee_structure') || '[]')
    };
  },

  saveAcademicSetup: async (academicYear, feeStructures) => {
    await mockDB.delay(200);
    localStorage.setItem('acad_academic_year', academicYear);
    localStorage.setItem('acad_fee_structure', JSON.stringify(feeStructures));
    return true;
  },

  // --- LEAVE SERVICES ---
  getLeaves: async (role, id, department = null) => {
    await mockDB.delay(150);
    const leaves = JSON.parse(localStorage.getItem('acad_leaves') || '[]');
    if (role === 'student') {
      return leaves.filter(l => l.studentId === id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (role === 'counsellor') {
      return leaves.filter(l => l.counsellorId === id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return leaves.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  subscribeLeaves: (role, id, department, callback) => {
    mockDB.getLeaves(role, id, department).then(callback);
    return pubSub.subscribe('leaves_changed', () => {
      mockDB.getLeaves(role, id, department).then(callback);
    });
  },

  applyLeave: async (studentId, studentName, rollNumber, branch, semester, counsellorId, reason, startDate, endDate) => {
    await mockDB.delay(200);
    const leaves = JSON.parse(localStorage.getItem('acad_leaves') || '[]');
    const newLeave = {
      leaveId: 'leave-' + Math.random().toString(36).substr(2, 9),
      studentId,
      studentName,
      rollNumber,
      branch,
      semester,
      counsellorId,
      reason,
      startDate,
      endDate,
      status: 'pending',
      remarks: '',
      createdAt: new Date().toISOString()
    };
    leaves.push(newLeave);
    localStorage.setItem('acad_leaves', JSON.stringify(leaves));
    pubSub.publish('leaves_changed', leaves);
    return newLeave;
  },

  reviewLeave: async (leaveId, action, remarks = '') => {
    await mockDB.delay(200);
    const leaves = JSON.parse(localStorage.getItem('acad_leaves') || '[]');
    const idx = leaves.findIndex(l => l.leaveId === leaveId);
    if (idx === -1) throw new Error('Leave application not found.');

    leaves[idx].status = action; // 'approved' | 'rejected'
    leaves[idx].remarks = remarks;

    localStorage.setItem('acad_leaves', JSON.stringify(leaves));
    pubSub.publish('leaves_changed', leaves);
    return leaves[idx];
  },

  // --- ATTENDANCE SERVICES ---
  getAttendanceForStudent: async (studentId) => {
    await mockDB.delay(100);
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    return attendance.filter(a => a.studentId === studentId).sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  getStudentsByBranchAndSemester: async (branch, semester) => {
    await mockDB.delay(100);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    return users.filter(u => u.role === 'student' && u.department === branch && u.semester === semester);
  },

  getAttendanceByFilter: async (branch, semester, date) => {
    await mockDB.delay(100);
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    return attendance.filter(a => a.branch === branch && a.semester === semester && a.date === date);
  },

  saveAttendanceBatch: async (attendanceRecords) => {
    await mockDB.delay(200);
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');

    attendanceRecords.forEach(record => {
      const idx = attendance.findIndex(a => a.studentId === record.studentId && a.date === record.date);
      if (idx !== -1) attendance.splice(idx, 1);
      
      attendance.push({
        attendanceId: 'att-' + Math.random().toString(36).substr(2, 9),
        ...record
      });

      // Recalculate student overall percentages
      const studIdx = students.findIndex(s => s.studentId === record.studentId);
      if (studIdx !== -1) {
        const studentHistory = attendance.filter(a => a.studentId === record.studentId);
        const total = studentHistory.length;
        const attended = studentHistory.filter(a => a.status === 'present').length;
        students[studIdx].totalClasses = total;
        students[studIdx].attendedClasses = attended;
        students[studIdx].attendancePercentage = total > 0 ? Math.round((attended / total) * 100) : 100;
      }
    });

    localStorage.setItem('acad_attendance', JSON.stringify(attendance));
    localStorage.setItem('acad_students', JSON.stringify(students));
    pubSub.publish('attendance_changed', attendance);
    return true;
  },

  // --- STUDY NOTES / STUDY MATERIALS ---
  getNotes: async (branch = null, semester = null) => {
    await mockDB.delay(100);
    // Reuse acad_notes as study materials
    const notes = JSON.parse(localStorage.getItem('acad_notes') || '[]');
    if (branch && semester) {
      return notes.filter(n => n.branch === branch && n.semester === semester).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (branch) {
      return notes.filter(n => n.branch === branch).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return notes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  uploadNote: async (facultyId, facultyName, branch, semester, subject, topic, description, fileName) => {
    await mockDB.delay(200);
    const notes = JSON.parse(localStorage.getItem('acad_notes') || '[]');
    const fileType = fileName.split('.').pop().toLowerCase();
    const newNote = {
      noteId: 'note-' + Math.random().toString(36).substr(2, 9),
      facultyId, facultyName, branch, semester, subject, topic, description,
      fileUrl: '#mock-download-url',
      fileName,
      fileType: ['pdf', 'docx', 'ppt', 'pptx'].includes(fileType) ? fileType : 'pdf',
      createdAt: new Date().toISOString()
    };
    notes.push(newNote);
    localStorage.setItem('acad_notes', JSON.stringify(notes));
    pubSub.publish('notes_changed', notes);
    return newNote;
  },

  // --- PLACEMENT DRIVE SERVICES ---
  getPlacementDrives: async () => {
    await mockDB.delay(150);
    return JSON.parse(localStorage.getItem('acad_drives') || '[]');
  },

  subscribePlacementDrives: (callback) => {
    mockDB.getPlacementDrives().then(callback);
    return pubSub.subscribe('drives_changed', () => {
      mockDB.getPlacementDrives().then(callback);
    });
  },

  createPlacementDrive: async (companyName, role, salaryPackage, eligibility, driveDate) => {
    await mockDB.delay(200);
    const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');
    const newDrive = {
      driveId: 'drive-' + Math.random().toString(36).substr(2, 9),
      companyName, role, salaryPackage, eligibility, driveDate,
      status: 'upcoming',
      applicants: [], selectedStudents: []
    };
    drives.push(newDrive);
    localStorage.setItem('acad_drives', JSON.stringify(drives));
    pubSub.publish('drives_changed', drives);
    return newDrive;
  },

  applyForDrive: async (driveId, studentId) => {
    await mockDB.delay(150);
    const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');
    const idx = drives.findIndex(d => d.driveId === driveId);
    if (idx === -1) throw new Error('Placement drive not found.');

    if (!drives[idx].applicants.includes(studentId)) {
      drives[idx].applicants.push(studentId);
      localStorage.setItem('acad_drives', JSON.stringify(drives));
      pubSub.publish('drives_changed', drives);
    }
    return drives[idx];
  },

  updatePlacementSelection: async (driveId, studentId, selectStatus) => {
    await mockDB.delay(150);
    const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');
    const idx = drives.findIndex(d => d.driveId === driveId);
    if (idx === -1) throw new Error('Drive not found.');

    const drive = drives[idx];
    if (selectStatus) {
      if (!drive.selectedStudents.includes(studentId)) drive.selectedStudents.push(studentId);
    } else {
      drive.selectedStudents = drive.selectedStudents.filter(id => id !== studentId);
    }

    drives[idx] = drive;
    localStorage.setItem('acad_drives', JSON.stringify(drives));
    pubSub.publish('drives_changed', drives);
    return drive;
  },

  // --- ACADEMIC ANNOUNCEMENTS ---
  getAnnouncements: async () => {
    await mockDB.delay(100);
    return JSON.parse(localStorage.getItem('acad_announcements') || '[]');
  },

  subscribeAnnouncements: (callback) => {
    mockDB.getAnnouncements().then(callback);
    return pubSub.subscribe('announcements_changed', () => {
      mockDB.getAnnouncements().then(callback);
    });
  },

  createAnnouncement: async (title, content, author) => {
    await mockDB.delay(150);
    const announcements = JSON.parse(localStorage.getItem('acad_announcements') || '[]');
    const newAnn = {
      id: 'ann-' + Math.random().toString(36).substr(2, 9),
      title, content, author,
      date: new Date().toISOString().split('T')[0]
    };
    announcements.unshift(newAnn);
    localStorage.setItem('acad_announcements', JSON.stringify(announcements));
    pubSub.publish('announcements_changed', announcements);
    return newAnn;
  },

  // --- SUBJECT ALLOCATIONS ---
  getSubjectAllocations: async (branch = null, facultyId = null) => {
    await mockDB.delay(100);
    const alloc = JSON.parse(localStorage.getItem('acad_subject_allocations') || '[]');
    if (branch) return alloc.filter(a => a.branch === branch);
    if (facultyId) return alloc.filter(a => a.facultyId === facultyId);
    return alloc;
  },

  allocateSubject: async (branch, semester, subjectName, facultyId, facultyName) => {
    await mockDB.delay(150);
    const allocs = JSON.parse(localStorage.getItem('acad_subject_allocations') || '[]');
    const newAlloc = {
      allocationId: 'alloc-' + Math.random().toString(36).substr(2, 9),
      branch, semester, subjectName, facultyId, facultyName
    };
    allocs.push(newAlloc);
    localStorage.setItem('acad_subject_allocations', JSON.stringify(allocs));
    return newAlloc;
  },

  // --- ASSIGNMENTS ---
  getAssignments: async (branch = null, semester = null) => {
    await mockDB.delay(100);
    const ass = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    if (branch && semester) {
      return ass.filter(a => a.branch === branch && a.semester === semester);
    }
    return ass;
  },

  createAssignment: async (title, description, branch, semester, subject, dueDate) => {
    await mockDB.delay(200);
    const ass = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const newAss = {
      assignmentId: 'assign-' + Math.random().toString(36).substr(2, 9),
      title, description, branch, semester, subject, dueDate,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    ass.push(newAss);
    localStorage.setItem('acad_assignments', JSON.stringify(ass));
    return newAss;
  },

  submitAssignment: async (assignmentId, studentId, studentName, rollNumber, fileUrl) => {
    await mockDB.delay(150);
    const ass = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const idx = ass.findIndex(a => a.assignmentId === assignmentId);
    if (idx === -1) throw new Error('Assignment not found.');

    const sub = {
      studentId, studentName, rollNumber, fileUrl,
      submittedAt: new Date().toISOString(),
      grade: 'Pending'
    };

    // Remove old submission if any
    ass[idx].submissions = ass[idx].submissions.filter(s => s.studentId !== studentId);
    ass[idx].submissions.push(sub);

    localStorage.setItem('acad_assignments', JSON.stringify(ass));
    return ass[idx];
  },

  gradeSubmission: async (assignmentId, studentId, grade) => {
    await mockDB.delay(150);
    const ass = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const idx = ass.findIndex(a => a.assignmentId === assignmentId);
    if (idx === -1) throw new Error('Assignment not found.');

    const subIdx = ass[idx].submissions.findIndex(s => s.studentId === studentId);
    if (subIdx !== -1) {
      ass[idx].submissions[subIdx].grade = grade;
    }

    localStorage.setItem('acad_assignments', JSON.stringify(ass));
    return ass[idx];
  },

  // --- INTERNAL MARKS ---
  getStudentMarks: async (studentId) => {
    await mockDB.delay(100);
    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]');
    return marks.filter(m => m.studentId === studentId);
  },

  getBranchMarks: async (branch, semester, subject) => {
    await mockDB.delay(100);
    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]');
    return marks.filter(m => m.branch === branch && m.semester === semester && m.subject === subject);
  },

  saveStudentMarks: async (studentId, studentName, rollNumber, branch, semester, subject, mid1, mid2, assignmentsVal) => {
    await mockDB.delay(150);
    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]');
    const total = Number(mid1) + Number(mid2) + Number(assignmentsVal);
    
    const idx = marks.findIndex(m => m.studentId === studentId && m.subject === subject);
    if (idx !== -1) {
      marks[idx] = { ...marks[idx], mid1: Number(mid1), mid2: Number(mid2), assignments: Number(assignmentsVal), total };
    } else {
      marks.push({
        markId: 'mark-' + Math.random().toString(36).substr(2, 9),
        studentId, studentName, rollNumber, branch, semester, subject,
        mid1: Number(mid1), mid2: Number(mid2), assignments: Number(assignmentsVal), total
      });
    }

    localStorage.setItem('acad_marks', JSON.stringify(marks));
    return true;
  },

  // --- ONLINE PAYMENT MODULE ---
  getFees: async (studentId) => {
    await mockDB.delay(100);
    const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
    return fees.filter(f => f.studentId === studentId);
  },

  payFee: async (invoiceId, paymentMethod) => {
    await mockDB.delay(200);
    const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
    const idx = fees.findIndex(f => f.invoiceId === invoiceId);
    if (idx === -1) throw new Error('Invoice not found.');
    
    fees[idx].status = 'paid';
    fees[idx].paidAt = new Date().toISOString();
    fees[idx].paymentMethod = paymentMethod;
    
    localStorage.setItem('acad_fees', JSON.stringify(fees));
    pubSub.publish('fees_changed', fees);
    return fees[idx];
  },

  // --- LIBRARY SERVICES (LIBRARIAN PORTAL REDESIGN) ---
  getBooks: async () => {
    await mockDB.delay(100);
    return JSON.parse(localStorage.getItem('acad_books') || '[]');
  },

  addBook: async (title, author, isbn, category, totalCopies) => {
    await mockDB.delay(150);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    if (books.find(b => b.isbn === isbn)) throw new Error('Book with this ISBN already exists.');

    const newBook = {
      bookId: 'book-' + Math.random().toString(36).substr(2, 9),
      title, author, isbn, category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies)
    };
    books.push(newBook);
    localStorage.setItem('acad_books', JSON.stringify(books));
    return newBook;
  },

  updateBook: async (bookId, updatedFields) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const idx = books.findIndex(b => b.bookId === bookId);
    if (idx === -1) throw new Error('Book not found.');

    const diff = Number(updatedFields.totalCopies) - books[idx].totalCopies;
    books[idx] = {
      ...books[idx],
      ...updatedFields,
      totalCopies: Number(updatedFields.totalCopies),
      availableCopies: Math.max(0, books[idx].availableCopies + diff)
    };

    localStorage.setItem('acad_books', JSON.stringify(books));
    return books[idx];
  },

  deleteBook: async (bookId) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const filtered = books.filter(b => b.bookId !== bookId);
    localStorage.setItem('acad_books', JSON.stringify(filtered));
    return true;
  },

  getIssuedBooks: async (studentId) => {
    await mockDB.delay(100);
    const issues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    // Apply auto fine calculation (₹10/day for student overdue)
    const updated = issues.map(issue => {
      if (issue.studentId === studentId && issue.status === 'issued' && !issue.returnDate) {
        const dueDate = new Date(issue.dueDate);
        const curDate = new Date(today);
        if (curDate > dueDate) {
          const diffTime = Math.abs(curDate - dueDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const fine = issue.borrowerType === 'faculty' ? 0 : diffDays * 10;
          if (issue.fine !== fine) {
            issue.fine = fine;
            changed = true;
          }
        }
      }
      return issue;
    });

    if (changed) localStorage.setItem('acad_issued_books', JSON.stringify(updated));
    return updated.filter(i => i.studentId === studentId);
  },

  getAllIssuedBooks: async () => {
    await mockDB.delay(100);
    return JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
  },

  requestBook: async (studentId, studentName, rollNumber, bookId) => {
    await mockDB.delay(150);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const bookIdx = books.findIndex(b => b.bookId === bookId);
    if (bookIdx === -1) throw new Error('Book not found.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No physical copies currently available.');

    const issues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const existing = issues.find(i => i.studentId === studentId && i.bookId === bookId && i.status !== 'returned');
    if (existing) throw new Error('You already have an active request or checkout for this book.');

    const newIssue = {
      transactionId: 'issue-' + Math.random().toString(36).substr(2, 9),
      bookId, bookTitle: books[bookIdx].title, author: books[bookIdx].author,
      studentId, studentName, rollNumber,
      borrowerType: 'student',
      issueDate: null, dueDate: null, returnDate: null,
      status: 'requested', fine: 0
    };

    issues.push(newIssue);
    localStorage.setItem('acad_issued_books', JSON.stringify(issues));
    pubSub.publish('library_changed', issues);
    return newIssue;
  },

  issueBookDirectly: async (borrowerId, borrowerName, rollNumber, borrowerType, isbn) => {
    await mockDB.delay(200);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const bookIdx = books.findIndex(b => b.isbn === isbn);
    if (bookIdx === -1) throw new Error('Book ISBN not found in catalog.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No physical copies currently available to issue.');

    const issues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const existing = issues.find(i => i.studentId === borrowerId && i.bookId === books[bookIdx].bookId && i.status !== 'returned');
    if (existing) throw new Error('User already has an active borrow record for this book.');

    books[bookIdx].availableCopies -= 1;
    localStorage.setItem('acad_books', JSON.stringify(books));

    const newIssue = {
      transactionId: 'issue-' + Math.random().toString(36).substr(2, 9),
      bookId: books[bookIdx].bookId,
      bookTitle: books[bookIdx].title,
      author: books[bookIdx].author,
      studentId: borrowerId,
      studentName: borrowerName,
      rollNumber,
      borrowerType,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      returnDate: null,
      status: 'issued',
      fine: 0
    };

    issues.push(newIssue);
    localStorage.setItem('acad_issued_books', JSON.stringify(issues));
    pubSub.publish('library_changed', issues);
    return newIssue;
  },

  approveBookRequest: async (transactionId) => {
    await mockDB.delay(150);
    const issues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const idx = issues.findIndex(i => i.transactionId === transactionId);
    if (idx === -1) throw new Error('Transaction not found.');

    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const bookIdx = books.findIndex(b => b.bookId === issues[idx].bookId);
    if (bookIdx === -1) throw new Error('Book not found.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No copies available.');

    books[bookIdx].availableCopies -= 1;
    localStorage.setItem('acad_books', JSON.stringify(books));

    issues[idx].status = 'issued';
    issues[idx].issueDate = new Date().toISOString().split('T')[0];
    issues[idx].dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    localStorage.setItem('acad_issued_books', JSON.stringify(issues));
    pubSub.publish('library_changed', issues);
    return issues[idx];
  },

  returnBook: async (transactionId) => {
    await mockDB.delay(150);
    const issues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const idx = issues.findIndex(i => i.transactionId === transactionId);
    if (idx === -1) throw new Error('Transaction not found.');

    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const bookIdx = books.findIndex(b => b.bookId === issues[idx].bookId);
    if (bookIdx !== -1) {
      books[bookIdx].availableCopies = Math.min(books[bookIdx].totalCopies, books[bookIdx].availableCopies + 1);
      localStorage.setItem('acad_books', JSON.stringify(books));
    }

    issues[idx].status = 'returned';
    issues[idx].returnDate = new Date().toISOString().split('T')[0];

    localStorage.setItem('acad_issued_books', JSON.stringify(issues));
    pubSub.publish('library_changed', issues);
    return issues[idx];
  },

  // --- WARD COUNSELLING MODULE SERVICES ---
  getCounsellingLogs: async (studentId) => {
    await mockDB.delay(100);
    const logs = JSON.parse(localStorage.getItem('acad_counseling_logs') || '[]');
    return logs.filter(l => l.studentId === studentId).sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  addCounsellingLog: async (studentId, studentName, counsellorId, counsellorName, topic, notes, actionItems) => {
    await mockDB.delay(150);
    const logs = JSON.parse(localStorage.getItem('acad_counseling_logs') || '[]');
    const newLog = {
      logId: 'log-' + Math.random().toString(36).substr(2, 9),
      studentId, studentName, counsellorId, counsellorName,
      date: new Date().toISOString().split('T')[0],
      topic, notes, actionItems
    };
    logs.push(newLog);
    localStorage.setItem('acad_counseling_logs', JSON.stringify(logs));
    return newLog;
  },

  getParentMeetings: async (counsellorId) => {
    await mockDB.delay(100);
    const meetings = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
    return meetings.filter(m => m.counsellorId === counsellorId);
  },

  addParentMeeting: async (counsellorId, studentId, studentName, parentName, notes) => {
    await mockDB.delay(150);
    const meetings = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
    const newMeeting = {
      meetingId: 'pm-' + Math.random().toString(36).substr(2, 9),
      counsellorId, studentId, studentName, parentName, notes,
      date: new Date().toISOString().split('T')[0]
    };
    meetings.push(newMeeting);
    localStorage.setItem('acad_parent_meetings', JSON.stringify(meetings));
    return newMeeting;
  },

  getCounsellingMeetings: async (role, id) => {
    await mockDB.delay(100);
    const meetings = JSON.parse(localStorage.getItem('acad_counseling_meetings') || '[]');
    if (role === 'student') return meetings.filter(m => m.studentId === id);
    if (role === 'counsellor' || role === 'faculty') return meetings.filter(m => m.counsellorId === id);
    return meetings;
  },

  requestCounsellingMeeting: async (studentId, studentName, counsellorId, counsellorName, title, date, time) => {
    await mockDB.delay(150);
    const meetings = JSON.parse(localStorage.getItem('acad_counseling_meetings') || '[]');
    const newMeeting = {
      meetingId: 'meet-' + Math.random().toString(36).substr(2, 9),
      studentId, studentName, counsellorId, counsellorName, title, date, time,
      status: 'pending'
    };
    meetings.push(newMeeting);
    localStorage.setItem('acad_counseling_meetings', JSON.stringify(meetings));
    return newMeeting;
  },

  respondToMeetingRequest: async (meetingId, action) => {
    await mockDB.delay(150);
    const meetings = JSON.parse(localStorage.getItem('acad_counseling_meetings') || '[]');
    const idx = meetings.findIndex(m => m.meetingId === meetingId);
    if (idx === -1) throw new Error('Meeting request not found.');
    
    meetings[idx].status = action;
    localStorage.setItem('acad_counseling_meetings', JSON.stringify(meetings));
    return meetings[idx];
  },

  // --- ANALYTICS FOR HOD & PRINCIPAL ---
  getHODAnalytics: async (department) => {
    await mockDB.delay(200);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
    const libraryIssues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');

    const deptStudents = users.filter(u => u.role === 'student' && u.department === department);
    const deptStudentIds = deptStudents.map(u => u.uid);
    const totalStudents = deptStudents.length;

    const deptFees = fees.filter(f => f.department === department);
    const totalDeptInvoiced = deptFees.reduce((acc, curr) => acc + curr.amount, 0);
    const totalDeptCollected = deptFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    
    const deptLibraryIssues = libraryIssues.filter(i => i.status === 'issued' && deptStudentIds.includes(i.studentId)).length;

    const deptProfiles = students.filter(s => deptStudentIds.includes(s.studentId));
    const avgAttendance = deptProfiles.length > 0
      ? Math.round(deptProfiles.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / deptProfiles.length)
      : 85;

    // Daily and weekly trends
    const dailyData = [
      { name: 'Mon', Present: Math.round(totalStudents * 0.90), Absent: Math.round(totalStudents * 0.10) },
      { name: 'Tue', Present: Math.round(totalStudents * 0.92), Absent: Math.round(totalStudents * 0.08) },
      { name: 'Wed', Present: Math.round(totalStudents * 0.88), Absent: Math.round(totalStudents * 0.12) },
      { name: 'Thu', Present: Math.round(totalStudents * 0.94), Absent: Math.round(totalStudents * 0.06) },
      { name: 'Fri', Present: Math.round(totalStudents * 0.89), Absent: Math.round(totalStudents * 0.11) }
    ];

    const weeklyData = [
      { name: 'Week 1', Attendance: 88 },
      { name: 'Week 2', Attendance: 90 },
      { name: 'Week 3', Attendance: 87 },
      { name: 'Week 4', Attendance: 92 }
    ];

    const monthlyData = [
      { name: 'Jan', Attendance: 89 },
      { name: 'Feb', Attendance: 91 },
      { name: 'Mar', Attendance: 88 },
      { name: 'Apr', Attendance: 92 },
      { name: 'May', Attendance: 90 },
      { name: 'Jun', Attendance: avgAttendance }
    ];

    return {
      totalStudents,
      presentToday: Math.round(totalStudents * 0.90),
      absentToday: Math.round(totalStudents * 0.10),
      attendancePercentage: avgAttendance,
      totalDeptInvoiced,
      totalDeptCollected,
      deptLibraryIssues,
      graphs: {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData
      }
    };
  },

  getPrincipalAnalytics: async () => {
    await mockDB.delay(200);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const leaves = JSON.parse(localStorage.getItem('acad_leaves') || '[]');
    const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
    const libraryIssues = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const drives = JSON.parse(localStorage.getItem('acad_drives') || '[]');

    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFaculty = users.filter(u => u.role === 'faculty').length;
    const totalLeaves = leaves.length;

    const totalInvoiced = fees.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCollected = fees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const activeCheckouts = libraryIssues.filter(i => i.status === 'issued').length;

    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / students.length)
      : 88;

    // Placed count
    const placedStudents = new Set();
    drives.forEach(d => d.selectedStudents.forEach(id => placedStudents.add(id)));

    const branches = ['CSE', 'CSE (AI & ML)', 'Civil', 'ECE', 'Mechanical'];
    const branchAttendance = branches.map(b => ({
      name: b,
      Attendance: Math.round(80 + Math.random() * 15)
    }));

    const deptComparison = branches.map(b => ({
      name: b,
      Students: users.filter(u => u.role === 'student' && u.department === b).length || Math.round(2 + Math.random() * 8)
    }));

    const monthlyTrends = [
      { name: 'Jan', 'CSE': 88, 'CSE (AI & ML)': 90, 'Civil': 82 },
      { name: 'Feb', 'CSE': 89, 'CSE (AI & ML)': 92, 'Civil': 84 },
      { name: 'Mar', 'CSE': 91, 'CSE (AI & ML)': 89, 'Civil': 81 },
      { name: 'Apr', 'CSE': 92, 'CSE (AI & ML)': 91, 'Civil': 85 }
    ];

    return {
      cards: {
        totalStudents,
        totalFaculty,
        totalLeaves,
        attendancePercentage: avgAttendance,
        totalInvoiced,
        totalCollected,
        activeCheckouts,
        placedCount: placedStudents.size
      },
      graphs: {
        branchAttendance,
        deptComparison,
        monthlyTrends
      }
    };
  },

  resetDatabase: () => {
    localStorage.removeItem('acad_users');
    localStorage.removeItem('acad_students');
    localStorage.removeItem('acad_faculty');
    localStorage.removeItem('acad_academic_year');
    localStorage.removeItem('acad_fee_structure');
    localStorage.removeItem('acad_fees');
    localStorage.removeItem('acad_books');
    localStorage.removeItem('acad_issued_books');
    localStorage.removeItem('acad_subject_allocations');
    localStorage.removeItem('acad_assignments');
    localStorage.removeItem('acad_marks');
    localStorage.removeItem('acad_attendance');
    localStorage.removeItem('acad_counseling_logs');
    localStorage.removeItem('acad_counseling_meetings');
    localStorage.removeItem('acad_parent_meetings');
    localStorage.removeItem('acad_drives');
    localStorage.removeItem('acad_announcements');
    localStorage.removeItem('acad_leaves');
    localStorage.removeItem('acad_current_user');
    initLocalStorage();
    window.location.reload();
  }
};

export { app, auth, db, storage, isFirebaseConfigured };
