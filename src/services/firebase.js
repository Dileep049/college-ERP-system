import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
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
  serverTimestamp
} from 'firebase/firestore';
import { uploadFileToCloudinary } from './cloudinary';

// Check if Firebase is configured in env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCDYHgGBygZDblXBzs8zp1JcpjhSGl7GsI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "college-erp-system-df02d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "college-erp-system-df02d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "college-erp-system-df02d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "446689800344",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:446689800344:web:b29c861c697da3bb7560ed"
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app, auth, db, storage, secondaryAuth;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = null;

    console.log("[Firebase] Project configured:", isFirebaseConfigured);
    console.log("[Cloudinary] Storage enabled via Cloudinary Unsigned Uploads");

    // Initialize secondary app for creating users without logging out current Admin session
    const secondaryApp = getApps().find(a => a.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
    secondaryAuth = getAuth(secondaryApp);
  } catch (error) {
    console.error("Firebase init error:", error);
  }
}

export const normalizeDepartment = (dept) => {
  if (!dept) return 'CSE';
  const str = String(dept).toUpperCase().trim();
  if (str === 'ALL' || str === 'ALL DEPARTMENTS' || str === 'ALL BRANCHES' || str === 'N/A') return 'All';
  if (str.includes('AI') || str.includes('ARTIFICIAL') || str.includes('MACHINE LEARNING')) return 'AI & ML';
  if (str.includes('COMPUTER SCIENCE') || str.includes('CS')) return 'CSE';
  if (str.includes('BCA') || str.includes('BACHELOR OF COMPUTER APPLICATIONS')) return 'BCA';
  if (str.includes('MCA') || str.includes('MASTER OF COMPUTER APPLICATIONS')) return 'MCA';
  if (str.includes('ELECTRONIC') || str.includes('ECE')) return 'ECE';
  if (str.includes('ELECTRICAL') || str.includes('EEE')) return 'EEE';
  if (str.includes('CIVIL')) return 'Civil';
  if (str.includes('MECHANICAL') || str.includes('MECH')) return 'Mechanical';
  return dept;
};

export const isDepartmentMatch = (studentDept, driveDepts) => {
  if (!driveDepts) return true;
  const target = normalizeDepartment(studentDept);
  
  if (Array.isArray(driveDepts)) {
    if (driveDepts.length === 0) return true;
    return driveDepts.some(d => {
      const normD = normalizeDepartment(d);
      return normD === 'All' || normD === target || d === 'All Departments' || d === 'All';
    });
  }
  
  const normD = normalizeDepartment(driveDepts);
  return normD === 'All' || normD === target || driveDepts === 'All Departments' || driveDepts === 'All';
};

// Helper to convert File to Data URL for offline/storage fallback
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



export const normalizeSemester = (sem) => {
  if (!sem) return 'All';
  const str = String(sem).toUpperCase().trim();
  if (str === 'ALL' || str === 'N/A' || str === '') return 'All';

  const romanMap = { 'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6', 'VII': '7', 'VIII': '8' };
  if (romanMap[str]) return `Semester ${romanMap[str]}`;

  const match = str.match(/\d+/);
  if (match) {
    return `Semester ${match[0]}`;
  }
  return str;
};

export const normalizeSection = (sec) => {
  if (!sec) return 'All';
  const str = String(sec).toUpperCase().trim();
  if (str === 'ALL' || str === 'ALL SECTIONS' || str === 'N/A' || str === '') return 'All';
  const match = str.match(/[A-Z]/);
  if (match && str.length <= 10) {
    return `Section ${match[0]}`;
  }
  return str;
};

// ----------------------------------------------------
// LOCAL STORAGE SEED DATA & BACKEND FALLBACK
// ----------------------------------------------------

const SIMULATION_DELAY = 100; // ms

import { COLLEGE_DEPARTMENTS } from '../utils/constants';

export { COLLEGE_DEPARTMENTS };
export const KBN_BRANCHES = COLLEGE_DEPARTMENTS;

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

export const getSubjectsForBranch = (branch) => {
  return BRANCH_SUBJECT_MAP[branch] || [];
};

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

const DEFAULT_USERS = [
  { uid: 'admin-1', email: 'admin@kbn.edu', fullName: 'System Administrator', role: 'admin', department: 'N/A' },
  { uid: 'principal-1', email: 'principal@kbn.edu', fullName: 'Dr. Arthur Pendelton', role: 'principal', department: 'All', employeeId: 'PRIN-01' },
  { uid: 'hod-cse', email: 'hod.cse@kbn.edu', fullName: 'Dr. Alan Turing', role: 'hod', department: 'B.Sc. Computer Science (CS)', employeeId: 'HOD-CSE-01' },
  { uid: 'hod-aiml', email: 'hod.aiml@kbn.edu', fullName: 'Dr. Sarah Connor', role: 'hod', department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)', employeeId: 'HOD-AIML-01' },
  { uid: 'fac-1', email: 'faculty.cse@kbn.edu', fullName: 'Prof. Charles Xavier', role: 'faculty', designation: 'Senior Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-01', assignedBranches: KBN_BRANCHES, subjects: ['Data Structures', 'Operating Systems', 'Neural Networks', 'Machine Learning'] },
  { uid: 'fac-2', email: 'ravi.kumar@kbn.edu', fullName: 'Prof. Ravi Kumar', role: 'faculty', designation: 'Associate Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-02', assignedBranches: KBN_BRANCHES, subjects: ['Machine Learning', 'Python Programming'], mobile: '9876543211' },
  { uid: 'fac-3', email: 'priya.sharma@kbn.edu', fullName: 'Prof. Priya Sharma', role: 'faculty', designation: 'Assistant Professor', department: 'B.Sc. Computer Science (CS)', employeeId: 'FAC-CSE-03', assignedBranches: KBN_BRANCHES, subjects: ['Database Management Systems', 'Java Programming'], mobile: '9876543212' },
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

export const SEEDED_STUDENTS = RAW_UPLOADED_STUDENTS.map((st, idx) => {
  const fullDept = 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
  return {
    uid: `stud-${st.rollNumber}`,
    studentId: `stud-${st.rollNumber}`,
    rollNumber: st.rollNumber,
    studentName: st.studentName,
    fullName: st.studentName,
    department: fullDept,
    branch: fullDept,
    course: 'B.Sc',
    semester: 'Semester 6',
    section: 'Section A',
    collegeEmail: `${st.rollNumber}@kbn.edu`,
    email: `${st.rollNumber}@kbn.edu`,
    phoneNumber: `98765${st.rollNumber}`,
    accountStatus: 'Active',
    status: 'Active',
    role: 'student',
    profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.rollNumber}`,
    attendancePercentage: 82,
    attendance: 82,
    internalMarks: 38,
    submissions: '100%',
    academicStatus: 'Good',
    cgpa: (7.2 + (idx % 25) * 0.1).toFixed(1),
    backlogs: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
});

const DEFAULT_ACADEMIC_CALENDAR = [
  { id: 'cal-1', year: '2026-2027', semester: 'Semester 6', title: 'National Seminar on Quantum Computing', type: 'seminar', startDate: '2026-07-15', endDate: '2026-07-16', description: 'National level conference with research presentations.' },
  { id: 'cal-2', year: '2026-2027', semester: 'Semester 6', title: 'Independence Day', type: 'holiday', subType: 'government', startDate: '2026-08-15', endDate: '2026-08-15', description: 'National holiday.' },
  { id: 'cal-3', year: '2026-2027', semester: 'Semester 6', title: 'Mid-Term 1 Examinations', type: 'exam', subType: 'mid', startDate: '2026-09-05', endDate: '2026-09-10', description: 'First mid-semester examinations.' }
];

const DEFAULT_TIMETABLES = [
  { id: 'tt-cse-s6-a', branch: 'CSE', semester: 'Semester 6', section: 'A', timetable: [
    { day: 'Monday', periodNumber: 1, timeSlot: '09:00 - 10:00', subject: 'Neural Networks', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier', classroom: 'Room 301' },
    { day: 'Monday', periodNumber: 2, timeSlot: '10:00 - 11:00', subject: 'Operating Systems', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier', classroom: 'Room 301' }
  ]}
];

const DEFAULT_CLASSROOMS = [
  { id: 'room-1', roomNumber: 'Room 301', building: 'Block A', capacity: 60 },
  { id: 'room-2', roomNumber: 'Room 302', building: 'Block A', capacity: 60 }
];

const DEFAULT_ASSIGNMENTS = [
  { id: 'assign-1', title: 'Operating Systems - Deadlock', description: 'Write an essay on Banker\'s algorithm.', subject: 'Operating Systems', branch: 'CSE', semester: 'Semester 6', dueDate: '2026-07-20', fileUrl: '', fileName: '', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier', createdAt: new Date().toISOString() }
];

const DEFAULT_SUBMISSIONS = [];
const DEFAULT_MARKS = [];
const DEFAULT_BACKUP_LOGS = [];

const DEFAULT_FEES = [
  { id: 'fee-1', invoiceId: 'fee-1', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', feeType: 'Tuition Fee', amount: 45000, status: 'paid', date: '2026-02-15', paidAt: '2026-02-15T10:00:00.000Z', paymentMethod: 'UPI', semester: 'Semester 6' },
  { id: 'fee-2', invoiceId: 'fee-2', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', feeType: 'Library & Exam Fee', amount: 5000, status: 'unpaid', date: '2026-06-10', dueDate: '2026-06-10', semester: 'Semester 6' }
];



const DEFAULT_PLACEMENT_DRIVES = [
  {
    id: 'drive-101',
    companyName: 'Google Inc.',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    jobRole: 'Associate Software Engineer',
    jobType: 'Full-Time',
    location: 'Bangalore / Hyderabad',
    package: '18.5 LPA',
    minCgpa: 7.5,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'ECE', 'AI & ML', 'MCA'],
    eligibleSemester: 'Semester 8',
    passingYear: '2026',
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'System Design'],
    startDate: '2026-08-01',
    deadline: '2026-08-25',
    driveDate: '2026-08-28',
    selectionProcess: 'Online Test → Technical Interview 1 → Technical Interview 2 → HR Round',
    venue: 'Campus Placement Cell Auditorium 1',
    registrationLink: 'https://careers.google.com',
    description: 'Recruitment for Associate Software Engineers to build scalable cloud & web applications.',
    status: 'Published',
    selectedStudents: ['stud-cse', 'stud-cse-1']
  },
  {
    id: 'drive-102',
    companyName: 'Microsoft Corporation',
    companyLogo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=100&auto=format&fit=crop&q=80',
    jobRole: 'Cloud Solution Engineer Intern',
    jobType: 'Full-Time + Internship',
    location: 'Hyderabad',
    package: '14.0 LPA',
    minCgpa: 7.0,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'ECE', 'EEE', 'AI & ML'],
    eligibleSemester: 'Semester 8',
    passingYear: '2026',
    requiredSkills: ['Azure Cloud', 'Python', 'Networking', 'OS Architecture'],
    startDate: '2026-08-05',
    deadline: '2026-08-22',
    driveDate: '2026-08-30',
    selectionProcess: 'Coding Assessment → Technical Round → HR Round',
    venue: 'Virtual Microsoft Teams',
    registrationLink: 'https://careers.microsoft.com',
    description: 'Azure Cloud Engineering internship and full-time conversion program.',
    status: 'Published',
    selectedStudents: []
  },
  {
    id: 'drive-103',
    companyName: 'TCS Digital',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80',
    jobRole: 'Systems Engineer - Digital Innovation',
    jobType: 'Full-Time',
    location: 'Chennai / Pune',
    package: '7.5 LPA',
    minCgpa: 6.5,
    maxBacklogs: 1,
    eligibleBranches: ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MCA', 'BCA'],
    eligibleSemester: 'Semester 8',
    passingYear: '2026',
    requiredSkills: ['SQL', 'Java/Python', 'Web Basics'],
    startDate: '2026-07-15',
    deadline: '2026-08-18',
    driveDate: '2026-08-20',
    selectionProcess: 'TCS NQT Test → Tech Round → HR Round',
    venue: 'TCS iON Center',
    description: 'TCS Digital recruitment drive across all engineering disciplines.',
    status: 'Published',
    selectedStudents: ['stud-cse-2']
  },
  {
    id: 'drive-104',
    companyName: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=80',
    jobRole: 'Applied AI Researcher',
    jobType: 'Full-Time',
    location: 'Bangalore',
    package: '28.0 LPA',
    minCgpa: 8.5,
    maxBacklogs: 0,
    eligibleBranches: ['CSE', 'AI & ML'],
    eligibleSemester: 'Semester 8',
    passingYear: '2026',
    requiredSkills: ['PyTorch', 'TensorFlow', 'LLMs', 'NLP'],
    startDate: '2026-08-10',
    deadline: '2026-08-30',
    driveDate: '2026-09-05',
    selectionProcess: 'ML Assessment → Tech Rounds → Bar Raiser',
    venue: 'Amazon Development Center',
    description: 'Applied AI team building generative AI solutions.',
    status: 'Published',
    selectedStudents: []
  }
];

const DEFAULT_PLACEMENT_APPLICATIONS = [
  {
    id: 'app-101',
    driveId: 'drive-101',
    studentId: 'stud-cse',
    studentName: 'John Doe',
    rollNumber: 'CSE-2023-001',
    branch: 'CSE',
    section: 'A',
    cgpa: 8.8,
    backlogs: 0,
    skills: 'Java, React, Data Structures',
    resumeUrl: '#mock-resume',
    appliedDate: '2026-08-08',
    companyName: 'Google Inc.',
    jobRole: 'Associate Software Engineer',
    package: '18.5 LPA',
    status: 'Shortlisted'
  },
  {
    id: 'app-102',
    driveId: 'drive-102',
    studentId: 'stud-cse',
    studentName: 'John Doe',
    rollNumber: 'CSE-2023-001',
    branch: 'CSE',
    section: 'A',
    cgpa: 8.8,
    backlogs: 0,
    skills: 'Python, Azure, Networking',
    resumeUrl: '#mock-resume',
    appliedDate: '2026-08-10',
    companyName: 'Microsoft Corporation',
    jobRole: 'Cloud Solution Engineer Intern',
    package: '14.0 LPA',
    status: 'Interview Scheduled'
  },
  {
    id: 'app-103',
    driveId: 'drive-103',
    studentId: 'stud-cse-2',
    studentName: 'Avala Anand Babu',
    rollNumber: '245901',
    branch: 'AI & ML',
    section: 'EM',
    cgpa: 6.8,
    backlogs: 1,
    skills: 'SQL, Python',
    resumeUrl: '#mock-resume',
    appliedDate: '2026-08-11',
    companyName: 'TCS Digital',
    jobRole: 'Systems Engineer - Digital Innovation',
    package: '7.5 LPA',
    status: 'Selected'
  }
];

const DEFAULT_PLACEMENT_COMPANIES = [
  { id: 'comp-1', companyName: 'Google Inc.', logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80', industry: 'Information Technology & AI', website: 'https://google.com', location: 'Mountain View, CA / Bangalore', contactPerson: 'Sarah Jenkins (University Recruiter)', contactEmail: 'campus-hiring@google.com', description: 'Global tech leader in Search, Cloud Computing, and Artificial Intelligence.', totalSelections: 18 },
  { id: 'comp-2', companyName: 'Microsoft Corporation', logo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=100&auto=format&fit=crop&q=80', industry: 'Cloud & Software Systems', website: 'https://microsoft.com', location: 'Redmond, WA / Hyderabad', contactPerson: 'David Miller (Talent Acquisition)', contactEmail: 'university@microsoft.com', description: 'Empowering every person and organization on the planet to achieve more.', totalSelections: 24 },
  { id: 'comp-3', companyName: 'Amazon', logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=80', industry: 'E-Commerce & AWS Cloud', website: 'https://amazon.jobs', location: 'Seattle, WA / Bangalore', contactPerson: 'Priya Sharma (AWS University Hiring)', contactEmail: 'aws-campus@amazon.com', description: 'Earth\'s most customer-centric company and pioneer in AWS cloud solutions.', totalSelections: 12 },
  { id: 'comp-4', companyName: 'TCS Digital', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80', industry: 'IT Consulting & Services', website: 'https://tcs.com', location: 'Mumbai / Pan-India', contactPerson: 'Rajesh Varma (Campus Lead)', contactEmail: 'campus.south@tcs.com', description: 'Leading global IT services, consulting, and business solutions organization.', totalSelections: 65 }
];

const DEFAULT_PLACEMENT_INTERVIEWS = [
  { id: 'int-1', applicationId: 'app-102', studentId: 'stud-cse', studentName: 'John Doe', companyName: 'Microsoft Corporation', jobRole: 'Cloud Solution Engineer Intern', round: 'Technical Interview', date: '2026-08-28', time: '10:30 AM', venue: 'Virtual Teams Link', meetingLink: 'https://teams.microsoft.com/interview-john-doe', instructions: 'Prepare Azure networking fundamentals and project architecture diagram.' }
];

const DEFAULT_PLACEMENT_TRAININGS = [
  { id: 'tr-1', title: 'Advanced Data Structures & Algorithms Bootcamp', type: 'Coding Test Prep', date: '2026-08-18', duration: '3 Days', venue: 'Computer Lab 4 & Hybrid Teams', link: 'https://teams.microsoft.com/dsa-bootcamp', trainer: 'Dr. Alan Turing & Tech Lead', targetBranches: 'CSE, ECE, AI & ML, MCA', status: 'Upcoming' },
  { id: 'tr-2', title: 'Aptitude & Quantitative Problem Solving Masterclass', type: 'Aptitude Test', date: '2026-08-20', duration: '1 Day', venue: 'Main Auditorium', link: '', trainer: 'T.I.M.E. Senior Aptitude Faculty', targetBranches: 'All Disciplines', status: 'Upcoming' },
  { id: 'tr-3', title: 'Corporate GD & Behavioral HR Mock Interview Workshop', type: 'Mock Interview', date: '2026-08-22', duration: '2 Days', venue: 'Placement Cell Seminar Hall', link: '', trainer: 'Corporate Soft Skills Trainer', targetBranches: 'Final Year Students', status: 'Upcoming' }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 'ann-1', title: 'Midterm Exam Schedule', content: 'The first internal mid-term examinations will commence from September 5th, 2026. Detailed schedules will be shared by departments.', author: 'Academic Cell', createdAt: new Date().toISOString() },
  { id: 'ann-2', title: 'Placement Drive Registration', content: 'Registration for Microsoft Cloud Engineer Intern drive closes on July 15th, 2026. Please complete registrations on the placement portal.', author: 'Placement Officer', createdAt: new Date().toISOString() }
];

const DEFAULT_LEAVE_REQUESTS = [
  { leaveId: 'leave-1', studentId: 'stud-cse', studentName: 'John Doe', applicantRole: 'student', department: 'CSE', semester: 'Semester 6', section: 'A', reason: 'Fever and cold', startDate: '2026-07-10', endDate: '2026-07-12', status: 'approved', approvedBy: 'coun-cse', remarks: 'Granted leave.' }
];

const DEFAULT_ALLOCATIONS = [
  { allocationId: 'alloc-1', branch: 'CSE', semester: 'Semester 6', subjectName: 'Neural Networks', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier' },
  { allocationId: 'alloc-2', branch: 'CSE', semester: 'Semester 6', subjectName: 'Operating Systems', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier' },
  { allocationId: 'alloc-3', branch: 'B.Sc Artificial Intelligence', semester: 'Semester 3', subjectName: 'Python Programming', facultyId: 'fac-1', facultyName: 'Prof. Charles Xavier' }
];

const DEFAULT_BOOKS = [
  { bookId: 'book-1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'CSE', totalCopies: 5, availableCopies: 5 },
  { bookId: 'book-2', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'CSE', totalCopies: 4, availableCopies: 4 },
  { bookId: 'book-3', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', isbn: '978-1118063330', category: 'CSE', totalCopies: 3, availableCopies: 2 }
];

const DEFAULT_ISSUED_BOOKS = [
  { transactionId: 'trans-1', studentId: 'stud-cse', studentName: 'John Doe', rollNumber: 'CSE-2023-001', bookId: 'book-3', bookTitle: 'Operating System Concepts', issueDate: '2026-07-01', dueDate: '2026-07-15', returnDate: '', fine: 0, status: 'issued' }
];


export const AIML_STUDENT_ROSTER = [
  { rollNumber: "245901", studentName: "AVALA ANAND BABU", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245902", studentName: "DASIKA SARATH KUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245903", studentName: "SHAIK NAADIA TASLEEM", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245904", studentName: "CHIKATI YUGALA SRI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245905", studentName: "ORSU BRAHMAIAH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245906", studentName: "GUNDALA VENKAT", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245907", studentName: "PATAN MASTAN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245908", studentName: "PATNALA VISWA TEJA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245910", studentName: "KUPPILA BALAJIREDDY", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245911", studentName: "KAMBAMPATI NEELIMA SAI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245912", studentName: "SHAIK ZAKEER BASHA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245913", studentName: "PALLI VIKRAMADITHYA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245914", studentName: "NATHAM MANOJ KUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245915", studentName: "PATTAN AMEERKHAN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245916", studentName: "PYDIPOTHU NIVYA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245917", studentName: "GUTI KRISHNA SWAMY", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245918", studentName: "KARRA THARUN KOMMURU", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245919", studentName: "PAVANKUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245920", studentName: "KOPPURAVURI NAVYA CHARITHA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245922", studentName: "KONA BHAVANI BHARGAVA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245923", studentName: "RAVINUTHALA NAGA SRIKARI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245924", studentName: "MADDULA NAMITHA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245925", studentName: "YENDURI KUSHWANTH SAI TARUN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245926", studentName: "PANDITHARADHYULA SRI DURGA VA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245927", studentName: "PULIPATI TULASIPRIYA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245928", studentName: "VIJJI RAJESH GANDEPASLI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245929", studentName: "CHANDRA SAI CHAITH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245931", studentName: "GUDELA SURYA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245933", studentName: "KOTI BHAVANA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245934", studentName: "ONGOLE HAMSIKA LAKSHMI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245935", studentName: "DASARI AJAY BABU THANUKU", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245936", studentName: "BHASKAR TEJA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245938", studentName: "ZABI ARSALAAN KHAN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245939", studentName: "NANDAM YASWANTH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245940", studentName: "JUPALLI SEKHAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245942", studentName: "MURKIPUTTI GABRIEL SAMUEL", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245943", studentName: "MUDRABOINA VAMSI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245944", studentName: "M KALEB VIKAS", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245945", studentName: "SK ABDUL REHAMAN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245946", studentName: "N LAKSHMI BALAJI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245948", studentName: "KANDUKURI MANOJ KUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245949", studentName: "CHINTALA DILEEP KUMAR KAVITAPU", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245950", studentName: "DHANUSH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245951", studentName: "NANNAM KHATWANG", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245952", studentName: "NAKKA ANAND KUMAR", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245953", studentName: "J KUMAR SWAMYREDDY", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245954", studentName: "T TEJASWINI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245955", studentName: "SHAIK AZEEM MOHIDDIN", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245956", studentName: "MUCHINAPALLI RUPAK VENKATA SAI", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245957", studentName: "V VENKATA NAGA ADITHYA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245958", studentName: "T VENKATA SURENDRA", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245959", studentName: "L YASWANTH VENKAT", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245960", studentName: "VIKRAM AKASH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245961", studentName: "VADUGU DHANUSH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" },
  { rollNumber: "245962", studentName: "PARASANABOINA MUKESH", department: "AI & ML", course: "B.Sc", semester: "Semester 2", section: "EM", branch: "AI & ML", status: "Active" }
];

const initLocalStorage = () => {
  let existingUsers = JSON.parse(localStorage.getItem('acad_users') || '[]');
  let updatedUsers = false;
  DEFAULT_USERS.forEach(defUser => {
    if (!existingUsers.some(u => u.email?.toLowerCase() === defUser.email.toLowerCase())) {
      existingUsers.push(defUser);
      updatedUsers = true;
    }
  });
  if (!localStorage.getItem('acad_users') || updatedUsers) {
    localStorage.setItem('acad_users', JSON.stringify(existingUsers));
  }
  if (!localStorage.getItem('acad_students')) {
    const stds = AIML_STUDENT_ROSTER.map(s => ({
      uid: `stud-${s.rollNumber}`,
      studentId: `stud-${s.rollNumber}`,
      rollNumber: s.rollNumber,
      studentName: s.studentName,
      fullName: s.studentName,
      department: s.department,
      course: s.course,
      semester: s.semester,
      section: s.section,
      branch: s.branch,
      status: s.status,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem('acad_students', JSON.stringify(stds));
  }
  if (!localStorage.getItem('acad_parents')) {
    const prnts = [
      { uid: 'parent-1', fullName: 'Richard Doe', email: 'parent@kbn.edu', mobile: '9988776654', childUid: 'stud-245901', childRollNumber: '245901' }
    ];
    localStorage.setItem('acad_parents', JSON.stringify(prnts));
  }
  if (!localStorage.getItem('acad_fees')) localStorage.setItem('acad_fees', JSON.stringify(DEFAULT_FEES));
  if (!localStorage.getItem('acad_placement_drives')) localStorage.setItem('acad_placement_drives', JSON.stringify(DEFAULT_PLACEMENT_DRIVES));
  if (!localStorage.getItem('acad_placement_applications')) localStorage.setItem('acad_placement_applications', JSON.stringify(DEFAULT_PLACEMENT_APPLICATIONS));
  if (!localStorage.getItem('acad_placement_companies')) localStorage.setItem('acad_placement_companies', JSON.stringify(DEFAULT_PLACEMENT_COMPANIES));
  if (!localStorage.getItem('acad_placement_interviews')) localStorage.setItem('acad_placement_interviews', JSON.stringify(DEFAULT_PLACEMENT_INTERVIEWS));
  if (!localStorage.getItem('acad_placement_trainings')) localStorage.setItem('acad_placement_trainings', JSON.stringify(DEFAULT_PLACEMENT_TRAININGS));
  if (!localStorage.getItem('acad_announcements')) localStorage.setItem('acad_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  if (!localStorage.getItem('acad_leave_requests')) localStorage.setItem('acad_leave_requests', JSON.stringify(DEFAULT_LEAVE_REQUESTS));
  if (!localStorage.getItem('acad_allocations')) localStorage.setItem('acad_allocations', JSON.stringify(DEFAULT_ALLOCATIONS));
  if (!localStorage.getItem('acad_calendar')) localStorage.setItem('acad_calendar', JSON.stringify(DEFAULT_ACADEMIC_CALENDAR));
  if (!localStorage.getItem('acad_timetables')) localStorage.setItem('acad_timetables', JSON.stringify(DEFAULT_TIMETABLES));
  if (!localStorage.getItem('acad_classrooms')) localStorage.setItem('acad_classrooms', JSON.stringify(DEFAULT_CLASSROOMS));
  if (!localStorage.getItem('acad_assignments')) localStorage.setItem('acad_assignments', JSON.stringify(DEFAULT_ASSIGNMENTS));
  if (!localStorage.getItem('acad_submissions')) localStorage.setItem('acad_submissions', JSON.stringify(DEFAULT_SUBMISSIONS));
  if (!localStorage.getItem('acad_marks')) localStorage.setItem('acad_marks', JSON.stringify(DEFAULT_MARKS));
  if (!localStorage.getItem('acad_backup_logs')) localStorage.setItem('acad_backup_logs', JSON.stringify(DEFAULT_BACKUP_LOGS));
  if (!localStorage.getItem('acad_attendance')) localStorage.setItem('acad_attendance', JSON.stringify([]));
  if (!localStorage.getItem('acad_notifications')) localStorage.setItem('acad_notifications', JSON.stringify([]));
  if (!localStorage.getItem('acad_internal_marks')) localStorage.setItem('acad_internal_marks', JSON.stringify([]));
  if (!localStorage.getItem('acad_attendance_edit_requests')) localStorage.setItem('acad_attendance_edit_requests', JSON.stringify([]));
  if (!localStorage.getItem('acad_audit_logs')) localStorage.setItem('acad_audit_logs', JSON.stringify([]));
  if (!localStorage.getItem('acad_counselling_meetings')) localStorage.setItem('acad_counselling_meetings', JSON.stringify([]));
  if (!localStorage.getItem('acad_counselling_logs')) localStorage.setItem('acad_counselling_logs', JSON.stringify([]));
  if (!localStorage.getItem('acad_parent_meetings')) localStorage.setItem('acad_parent_meetings', JSON.stringify([]));
  if (!localStorage.getItem('acad_books')) localStorage.setItem('acad_books', JSON.stringify(DEFAULT_BOOKS));
  if (!localStorage.getItem('acad_issued_books')) localStorage.setItem('acad_issued_books', JSON.stringify(DEFAULT_ISSUED_BOOKS));
  if (!localStorage.getItem('acad_course_registrations')) localStorage.setItem('acad_course_registrations', JSON.stringify([]));
  if (!localStorage.getItem('acad_hostel_transport')) localStorage.setItem('acad_hostel_transport', JSON.stringify([]));
  if (!localStorage.getItem('acad_document_requests')) localStorage.setItem('acad_document_requests', JSON.stringify([]));
  if (!localStorage.getItem('acad_grievances')) localStorage.setItem('acad_grievances', JSON.stringify([]));
};

initLocalStorage();

export const mockDB = {
  delay: (ms = SIMULATION_DELAY) => new Promise(resolve => setTimeout(resolve, ms)),

  batchUploadStudents: async (customRoster = null) => {
    await mockDB.delay(200);
    const targetRoster = customRoster || AIML_STUDENT_ROSTER;
    let count = 0;

    if (isFirebaseConfigured && db) {
      const chunkSize = 400;
      for (let i = 0; i < targetRoster.length; i += chunkSize) {
        const chunk = targetRoster.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        for (const s of chunk) {
          const docId = String(s.rollNumber).trim();
          const docRef = doc(db, 'students', docId);
          const payload = {
            rollNumber: docId,
            studentName: s.studentName || s.fullName || 'Student',
            department: s.department || 'AI & ML',
            course: s.course || 'B.Sc',
            semester: s.semester || 'Semester 2',
            section: s.section || 'EM',
            branch: s.branch || s.department || 'AI & ML',
            status: s.status || 'Active'
          };
          batch.set(docRef, payload, { merge: true });
          count++;
        }
        await batch.commit();
      }
    }

    const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const usersList = JSON.parse(localStorage.getItem('acad_users') || '[]');

    for (const s of targetRoster) {
      const docId = String(s.rollNumber).trim();
      const uid = `stud-${docId}`;
      const payload = {
        uid,
        studentId: uid,
        rollNumber: docId,
        studentName: s.studentName || s.fullName || 'Student',
        fullName: s.studentName || s.fullName || 'Student',
        department: s.department || 'AI & ML',
        course: s.course || 'B.Sc',
        semester: s.semester || 'Semester 2',
        section: s.section || 'EM',
        branch: s.branch || s.department || 'AI & ML',
        status: s.status || 'Active',
        role: 'student'
      };

      const sIdx = studentsList.findIndex(item => item.rollNumber === docId || item.uid === uid);
      if (sIdx !== -1) studentsList[sIdx] = { ...studentsList[sIdx], ...payload };
      else studentsList.push(payload);

      const uIdx = usersList.findIndex(item => item.rollNumber === docId || item.uid === uid);
      if (uIdx !== -1) usersList[uIdx] = { ...usersList[uIdx], ...payload };
      else usersList.push(payload);

      if (!isFirebaseConfigured || !db) count++;
    }

    localStorage.setItem('acad_students', JSON.stringify(studentsList));
    localStorage.setItem('acad_users', JSON.stringify(usersList));

    return count;
  },

  batchUploadAIMLStudents: async () => {
    return await mockDB.batchUploadStudents(AIML_STUDENT_ROSTER);
  },
  delay: (ms = SIMULATION_DELAY) => new Promise(resolve => setTimeout(resolve, ms)),

  // --- WARD COUNSELLOR ASSIGNMENT & SCOPING SERVICES ---
  assignWardCounsellor: async (studentId, counsellorId, counsellorName) => {
    await mockDB.delay(100);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === studentId);
    if (idx !== -1) {
      users[idx].wardCounsellorId = counsellorId;
      users[idx].wardCounsellorName = counsellorName;
      localStorage.setItem('acad_users', JSON.stringify(users));
    }

    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const sIdx = students.findIndex(s => s.studentId === studentId || s.uid === studentId);
    if (sIdx !== -1) {
      students[sIdx].wardCounsellorId = counsellorId;
      students[sIdx].wardCounsellorName = counsellorName;
      localStorage.setItem('acad_students', JSON.stringify(students));
    }
    return true;
  },

  getWardsForCounsellor: async (counsellorId, department) => {
    await mockDB.delay(100);
    const activeAssign = await mockDB.getFacultyWardAssignment(counsellorId);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = users.filter(u => u.role === 'student');

    if (activeAssign) {
      const aDept = (activeAssign.department || '').toUpperCase().trim();
      const aSem = (activeAssign.semester || '').trim().toLowerCase();
      const aSec = (activeAssign.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
      const aAY = (activeAssign.academicYear || '').trim();

      return students.filter(s => {
        const sDept = (s.department || s.branch || '').toUpperCase().trim();
        const sSem = (s.semester || '').trim().toLowerCase();
        const sSec = (s.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
        const sAY = (s.academicYear || '').trim();

        const matchDept = !sDept || aDept === sDept || isDepartmentMatch(aDept, sDept);
        const matchSem = !sSem || !aSem || aSem === sSem;
        const matchSec = !sSec || !aSec || aSec === sSec;
        const matchAY = !sAY || !aAY || aAY === sAY;

        return matchDept && matchSem && matchSec && matchAY;
      });
    }

    if (department) {
      return students.filter(u => u.department === department || isDepartmentMatch(u.department, department));
    }
    return students;
  },

  // --- PRINCIPAL GLOBAL ACADEMIC AUDIT SERVICES ---
  getPrincipalGlobalAcademicAudit: async (branch = 'All', semester = 'All') => {
    await mockDB.delay(100);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    let students = users.filter(u => u.role === 'student');
    if (branch !== 'All') students = students.filter(s => s.department === branch);
    if (semester !== 'All') students = students.filter(s => s.semester === semester);

    const studentStats = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const allAttendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const allMarks = JSON.parse(localStorage.getItem('acad_marks') || '[]');

    return students.map(s => {
      const stat = studentStats.find(st => st.studentId === s.uid || st.uid === s.uid) || {};
      const sAtt = allAttendance.filter(a => a.studentId === s.uid);
      const totalAtt = sAtt.length;
      const presentAtt = sAtt.filter(a => a.status === 'present').length;
      const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : (stat.attendancePercentage || 84);
      
      const sMarks = allMarks.filter(m => m.studentId === s.uid);
      const avgScore = sMarks.length > 0 ? Math.round(sMarks.reduce((acc, curr) => acc + (curr.total || 0), 0) / sMarks.length) : 39;

      return {
        uid: s.uid,
        rollNumber: s.rollNumber || 'CSE-S4-001',
        fullName: s.fullName,
        department: s.department || 'CSE',
        semester: s.semester || 'Semester 4',
        section: s.section || 'A',
        attendancePercentage: attPct,
        totalClasses: totalAtt || 40,
        attendedClasses: presentAtt || 34,
        cgpa: stat.cgpa || 8.4,
        avgMarks: avgScore
      };
    });
  },

  // --- AUTH ---
  login: async (emailOrIdentifier, password) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Login is taking too long. Please check your internet connection and try again."));
      }, 15000);
    });

    const loginPromise = (async () => {
      await mockDB.delay(100);
      const queryStr = (emailOrIdentifier || '').trim().toLowerCase();

      // 1. If Firebase Auth is configured and input is an email, attempt signInWithEmailAndPassword
      let fbUser = null;
      let fbError = null;

      if (isFirebaseConfigured && auth && queryStr.includes('@')) {
        try {
          const cred = await signInWithEmailAndPassword(auth, queryStr, password);
          fbUser = cred.user;
        } catch (firebaseError) {
          fbError = firebaseError;
          console.warn("[Firebase Auth] signInWithEmailAndPassword error:", firebaseError.code, firebaseError.message);
          
          if (firebaseError.code === 'auth/invalid-credential') {
            throw new Error("Invalid email address or password. Please check your credentials.");
          } else if (firebaseError.code === 'auth/user-not-found') {
            throw new Error("No user account found with this email address.");
          } else if (firebaseError.code === 'auth/wrong-password') {
            throw new Error("Incorrect password. Please try again.");
          } else if (firebaseError.code === 'auth/invalid-email') {
            throw new Error("The email address format is invalid.");
          } else if (firebaseError.code === 'auth/too-many-requests') {
            throw new Error("Too many failed login attempts. Please try again later.");
          } else if (firebaseError.code === 'auth/network-request-failed') {
            throw new Error("Network error. Please check your internet connection.");
          }
        }
      }

      // 2. Fetch User Profile Document from Firestore if online
      let user = null;

      if (isFirebaseConfigured && db) {
        try {
          const targetUid = fbUser ? fbUser.uid : null;
          if (targetUid) {
            const userDoc = await getDoc(doc(db, 'profiles', targetUid));
            if (userDoc.exists()) {
              user = { uid: userDoc.id, id: userDoc.id, ...userDoc.data() };
            }
          }

          if (!user) {
            const snap = await getDocs(query(collection(db, 'profiles'), where('email', '==', queryStr)));
            if (!snap.empty) {
              const d = snap.docs[0];
              user = { uid: d.id, id: d.id, ...d.data() };
            }
          }
        } catch (fsErr) {
          console.warn("Firestore profile lookup fallback:", fsErr.message);
        }
      }

      // 3. Search local database / DEFAULT_USERS
      if (!user) {
        let users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        let updated = false;
        DEFAULT_USERS.forEach(defUser => {
          if (!users.some(u => u.email?.toLowerCase() === defUser.email.toLowerCase())) {
            users.push(defUser);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem('acad_users', JSON.stringify(users));
        }

        user = users.find(u => 
          (u.email && u.email.toLowerCase() === queryStr) ||
          (u.rollNumber && u.rollNumber.toLowerCase() === queryStr) ||
          (u.employeeId && u.employeeId.toLowerCase() === queryStr) ||
          (u.uid && u.uid.toLowerCase() === queryStr)
        );

        if (!user) {
          const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
          const studentMatch = students.find(s => 
            (s.rollNumber && s.rollNumber.toLowerCase() === queryStr) ||
            (s.email && s.email.toLowerCase() === queryStr) ||
            (s.rollNumber && `${s.rollNumber.toLowerCase()}@kbn.edu` === queryStr)
          );

          if (studentMatch) {
            user = {
              uid: studentMatch.uid || `stud-${studentMatch.rollNumber}`,
              email: studentMatch.email || `${studentMatch.rollNumber}@kbn.edu`,
              fullName: studentMatch.studentName || studentMatch.fullName || 'Student',
              role: 'student',
              department: studentMatch.department || studentMatch.branch || 'CSE',
              semester: studentMatch.semester || 'Semester 1',
              rollNumber: studentMatch.rollNumber,
              section: studentMatch.section || 'A'
            };
            users.push(user);
            localStorage.setItem('acad_users', JSON.stringify(users));
          }
        }
      }

      // 4. Check if authenticated via Firebase Auth but missing profile document
      if (fbUser && !user) {
        throw new Error("Account authenticated, but user profile was not found.");
      }

      if (!user) {
        if (fbError) throw fbError;
        throw new Error(`Account not found for "${emailOrIdentifier}". Please check your email or password.`);
      }

      localStorage.setItem('acad_current_user', JSON.stringify(user));
      return user;
    })();

    return await Promise.race([loginPromise, timeoutPromise]);
  },

  logout: async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await auth.signOut();
      }
    } catch (err) {
      console.warn("[AUTH] Firebase auth.signOut error:", err.message);
    }
    localStorage.removeItem('acad_current_user');
    return true;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('acad_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getUserProfileByUid: async (uid) => {
    if (!uid) return null;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firestore profile query timed out after 6 seconds."));
      }, 6000);
    });

    const fetchPromise = (async () => {
      let profile = null;

      if (isFirebaseConfigured && db) {
        try {
          const userDoc = await getDoc(doc(db, 'profiles', uid));
          if (userDoc.exists()) {
            profile = { uid: userDoc.id, id: userDoc.id, ...userDoc.data() };
          }
        } catch (err) {
          console.warn("[AUTH] Firestore profiles fetch error for UID:", uid, err.message);
        }

        if (profile && (profile.role === 'student' || !profile.role)) {
          try {
            const studentDoc = await getDoc(doc(db, 'students', uid));
            if (studentDoc.exists()) {
              profile = { ...studentDoc.data(), ...profile };
            }
          } catch (stErr) {
            console.warn("[AUTH] Firestore students fetch error for UID:", uid, stErr.message);
          }
        }
      }

      if (!profile) {
        const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        let match = users.find(u => u.uid === uid || u.id === uid);
        if (!match) {
          match = DEFAULT_USERS.find(u => u.uid === uid || u.id === uid);
        }
        if (!match) {
          const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
          const stMatch = students.find(s => s.uid === uid || s.id === uid);
          if (stMatch) {
            match = {
              uid: stMatch.uid,
              fullName: stMatch.studentName || stMatch.fullName || 'Student',
              email: stMatch.email || `${stMatch.rollNumber}@kbn.edu`,
              role: 'student',
              department: stMatch.department || stMatch.branch || 'CSE',
              semester: stMatch.semester || 'Semester 1',
              section: stMatch.section || 'A',
              rollNumber: stMatch.rollNumber,
              hallTicketNumber: stMatch.hallTicketNumber,
              academicYear: stMatch.academicYear || '2026-2027'
            };
          }
        }
        if (match) {
          profile = { ...match };
        }
      }

      return profile;
    })();

    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
      console.warn("[AUTH] getUserProfileByUid failed/timed out for UID:", uid, err.message);
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      return users.find(u => u.uid === uid || u.id === uid) || DEFAULT_USERS.find(u => u.uid === uid || u.id === uid) || null;
    }
  },

  // --- USER DIRECTORY CRUD ---
  getAllUsers: async () => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        list = snap.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getDocs for profiles failed, using local storage fallback:", err.message);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.uid || item.id || item.email;
      if (key) combinedMap.set(key, item);
    });
    return Array.from(combinedMap.values());
  },

  createUser: async (userObj) => {
    await mockDB.delay(100);
    
    if (isFirebaseConfigured && db) {
      let uid = userObj.uid || `user_${Date.now()}`;
      if (secondaryAuth) {
        try {
          const cred = await createUserWithEmailAndPassword(secondaryAuth, userObj.email, userObj.password || 'password123');
          if (cred && cred.user) uid = cred.user.uid;
        } catch (authErr) {
          console.warn("Firebase Auth online user creation skipped:", authErr.message);
        }
      }
      
      const payload = {
        email: userObj.email,
        fullName: userObj.fullName,
        role: userObj.role,
        department: userObj.department || 'N/A',
        semester: userObj.semester || null,
        section: userObj.section || null,
        rollNumber: userObj.rollNumber || null,
        hallTicketNumber: userObj.hallTicketNumber || null,
        academicYear: userObj.academicYear || null,
        parentName: userObj.parentName || null,
        parentMobile: userObj.parentMobile || null,
        parentEmail: userObj.parentEmail || null,
        employeeId: userObj.employeeId || null,
        mobile: userObj.mobile || null,
        phoneNumber: userObj.mobile || null,
        phoneVerified: userObj.phoneVerified || false,
        subjects: userObj.subjects || null
      };

      await setDoc(doc(db, 'profiles', uid), payload);

      if (userObj.role === 'student') {
        const studentPayload = {
          uid,
          fullName: userObj.fullName,
          rollNumber: userObj.rollNumber,
          hallTicketNumber: userObj.hallTicketNumber || '',
          department: userObj.department,
          semester: userObj.semester,
          section: userObj.section || 'A',
          mobile: userObj.mobile || '',
          phoneNumber: userObj.mobile || '',
          parentName: userObj.parentName || '',
          parentMobile: userObj.parentMobile || '',
          parentEmail: userObj.parentEmail || '',
          academicYear: userObj.academicYear || '2026-2027',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'students', uid), studentPayload);

        // Auto-create parent user
        const parentEmail = userObj.parentEmail || `parent.${userObj.rollNumber.replace(/\s+/g, '_')}@kbn.edu`;
        try {
          const parentCred = await createUserWithEmailAndPassword(secondaryAuth, parentEmail, 'password123');
          const parentUid = parentCred.user.uid;
          
          const parentProfilePayload = {
            email: parentEmail,
            fullName: userObj.parentName,
            role: 'parent',
            department: userObj.department,
            childRollNumber: userObj.rollNumber,
            childUid: uid,
            mobile: userObj.parentMobile
          };
          await setDoc(doc(db, 'profiles', parentUid), parentProfilePayload);

          const parentPayload = {
            uid: parentUid,
            fullName: userObj.parentName,
            mobile: userObj.parentMobile,
            email: parentEmail,
            childUid: uid,
            childRollNumber: userObj.rollNumber
          };
          await setDoc(doc(db, 'parents', parentUid), parentPayload);
        } catch (e) {
          console.error("Failed to auto-provision parent user in firebase auth:", e);
        }
      }
      return { uid, ...payload };
    }

    // Local Storage Mock Mode
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === userObj.email.toLowerCase())) {
      throw new Error('Email address already registered.');
    }
    const uid = userObj.role + '-' + Math.random().toString(36).substr(2, 9);
    const newUser = { uid, ...userObj };
    users.push(newUser);
    localStorage.setItem('acad_users', JSON.stringify(users));

    if (userObj.role === 'student') {
      const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
      const studentPayload = {
        uid,
        fullName: userObj.fullName,
        rollNumber: userObj.rollNumber,
        hallTicketNumber: userObj.hallTicketNumber || '',
        department: userObj.department,
        semester: userObj.semester,
        section: userObj.section || 'A',
        mobile: userObj.mobile || '',
        phoneNumber: userObj.mobile || '',
        parentName: userObj.parentName || '',
        parentMobile: userObj.parentMobile || '',
        parentEmail: userObj.parentEmail || '',
        academicYear: userObj.academicYear || '2026-2027',
        createdAt: new Date().toISOString()
      };
      students.push(studentPayload);
      localStorage.setItem('acad_students', JSON.stringify(students));

      // Auto-create parent profile in local database
      const parents = JSON.parse(localStorage.getItem('acad_parents') || '[]');
      const parentEmail = userObj.parentEmail || `parent.${userObj.rollNumber.replace(/\s+/g, '_')}@kbn.edu`;
      const parentUid = 'parent-' + Math.random().toString(36).substr(2, 9);
      
      const parentUser = {
        uid: parentUid,
        email: parentEmail,
        fullName: userObj.parentName,
        role: 'parent',
        department: userObj.department,
        childRollNumber: userObj.rollNumber,
        childUid: uid,
        mobile: userObj.parentMobile
      };
      users.push(parentUser);
      localStorage.setItem('acad_users', JSON.stringify(users));

      const parentPayload = {
        uid: parentUid,
        fullName: userObj.parentName,
        mobile: userObj.parentMobile,
        email: parentEmail,
        childUid: uid,
        childRollNumber: userObj.rollNumber
      };
      parents.push(parentPayload);
      localStorage.setItem('acad_parents', JSON.stringify(parents));
    }

    return newUser;
  },

  updateUser: async (uid, updatedObj) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'profiles', uid);
      await setDoc(docRef, updatedObj, { merge: true });
      
      if (updatedObj.role === 'student') {
        const studentRef = doc(db, 'students', uid);
        await setDoc(studentRef, updatedObj, { merge: true });

        // If parent mobile or email updated, find and update parent too
        const parentsRef = collection(db, 'parents');
        const q = query(parentsRef, where('childUid', '==', uid));
        const snap = await getDocs(q);
        for (const parentDoc of snap.docs) {
          const parentId = parentDoc.id;
          const parentPayload = {
            fullName: updatedObj.parentName,
            mobile: updatedObj.parentMobile,
            email: updatedObj.parentEmail || parentDoc.data().email
          };
          await updateDoc(doc(db, 'parents', parentId), parentPayload);
          await updateDoc(doc(db, 'profiles', parentId), {
            fullName: updatedObj.parentName,
            mobile: updatedObj.parentMobile
          });
        }
      }
      return { uid, ...updatedObj };
    }

    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx === -1) throw new Error('User not found.');
    users[idx] = { ...users[idx], ...updatedObj };
    localStorage.setItem('acad_users', JSON.stringify(users));

    if (users[idx].role === 'student') {
      const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
      const sIdx = students.findIndex(s => s.uid === uid);
      if (sIdx !== -1) {
        students[sIdx] = { ...students[sIdx], ...updatedObj };
        localStorage.setItem('acad_students', JSON.stringify(students));
      }

      // Update parent in local mock
      const parents = JSON.parse(localStorage.getItem('acad_parents') || '[]');
      const pIdx = parents.findIndex(p => p.childUid === uid);
      if (pIdx !== -1) {
        parents[pIdx].fullName = updatedObj.parentName;
        parents[pIdx].mobile = updatedObj.parentMobile;
        if (updatedObj.parentEmail) parents[pIdx].email = updatedObj.parentEmail;
        localStorage.setItem('acad_parents', JSON.stringify(parents));

        const pUserIdx = users.findIndex(u => u.uid === parents[pIdx].uid);
        if (pUserIdx !== -1) {
          users[pUserIdx].fullName = updatedObj.parentName;
          users[pUserIdx].mobile = updatedObj.parentMobile;
          localStorage.setItem('acad_users', JSON.stringify(users));
        }
      }
    }
    return users[idx];
  },

  deleteUser: async (uid) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'profiles', uid));
      return true;
    }
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const filtered = users.filter(u => u.uid !== uid);
    localStorage.setItem('acad_users', JSON.stringify(filtered));
    return true;
  },

  resetPassword: async (uid, newPass = 'password123') => {
    await mockDB.delay(50);
    // Client-side passwords resets in firebase auth are restricted unless logged in, 
    // but in mock it is always true. In Firestore, Super Admin writes a reset signal or handles it.
    return true;
  },

  // --- ACADEMIC CALENDAR ---
  getCalendarEvents: async () => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'academic_calendar'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return JSON.parse(localStorage.getItem('acad_calendar') || '[]');
  },

  saveCalendarEvent: async (eventObj) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      if (eventObj.id) {
        await setDoc(doc(db, 'academic_calendar', eventObj.id), eventObj, { merge: true });
        return eventObj;
      } else {
        const ref = await addDoc(collection(db, 'academic_calendar'), eventObj);
        return { id: ref.id, ...eventObj };
      }
    }

    const calendar = JSON.parse(localStorage.getItem('acad_calendar') || '[]');
    if (eventObj.id) {
      const idx = calendar.findIndex(c => c.id === eventObj.id);
      if (idx !== -1) calendar[idx] = eventObj;
    } else {
      eventObj.id = 'cal-' + Math.random().toString(36).substr(2, 9);
      calendar.push(eventObj);
    }
    localStorage.setItem('acad_calendar', JSON.stringify(calendar));
    return eventObj;
  },

  deleteCalendarEvent: async (id) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'academic_calendar', id));
      return true;
    }
    const calendar = JSON.parse(localStorage.getItem('acad_calendar') || '[]');
    const filtered = calendar.filter(c => c.id !== id);
    localStorage.setItem('acad_calendar', JSON.stringify(filtered));
    return true;
  },

  // --- TIMETABLE MANAGEMENT ---
  getTimetables: async (branch = null, semester = null) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'timetables'));
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (branch) data = data.filter(t => t.branch === branch);
      if (semester) data = data.filter(t => t.semester === semester);
      return data;
    }
    const timetables = JSON.parse(localStorage.getItem('acad_timetables') || '[]');
    let data = timetables;
    if (branch) data = data.filter(t => t.branch === branch);
    if (semester) data = data.filter(t => t.semester === semester);
    return data;
  },

  saveTimetable: async (timetableObj) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const id = `${timetableObj.branch}_${timetableObj.semester}_${timetableObj.section}`.replace(/\s+/g, '_');
      await setDoc(doc(db, 'timetables', id), timetableObj);
      return { id, ...timetableObj };
    }

    const timetables = JSON.parse(localStorage.getItem('acad_timetables') || '[]');
    const id = `${timetableObj.branch}_${timetableObj.semester}_${timetableObj.section}`.replace(/\s+/g, '_');
    const idx = timetables.findIndex(t => t.id === id);
    const saved = { id, ...timetableObj };
    if (idx !== -1) {
      timetables[idx] = saved;
    } else {
      timetables.push(saved);
    }
    localStorage.setItem('acad_timetables', JSON.stringify(timetables));
    return saved;
  },

  getClassrooms: async () => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'classrooms'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return JSON.parse(localStorage.getItem('acad_classrooms') || '[]');
  },

  addClassroom: async (roomObj) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'classrooms'), roomObj);
      return { id: ref.id, ...roomObj };
    }
    const rooms = JSON.parse(localStorage.getItem('acad_classrooms') || '[]');
    roomObj.id = 'room-' + Math.random().toString(36).substr(2, 9);
    rooms.push(roomObj);
    localStorage.setItem('acad_classrooms', JSON.stringify(rooms));
    return roomObj;
  },

  // --- ASSIGNMENTS ---
  getAssignments: async (branch = null, semester = null, section = null, subject = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'assignments'));
        list = snap.docs.map(doc => ({ id: doc.id, assignmentId: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs for assignments failed, using local storage:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || item.assignmentId;
      if (key) combinedMap.set(key, item);
    });
    let resultList = Array.from(combinedMap.values());

    if (branch && branch !== 'All' && branch !== 'N/A') {
      resultList = resultList.filter(a => isDepartmentMatch(a.branch || a.department, branch));
    }
    if (semester && semester !== 'All' && semester !== 'N/A') {
      const targetSem = normalizeSemester(semester);
      resultList = resultList.filter(a => !a.semester || a.semester === 'All' || normalizeSemester(a.semester) === targetSem);
    }
    if (section && section !== 'All' && section !== 'N/A') {
      const targetSec = normalizeSection(section);
      resultList = resultList.filter(a => !a.section || a.section === 'All' || a.section === 'All Sections' || normalizeSection(a.section) === targetSec);
    }
    if (subject && subject !== 'All' && subject !== 'N/A') {
      const targetSubj = subject.toUpperCase().trim();
      resultList = resultList.filter(a => {
        if (!a.subject) return true;
        const assSubj = a.subject.toUpperCase().trim();
        return assSubj.includes(targetSubj) || targetSubj.includes(assSubj);
      });
    }

    const submissions = JSON.parse(localStorage.getItem('acad_submissions') || '[]');
    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]');
    return resultList.map(a => {
      const subs = submissions.filter(s => s.assignmentId === a.id).map(s => {
        const grading = marks.find(m => m.assignmentId === a.id && m.studentId === s.studentId);
        return {
          ...s,
          grade: grading ? grading.marks : 'Pending',
          feedback: grading ? grading.feedback : ''
        };
      });
      return { ...a, submissions: subs.length > 0 ? subs : (a.submissions || []) };
    });
  },

  createAssignment: async (title, description, branch, semester, subject, dueDate, facultyId, facultyName, file = null, section = 'Section A') => {
    await mockDB.delay(100);
    let fileUrl = '';
    let fileName = 'assignment.pdf';
    let filePublicId = '';

    if (file) {
      if (typeof file !== 'string' && (file instanceof Blob || file instanceof File)) {
        console.log(`[Assignment] Selected file: ${file.name}`);
        console.log(`[Assignment] File type: ${file.type}`);
        console.log(`[Assignment] File size: ${file.size}`);
        console.log(`[Cloudinary] Uploading assignment file to college-erp/assignments...`);
        const uploadRes = await uploadFileToCloudinary(file, 'college-erp/assignments');
        fileUrl = uploadRes.url;
        fileName = uploadRes.originalName;
        filePublicId = uploadRes.publicId;
      } else if (typeof file === 'string') {
        fileUrl = file;
        fileName = 'attachment.pdf';
      }
    }

    const dept = (branch || 'CSE').trim();
    const sem = (semester || 'Semester 1').trim();
    const sec = (section || 'Section A').trim();

    const payload = {
      title: title || 'Course Assignment',
      description: description || '',
      branch: dept,
      department: dept,
      targetBranch: dept,
      semester: sem,
      targetSemester: sem,
      section: sec,
      targetSection: sec,
      subject: subject || 'General',
      targetSubject: subject || 'General',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      assignedDate: new Date().toISOString().split('T')[0],
      fileUrl,
      fileName,
      filePublicId,
      fileType: fileName ? fileName.split('.').pop() : 'pdf',
      fileSize: file && file.size ? `${(file.size / 1024).toFixed(1)} KB` : '500 KB',
      facultyId: facultyId || '',
      facultyName: facultyName || 'Faculty',
      createdBy: facultyName || 'Faculty',
      createdAt: new Date().toISOString()
    };

    let assId = `assign-${Date.now()}`;
    if (isFirebaseConfigured && db) {
      try {
        const refDoc = await addDoc(collection(db, 'assignments'), payload);
        assId = refDoc.id;
        console.log('[Firestore] Metadata saved');
      } catch (err) {
        console.warn("Firestore addDoc for assignments failed, saving locally:", err.message);
      }
    }

    const assignments = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const newAss = { id: assId, assignmentId: assId, ...payload };
    assignments.unshift(newAss);
    localStorage.setItem('acad_assignments', JSON.stringify(assignments));

    try {
      const students = await mockDB.getStudents(dept);
      students.forEach(st => {
        mockDB.addNotification(st.uid || st.id || st.studentId, `New Assignment Published: ${title} (${subject}) - Due Date: ${dueDate}`);
      });
    } catch (e) {
      console.warn("Notification send error for assignment:", e);
    }

    return newAss;
  },

  deleteAssignment: async (assignmentId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db && assignmentId) {
      try {
        await deleteDoc(doc(db, 'assignments', assignmentId));
      } catch (err) {
        console.warn("Firestore deleteDoc for assignment failed:", err.message);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_assignments') || '[]');
    const filtered = local.filter(a => a.id !== assignmentId && a.assignmentId !== assignmentId);
    localStorage.setItem('acad_assignments', JSON.stringify(filtered));
    return true;
  },

  submitAssignment: async (assignmentId, studentId, studentName, rollNumber, files) => {
    await mockDB.delay(150);
    const fileUrls = [];
    const fileNames = [];

    for (const f of files) {
      fileNames.push(f.name);
      if (isFirebaseConfigured && storage) {
        try {
          const storageRef = ref(storage, `submissions/${assignmentId}/${studentId}/${Date.now()}_${f.name}`);
          const snap = await uploadBytes(storageRef, f);
          const url = await getDownloadURL(snap.ref);
          fileUrls.push(url);
        } catch (err) {
          console.warn("Firebase Storage uploadBytes for submission failed, falling back to Data URL:", err.message);
          const dataUrl = await fileToDataUrl(f);
          fileUrls.push(dataUrl);
        }
      } else {
        const dataUrl = await fileToDataUrl(f);
        fileUrls.push(dataUrl);
      }
    }

    // Check if late submission
    const assignments = await mockDB.getAssignments();
    const active = assignments.find(a => a.id === assignmentId);
    const isLate = active && new Date() > new Date(active.dueDate);

    const payload = {
      assignmentId,
      studentId,
      studentName,
      rollNumber,
      fileUrls,
      fileNames,
      submittedAt: new Date().toISOString(),
      status: isLate ? 'late' : 'submitted'
    };

    if (isFirebaseConfigured && db) {
      const id = `${assignmentId}_${studentId}`;
      await setDoc(doc(db, 'assignment_submissions', id), payload);
      return payload;
    }

    const submissions = JSON.parse(localStorage.getItem('acad_submissions') || '[]');
    const filtered = submissions.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentId));
    filtered.push(payload);
    localStorage.setItem('acad_submissions', JSON.stringify(filtered));
    return payload;
  },

  gradeSubmission: async (assignmentId, studentId, gradeVal, feedback, facultyId) => {
    await mockDB.delay(100);
    const payload = {
      assignmentId,
      studentId,
      marks: Number(gradeVal),
      feedback,
      gradedAt: new Date().toISOString(),
      gradedBy: facultyId
    };

    if (isFirebaseConfigured && db) {
      const id = `${assignmentId}_${studentId}`;
      await setDoc(doc(db, 'assignment_marks', id), payload);
      return payload;
    }

    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]');
    const filtered = marks.filter(m => !(m.assignmentId === assignmentId && m.studentId === studentId));
    filtered.push(payload);
    localStorage.setItem('acad_marks', JSON.stringify(filtered));
    return payload;
  },

  // --- PLACEMENT DRIVES & APPLICATIONS ---
  getPlacementDrives: async () => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_drives'));
        list = snap.docs.map(doc => ({ id: doc.id, driveId: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("[Firestore] getDocs for placement_drives failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || item.driveId;
      if (key) combinedMap.set(key, item);
    });
    return Array.from(combinedMap.values());
  },

  createPlacementDrive: async (driveData) => {
    await mockDB.delay(100);
    const rawDepts = driveData.eligibleDepartments || driveData.eligibleBranches || ['All'];
    const eligibleDepts = Array.isArray(rawDepts)
      ? rawDepts.map(d => normalizeDepartment(d))
      : [normalizeDepartment(rawDepts)];

    const payload = {
      companyName: driveData.companyName || 'Company',
      jobRole: driveData.jobRole || driveData.role || 'Software Engineer',
      package: driveData.package || driveData.salaryPackage || '6.0 LPA',
      location: driveData.location || 'Pan India',
      driveDate: driveData.driveDate || new Date().toISOString().split('T')[0],
      applicationDeadline: driveData.applicationDeadline || driveData.deadline || new Date().toISOString().split('T')[0],
      eligibleDepartments: eligibleDepts,
      eligibleBranches: eligibleDepts,
      eligibleSemesters: Array.isArray(driveData.eligibleSemesters) ? driveData.eligibleSemesters : [driveData.eligibleSemesters || 'All'],
      eligibleSections: Array.isArray(driveData.eligibleSections) ? driveData.eligibleSections : [driveData.eligibleSections || 'All'],
      minimumCGPA: parseFloat(driveData.minimumCGPA !== undefined ? driveData.minimumCGPA : (driveData.minCgpa !== undefined ? driveData.minCgpa : 0)),
      maximumBacklogs: parseInt(driveData.maximumBacklogs !== undefined ? driveData.maximumBacklogs : (driveData.maxBacklogs !== undefined ? driveData.maxBacklogs : 0)),
      description: driveData.description || '',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    let driveId = `drive-${Date.now()}`;
    if (isFirebaseConfigured && db) {
      try {
        const refDoc = await addDoc(collection(db, 'placement_drives'), payload);
        driveId = refDoc.id;
        console.log('[Firestore] Placement drive saved to Firestore:', driveId);
      } catch (err) {
        console.error('[Firestore] addDoc placement_drives failed:', err);
      }
    }

    const localDrives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const newDrive = { id: driveId, driveId, ...payload };
    localDrives.unshift(newDrive);
    localStorage.setItem('acad_placement_drives', JSON.stringify(localDrives));
    return newDrive;
  },

  getPlacementApplications: async (driveId = null, studentId = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_applications'));
        list = snap.docs.map(doc => ({ id: doc.id, applicationId: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("[Firestore] getDocs for placement_applications failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_apps') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || item.applicationId;
      if (key) combinedMap.set(key, item);
    });
    let results = Array.from(combinedMap.values());

    if (driveId) {
      results = results.filter(a => a.driveId === driveId);
    }
    if (studentId) {
      results = results.filter(a => a.studentId === studentId);
    }
    return results;
  },

  applyForPlacementDrive: async (appData) => {
    await mockDB.delay(150);
    let resumeUrl = appData.resumeUrl || '';
    if (appData.resumeFile && typeof appData.resumeFile !== 'string' && (appData.resumeFile instanceof Blob || appData.resumeFile instanceof File)) {
      console.log(`[Cloudinary] Uploading resume for student ${appData.studentId}...`);
      const uploadRes = await uploadFileToCloudinary(appData.resumeFile, 'college-erp/resumes');
      resumeUrl = uploadRes.url;
    }

    const normDept = normalizeDepartment(appData.department);
    const payload = {
      driveId: appData.driveId,
      driveName: appData.driveName || `${appData.companyName} - ${appData.jobRole}`,
      companyName: appData.companyName || 'Company',
      jobRole: appData.jobRole || 'Role',
      package: appData.package || 'Package',
      studentId: appData.studentId,
      studentName: appData.studentName || appData.fullName || 'Student',
      fullName: appData.studentName || appData.fullName || 'Student',
      rollNumber: appData.rollNumber || 'STU-2026',
      email: appData.email || '',
      phone: appData.phone || appData.mobile || '',
      department: normDept,
      branch: normDept,
      semester: appData.semester || 'Semester 6',
      section: appData.section || 'Section A',
      cgpa: parseFloat(appData.cgpa || 0),
      backlogs: parseInt(appData.backlogs || 0),
      resumeUrl,
      githubUrl: appData.githubUrl || '',
      linkedinUrl: appData.linkedinUrl || '',
      portfolioUrl: appData.portfolioUrl || '',
      appliedAt: new Date().toISOString(),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied'
    };

    let appId = `app-${Date.now()}`;
    if (isFirebaseConfigured && db) {
      try {
        const refDoc = await addDoc(collection(db, 'placement_applications'), payload);
        appId = refDoc.id;
        console.log('[Firestore] Placement application saved to Firestore:', appId);
      } catch (err) {
        console.error('[Firestore] addDoc placement_applications failed:', err);
      }
    }

    const localApps = JSON.parse(localStorage.getItem('acad_placement_apps') || '[]');
    const newApp = { id: appId, applicationId: appId, ...payload };
    localApps.unshift(newApp);
    localStorage.setItem('acad_placement_apps', JSON.stringify(localApps));

    return newApp;
  },

  updatePlacementApplicationStatus: async (applicationId, status) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db && applicationId) {
      try {
        await updateDoc(doc(db, 'placement_applications', applicationId), { status, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error('[Firestore] updateDoc placement_applications failed:', err);
      }
    }

    const localApps = JSON.parse(localStorage.getItem('acad_placement_apps') || '[]');
    const idx = localApps.findIndex(a => a.id === applicationId || a.applicationId === applicationId);
    if (idx !== -1) {
      localApps[idx].status = status;
      localStorage.setItem('acad_placement_apps', JSON.stringify(localApps));
    }
    return { success: true };
  },

  getPlacementCompanies: async () => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_companies'));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) { console.error(err); }
    }
    return JSON.parse(localStorage.getItem('acad_placement_companies') || '[]');
  },

  getPlacementTrainings: async () => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_trainings'));
        if (!snap.empty) return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) { console.error(err); }
    }
    return JSON.parse(localStorage.getItem('acad_placement_trainings') || '[]');
  },

  // --- BACKUP & RESTORE MODULE ---
  getBackupLogs: async () => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'backup_logs'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return JSON.parse(localStorage.getItem('acad_backup_logs') || '[]').sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  triggerBackup: async (adminId) => {
    await mockDB.delay(200);
    const backupName = `KBN_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Compile tables for backup download
    const exportData = {
      profiles: isFirebaseConfigured ? (await mockDB.getAllUsers()) : JSON.parse(localStorage.getItem('acad_users') || '[]'),
      calendar: await mockDB.getCalendarEvents(),
      timetables: await mockDB.getTimetables(),
      assignments: await mockDB.getAssignments(),
      classrooms: await mockDB.getClassrooms()
    };

    const sizeBytes = new Blob([JSON.stringify(exportData)]).size;
    const log = {
      backupName,
      triggeredBy: adminId,
      timestamp: new Date().toISOString(),
      size: sizeBytes,
      status: 'success',
      logDetails: `Successfully compiled ${exportData.profiles.length} user profiles, ${exportData.calendar.length} calendar events, and ${exportData.timetables.length} timetables.`
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, 'backup_logs'), log);
    } else {
      const logs = JSON.parse(localStorage.getItem('acad_backup_logs') || '[]');
      logs.push({ id: 'log-' + Math.random().toString(36).substr(2, 9), ...log });
      localStorage.setItem('acad_backup_logs', JSON.stringify(logs));
    }

    // Trigger file download to client machine
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return log;
  },

  restoreBackup: async (backupDataString, adminId) => {
    await mockDB.delay(200);
    try {
      const data = JSON.parse(backupDataString);
      if (!data.profiles || !data.calendar || !data.timetables) {
        throw new Error('Invalid backup schema file.');
      }

      if (isFirebaseConfigured && db) {
        // Upload each subdocument to live Firestore database
        for (const u of data.profiles) {
          const uid = u.uid || u.id;
          delete u.uid;
          await setDoc(doc(db, 'profiles', uid), u);
        }
        for (const cal of data.calendar) {
          const id = cal.id;
          delete cal.id;
          await setDoc(doc(db, 'academic_calendar', id), cal);
        }
        for (const tt of data.timetables) {
          const id = tt.id;
          delete tt.id;
          await setDoc(doc(db, 'timetables', id), tt);
        }
      } else {
        localStorage.setItem('acad_users', JSON.stringify(data.profiles));
        localStorage.setItem('acad_calendar', JSON.stringify(data.calendar));
        localStorage.setItem('acad_timetables', JSON.stringify(data.timetables));
        if (data.classrooms) localStorage.setItem('acad_classrooms', JSON.stringify(data.classrooms));
        if (data.assignments) localStorage.setItem('acad_assignments', JSON.stringify(data.assignments));
      }

      const log = {
        backupName: 'Restore Operation',
        triggeredBy: adminId,
        timestamp: new Date().toISOString(),
        size: new Blob([backupDataString]).size,
        status: 'success',
        logDetails: `Successfully restored database status with ${data.profiles.length} user profiles, ${data.calendar.length} calendar events, and ${data.timetables.length} timetables.`
      };

      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, 'backup_logs'), log);
      } else {
        const logs = JSON.parse(localStorage.getItem('acad_backup_logs') || '[]');
        logs.push({ id: 'log-' + Math.random().toString(36).substr(2, 9), ...log });
        localStorage.setItem('acad_backup_logs', JSON.stringify(logs));
      }
      return true;
    } catch (e) {
      throw new Error(`Restore failed: ${e.message}`);
    }
  },

  assignSubjectToFaculty: async (branch, semester, subjectName, facultyId, facultyName, section = 'Section A', hodUser = null, facultyEmail = '', facultyPhone = '') => {
    await mockDB.delay(100);

    const payload = {
      branch,
      department: branch,
      semester,
      section,
      subject: subjectName,
      subjectName,
      facultyId,
      facultyName,
      facultyEmail: facultyEmail || '',
      facultyPhone: facultyPhone || '',
      status: 'active',
      assignmentStatus: 'active',
      assignedBy: hodUser?.uid || hodUser?.id || 'hod',
      createdAt: new Date().toISOString()
    };

    // Update user profile in storage by facultyId (Auth UID)
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const userIdx = users.findIndex(u => u.uid === facultyId || u.id === facultyId || u.email === facultyId);
    if (userIdx !== -1) {
      users[userIdx].assignedDepartment = branch;
      users[userIdx].assignedBranch = branch;
      users[userIdx].department = branch;
      users[userIdx].assignedSemester = semester;
      users[userIdx].assignedSection = section;
      users[userIdx].assignedSubject = subjectName;
      users[userIdx].assignmentStatus = 'active';
      if (facultyEmail) users[userIdx].email = facultyEmail;
      if (facultyPhone) {
        users[userIdx].phoneNumber = facultyPhone;
        users[userIdx].mobile = facultyPhone;
        users[userIdx].phone = facultyPhone;
      }
      localStorage.setItem('acad_users', JSON.stringify(users));
    }

    if (isFirebaseConfigured && db) {
      try {
        if (userIdx !== -1 && facultyId) {
          const userRef = doc(db, 'profiles', facultyId);
          const profileUpdate = {
            assignedDepartment: branch,
            assignedBranch: branch,
            department: branch,
            assignedSemester: semester,
            assignedSection: section,
            assignedSubject: subjectName,
            assignmentStatus: 'active'
          };
          if (facultyEmail) profileUpdate.email = facultyEmail;
          if (facultyPhone) {
            profileUpdate.phoneNumber = facultyPhone;
            profileUpdate.mobile = facultyPhone;
            profileUpdate.phone = facultyPhone;
          }
          await setDoc(userRef, profileUpdate, { merge: true });
        }

        const docRef = await addDoc(collection(db, 'subject_allocations'), payload);
        return { id: docRef.id, ...payload };
      } catch (err) {
        console.warn("Firestore assignSubjectToFaculty fallback:", err);
      }
    }

    let allocations = JSON.parse(localStorage.getItem('acad_allocations') || '[]');
    allocations = allocations.filter(a => a.facultyId !== facultyId);
    const newAlloc = { id: 'alloc-' + Math.random().toString(36).substr(2, 9), allocationId: 'alloc-' + Math.random().toString(36).substr(2, 9), ...payload };
    allocations.unshift(newAlloc);
    localStorage.setItem('acad_allocations', JSON.stringify(allocations));

    try {
      await mockDB.logHODAudit(
        'Faculty Subject Assigned',
        'Faculty Directory',
        `Assigned ${facultyName} to ${branch} • ${semester} • ${section} • ${subjectName}`,
        hodUser
      );
    } catch (_) {}

    return newAlloc;
  },

  allocateSubject: async (branch, semester, subjectName, facultyId, facultyName) => {
    return await mockDB.assignSubjectToFaculty(branch, semester, subjectName, facultyId, facultyName);
  },

  getSubjectAllocations: async (branch = null, facultyId = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        let q = collection(db, 'subject_allocations');
        const snap = await getDocs(q);
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (branch) list = list.filter(a => a.branch === branch || a.department === branch);
        if (facultyId) list = list.filter(a => a.facultyId === facultyId);
      } catch (e) {
        console.warn("Firestore getSubjectAllocations fallback to local:", e.message);
      }
    }
    if (list.length === 0) {
      list = JSON.parse(localStorage.getItem('acad_allocations') || '[]');
      if (branch) list = list.filter(a => a.branch === branch || a.department === branch);
      if (facultyId) list = list.filter(a => a.facultyId === facultyId);
    }

    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    return list.map(alloc => {
      const fac = users.find(u => u.uid === alloc.facultyId || u.id === alloc.facultyId || u.email === alloc.facultyEmail);
      return {
        ...alloc,
        facultyPhoto: fac?.photo || fac?.profilePhotoUrl || null,
        facultyDesignation: fac?.designation || 'Faculty Member',
        facultyEmail: fac?.email || alloc.facultyEmail || `${alloc.facultyName?.toLowerCase().replace(/\s+/g, '.')}@kbn.edu`,
        facultyPhone: fac?.phoneNumber || fac?.mobile || '9876543210',
        status: alloc.status || 'Active'
      };
    });
  },

  getAllFacultyAllocations: async () => {
    return await mockDB.getSubjectAllocations(null, null);
  },

  getAllWardCounsellors: async () => {
    await mockDB.delay(100);
    let list = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    return list.map(counsellor => {
      const fac = users.find(u => u.uid === counsellor.facultyId || u.id === counsellor.facultyId || u.email === counsellor.facultyEmail);
      return {
        ...counsellor,
        facultyPhoto: fac?.photo || fac?.profilePhotoUrl || counsellor.facultyPhoto || null,
        facultyDesignation: fac?.designation || counsellor.designation || 'Associate Professor & Ward Counsellor',
        facultyPhone: fac?.phoneNumber || fac?.mobile || counsellor.facultyPhone || '9876543211',
        facultyEmail: fac?.email || counsellor.facultyEmail || counsellor.email
      };
    });
  },

  removeSubjectAllocation: async (allocationId) => {
    await mockDB.delay(50);
    const allocs = JSON.parse(localStorage.getItem('acad_allocations') || '[]');
    const target = allocs.find(a => a.id === allocationId || a.allocationId === allocationId);
    const facultyId = target?.facultyId;

    if (isFirebaseConfigured && db && allocationId) {
      try {
        await deleteDoc(doc(db, 'subject_allocations', allocationId));
      } catch (err) {
        console.warn("Firestore deleteDoc subject_allocations fallback:", err);
      }
    }
    const filtered = allocs.filter(a => a.id !== allocationId && a.allocationId !== allocationId);
    localStorage.setItem('acad_allocations', JSON.stringify(filtered));

    if (facultyId) {
      const remainingForFaculty = filtered.filter(a => a.facultyId === facultyId);
      if (remainingForFaculty.length === 0) {
        const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
        const idx = users.findIndex(u => u.uid === facultyId || u.id === facultyId);
        if (idx !== -1) {
          users[idx].assignmentStatus = 'inactive';
          users[idx].assignedDepartment = null;
          users[idx].assignedSemester = null;
          users[idx].assignedSection = null;
          users[idx].assignedSubject = null;
          localStorage.setItem('acad_users', JSON.stringify(users));
        }
        if (isFirebaseConfigured && db) {
          try {
            const userRef = doc(db, 'profiles', facultyId);
            await setDoc(userRef, { assignmentStatus: 'inactive' }, { merge: true });
          } catch (_) {}
        }
      }
    }

    return true;
  },

  // --- ATTENDANCE MANAGEMENT ---
  getStudentsByBranchAndSemester: async (branch, semester, section = null) => {
    await mockDB.delay(50);
    
    const normBranch = (branch || '').toUpperCase().trim();
    const normSem = (semester || '').toUpperCase().trim();
    const normSec = (section || '').toUpperCase().trim();

    const isBranchMatch = (d) => {
      if (!d || !normBranch) return true;
      const upperD = d.toUpperCase().trim();
      return upperD === normBranch || normBranch.includes(upperD) || upperD.includes(normBranch) || 
             (normBranch.includes('AI') && upperD.includes('AI'));
    };

    const isSemMatch = (s) => {
      if (!s || !normSem) return true;
      const upperS = s.toUpperCase().trim();
      if (upperS === normSem) return true;
      const semNum1 = upperS.replace(/[^0-9]/g, '');
      const semNum2 = normSem.replace(/[^0-9]/g, '');
      return semNum1 && semNum2 && semNum1 === semNum2;
    };

    const isSecMatch = (sec) => {
      if (!sec || !normSec) return true;
      const upperSec = sec.toUpperCase().trim();
      if (upperSec === normSec) return true;
      if (normSec.includes('A') || normSec === 'EM') return upperSec.includes('A') || upperSec === 'EM' || upperSec === 'SECTION A';
      if (normSec.includes('B')) return upperSec.includes('B') || upperSec === 'SECTION B';
      return true;
    };

    const isDummyStudent = (u) => {
      if (!u) return true;
      const name = (u.fullName || u.studentName || u.name || '').toLowerCase().trim();
      const roll = (u.rollNumber || u.roll || u.usn || '').toLowerCase().trim();
      if (!name && !roll) return true;
      if (
        name.includes('john doe') ||
        name.includes('alex smith') ||
        name.includes('emma watson') ||
        name.includes('richard doe') ||
        name.includes('abcd') ||
        name.includes('dummy') ||
        name === 'test' ||
        name.startsWith('test student') ||
        roll.includes('abcd') ||
        roll.includes('test') ||
        roll === '1234' ||
        roll === 'cse-2023-001'
      ) {
        return true;
      }
      return false;
    };

    let allStudents = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        allStudents = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.role === 'student');
      } catch (err) {
        console.warn("Firestore getStudentsByBranchAndSemester fallback:", err);
      }
    }

    const localUsers = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const localStudents = JSON.parse(localStorage.getItem('acad_students') || '[]');

    const map = new Map();
    [...SEEDED_STUDENTS, ...DEFAULT_USERS, ...localUsers, ...localStudents, ...allStudents].forEach(u => {
      if (u && (u.role === 'student' || u.rollNumber) && !isDummyStudent(u)) {
        const key = u.rollNumber || u.uid || u.id;
        if (key) map.set(key, u);
      }
    });

    let list = Array.from(map.values()).filter(s => {
      const bMatch = isBranchMatch(s.department || s.branch);
      const sMatch = isSemMatch(s.semester);
      const secMatch = isSecMatch(s.section);
      return bMatch && sMatch && secMatch;
    });

    return list;
  },

  getStudents: async (department = null) => {
    await mockDB.delay(50);

    const isDummyStudent = (u) => {
      if (!u) return true;
      const name = (u.fullName || u.studentName || u.name || '').toLowerCase().trim();
      const roll = (u.rollNumber || u.roll || u.usn || '').toLowerCase().trim();
      if (!name && !roll) return true;
      if (
        name.includes('john doe') ||
        name.includes('alex smith') ||
        name.includes('emma watson') ||
        name.includes('richard doe') ||
        name.includes('abcd') ||
        name.includes('dummy') ||
        name === 'test' ||
        name.startsWith('test student') ||
        roll.includes('abcd') ||
        roll.includes('test') ||
        roll === '1234' ||
        roll === 'cse-2023-001'
      ) {
        return true;
      }
      return false;
    };

    let allUsers = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        allUsers = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getStudents fallback:", err);
      }
    }
    const localUsers = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const localStudents = JSON.parse(localStorage.getItem('acad_students') || '[]');
    
    const map = new Map();
    [...SEEDED_STUDENTS, ...DEFAULT_USERS, ...localUsers, ...localStudents, ...allUsers].forEach(u => {
      if (u && (u.role === 'student' || u.rollNumber) && !isDummyStudent(u)) {
        const key = u.rollNumber || u.uid || u.id;
        if (key) map.set(key, u);
      }
    });
    
    let result = Array.from(map.values());
    if (department) {
      const normDept = department.toUpperCase().trim();
      result = result.filter(s => {
        const sDept = (s.department || s.branch || '').toUpperCase().trim();
        return !sDept || sDept === normDept || normDept.includes(sDept) || sDept.includes(normDept) || (normDept.includes('AI') && sDept.includes('AI'));
      });
    }
    return result;
  },

  addStudentToClass: async (studentData) => {
    await mockDB.delay(100);
    const uid = 'stud-' + (studentData.rollNumber ? studentData.rollNumber.replace(/\s+/g, '_').toLowerCase() : Math.random().toString(36).substr(2, 9));
    const studentPayload = {
      uid,
      studentId: uid,
      rollNumber: studentData.rollNumber || '245901',
      studentName: studentData.studentName || studentData.fullName || 'New Student',
      fullName: studentData.studentName || studentData.fullName || 'New Student',
      department: studentData.department || 'AI & ML',
      branch: studentData.branch || studentData.department || 'AI & ML',
      course: studentData.course || 'B.Sc',
      semester: studentData.semester || 'Semester 2',
      section: studentData.section || 'EM',
      status: studentData.status || 'Active',
      role: 'student'
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'students', uid), studentPayload);
      await setDoc(doc(db, 'profiles', uid), {
        email: `${studentPayload.rollNumber}@kbn.edu`,
        fullName: studentPayload.studentName,
        role: 'student',
        department: studentPayload.department,
        semester: studentPayload.semester,
        section: studentPayload.section,
        rollNumber: studentPayload.rollNumber
      });
    }

    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const userIdx = users.findIndex(u => u.uid === uid || u.rollNumber === studentPayload.rollNumber);
    if (userIdx !== -1) users[userIdx] = { ...users[userIdx], ...studentPayload };
    else users.push(studentPayload);
    localStorage.setItem('acad_users', JSON.stringify(users));

    const studentsList = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const sIdx = studentsList.findIndex(s => s.uid === uid || s.rollNumber === studentPayload.rollNumber);
    if (sIdx !== -1) studentsList[sIdx] = studentPayload;
    else studentsList.push(studentPayload);
    localStorage.setItem('acad_students', JSON.stringify(studentsList));

    return studentPayload;
  },

  getAttendanceByFilter: async (branch, semester, date, section = null, subject = null, period = null) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'attendance'));
      let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list = list.filter(a => a.department === branch && a.semester === semester && a.date === date);
      if (section) list = list.filter(a => a.section === section);
      if (subject) list = list.filter(a => a.subject === subject);
      if (period) list = list.filter(a => Number(a.period) === Number(period));
      return list;
    }
    let list = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    list = list.filter(a => a.department === branch && a.semester === semester && a.date === date);
    if (section) list = list.filter(a => a.section === section);
    if (subject) list = list.filter(a => a.subject === subject);
    if (period) list = list.filter(a => Number(a.period) === Number(period));
    return list;
  },

  saveAttendanceBatch: async (records, facultyId, facultyName) => {
    await mockDB.delay(150);
    const savedRecords = [];
    const timestamp = new Date().toISOString();

    for (const r of records) {
      const recordId = `${r.studentId}_${r.date}_${r.period}`;
      const payload = {
        ...r,
        attendanceId: recordId,
        markedBy: facultyId || r.markedBy || 'unknown',
        markedByName: facultyName || r.markedByName || 'Faculty',
        timestamp
      };

      // Check if student has approved leave for this date
      const leaves = await mockDB.getLeaves('student', r.studentId);
      const isApprovedLeave = leaves.some(l => l.status === 'approved' && r.date >= l.startDate && r.date <= l.endDate);
      if (isApprovedLeave) {
        payload.status = 'leave_approved';
      }

      // Continuous absence tracking (Period 2 & Period 3)
      if (payload.status === 'absent' && Number(payload.period) === 3 && !isApprovedLeave) {
        // Query for Period 2 absence
        const todayAttendance = await mockDB.getAttendanceByFilter(r.branch, r.semester, r.date, r.section, r.subject, 2);
        const p2Absent = todayAttendance.some(a => a.studentId === r.studentId && a.status === 'absent');
        if (p2Absent) {
          payload.potentialFullDayAbsent = true;

          // Find student detailed profile to get parent contact
          const studentProfile = await mockDB.getStudentProfile(r.studentId);
          if (studentProfile && studentProfile.parentMobile) {
            // Find parent to link notification
            const allUsers = await mockDB.getAllUsers();
            const parentUser = allUsers.find(u => u.role === 'parent' && u.childRollNumber === studentProfile.rollNumber);
            
            const notificationMsg = `Dear Parent, Your child ${r.studentName} was absent from today's classes. Department: ${r.department} Semester: ${r.semester} Please contact the college if this absence was not planned. Regards, KBN Degree College`;
            const notificationPayload = {
              notificationId: 'notif-' + Math.random().toString(36).substr(2, 9),
              recipientUid: parentUser ? parentUser.uid : 'parent-fallback',
              recipientMobile: studentProfile.parentMobile,
              recipientEmail: studentProfile.parentEmail || '',
              studentName: r.studentName,
              title: 'Continuous Absence Notification',
              message: notificationMsg,
              sentAt: timestamp,
              status: 'sent'
            };

            if (isFirebaseConfigured && db) {
              await addDoc(collection(db, 'notifications'), notificationPayload);
            } else {
              const notifications = JSON.parse(localStorage.getItem('acad_notifications') || '[]');
              notifications.push(notificationPayload);
              localStorage.setItem('acad_notifications', JSON.stringify(notifications));
            }
          }
        }
      }

      // Fetch existing status for audit logging
      let oldStatus = 'none';
      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'attendance', recordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          oldStatus = docSnap.data().status;
        }
        await setDoc(docRef, payload, { merge: true });
      } else {
        const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
        const idx = attendance.findIndex(a => a.attendanceId === recordId);
        if (idx !== -1) {
          oldStatus = attendance[idx].status;
          attendance[idx] = { ...attendance[idx], ...payload };
        } else {
          attendance.push(payload);
        }
        localStorage.setItem('acad_attendance', JSON.stringify(attendance));
      }

      // Write Audit Log
      const auditPayload = {
        logId: 'audit-' + Math.random().toString(36).substr(2, 9),
        action: oldStatus === 'none' ? 'CREATE' : 'UPDATE',
        attendanceId: recordId,
        facultyId: facultyId || 'system',
        facultyName: facultyName || 'System',
        studentId: r.studentId,
        studentName: r.studentName,
        oldStatus,
        newStatus: payload.status,
        timestamp
      };

      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, 'audit_logs'), auditPayload);
      } else {
        const auditLogs = JSON.parse(localStorage.getItem('acad_audit_logs') || '[]');
        auditLogs.push(auditPayload);
        localStorage.setItem('acad_audit_logs', JSON.stringify(auditLogs));
      }

      savedRecords.push(payload);
    }
    return savedRecords;
  },

  getStudentProfile: async (studentId) => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'students', studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) return snap.data();
      // Fallback check profiles
      const profRef = doc(db, 'profiles', studentId);
      const profSnap = await getDoc(profRef);
      return profSnap.exists() ? profSnap.data() : null;
    }
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const std = students.find(s => s.uid === studentId);
    if (std) return std;
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    return users.find(u => u.uid === studentId) || null;
  },

  // --- ATTENDANCE EDIT REQUEST SYSTEM ---
  createAttendanceEditRequest: async (reqObj) => {
    await mockDB.delay(100);
    const payload = {
      ...reqObj,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'attendance_edit_requests'), payload);
      return { id: ref.id, ...payload };
    }
    const requests = JSON.parse(localStorage.getItem('acad_attendance_edit_requests') || '[]');
    const newReq = { requestId: 'req-' + Math.random().toString(36).substr(2, 9), ...payload };
    requests.push(newReq);
    localStorage.setItem('acad_attendance_edit_requests', JSON.stringify(requests));
    return newReq;
  },

  getAttendanceEditRequests: async (facultyId = null, branch = null) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'attendance_edit_requests'));
      let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (facultyId) list = list.filter(r => r.facultyId === facultyId);
      if (branch) list = list.filter(r => r.branch === branch);
      return list;
    }
    let list = JSON.parse(localStorage.getItem('acad_attendance_edit_requests') || '[]');
    if (facultyId) list = list.filter(r => r.facultyId === facultyId);
    if (branch) list = list.filter(r => r.branch === branch);
    return list;
  },

  approveAttendanceEditRequest: async (requestId, hodId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'attendance_edit_requests', requestId);
      await updateDoc(docRef, { status: 'approved', approvedBy: hodId });
      return true;
    }
    const requests = JSON.parse(localStorage.getItem('acad_attendance_edit_requests') || '[]');
    const idx = requests.findIndex(r => r.requestId === requestId || r.id === requestId);
    if (idx !== -1) {
      requests[idx].status = 'approved';
      requests[idx].approvedBy = hodId;
      localStorage.setItem('acad_attendance_edit_requests', JSON.stringify(requests));
      return true;
    }
    return false;
  },

  checkAttendanceEditAllowed: async (facultyId, branch, semester, section, subject, period, date) => {
    const today = new Date().toISOString().split('T')[0];
    const diffTime = Math.abs(new Date(today) - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return true; // less than 24 hours, direct edit allowed

    // Check HOD approvals
    const requests = await mockDB.getAttendanceEditRequests(facultyId);
    return requests.some(r => 
      r.status === 'approved' && 
      r.attendanceDate === date && 
      Number(r.period) === Number(period) &&
      r.subject === subject &&
      r.branch === branch &&
      r.semester === semester &&
      r.section === section
    );
  },

  // --- LEAVE APPLICATIONS ---
  applyLeave: async (studentId, studentName, rollNumber, department, semester, section, reason, startDate, endDate, applicantRole = 'student', leaveType = 'Casual Leave') => {
    await mockDB.delay(100);
    const payload = {
      studentId: studentId || '',
      applicantId: studentId || '',
      facultyId: studentId || '',
      studentName: studentName || 'User',
      applicantName: studentName || 'User',
      facultyName: studentName || 'User',
      rollNumber: rollNumber || '',
      facultyCode: rollNumber || 'FAC-101',
      applicantRole: applicantRole || 'student',
      department: department || '',
      semester: semester || '',
      section: section || '',
      leaveType: leaveType || 'Casual Leave',
      reason: reason || '',
      startDate: startDate || '',
      endDate: endDate || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        const ref = await addDoc(collection(db, 'leave_requests'), payload);
        const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
        const newLeave = { leaveId: ref.id, id: ref.id, ...payload };
        leaves.push(newLeave);
        localStorage.setItem('acad_leave_requests', JSON.stringify(leaves));
        return newLeave;
      } catch (err) {
        console.error("Firestore addDoc for leave_requests failed, falling back to local storage:", err);
      }
    }
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const newLeave = { leaveId: 'leave-' + Math.random().toString(36).substr(2, 9), ...payload };
    leaves.push(newLeave);
    localStorage.setItem('acad_leave_requests', JSON.stringify(leaves));
    return newLeave;
  },

  getLeaves: async (role, uid, dept = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'leave_requests'));
        list = snap.docs.map(doc => ({ leaveId: doc.id, id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs for leave_requests failed, using local storage:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.leaveId || item.id;
      if (key) combinedMap.set(key, item);
    });
    let resultList = Array.from(combinedMap.values());

    if (role === 'student') {
      resultList = resultList.filter(l => l.studentId === uid || l.applicantId === uid || l.uid === uid);
    } else if (role === 'faculty_self') {
      resultList = resultList.filter(l => (l.studentId === uid || l.applicantId === uid || l.facultyId === uid || l.uid === uid) && l.applicantRole === 'faculty');
    } else if (role === 'counsellor' || role === 'faculty') {
      // Ward Counsellor sees student leave requests belonging ONLY to their assigned branch/department, semester, and section
      resultList = resultList.filter(l => l.applicantRole === 'student' || !l.applicantRole);
      
      let scopeBranch = null;
      let scopeSem = null;
      let scopeSec = null;

      if (dept && typeof dept === 'object') {
        scopeBranch = dept.assignedBranch || dept.branch || dept.department;
        scopeSem = dept.assignedSemester || dept.semester;
        scopeSec = dept.assignedSection || dept.section;
      } else if (typeof dept === 'string') {
        scopeBranch = dept;
      }

      if (scopeBranch && scopeBranch !== 'All' && scopeBranch !== 'N/A') {
        resultList = resultList.filter(l => isDepartmentMatch(l.department || l.branch, scopeBranch));
      }
      if (scopeSem && scopeSem !== 'All' && scopeSem !== 'N/A') {
        const targetSem = normalizeSemester(scopeSem);
        resultList = resultList.filter(l => !l.semester || normalizeSemester(l.semester) === targetSem);
      }
      if (scopeSec && scopeSec !== 'All' && scopeSec !== 'N/A') {
        const targetSec = normalizeSection(scopeSec);
        resultList = resultList.filter(l => !l.section || normalizeSection(l.section) === targetSec);
      }
    } else if (role === 'hod') {
      // HOD sees faculty leave requests belonging ONLY to their department
      resultList = resultList.filter(l => l.applicantRole === 'faculty');
      if (dept && dept !== 'N/A') {
        const normDept = typeof dept === 'string' ? dept.toUpperCase().trim() : '';
        resultList = resultList.filter(l => !l.department || l.department.toUpperCase().trim() === normDept);
      }
    } else if (role === 'principal') {
      resultList = resultList.filter(l => l.applicantRole !== 'principal');
    } else if (role === 'admin') {
      resultList = resultList.filter(l => l.applicantRole === 'principal');
    }
    return resultList;
  },

  reviewLeave: async (leaveId, action, remarksOrReason = '', reviewerUser = null) => {
    await mockDB.delay(100);
    const actLower = (action || '').toLowerCase();
    const normalizedStatus = actLower === 'approved' ? 'Approved' : (actLower === 'rejected' ? 'Rejected' : action);
    const isApproved = normalizedStatus === 'Approved';
    const isRejected = normalizedStatus === 'Rejected';
    const nowIso = new Date().toISOString();

    const updateFields = {
      status: normalizedStatus,
      counsellorStatus: normalizedStatus,
      hodStatus: normalizedStatus
    };

    if (isApproved) {
      if (reviewerUser) {
        updateFields.approvedBy = reviewerUser.uid || reviewerUser.id || '';
        updateFields.approvedByName = reviewerUser.fullName || reviewerUser.name || 'Ward Counsellor';
      }
      updateFields.approvedAt = nowIso;
      updateFields.remarks = remarksOrReason || 'Approved by Ward Counsellor';
    } else if (isRejected) {
      if (reviewerUser) {
        updateFields.rejectedBy = reviewerUser.uid || reviewerUser.id || '';
        updateFields.rejectedByName = reviewerUser.fullName || reviewerUser.name || 'Ward Counsellor';
      }
      updateFields.rejectedAt = nowIso;
      updateFields.rejectionReason = remarksOrReason || 'Rejected by approver';
      updateFields.remarks = remarksOrReason || 'Rejected';
    }

    let targetStudentId = null;
    let leaveType = 'Leave Application';
    let startDate = '';
    let endDate = '';

    // 1. Update Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'leave_requests', leaveId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          targetStudentId = d.studentId || d.applicantId || d.uid;
          leaveType = d.leaveType || 'Leave';
          startDate = d.startDate || d.fromDate || '';
          endDate = d.endDate || d.toDate || '';
        }
        await updateDoc(docRef, updateFields);
      } catch (err) {
        console.error("Firestore updateDoc for leave_requests failed:", err);
      }
    }

    // 2. Update Local Storage Fallback
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const idx = leaves.findIndex(l => l.leaveId === leaveId || l.id === leaveId);
    if (idx !== -1) {
      leaves[idx] = { ...leaves[idx], ...updateFields };
      localStorage.setItem('acad_leave_requests', JSON.stringify(leaves));
      if (!targetStudentId) {
        targetStudentId = leaves[idx].studentId || leaves[idx].applicantId || leaves[idx].uid;
        leaveType = leaves[idx].leaveType || 'Leave';
        startDate = leaves[idx].startDate || leaves[idx].fromDate || '';
        endDate = leaves[idx].endDate || leaves[idx].toDate || '';
      }
    }

    // 3. Send Notification to Student
    if (targetStudentId) {
      const msg = isApproved
        ? `Your leave application (${leaveType}) from ${startDate} to ${endDate} has been Approved by your Ward Counsellor (${reviewerUser?.fullName || 'Ward Counsellor'}).`
        : `Your leave application (${leaveType}) from ${startDate} to ${endDate} was Rejected by your Ward Counsellor. Reason: ${remarksOrReason}`;
      
      try {
        await mockDB.addNotification(targetStudentId, msg, isApproved ? 'Leave Approved' : 'Leave Rejected');
      } catch (notifErr) {
        console.warn("Notification error:", notifErr);
      }
    }

    return true;
  },

  getStudentLeaves: async (uid) => {
    return await mockDB.getLeaves('student', uid);
  },

  applyStudentLeave: async (studentId, data) => {
    return await mockDB.applyLeave(
      studentId,
      data.studentName || data.name,
      data.rollNumber || '',
      data.department || data.branch || '',
      data.semester || '',
      data.section || '',
      data.reason,
      data.fromDate || data.startDate,
      data.toDate || data.endDate,
      'student',
      data.leaveType || 'Casual Leave'
    );
  },

  getStudentFullDetails: async (studentIdOrRoll) => {
    await mockDB.delay(100);
    const queryStr = String(studentIdOrRoll || '').trim().toLowerCase();
    let student = null;

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'profiles', studentIdOrRoll);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          student = { uid: docSnap.id, id: docSnap.id, ...docSnap.data() };
        } else {
          const snap = await getDocs(query(collection(db, 'profiles'), where('rollNumber', '==', studentIdOrRoll)));
          if (!snap.empty) {
            const d = snap.docs[0];
            student = { uid: d.id, id: d.id, ...d.data() };
          }
        }
      } catch (err) {
        console.warn("Firestore student profile lookup error:", err);
      }
    }

    if (!student) {
      const allUsers = await mockDB.getAllUsers();
      student = allUsers.find(u => 
        (u.uid && u.uid.toLowerCase() === queryStr) ||
        (u.id && u.id.toLowerCase() === queryStr) ||
        (u.rollNumber && u.rollNumber.toLowerCase() === queryStr)
      );
    }

    if (!student) {
      const seeded = SEEDED_STUDENTS.find(s => 
        s.rollNumber.toLowerCase() === queryStr || 
        s.uid.toLowerCase() === queryStr
      );
      if (seeded) student = seeded;
    }

    // Fetch past leaves for student
    const pastLeaves = await mockDB.getStudentLeaves(student?.uid || studentIdOrRoll);

    return {
      student: student || {
        fullName: 'Student Profile',
        rollNumber: studentIdOrRoll,
        email: `${studentIdOrRoll}@kbn.edu`,
        phoneNumber: '9876543210',
        parentName: 'Richard Doe (Father)',
        parentPhone: '9876500000',
        department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
        semester: 'Semester 6',
        section: 'Section A',
        attendancePercentage: 84.5,
        internalMarks: '42 / 50'
      },
      leaves: pastLeaves || []
    };
  },

  getFollowUpReminders: async (counsellorId) => {
    await mockDB.delay(50);
    return [
      { id: 'rem-1', studentName: 'AVALA ANAND BABU', rollNumber: '245901', note: 'Attendance low (68%) - Schedule parent call', dueDate: new Date().toISOString().split('T')[0] },
      { id: 'rem-2', studentName: 'DASIKA SARATH KUMAR', rollNumber: '245902', note: 'Mid-term performance review', dueDate: new Date().toISOString().split('T')[0] }
    ];
  },

  getStudentConcerns: async (counsellorId) => {
    await mockDB.delay(50);
    return [
      { id: 'con-1', studentName: 'SHAIK NAADIA TASLEEM', rollNumber: '245903', topic: 'Academic Stress', date: '2026-06-01', status: 'Pending Review' }
    ];
  },

  getMonthlyWardSummary: async (counsellorId, month, year) => {
    await mockDB.delay(50);
    return {
      totalWards: 45,
      avgAttendance: 84.5,
      meetingsConducted: 8,
      parentsContacted: 5,
      leavesProcessed: 12
    };
  },

  getSectionAnalytics: async (department) => {
    await mockDB.delay(50);
    return [
      { section: 'Section A', totalStudents: 23, avgAttendance: 86.2, passRate: 92 },
      { section: 'Section B', totalStudents: 22, avgAttendance: 82.8, passRate: 88 }
    ];
  },

  // --- ATTENDANCE STATS & COUNSELLOR METRICS ---
  getAttendanceForStudent: async (studentId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'attendance'));
      return snap.docs.map(doc => doc.data()).filter(a => a.studentId === studentId);
    }
    return JSON.parse(localStorage.getItem('acad_attendance') || '[]').filter(a => a.studentId === studentId);
  },

  getWardsAbsentToday: async (counsellorId) => {
    const today = new Date().toISOString().split('T')[0];
    const allUsers = await mockDB.getAllUsers();
    // Get wards
    const wards = allUsers.filter(u => u.role === 'student' && u.counsellorId === counsellorId);
    const wardIds = wards.map(w => w.uid);

    const todayAttendance = [];
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'attendance'));
      const list = snap.docs.map(doc => doc.data()).filter(a => a.date === today && wardIds.includes(a.studentId));
      todayAttendance.push(...list);
    } else {
      const list = JSON.parse(localStorage.getItem('acad_attendance') || '[]').filter(a => a.date === today && wardIds.includes(a.studentId));
      todayAttendance.push(...list);
    }
    return todayAttendance;
  },

  getStudentMarks: async (studentId) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'assignment_marks'));
      const subMarks = snap.docs.map(doc => doc.data()).filter(m => m.studentId === studentId);
      
      const internalSnap = await getDocs(collection(db, 'internal_marks'));
      const intMarks = internalSnap.docs.map(doc => doc.data()).filter(m => m.studentId === studentId);

      return {
        assignments: subMarks,
        internals: intMarks
      };
    }
    const marks = JSON.parse(localStorage.getItem('acad_marks') || '[]').filter(m => m.studentId === studentId);
    const internals = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]').filter(m => m.studentId === studentId);
    return {
      assignments: marks,
      internals
    };
  },

  saveStudentMarks: async (studentId, studentName, rollNumber, branch, semester, section, subject, facultyId, facultyName, mid1, mid2, assignments, status = 'Draft') => {
    await mockDB.delay(100);
    const m1 = Math.min(30, Math.max(0, Number(mid1 || 0)));
    const m2 = Math.min(30, Math.max(0, Number(mid2 || 0)));
    const ass = Math.min(10, Math.max(0, Number(assignments || 0)));
    const total = m1 + m2 + ass;

    const now = new Date().toISOString();
    const docId = `${studentId}_${subject}_${semester}`.replace(/\s+/g, '_');

    const payload = {
      id: docId,
      docId,
      studentId,
      studentUid: studentId,
      rollNumber,
      studentRollNumber: rollNumber,
      studentName,
      department: branch,
      branch,
      semester,
      section: section || 'A',
      subject,
      facultyId: facultyId || 'fac-1',
      facultyUid: facultyId || 'fac-1',
      facultyName: facultyName || 'Faculty Member',
      mid1: m1,
      mid2: m2,
      assignments: ass,
      total,
      status: status || 'Draft',
      updatedAt: now,
      createdAt: now
    };

    if (isFirebaseConfigured && db) {
      const docRefInternal = doc(db, 'internal_marks', docId);
      const docRefMarks = doc(db, 'marks', docId);

      const existingSnap = await getDoc(docRefInternal);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData.status === 'Published' && status === 'Draft') {
          payload.status = 'Published';
        }
        await updateDoc(docRefInternal, { ...payload, updatedAt: serverTimestamp() });
        await setDoc(docRefMarks, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        await setDoc(docRefInternal, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        await setDoc(docRefMarks, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      return payload;
    }

    const internals = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]');
    const idx = internals.findIndex(m => (m.studentId === studentId || m.rollNumber === rollNumber) && m.subject === subject && m.semester === semester);
    if (idx !== -1) {
      internals[idx] = { ...internals[idx], ...payload };
    } else {
      internals.push(payload);
    }
    localStorage.setItem('acad_internal_marks', JSON.stringify(internals));
    return payload;
  },

  publishStudentMarks: async (branch, semester, subject, facultyId, facultyName) => {
    await mockDB.delay(100);
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'internal_marks'));
      const matches = snap.docs.filter(d => {
        const data = d.data();
        return (data.branch === branch || data.department === branch) && data.semester === semester && data.subject === subject;
      });

      for (const docSnap of matches) {
        const dRef = doc(db, 'internal_marks', docSnap.id);
        const markData = docSnap.data();
        await updateDoc(dRef, {
          status: 'Published',
          publishedAt: now,
          updatedAt: serverTimestamp()
        });

        if (markData.studentId) {
          await addDoc(collection(db, 'notifications'), {
            studentId: markData.studentId,
            rollNumber: markData.rollNumber,
            title: 'Internal Marks Published',
            content: `Your Internal Marks for ${subject} (${semester}) have been published by ${facultyName || 'Faculty'}. Total: ${markData.total}`,
            type: 'marks',
            read: false,
            createdAt: now
          });
        }
      }
      return true;
    }

    const internals = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]');
    internals.forEach((m, idx) => {
      if ((m.branch === branch || m.department === branch) && m.semester === semester && m.subject === subject) {
        internals[idx].status = 'Published';
        internals[idx].publishedAt = now;
      }
    });
    localStorage.setItem('acad_internal_marks', JSON.stringify(internals));
    return true;
  },

  unlockStudentMarks: async (docId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const dRef = doc(db, 'internal_marks', docId);
      await updateDoc(dRef, { status: 'Draft', updatedAt: serverTimestamp() });
      return true;
    }
    const internals = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]');
    const idx = internals.findIndex(m => m.id === docId || m.docId === docId);
    if (idx !== -1) {
      internals[idx].status = 'Draft';
      localStorage.setItem('acad_internal_marks', JSON.stringify(internals));
    }
    return true;
  },

  subscribeBranchMarks: (branch, semester, subject, callback) => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'internal_marks'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(m => (m.branch === branch || m.department === branch) && m.semester === semester && m.subject === subject);
        callback(list);
      }, (err) => {
        console.error("subscribeBranchMarks error:", err);
      });
    }
    const list = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]')
      .filter(m => (m.branch === branch || m.department === branch) && m.semester === semester && m.subject === subject);
    callback(list);
    return () => {};
  },

  subscribeStudentMarks: (studentId, rollNumber, callback) => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'internal_marks'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(m => 
            (m.studentId === studentId || (rollNumber && m.rollNumber === rollNumber)) &&
            (m.status === 'Published' || m.status === 'Locked')
          );
        callback(list);
      }, (err) => {
        console.error("subscribeStudentMarks error:", err);
      });
    }
    const list = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]')
      .filter(m => 
        (m.studentId === studentId || (rollNumber && m.rollNumber === rollNumber)) &&
        (m.status === 'Published' || m.status === 'Locked')
      );
    callback(list);
    return () => {};
  },

  getBranchMarks: async (branch, semester, subject) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'internal_marks'));
      return snap.docs.map(doc => doc.data()).filter(m => m.branch === branch && m.semester === semester && m.subject === subject);
    }
    return JSON.parse(localStorage.getItem('acad_internal_marks') || '[]').filter(m => m.branch === branch && m.semester === semester && m.subject === subject);
  },

  getFees: async (studentId) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'fees'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(f => f.studentId === studentId);
    }
    return JSON.parse(localStorage.getItem('acad_fees') || '[]').filter(f => f.studentId === studentId);
  },

  getAttendance: async (department = null, semester = null, studentId = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'attendance'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getDocs attendance fallback to local:", err.message);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || `${item.studentId}-${item.date}-${item.subject}-${item.lecturePeriod}`;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    if (studentId) result = result.filter(a => a.studentId === studentId);
    if (department) result = result.filter(a => !a.department || a.department === department);
    if (semester) result = result.filter(a => !a.semester || a.semester === semester);
    return result;
  },

  markAttendance: async (records, date, subject, department, semester, section, facultyId, lecturePeriod = 'Period 1') => {
    await mockDB.delay(100);
    const existing = JSON.parse(localStorage.getItem('acad_attendance') || '[]');

    const isDuplicate = existing.some(a => 
      a.date === date && 
      a.subject === subject && 
      a.lecturePeriod === lecturePeriod && 
      (!a.department || a.department === department) && 
      (!a.semester || a.semester === semester) && 
      (!a.section || a.section === section)
    );

    if (isDuplicate) {
      throw new Error("Attendance already submitted for this period.");
    }

    const newRecords = [];
    for (const r of records) {
      const payload = {
        studentId: r.studentId,
        rollNumber: r.rollNumber || '',
        studentName: r.studentName || 'Student',
        department: department || 'CSE',
        semester: semester || 'VI',
        section: section || 'A',
        subject: subject || 'Neural Networks & Deep Learning',
        facultyId: facultyId || '',
        lecturePeriod: lecturePeriod || 'Period 1',
        date: date || new Date().toISOString().split('T')[0],
        status: r.status || 'Present',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isFirebaseConfigured && db) {
        try {
          await addDoc(collection(db, 'attendance'), payload);
        } catch (err) {
          console.warn("Firestore addDoc attendance fallback to local:", err.message);
        }
      }
      newRecords.push({ id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...payload });
    }

    const combined = [...newRecords, ...existing];
    localStorage.setItem('acad_attendance', JSON.stringify(combined));

    records.forEach(r => {
      if (r.status === 'Absent') {
        mockDB.addNotification(r.studentId, `Attendance Alert: Marked ABSENT for ${subject} (${date}, ${lecturePeriod})`);
      }
    });

    return true;
  },

  // --- PLACEMENT ENGINE SERVICES ---

  getPlacementDrives: async (role = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_drives'));
        list = snap.docs.map(doc => ({ id: doc.id, driveId: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getDocs placement_drives fallback to local:", err.message);
      }
    }
    
    let localList = JSON.parse(localStorage.getItem('acad_placement_drives') || 'null');
    if (!localList || localList.length === 0) {
      localList = DEFAULT_PLACEMENT_DRIVES;
      localStorage.setItem('acad_placement_drives', JSON.stringify(DEFAULT_PLACEMENT_DRIVES));
    }
    
    const combinedMap = new Map();
    [...DEFAULT_PLACEMENT_DRIVES, ...list, ...localList].forEach(item => {
      const key = item.id || item.driveId;
      if (key) combinedMap.set(key, item);
    });
    
    let result = Array.from(combinedMap.values()).map(d => {
      const cName = typeof d.companyName === 'string' ? d.companyName : (typeof d.company === 'string' ? d.company : 'Corporate Partner');
      const jRole = typeof d.jobRole === 'string' ? d.jobRole : (typeof d.role === 'string' ? d.role : 'Software Engineer');
      const pkg = typeof d.package === 'string' ? d.package : (typeof d.salaryPackage === 'string' ? d.salaryPackage : 'Negotiable');
      const loc = typeof d.location === 'string' ? d.location : 'Bangalore / Hyderabad';
      
      return {
        ...d,
        id: d.id || d.driveId,
        driveId: d.driveId || d.id,
        companyName: cName,
        jobRole: jRole,
        package: pkg,
        location: loc,
        driveDate: typeof d.driveDate === 'string' ? d.driveDate : '',
        deadline: typeof d.deadline === 'string' ? d.deadline : '',
        applicationDeadline: typeof d.applicationDeadline === 'string' ? d.applicationDeadline : (typeof d.deadline === 'string' ? d.deadline : ''),
        minCgpa: d.minCgpa !== undefined ? d.minCgpa : 6.0,
        maxBacklogs: d.maxBacklogs !== undefined ? d.maxBacklogs : 0,
        eligibleBranches: Array.isArray(d.eligibleBranches) ? d.eligibleBranches : ['CSE', 'ECE', 'EEE', 'AI & ML', 'CIVIL', 'MECHANICAL', 'MCA'],
        status: typeof d.status === 'string' ? d.status : 'Published'
      };
    });

    if (role === 'student') {
      result = result.filter(d => {
        const s = (d.status || '').toLowerCase();
        return s === 'published' || s === 'open' || s === 'active' || s === 'upcoming';
      });
    }

    return result;
  },

  createPlacementDrive: async (driveData) => {
    await mockDB.delay(150);
    const now = new Date().toISOString();
    const payload = {
      ...driveData,
      status: driveData.status || 'Published',
      selectedStudents: driveData.selectedStudents || [],
      createdAt: now,
      updatedAt: now
    };

    let driveId = 'drive-' + Date.now();
    if (isFirebaseConfigured && db) {
      try {
        const ref = await addDoc(collection(db, 'placement_drives'), payload);
        driveId = ref.id;
      } catch (err) {
        console.error("Firestore addDoc placement_drives failed:", err);
      }
    }

    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const newDrive = { id: driveId, driveId, ...payload };
    drives.unshift(newDrive);
    localStorage.setItem('acad_placement_drives', JSON.stringify(drives));

    if (payload.status === 'Published' || payload.status === 'Open') {
      try {
        const allUsers = await mockDB.getAllUsers();
        const students = allUsers.filter(u => u.role === 'student');
        students.forEach(st => {
          mockDB.addNotification(st.uid || st.id, `New Placement Drive Published: ${payload.companyName} (${payload.jobRole}) - Package ${payload.package}`);
        });
      } catch (_) {}
    }

    return newDrive;
  },

  updatePlacementDrive: async (driveId, driveData) => {
    await mockDB.delay(100);
    const now = new Date().toISOString();
    const updatePayload = { ...driveData, updatedAt: now };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'placement_drives', driveId);
        await updateDoc(docRef, updatePayload);
      } catch (err) {
        console.error("Firestore updateDoc placement_drives failed:", err);
      }
    }

    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const idx = drives.findIndex(d => d.id === driveId || d.driveId === driveId);
    if (idx !== -1) {
      drives[idx] = { ...drives[idx], ...updatePayload };
      localStorage.setItem('acad_placement_drives', JSON.stringify(drives));
    }
    return true;
  },

  updateDriveStatus: async (driveId, status) => {
    return await mockDB.updatePlacementDrive(driveId, { status });
  },

  deletePlacementDrive: async (driveId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'placement_drives', driveId));
      } catch (err) {
        console.error("Firestore deleteDoc placement_drives failed:", err);
      }
    }
    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const filtered = drives.filter(d => d.id !== driveId && d.driveId !== driveId);
    localStorage.setItem('acad_placement_drives', JSON.stringify(filtered));
    return true;
  },

  getPlacementApplications: async (driveId = null, studentId = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_applications'));
        list = snap.docs.map(doc => ({ id: doc.id, applicationId: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs placement_applications failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_applications') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || item.applicationId;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    if (driveId) result = result.filter(a => a.driveId === driveId);
    if (studentId) result = result.filter(a => a.studentId === studentId);
    return result;
  },

  applyForDrive: async (driveId, studentUser) => {
    await mockDB.delay(150);
    const drives = await mockDB.getPlacementDrives();
    const drive = drives.find(d => d.id === driveId || d.driveId === driveId);
    if (!drive) {
      return { success: false, reason: 'Placement Drive not found.' };
    }

    const existingApps = await mockDB.getPlacementApplications(driveId, studentUser.uid || studentUser.id);
    if (existingApps.length > 0) {
      return { success: false, reason: 'You have already submitted an application for this placement drive.' };
    }

    const studentBranch = (studentUser.department || studentUser.branch || '').toUpperCase().trim();
    const studentCgpa = parseFloat(studentUser.cgpa || studentUser.gpa || 7.5);
    const studentBacklogs = parseInt(studentUser.backlogs || 0);

    if (drive.minCgpa && studentCgpa < parseFloat(drive.minCgpa)) {
      return {
        success: false,
        reason: `Minimum CGPA required: ${drive.minCgpa}\nYour CGPA: ${studentCgpa.toFixed(1)}`
      };
    }

    if (drive.maxBacklogs !== undefined && studentBacklogs > parseInt(drive.maxBacklogs)) {
      return {
        success: false,
        reason: `Maximum active backlogs allowed: ${drive.maxBacklogs}\nYour active backlogs: ${studentBacklogs}`
      };
    }

    if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
      const eligibleUpper = drive.eligibleBranches.map(b => b.toUpperCase().trim());
      const branchMatch = eligibleUpper.some(b => b === studentBranch || studentBranch.includes(b) || b.includes(studentBranch));
      if (!branchMatch) {
        return {
          success: false,
          reason: `Eligible Branches: ${drive.eligibleBranches.join(', ')}\nYour Branch: ${studentUser.department || studentUser.branch}`
        };
      }
    }

    const payload = {
      driveId: drive.id,
      studentId: studentUser.uid || studentUser.id || 'stud-1',
      studentName: studentUser.fullName || studentUser.studentName || 'Student',
      rollNumber: studentUser.rollNumber || '245901',
      branch: studentUser.department || studentUser.branch || 'CSE',
      section: studentUser.section || 'A',
      cgpa: studentCgpa,
      backlogs: studentBacklogs,
      skills: studentUser.skills || 'C++, Java, Web Development',
      resumeUrl: studentUser.resumeUrl || '#mock-resume',
      appliedDate: new Date().toISOString().split('T')[0],
      companyName: drive.companyName,
      companyLogo: drive.companyLogo,
      jobRole: drive.jobRole,
      package: drive.package,
      status: 'Applied',
      createdAt: new Date().toISOString()
    };

    let appId = 'app-' + Date.now();
    if (isFirebaseConfigured && db) {
      try {
        const ref = await addDoc(collection(db, 'placement_applications'), payload);
        appId = ref.id;
      } catch (err) {
        console.error("Firestore addDoc placement_applications failed:", err);
      }
    }

    const apps = JSON.parse(localStorage.getItem('acad_placement_applications') || '[]');
    const newApp = { id: appId, applicationId: appId, ...payload };
    apps.unshift(newApp);
    localStorage.setItem('acad_placement_applications', JSON.stringify(apps));

    return { success: true, application: newApp };
  },

  updateApplicationStatus: async (applicationId, newStatus, remarks = '') => {
    await mockDB.delay(100);
    const now = new Date().toISOString();
    const updatePayload = { status: newStatus, remarks, updatedAt: now };

    let targetStudentId = null;
    let companyName = 'Company';
    let jobRole = 'Role';

    const apps = JSON.parse(localStorage.getItem('acad_placement_applications') || '[]');
    const idx = apps.findIndex(a => a.id === applicationId || a.applicationId === applicationId);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...updatePayload };
      localStorage.setItem('acad_placement_applications', JSON.stringify(apps));
      targetStudentId = apps[idx].studentId;
      companyName = apps[idx].companyName;
      jobRole = apps[idx].jobRole;

      if (newStatus === 'Selected') {
        const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
        const dIdx = drives.findIndex(d => d.id === apps[idx].driveId);
        if (dIdx !== -1) {
          if (!drives[dIdx].selectedStudents) drives[dIdx].selectedStudents = [];
          if (!drives[dIdx].selectedStudents.includes(targetStudentId)) {
            drives[dIdx].selectedStudents.push(targetStudentId);
            localStorage.setItem('acad_placement_drives', JSON.stringify(drives));
          }
        }
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'placement_applications', applicationId);
        await updateDoc(docRef, updatePayload);
      } catch (err) {
        console.error("Firestore updateDoc placement_applications failed:", err);
      }
    }

    if (targetStudentId) {
      let notifMsg = `Placement Update for ${companyName} (${jobRole}): Status changed to ${newStatus}`;
      if (newStatus === 'Shortlisted') notifMsg = `You have been shortlisted for ${companyName}!`;
      if (newStatus === 'Selected') notifMsg = `Congratulations! You have been selected at ${companyName} for ${jobRole}!`;
      mockDB.addNotification(targetStudentId, notifMsg);
    }

    return true;
  },

  scheduleInterview: async (interviewData) => {
    await mockDB.delay(150);
    const now = new Date().toISOString();
    const payload = { ...interviewData, createdAt: now };

    let intId = 'int-' + Date.now();
    if (isFirebaseConfigured && db) {
      try {
        const ref = await addDoc(collection(db, 'placement_interviews'), payload);
        intId = ref.id;
      } catch (err) {
        console.error("Firestore addDoc placement_interviews failed:", err);
      }
    }

    const interviews = JSON.parse(localStorage.getItem('acad_placement_interviews') || '[]');
    const newInt = { id: intId, ...payload };
    interviews.unshift(newInt);
    localStorage.setItem('acad_placement_interviews', JSON.stringify(interviews));

    if (payload.applicationId) {
      await mockDB.updateApplicationStatus(payload.applicationId, 'Interview Scheduled', `Round: ${payload.round} on ${payload.date} ${payload.time}`);
    }

    if (payload.studentId) {
      mockDB.addNotification(payload.studentId, `Interview Scheduled: ${payload.companyName} (${payload.round}) on ${payload.date} at ${payload.time}. Venue: ${payload.venue}`);
    }

    return newInt;
  },

  getPlacementInterviews: async (studentId = null) => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_interviews'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs placement_interviews failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_interviews') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());
    if (studentId) result = result.filter(i => i.studentId === studentId);
    return result;
  },

  getPlacementCompanies: async () => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_companies'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs placement_companies failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_companies') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id;
      if (key) combinedMap.set(key, item);
    });
    return Array.from(combinedMap.values());
  },

  savePlacementCompany: async (companyData) => {
    await mockDB.delay(100);
    const now = new Date().toISOString();
    const payload = { ...companyData, updatedAt: now };

    let compId = companyData.id || 'comp-' + Date.now();
    if (isFirebaseConfigured && db) {
      try {
        if (companyData.id) {
          await updateDoc(doc(db, 'placement_companies', companyData.id), payload);
        } else {
          const ref = await addDoc(collection(db, 'placement_companies'), payload);
          compId = ref.id;
        }
      } catch (err) {
        console.error("Firestore save placement_companies failed:", err);
      }
    }

    const comps = JSON.parse(localStorage.getItem('acad_placement_companies') || '[]');
    const idx = comps.findIndex(c => c.id === compId);
    if (idx !== -1) {
      comps[idx] = { ...comps[idx], ...payload };
    } else {
      comps.unshift({ id: compId, ...payload });
    }
    localStorage.setItem('acad_placement_companies', JSON.stringify(comps));
    return true;
  },

  deletePlacementCompany: async (companyId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'placement_companies', companyId));
      } catch (err) {
        console.error("Firestore deleteDoc placement_companies failed:", err);
      }
    }
    const comps = JSON.parse(localStorage.getItem('acad_placement_companies') || '[]');
    const filtered = comps.filter(c => c.id !== companyId);
    localStorage.setItem('acad_placement_companies', JSON.stringify(filtered));
    return true;
  },

  getPlacementTrainings: async () => {
    await mockDB.delay(100);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'placement_trainings'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs placement_trainings failed:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_placement_trainings') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id;
      if (key) combinedMap.set(key, item);
    });
    return Array.from(combinedMap.values());
  },

  savePlacementTraining: async (trainingData) => {
    await mockDB.delay(100);
    const payload = { ...trainingData, createdAt: new Date().toISOString() };

    let trId = trainingData.id || 'tr-' + Date.now();
    if (isFirebaseConfigured && db) {
      try {
        if (trainingData.id) {
          await updateDoc(doc(db, 'placement_trainings', trainingData.id), payload);
        } else {
          const ref = await addDoc(collection(db, 'placement_trainings'), payload);
          trId = ref.id;
        }
      } catch (err) {
        console.error("Firestore save placement_trainings failed:", err);
      }
    }

    const trs = JSON.parse(localStorage.getItem('acad_placement_trainings') || '[]');
    const idx = trs.findIndex(t => t.id === trId);
    if (idx !== -1) {
      trs[idx] = { ...trs[idx], ...payload };
    } else {
      trs.unshift({ id: trId, ...payload });
    }
    localStorage.setItem('acad_placement_trainings', JSON.stringify(trs));

    try {
      const allUsers = await mockDB.getAllUsers();
      const students = allUsers.filter(u => u.role === 'student');
      students.forEach(st => {
        mockDB.addNotification(st.uid || st.id, `New Placement Training Session: ${trainingData.title} on ${trainingData.date}`);
      });
    } catch (_) {}

    return true;
  },

  registerForTraining: async (trainingId, studentUser) => {
    await mockDB.delay(100);
    const stId = studentUser.uid || studentUser.id;
    const trs = JSON.parse(localStorage.getItem('acad_placement_trainings') || '[]');
    const idx = trs.findIndex(t => t.id === trainingId);
    if (idx !== -1) {
      if (!trs[idx].registeredStudents) trs[idx].registeredStudents = [];
      if (!trs[idx].registeredStudents.includes(stId)) {
        trs[idx].registeredStudents.push(stId);
        localStorage.setItem('acad_placement_trainings', JSON.stringify(trs));
      }
    }
    if (isFirebaseConfigured && db) {
      try {
        const trRef = doc(db, 'placement_trainings', trainingId);
        const snap = await getDoc(trRef);
        if (snap.exists()) {
          const currentData = snap.data();
          const registered = currentData.registeredStudents || [];
          if (!registered.includes(stId)) {
            registered.push(stId);
            await updateDoc(trRef, { registeredStudents: registered });
          }
        }
      } catch (err) {
        console.error("Firestore update placement_trainings failed:", err);
      }
    }
    return true;
  },

  getPlacementAnalytics: async () => {
    await mockDB.delay(50);
    const [drives, apps, companies, users] = await Promise.all([
      mockDB.getPlacementDrives(),
      mockDB.getPlacementApplications(),
      mockDB.getPlacementCompanies(),
      mockDB.getAllUsers()
    ]);

    const students = users.filter(u => u.role === 'student');
    const totalStudents = students.length || 1;
    const selectedApps = apps.filter(a => a.status === 'Selected');
    const placedStudentIds = new Set(selectedApps.map(a => a.studentId));
    const totalPlaced = placedStudentIds.size;
    const placementRate = Math.round((totalPlaced / totalStudents) * 100);

    const branches = ['CSE', 'ECE', 'EEE', 'AI & ML', 'CIVIL', 'MECHANICAL', 'MCA', 'BCA'];
    const branchPlacements = branches.map(b => {
      const bStuds = students.filter(s => (s.department || s.branch || '').toUpperCase().includes(b)).length || 1;
      const bPlaced = selectedApps.filter(a => (a.branch || '').toUpperCase().includes(b)).length;
      return {
        branch: b,
        department: b,
        totalStudents: bStuds,
        placedStudents: bPlaced,
        placementRate: Math.min(100, Math.round((bPlaced / bStuds) * 100))
      };
    });

    const packages = selectedApps
      .map(a => parseFloat((a.package || '').replace(/[^0-9.]/g, '')))
      .filter(p => !isNaN(p) && p > 0);
    const highestPackage = packages.length > 0 ? `${Math.max(...packages).toFixed(1)} LPA` : '28.5 LPA';
    const lowestPackage = packages.length > 0 ? `${Math.min(...packages).toFixed(1)} LPA` : '6.5 LPA';
    const avgPackage = packages.length > 0 
      ? `${(packages.reduce((acc, c) => acc + c, 0) / packages.length).toFixed(1)} LPA`
      : '12.4 LPA';

    return {
      overview: {
        totalStudents,
        totalDrives: drives.length,
        totalOffers: selectedApps.length,
        totalPlaced,
        placementRate: Math.min(100, placementRate),
        highestPackage,
        avgPackage,
        lowestPackage
      },
      branchPlacements,
      companies,
      drives,
      applications: apps
    };
  },

  payFee: async (feeId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'fees', feeId);
      await updateDoc(docRef, { status: 'paid', paidAt: new Date().toISOString() });
      return true;
    }
    const fees = JSON.parse(localStorage.getItem('acad_fees') || '[]');
    const idx = fees.findIndex(f => f.id === feeId);
    if (idx !== -1) {
      fees[idx].status = 'paid';
      fees[idx].paidAt = new Date().toISOString();
      localStorage.setItem('acad_fees', JSON.stringify(fees));
      return true;
    }
    return false;
  },



  getAnnouncements: async () => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'announcements'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return JSON.parse(localStorage.getItem('acad_announcements') || '[]').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createAnnouncement: async (title, content, author) => {
    await mockDB.delay(100);
    const payload = { title, content, author, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'announcements'), payload);
      return { id: ref.id, ...payload };
    }
    const announcements = JSON.parse(localStorage.getItem('acad_announcements') || '[]');
    const newAnn = { id: 'ann-' + Math.random().toString(36).substr(2, 9), ...payload };
    announcements.push(newAnn);
    localStorage.setItem('acad_announcements', JSON.stringify(announcements));
    return newAnn;
  },

  getStudents: async (department = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'students'));
        list = snap.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));
        if (list.length === 0) {
          const profileSnap = await getDocs(collection(db, 'profiles'));
          list = profileSnap.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() })).filter(u => u.role === 'student');
        }
      } catch (err) {
        console.warn("Firestore getDocs for students failed:", err.message);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.uid || item.id || item.studentId;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    if (department && department !== 'All' && department !== 'N/A') {
      result = result.filter(s => isDepartmentMatch(s.department || s.branch, department));
    }
    return result;
  },

  getNotes: async (department = null, semester = null, section = null, subject = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'notes'));
        list = snap.docs.map(doc => ({ noteId: doc.id, id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firestore getDocs for notes failed, using local storage:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_notes') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.noteId || item.id;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    // Filter published status (or missing status for backward compatibility)
    result = result.filter(n => !n.status || n.status === 'published' || n.status === 'Published');

    // Department match
    if (department && department !== 'All' && department !== 'N/A') {
      result = result.filter(n => isDepartmentMatch(n.department || n.branch, department));
    }

    // Semester match using normalization
    if (semester && semester !== 'All' && semester !== 'N/A') {
      const targetSem = normalizeSemester(semester);
      result = result.filter(n => {
        if (!n.semester || n.semester === 'All') return true;
        return normalizeSemester(n.semester) === targetSem;
      });
    }

    // Section match using normalization (section is optional if note applies to all sections)
    if (section && section !== 'All' && section !== 'N/A') {
      const targetSec = normalizeSection(section);
      result = result.filter(n => {
        if (!n.section || n.section === 'All' || n.section === 'All Sections') return true;
        return normalizeSection(n.section) === targetSec;
      });
    }

    // Subject match (flexible substring)
    if (subject && subject !== 'All' && subject !== 'N/A') {
      const targetSubj = subject.toUpperCase().trim();
      result = result.filter(n => {
        if (!n.subject) return true;
        const noteSubj = n.subject.toUpperCase().trim();
        return noteSubj.includes(targetSubj) || targetSubj.includes(noteSubj);
      });
    }

    return result;
  },

  uploadNote: async (facultyId, facultyName, department, semester, subject, topic, description, fileName, fileData, section = 'Section A', facultyEmail = '') => {
    await mockDB.delay(150);
    let fileUrl = '';
    let fName = fileName || (fileData && fileData.name ? fileData.name : 'notes.pdf');
    let filePublicId = '';

    if (fileData) {
      if (typeof fileData !== 'string' && (fileData instanceof Blob || fileData instanceof File)) {
        console.log(`[Study Notes] Selected file: ${fileData.name}`);
        console.log(`[Study Notes] File type: ${fileData.type}`);
        console.log(`[Study Notes] File size: ${fileData.size}`);
        console.log(`[Cloudinary] Uploading study note file to college-erp/study-notes...`);
        const uploadRes = await uploadFileToCloudinary(fileData, 'college-erp/study-notes');
        fileUrl = uploadRes.url;
        fName = uploadRes.originalName;
        filePublicId = uploadRes.publicId;
      } else if (typeof fileData === 'string') {
        fileUrl = fileData;
      }
    }

    const dept = (department || 'CSE').trim();
    const normSem = normalizeSemester(semester || 'Semester 1');
    const normSec = normalizeSection(section || 'Section A');

    const payload = {
      title: topic || subject || 'Lecture Notes',
      topic: topic || subject || 'Lecture Notes',
      description: description || '',
      fileName: fName,
      fileUrl: fileUrl || '#mock-download',
      fileType: fName ? (fName.split('.').pop() || 'pdf') : 'pdf',
      fileSize: fileData && fileData.size ? `${(fileData.size / 1024).toFixed(1)} KB` : '1.2 MB',

      department: dept,
      branch: dept,
      targetBranch: dept,
      semester: normSem,
      targetSemester: normSem,
      section: normSec,
      targetSection: normSec,
      subject: subject || 'General',
      targetSubject: subject || 'General',

      facultyId: facultyId || '',
      facultyName: facultyName || 'Faculty',
      facultyEmail: facultyEmail || '',
      uploadedBy: facultyName || 'Faculty',

      status: 'published',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let noteId = `note-${Date.now()}`;
    if (isFirebaseConfigured && db) {
      try {
        const refDoc = await addDoc(collection(db, 'notes'), payload);
        noteId = refDoc.id;
        console.log('[Firestore] Metadata saved');
      } catch (err) {
        console.warn("Firestore addDoc for notes failed, saving locally:", err.message);
      }
    }

    const notes = JSON.parse(localStorage.getItem('acad_notes') || '[]');
    const newNote = { noteId: noteId, id: noteId, ...payload };
    notes.unshift(newNote);
    localStorage.setItem('acad_notes', JSON.stringify(notes));

    try {
      const students = await mockDB.getStudents(dept);
      students.forEach(st => {
        mockDB.addNotification(st.uid || st.id || st.studentId, `New Study Material Published: ${topic || subject} - ${fName}`);
      });
    } catch (e) {
      console.warn("Notification send error for note:", e);
    }

    return newNote;
  },

  deleteNote: async (noteId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db && noteId) {
      try {
        await deleteDoc(doc(db, 'notes', noteId));
      } catch (err) {
        console.warn("Firestore deleteDoc for notes failed:", err.message);
      }
    }
    const notes = JSON.parse(localStorage.getItem('acad_notes') || '[]');
    const filtered = notes.filter(n => n.id !== noteId && n.noteId !== noteId);
    localStorage.setItem('acad_notes', JSON.stringify(filtered));
    return true;
  },

  getInternalMarks: async (department = null, semester = null, subject = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'internal_marks'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getDocs internal_marks fallback to local:", err.message);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || `${item.studentId}-${item.subject}`;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    if (department) result = result.filter(m => !m.department || m.department === department);
    if (semester) result = result.filter(m => !m.semester || m.semester === semester);
    if (subject) result = result.filter(m => !m.subject || m.subject === subject);
    return result;
  },

  saveInternalMarksBatch: async (marksList) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      try {
        for (const item of marksList) {
          const docId = `${item.studentId || item.rollNumber}_${item.subject}_${item.semester || 'Sem'}`.replace(/\s+/g, '_');
          const payload = {
            id: docId,
            docId,
            ...item,
            rollNumber: item.rollNumber || item.studentRollNumber,
            studentRollNumber: item.rollNumber || item.studentRollNumber,
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'internal_marks', docId), payload, { merge: true });
          await setDoc(doc(db, 'marks', docId), payload, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore setDoc internal_marks / marks batch error:", err.message);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_internal_marks') || '[]');
    marksList.forEach(item => {
      const idx = local.findIndex(m => (m.studentId === item.studentId || m.rollNumber === item.rollNumber) && m.subject === item.subject);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...item, updatedAt: new Date().toISOString() };
      } else {
        local.unshift({ id: `mark-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...item, updatedAt: new Date().toISOString() });
      }
    });
    localStorage.setItem('acad_internal_marks', JSON.stringify(local));

    try {
      marksList.forEach(m => {
        if (m.studentId) {
          mockDB.addNotification(m.studentId, `Internal Marks Updated for ${m.subject || 'Subject'}: Total ${m.total || 0}/50`);
        }
      });
    } catch (_) {}

    return true;
  },

  getSubjectAllocations: async (department = null, facultyId = null) => {
    await mockDB.delay(50);
    let list = [];
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'subject_allocations'));
        list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getDocs allocations fallback to local:", err.message);
      }
    }
    const localList = JSON.parse(localStorage.getItem('acad_allocations') || '[]');
    const combinedMap = new Map();
    [...list, ...localList].forEach(item => {
      const key = item.id || `${item.facultyId}-${item.subject}`;
      if (key) combinedMap.set(key, item);
    });
    let result = Array.from(combinedMap.values());

    if (facultyId) result = result.filter(a => a.facultyId === facultyId || a.facultyUid === facultyId);
    if (department) result = result.filter(a => a.department === department);
    return result;
  },

  addNotification: async (recipientOrPayload, titleOrMessage, optionalMessage, optionalType = 'info') => {
    await mockDB.delay(10);
    try {
      let recipientUid = '';
      let title = 'Campus Notification';
      let message = '';
      let type = optionalType || 'info';

      if (typeof recipientOrPayload === 'object' && recipientOrPayload !== null) {
        recipientUid = recipientOrPayload.recipientUid || recipientOrPayload.userId || recipientOrPayload.studentId || recipientOrPayload.uid || '';
        title = recipientOrPayload.title || title;
        message = recipientOrPayload.message || recipientOrPayload.text || '';
        type = recipientOrPayload.type || type;
      } else if (typeof recipientOrPayload === 'string') {
        recipientUid = recipientOrPayload;
        if (optionalMessage !== undefined) {
          title = titleOrMessage || title;
          message = optionalMessage;
        } else {
          title = 'Campus Notification';
          message = titleOrMessage || '';
        }
      }

      const notifId = 'notif-' + Math.random().toString(36).substr(2, 9);
      const payload = {
        id: notifId,
        notificationId: notifId,
        recipientUid: recipientUid,
        userId: recipientUid,
        title: title,
        message: message,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
      };

      if (isFirebaseConfigured && db) {
        try {
          await addDoc(collection(db, 'notifications'), payload);
        } catch (e) {
          console.warn("Firestore addNotification fallback to local:", e.message);
        }
      }

      const localNotifs = JSON.parse(localStorage.getItem('acad_notifications') || '[]');
      localNotifs.unshift(payload);
      localStorage.setItem('acad_notifications', JSON.stringify(localNotifs));

      return payload;
    } catch (err) {
      console.error("addNotification error:", err);
      return null;
    }
  },

  getNotifications: async (recipientUid) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'notifications'));
        let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (recipientUid) {
          list = list.filter(n => n.recipientUid === recipientUid || n.userId === recipientUid);
        }
        return list;
      } catch (e) {
        console.warn("Firestore getNotifications fallback to local:", e.message);
      }
    }
    const localNotifs = JSON.parse(localStorage.getItem('acad_notifications') || '[]');
    if (recipientUid) {
      return localNotifs.filter(n => n.recipientUid === recipientUid || n.userId === recipientUid);
    }
    return localNotifs;
  },

  // --- COUNSELLING / MEETING REQUEST FLOWS ---
  getCounsellingMeetings: async (role, uid) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'counselling_meetings'));
      let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (role === 'counsellor') list = list.filter(m => m.counsellorId === uid);
      if (role === 'student') list = list.filter(m => m.studentId === uid);
      return list;
    }
    let list = JSON.parse(localStorage.getItem('acad_counselling_meetings') || '[]');
    if (role === 'counsellor') list = list.filter(m => m.counsellorId === uid);
    if (role === 'student') list = list.filter(m => m.studentId === uid);
    return list;
  },

  addCounsellingLog: async (studentId, studentName, notes, counsellorId) => {
    await mockDB.delay(100);
    const payload = { studentId, studentName, notes, counsellorId, timestamp: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'counselling_logs'), payload);
      return { id: ref.id, ...payload };
    }
    const logs = JSON.parse(localStorage.getItem('acad_counselling_logs') || '[]');
    const newLog = { id: 'clog-' + Math.random().toString(36).substr(2, 9), ...payload };
    logs.push(newLog);
    localStorage.setItem('acad_counselling_logs', JSON.stringify(logs));
    return newLog;
  },

  getCounsellingLogs: async (studentId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'counselling_logs'));
      return snap.docs.map(doc => doc.data()).filter(l => l.studentId === studentId);
    }
    return JSON.parse(localStorage.getItem('acad_counselling_logs') || '[]').filter(l => l.studentId === studentId);
  },

  getParentMeetings: async (counsellorId) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const snap = await getDocs(collection(db, 'parent_meetings'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(m => m.counsellorId === counsellorId);
    }
    return JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]').filter(m => m.counsellorId === counsellorId);
  },

  addParentMeeting: async (studentId, studentName, parentName, date, time, counsellorId, notes) => {
    await mockDB.delay(100);
    const payload = { studentId, studentName, parentName, date, time, counsellorId, notes, status: 'scheduled', timestamp: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      const ref = await addDoc(collection(db, 'parent_meetings'), payload);
      return { id: ref.id, ...payload };
    }
    const meetings = JSON.parse(localStorage.getItem('acad_parent_meetings') || '[]');
    const newMeet = { id: 'meet-' + Math.random().toString(36).substr(2, 9), ...payload };
    meetings.push(newMeet);
    localStorage.setItem('acad_parent_meetings', JSON.stringify(meetings));
    return newMeet;
  },

  respondToMeetingRequest: async (meetId, action) => {
    await mockDB.delay(100);
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'counselling_meetings', meetId);
      await updateDoc(docRef, { status: action });
      return true;
    }
    const meetings = JSON.parse(localStorage.getItem('acad_counselling_meetings') || '[]');
    const idx = meetings.findIndex(m => m.id === meetId || m.meetingId === meetId);
    if (idx !== -1) {
      meetings[idx].status = action;
      localStorage.setItem('acad_counselling_meetings', JSON.stringify(meetings));
      return true;
    }
    return false;
  },

  // --- LIBRARY CATALOG & CIRCULATION ---
  getBooks: async () => {
    await mockDB.delay(50);
    return JSON.parse(localStorage.getItem('acad_books') || '[]');
  },

  getIssuedBooks: async (studentId) => {
    await mockDB.delay(50);
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    return issued.filter(i => i.studentId === studentId);
  },

  requestBook: async (studentId, studentName, rollNumber, bookId) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');

    const bookIdx = books.findIndex(b => b.bookId === bookId);
    if (bookIdx === -1) throw new Error('Book not found in library.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No copies available for checkout.');

    const alreadyBorrowed = issued.some(i => i.studentId === studentId && i.bookId === bookId && i.status !== 'returned');
    if (alreadyBorrowed) throw new Error('You have already borrowed/requested this book.');

    const newTransaction = {
      transactionId: 'trans-' + Math.random().toString(36).substr(2, 9),
      studentId,
      studentName,
      rollNumber,
      bookId,
      bookTitle: books[bookIdx].title,
      issueDate: '',
      dueDate: '',
      returnDate: '',
      fine: 0,
      status: 'requested'
    };

    issued.push(newTransaction);
    localStorage.setItem('acad_issued_books', JSON.stringify(issued));
    return newTransaction;
  },

  getAllIssuedBooks: async () => {
    await mockDB.delay(50);
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    // Update fines on the fly for active checkouts that are overdue
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    const modified = issued.map(i => {
      if (i.status === 'issued' && i.dueDate && today > i.dueDate) {
        const diffTime = Math.abs(new Date(today) - new Date(i.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmt = diffDays * 10; // ₹10 per day delay
        if (i.fine !== fineAmt) {
          i.fine = fineAmt;
          updated = true;
        }
      }
      return i;
    });
    if (updated) {
      localStorage.setItem('acad_issued_books', JSON.stringify(modified));
    }
    return modified;
  },

  approveBookRequest: async (transactionId) => {
    await mockDB.delay(100);
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');

    const transIdx = issued.findIndex(i => i.transactionId === transactionId);
    if (transIdx === -1) throw new Error('Transaction record not found.');

    const bookIdx = books.findIndex(b => b.bookId === issued[transIdx].bookId);
    if (bookIdx === -1) throw new Error('Book not found in inventory.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No copies available for checkout.');

    // Deduct available copy
    books[bookIdx].availableCopies -= 1;
    localStorage.setItem('acad_books', JSON.stringify(books));

    // Update transaction
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days borrowing period
    
    issued[transIdx].status = 'issued';
    issued[transIdx].issueDate = today;
    issued[transIdx].dueDate = dueDate.toISOString().split('T')[0];

    localStorage.setItem('acad_issued_books', JSON.stringify(issued));
    return issued[transIdx];
  },

  returnBook: async (transactionId) => {
    await mockDB.delay(100);
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');

    const transIdx = issued.findIndex(i => i.transactionId === transactionId);
    if (transIdx === -1) throw new Error('Transaction record not found.');
    if (issued[transIdx].status === 'returned') throw new Error('Book has already been returned.');

    const bookIdx = books.findIndex(b => b.bookId === issued[transIdx].bookId);
    if (bookIdx !== -1) {
      // Re-add copy to availability
      books[bookIdx].availableCopies = Math.min(books[bookIdx].totalCopies, books[bookIdx].availableCopies + 1);
      localStorage.setItem('acad_books', JSON.stringify(books));
    }

    // Process return
    const today = new Date().toISOString().split('T')[0];
    issued[transIdx].status = 'returned';
    issued[transIdx].returnDate = today;

    // Calculate final fine
    let fineAmt = 0;
    if (issued[transIdx].dueDate && today > issued[transIdx].dueDate) {
      const diffTime = Math.abs(new Date(today) - new Date(issued[transIdx].dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmt = diffDays * 10;
    }
    issued[transIdx].fine = fineAmt;

    localStorage.setItem('acad_issued_books', JSON.stringify(issued));
    return issued[transIdx];
  },

  issueBookDirectly: async (studentId, studentName, rollNumber, role, bookIsbn) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');

    const bookIdx = books.findIndex(b => b.isbn === bookIsbn);
    if (bookIdx === -1) throw new Error('Book ISBN not found in catalog.');
    if (books[bookIdx].availableCopies <= 0) throw new Error('No copies available for checkout.');

    // Deduct copy
    books[bookIdx].availableCopies -= 1;
    localStorage.setItem('acad_books', JSON.stringify(books));

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days

    const newTransaction = {
      transactionId: 'trans-' + Math.random().toString(36).substr(2, 9),
      studentId,
      studentName,
      rollNumber,
      bookId: books[bookIdx].bookId,
      bookTitle: books[bookIdx].title,
      issueDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: '',
      fine: 0,
      status: 'issued'
    };

    issued.push(newTransaction);
    localStorage.setItem('acad_issued_books', JSON.stringify(issued));
    return newTransaction;
  },

  addBook: async (title, author, isbn, category, totalCopies) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    if (books.some(b => b.isbn === isbn)) throw new Error('A textbook with this ISBN is already registered.');

    const newBook = {
      bookId: 'book-' + Math.random().toString(36).substr(2, 9),
      title,
      author,
      isbn,
      category,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies)
    };

    books.push(newBook);
    localStorage.setItem('acad_books', JSON.stringify(books));
    return newBook;
  },

  updateBook: async (bookId, updatedData) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const idx = books.findIndex(b => b.bookId === bookId);
    if (idx === -1) throw new Error('Textbook not found.');

    const currentDiff = books[idx].totalCopies - books[idx].availableCopies;
    const newTotal = Number(updatedData.totalCopies);
    const newAvailable = newTotal - currentDiff;

    if (newAvailable < 0) {
      throw new Error(`Cannot decrease copies below checked out count. Currently checked out: ${currentDiff}`);
    }

    books[idx] = {
      ...books[idx],
      ...updatedData,
      totalCopies: newTotal,
      availableCopies: newAvailable
    };

    localStorage.setItem('acad_books', JSON.stringify(books));
    return books[idx];
  },

  deleteBook: async (bookId) => {
    await mockDB.delay(100);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const issued = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');

    const activeBorrow = issued.some(i => i.bookId === bookId && i.status === 'issued');
    if (activeBorrow) throw new Error('Cannot delete book while copies are still checked out.');

    const filtered = books.filter(b => b.bookId !== bookId);
    localStorage.setItem('acad_books', JSON.stringify(filtered));
    return true;
  },

  // --- CBCS CHOICE BASED CREDIT SYSTEM ---
  getCbcsCourses: async (semester, department) => {
    await mockDB.delay(50);
    // Return standard university course list matching semester
    const mockCourses = [
      { id: 'c-core-1', code: 'CS-601', title: 'Neural Networks & Deep Learning', credits: 4, type: 'core', faculty: 'Prof. Charles Xavier', slot: 'Mon-Wed 9-10 AM' },
      { id: 'c-core-2', code: 'CS-602', title: 'Compiler Design & Theory', credits: 4, type: 'core', faculty: 'Dr. Alan Turing', slot: 'Tue-Thu 10-11 AM' },
      { id: 'c-core-3', code: 'CS-603', title: 'Software Engineering Architecture', credits: 3, type: 'core', faculty: 'Dr. Bruce Banner', slot: 'Fri 9-11 AM' },
      // Professional Electives
      { id: 'c-pe-1', code: 'CS-E61', title: 'Cloud Computing Infrastructure', credits: 3, type: 'elective_prof', faculty: 'Prof. Erik Lehnsherr', slot: 'Mon-Wed 11-12 PM' },
      { id: 'c-pe-2', code: 'CS-E62', title: 'Cyber Security & Cryptography', credits: 3, type: 'elective_prof', faculty: 'Dr. Sarah Connor', slot: 'Tue-Thu 1-2 PM' },
      { id: 'c-pe-3', code: 'CS-E63', title: 'Artificial Intelligence & Robotics', credits: 3, type: 'elective_prof', faculty: 'Dr. Tony Stark', slot: 'Fri 1-3 PM' },
      // Open Electives
      { id: 'c-oe-1', code: 'OE-101', title: 'Corporate Finance & Valuation', credits: 3, type: 'elective_open', faculty: 'Dr. Bruce Wayne', slot: 'Mon-Wed 2-3 PM' },
      { id: 'c-oe-2', code: 'OE-102', title: 'Human Psychology & Behavior', credits: 3, type: 'elective_open', faculty: 'Prof. Jean Grey', slot: 'Tue-Thu 3-4 PM' },
      { id: 'c-oe-3', code: 'OE-103', title: 'Sustainable Environmental Energy', credits: 3, type: 'elective_open', faculty: 'Dr. Pamela Isley', slot: 'Fri 3-5 PM' }
    ];
    return mockCourses;
  },

  registerCbcsCourses: async (studentId, coursesList) => {
    await mockDB.delay(150);
    const regs = JSON.parse(localStorage.getItem('acad_course_registrations') || '[]');
    const filtered = regs.filter(r => r.studentId !== studentId);
    
    const payload = {
      studentId,
      courses: coursesList,
      registeredAt: new Date().toISOString(),
      status: 'submitted'
    };

    filtered.push(payload);
    localStorage.setItem('acad_course_registrations', JSON.stringify(filtered));
    return payload;
  },

  getStudentRegistrationStatus: async (studentId) => {
    await mockDB.delay(50);
    const regs = JSON.parse(localStorage.getItem('acad_course_registrations') || '[]');
    return regs.find(r => r.studentId === studentId) || null;
  },

  // --- HOSTEL & TRANSPORT ---
  bookHostelOrTransport: async (studentId, type, details) => {
    await mockDB.delay(100);
    const bookings = JSON.parse(localStorage.getItem('acad_hostel_transport') || '[]');
    const idx = bookings.findIndex(b => b.studentId === studentId);
    
    let current = idx !== -1 ? bookings[idx] : { studentId, hostel: null, transport: null };
    
    if (type === 'hostel') {
      current.hostel = { ...details, status: 'allocated', bookedAt: new Date().toISOString() };
    } else {
      current.transport = { ...details, status: 'allotted', bookedAt: new Date().toISOString() };
    }

    if (idx !== -1) {
      bookings[idx] = current;
    } else {
      bookings.push(current);
    }

    localStorage.setItem('acad_hostel_transport', JSON.stringify(bookings));
    return current;
  },

  getHostelTransportDetails: async (studentId) => {
    await mockDB.delay(50);
    const bookings = JSON.parse(localStorage.getItem('acad_hostel_transport') || '[]');
    return bookings.find(b => b.studentId === studentId) || { studentId, hostel: null, transport: null };
  },

  // --- DOCUMENT & CERTIFICATE REQUESTS ---
  submitDocumentRequest: async (studentId, requestObj) => {
    await mockDB.delay(100);
    const reqs = JSON.parse(localStorage.getItem('acad_document_requests') || '[]');
    const newRequest = {
      id: 'doc-' + Math.random().toString(36).substr(2, 9),
      studentId,
      docType: requestObj.docType,
      purpose: requestObj.purpose,
      urgency: requestObj.urgency,
      requestedAt: new Date().toISOString().split('T')[0],
      status: 'pending', // pending -> approved -> printed -> ready
      remarks: ''
    };

    reqs.push(newRequest);
    localStorage.setItem('acad_document_requests', JSON.stringify(reqs));
    return newRequest;
  },

  getDocumentRequests: async (studentId) => {
    await mockDB.delay(50);
    const reqs = JSON.parse(localStorage.getItem('acad_document_requests') || '[]');
    return reqs.filter(r => r.studentId === studentId);
  },

  // --- SUPPORT TICKET SYSTEM ---
  submitGrievanceTicket: async (studentId, ticketObj) => {
    await mockDB.delay(100);
    const tickets = JSON.parse(localStorage.getItem('acad_grievances') || '[]');
    const newTicket = {
      id: 'tkt-' + Math.random().toString(36).substr(2, 9),
      studentId,
      category: ticketObj.category,
      subject: ticketObj.subject,
      description: ticketObj.description,
      status: 'open', // open -> processing -> resolved
      reply: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    tickets.push(newTicket);
    localStorage.setItem('acad_grievances', JSON.stringify(tickets));
    return newTicket;
  },

  getGrievanceTickets: async (studentId) => {
    await mockDB.delay(50);
    const grievances = JSON.parse(localStorage.getItem('acad_grievances') || '[]');
    return grievances.filter(g => g.studentId === studentId);
  },

  // --- PRINCIPAL GOVERNANCE SERVICES ---
  getPrincipalAnalytics: async () => {
    await mockDB.delay(80);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const wardCounsellors = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
    const depts = await mockDB.getDepartmentsList();

    const totalStudents = users.filter(u => u.role === 'student').length || students.length || 620;
    const totalFaculty = users.filter(u => u.role === 'faculty').length || 38;
    const totalHODs = users.filter(u => u.role === 'hod').length || depts.length || 9;
    const activeWardCounsellors = wardCounsellors.filter(w => w.status === 'Active').length || depts.length;

    const avgAtt = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage || s.attendance || 85), 0) / students.length)
      : 86.4;

    const atRiskCount = students.filter(s => (s.attendancePercentage || s.attendance || 85) < 75 || s.academicRisk === 'High').length || 18;
    const passedCount = Math.round(totalStudents * 0.88);
    const failedCount = totalStudents - passedCount;
    const placementRate = 78.5;

    // Executive Insights generated dynamically
    const insights = [
      { type: 'academic', text: 'Computer Science & Engineering (CSE) holds the highest semester pass rate at 91.2%.' },
      { type: 'attendance', text: `Overall institutional attendance stands at ${avgAtt}%, with ${atRiskCount} students identified at risk (<75%).` },
      { type: 'placement', text: `Placement drive registered ${placementRate}% selection rate with CSE leading corporate placements.` },
      { type: 'risk', text: `${atRiskCount} students require immediate academic counselling intervention.` }
    ];

    // Top Performing Departments
    const topDepartments = depts.slice(0, 4).map((dept, i) => ({
      rank: i + 1,
      name: dept,
      passRate: 92 - (i * 3.5),
      avgMarks: (82 - (i * 2.8)).toFixed(1),
      attendance: (90 - (i * 2.1)).toFixed(1),
      placementRate: 85 - (i * 4.2)
    }));

    return {
      cards: {
        totalStudents,
        totalFaculty,
        totalDepartments: depts.length,
        totalHODs,
        totalWardCounsellors: activeWardCounsellors,
        attendancePercentage: avgAtt,
        studentsAtRisk: atRiskCount,
        studentsPassed: passedCount,
        studentsFailed: failedCount,
        placementRate
      },
      insights,
      topDepartments
    };
  },

  getBranchAnalytics: async () => {
    await mockDB.delay(60);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const depts = await mockDB.getDepartmentsList();

    const results = [];
    for (let idx = 0; idx < depts.length; idx++) {
      const dept = depts[idx];
      const deptStudents = students.filter(s => s.department === dept);
      const studentCount = users.filter(u => u.role === 'student' && u.department === dept).length || (120 - (idx * 10));
      const facultyCount = users.filter(u => u.role === 'faculty' && u.department === dept).length || (12 - (idx % 4));

      const avgAtt = deptStudents.length > 0
        ? Math.round(deptStudents.reduce((acc, s) => acc + (s.attendancePercentage || s.attendance || 85), 0) / deptStudents.length)
        : (86 - (idx * 2));

      // Resolve HOD User
      const hodUser = users.find(u => u.role === 'hod' && u.department === dept);
      const hodName = hodUser?.fullName || hodUser?.name || (idx === 0 ? 'Dr. Alan Turing' : idx === 1 ? 'Dr. Sarah Connor' : `Dr. HOD ${dept.split(' ')[0]}`);
      const hodEmail = hodUser?.email || `hod.${dept.substring(0, 4).toLowerCase()}@kbn.edu`;
      const hodPhoto = hodUser?.profilePhotoUrl || null;

      // Resolve Active Ward Counsellor assigned by HOD
      const activeCounsellor = await mockDB.getActiveBranchWardCounsellor(dept);

      results.push({
        branch: dept,
        students: studentCount > 0 ? studentCount : 80,
        faculty: facultyCount > 0 ? facultyCount : 10,
        attendance: Math.max(70, Math.min(95, avgAtt)),
        passRate: Math.max(65, 91 - (idx * 2.5)),
        placementRate: Math.max(60, 82 - (idx * 3.2)),
        hodName,
        hodEmail,
        hodPhoto,
        counsellorName: activeCounsellor?.facultyName || null,
        counsellorEmail: activeCounsellor?.facultyEmail || null,
        counsellorId: activeCounsellor?.facultyId || null,
        counsellorPhoto: activeCounsellor?.profilePhotoUrl || null,
        wardStudentsCount: activeCounsellor ? (activeCounsellor.assignedStudentsCount || deptStudents.length || 45) : 0,
        isAssigned: !!activeCounsellor
      });
    }

    return results;
  },

  getSemesterResultAnalytics: async (department = 'All Departments', year = '2025-26', semester = 'Semester 6') => {
    await mockDB.delay(60);
    const total = 60;
    const appeared = 58;
    const passed = 52;
    const failed = 6;
    const passPercentage = Number(((passed / appeared) * 100).toFixed(2));

    const subjects = [
      { name: 'Neural Networks & Deep Learning', appeared: 58, passed: 55, failed: 3, passRate: 94.8, avgMarks: 78.4, status: 'Good' },
      { name: 'Machine Learning Systems', appeared: 58, passed: 52, failed: 6, passRate: 89.6, avgMarks: 74.2, status: 'Good' },
      { name: 'Database Management Systems', appeared: 58, passed: 50, failed: 8, passRate: 86.2, avgMarks: 71.5, status: 'Good' },
      { name: 'Python for Data Science', appeared: 58, passed: 53, failed: 5, passRate: 91.3, avgMarks: 76.8, status: 'Good' },
      { name: 'Compiler Design', appeared: 58, passed: 34, failed: 24, passRate: 58.6, avgMarks: 54.2, status: 'Critical' },
      { name: 'Advanced Engineering Mathematics', appeared: 58, passed: 37, failed: 21, passRate: 63.7, avgMarks: 58.9, status: 'Attention' }
    ];

    const lowPerformanceAlerts = subjects.filter(s => s.passRate < 75).map(s => ({
      subject: s.name,
      passRate: s.passRate,
      level: s.passRate < 60 ? 'Critical' : 'Attention',
      message: s.passRate < 60 ? `⚠ ${s.name} — ${s.passRate}% Pass Rate (Critical < 60%)` : `⚠ ${s.name} — ${s.passRate}% Pass Rate (Attention Required)`
    }));

    const semesterTrend = [
      { semester: 'Semester 1', passRate: 78.4 },
      { semester: 'Semester 2', passRate: 81.2 },
      { semester: 'Semester 3', passRate: 84.5 },
      { semester: 'Semester 4', passRate: 86.1 },
      { semester: 'Semester 5', passRate: 88.7 },
      { semester: 'Semester 6', passRate: 89.6 }
    ];

    const branchComparison = [
      { branch: 'CSE', passRate: 91.2 },
      { branch: 'ECE', passRate: 87.4 },
      { branch: 'EEE', passRate: 82.1 },
      { branch: 'Mechanical', passRate: 78.5 },
      { branch: 'Civil', passRate: 85.0 }
    ];

    return {
      summary: {
        totalStudents: total,
        appearedStudents: appeared,
        passedStudents: passed,
        failedStudents: failed,
        passPercentage,
        averagePercentage: 72.4,
        highestPercentage: 96.8,
        lowestPercentage: 42.0,
        distinctionCount: 22,
        firstClassCount: 24,
        secondClassCount: 6,
        backlogsCount: 6
      },
      subjects,
      lowPerformanceAlerts,
      semesterTrend,
      branchComparison
    };
  },

  getAcademicRiskAnalytics: async () => {
    await mockDB.delay(60);
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');

    const distribution = [
      { range: '90 – 100%', count: 18 },
      { range: '80 – 89%', count: 28 },
      { range: '70 – 79%', count: 34 },
      { range: '60 – 69%', count: 14 },
      { range: '50 – 59%', count: 8 },
      { range: 'Below 50%', count: 4 }
    ];

    const atRiskStudents = (students.length > 0 ? students : [
      { rollNumber: '22KBN-CS042', name: 'K. Rahul Varma', department: 'CSE', semester: 'Semester 6', attendance: 64, marks: 45, risk: 'High' },
      { rollNumber: '22KBN-EC019', name: 'P. Sneha Latha', department: 'ECE', semester: 'Semester 6', attendance: 71, marks: 52, risk: 'Medium' },
      { rollNumber: '22KBN-EE008', name: 'M. Shiva Kumar', department: 'EEE', semester: 'Semester 6', attendance: 68, marks: 48, risk: 'High' },
      { rollNumber: '22KBN-ME015', name: 'G. Suresh Babu', department: 'Mechanical', semester: 'Semester 6', attendance: 73, marks: 58, risk: 'Medium' },
      { rollNumber: '22KBN-CS088', name: 'V. Anitha Devi', department: 'CSE', semester: 'Semester 6', attendance: 82, marks: 49, risk: 'Low' }
    ]).map(s => ({
      rollNumber: s.rollNumber || s.roll_number || '22KBN-CS001',
      name: s.name || s.fullName || 'Student',
      department: s.department || 'CSE',
      semester: s.semester || 'Semester 6',
      attendance: s.attendancePercentage || s.attendance || 72,
      result: (s.attendancePercentage || s.attendance || 72) < 75 ? 'Low Attendance' : 'Low Marks',
      risk: (s.attendancePercentage || s.attendance || 72) < 70 ? 'High' : (s.attendancePercentage || s.attendance || 72) < 75 ? 'Medium' : 'Low'
    }));

    return { distribution, atRiskStudents };
  },

  getFacultyAnalytics: async () => {
    await mockDB.delay(60);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const depts = await mockDB.getDepartmentsList();
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');

    const totalFaculty = users.filter(u => u.role === 'faculty').length || 38;
    const leavesSummary = [
      { month: 'January', leaves: 12 },
      { month: 'February', leaves: 8 },
      { month: 'March', leaves: 15 },
      { month: 'April', leaves: 10 },
      { month: 'May', leaves: 6 },
      { month: 'June', leaves: 14 }
    ];

    const departmentFaculty = depts.map((d, i) => {
      const count = users.filter(u => u.role === 'faculty' && u.department === d).length || (8 - (i % 3));
      return {
        department: d,
        facultyCount: count > 0 ? count : 8,
        avgWorkload: `${18 + (i % 4)} hrs/wk`,
        onLeave: leaves.filter(l => l.department === d && l.status === 'approved').length || (i % 2)
      };
    });

    return {
      totalFaculty,
      leavesSummary,
      departmentFaculty
    };
  },

  getPlacementAnalytics: async () => {
    await mockDB.delay(60);
    const depts = await mockDB.getDepartmentsList();

    const overview = {
      eligibleStudents: 320,
      registeredStudents: 298,
      placedStudents: 251,
      placementRate: 78.4,
      companiesParticipated: 42,
      highestPackage: '18.5 LPA',
      averagePackage: '6.2 LPA'
    };

    const branchPlacements = depts.slice(0, 5).map((d, i) => {
      const eligible = 80 - (i * 8);
      const placed = Math.round(eligible * (0.85 - (i * 0.05)));
      return {
        department: d,
        eligible,
        placed,
        placementRate: Number(((placed / eligible) * 100).toFixed(1))
      };
    });

    return { overview, branchPlacements };
  },

  getPendingDocumentRequests: async () => {
    await mockDB.delay(50);
    return JSON.parse(localStorage.getItem('acad_document_requests') || '[]');
  },

  approveDocumentRequest: async (requestId, remarks) => {
    await mockDB.delay(100);
    const reqs = JSON.parse(localStorage.getItem('acad_document_requests') || '[]');
    const idx = reqs.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      reqs[idx].status = 'approved';
      reqs[idx].remarks = remarks || 'Signed & Approved by Principal Office';
      localStorage.setItem('acad_document_requests', JSON.stringify(reqs));
      return true;
    }
    return false;
  },

  getPendingGrievances: async () => {
    await mockDB.delay(50);
    return JSON.parse(localStorage.getItem('acad_grievances') || '[]');
  },

  resolveGrievanceTicket: async (ticketId, reply) => {
    await mockDB.delay(100);
    const tickets = JSON.parse(localStorage.getItem('acad_grievances') || '[]');
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].status = 'resolved';
      tickets[idx].reply = reply || 'Action taken by Principal Desk.';
      tickets[idx].updatedAt = new Date().toISOString().split('T')[0];
      localStorage.setItem('acad_grievances', JSON.stringify(tickets));
      return true;
    }
    return false;
  },

  getGlobalCourseRegistrations: async () => {
    await mockDB.delay(50);
    const regs = JSON.parse(localStorage.getItem('acad_course_registrations') || '[]');
    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    return regs.map(r => {
      const stud = students.find(s => s.uid === r.studentId || s.studentId === r.studentId) || {};
      return {
        ...r,
        studentName: stud.fullName || 'Student',
        rollNumber: stud.rollNumber || 'N/A',
        department: stud.department || 'CSE',
        semester: stud.semester || 'Semester 6'
      };
    });
  },

  approveGlobalCourseRegistration: async (studentId) => {
    await mockDB.delay(100);
    const regs = JSON.parse(localStorage.getItem('acad_course_registrations') || '[]');
    const idx = regs.findIndex(r => r.studentId === studentId);
    if (idx !== -1) {
      regs[idx].status = 'approved';
      localStorage.setItem('acad_course_registrations', JSON.stringify(regs));
      return true;
    }
    return false;
  },

  // --- PLACEMENT RECRUITMENT SERVICES ---
  subscribePlacementDrives: (callback) => {
    const load = () => {
      const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
      // Ensure drives have applicants and selectedStudents arrays
      const formatted = drives.map(d => ({
        ...d,
        driveId: d.driveId || d.id,
        salaryPackage: d.salaryPackage || d.package || '12 LPA',
        applicants: d.applicants || ['stud-cse'],
        selectedStudents: d.selectedStudents || []
      }));
      callback(formatted);
    };
    load();
    return () => {};
  },

  createPlacementDrive: async (companyName, role, salaryPackage, eligibility, driveDate) => {
    await mockDB.delay(100);
    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const newDrive = {
      driveId: 'drive-' + Math.random().toString(36).substr(2, 9),
      id: 'drive-' + Math.random().toString(36).substr(2, 9),
      companyName,
      role,
      salaryPackage,
      package: salaryPackage,
      eligibility,
      driveDate,
      status: 'upcoming',
      applicants: ['stud-cse'],
      selectedStudents: []
    };
    drives.push(newDrive);
    localStorage.setItem('acad_placement_drives', JSON.stringify(drives));
    return newDrive;
  },

  updatePlacementSelection: async (driveId, studentId, isSelected) => {
    await mockDB.delay(100);
    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const idx = drives.findIndex(d => d.driveId === driveId || d.id === driveId);
    if (idx !== -1) {
      let selected = drives[idx].selectedStudents || [];
      if (isSelected) {
        if (!selected.includes(studentId)) selected.push(studentId);
      } else {
        selected = selected.filter(id => id !== studentId);
      }
      drives[idx].selectedStudents = selected;
      localStorage.setItem('acad_placement_drives', JSON.stringify(drives));
      return true;
    }
    return false;
  },

  applyForDrive: async (driveId, studentId) => {
    await mockDB.delay(100);
    const drives = JSON.parse(localStorage.getItem('acad_placement_drives') || '[]');
    const idx = drives.findIndex(d => d.driveId === driveId || d.id === driveId);
    if (idx !== -1) {
      const applicants = drives[idx].applicants || [];
      if (!applicants.includes(studentId)) {
        applicants.push(studentId);
      }
      drives[idx].applicants = applicants;
      localStorage.setItem('acad_placement_drives', JSON.stringify(drives));
      return true;
    }
    return false;
  },

  // --- PARENT COUNSELLING SERVICES ---
  getCounsellingRecords: async (studentId) => {
    await mockDB.delay(50);
    const records = JSON.parse(localStorage.getItem('acad_counselling_records') || '[]');
    if (records.length === 0) {
      const initial = [
        {
          id: 'couns-1',
          studentId: studentId || 'stud-cse',
          date: '2026-06-18',
          counsellorName: 'Dr. Bruce Banner',
          notes: 'Ward is performing exceptionally well in machine learning and core subjects. Regular attendance maintained.',
          recommendations: 'Encouraged to submit research publication draft.'
        }
      ];
      localStorage.setItem('acad_counselling_records', JSON.stringify(initial));
      return initial;
    }
    return records.filter(r => r.studentId === studentId);
  },

  // --- LIBRARIAN & E-RESOURCES SERVICES ---
  getLibraryAnalytics: async () => {
    await mockDB.delay(50);
    const books = JSON.parse(localStorage.getItem('acad_books') || '[]');
    const checkouts = JSON.parse(localStorage.getItem('acad_issued_books') || '[]');
    
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || b.availableCopies || 5), 0);
    const activeIssued = checkouts.filter(c => c.status === 'issued').length;
    const overdueCount = checkouts.filter(c => c.status === 'overdue' || (c.status === 'issued' && c.dueDate < new Date().toISOString().split('T')[0])).length;

    return {
      totalTitles,
      totalCopies,
      activeIssued,
      overdueCount,
      finesCollected: 4500
    };
  },

  getEresources: async () => {
    await mockDB.delay(50);
    const res = JSON.parse(localStorage.getItem('acad_eresources') || '[]');
    if (res.length === 0) {
      const defaultRes = [
        { id: 'eres-1', title: 'IEEE Xplore Digital Library Subscription 2026', category: 'IEEE Journal', accessType: 'Open Campus IP', author: 'IEEE Org', pdfUrl: '#' },
        { id: 'eres-2', title: 'Springer Nature Computer Science Collection', category: 'Springer Book', accessType: 'Full Text Access', author: 'Springer', pdfUrl: '#' }
      ];
      localStorage.setItem('acad_eresources', JSON.stringify(defaultRes));
      return defaultRes;
    }
    return res;
  },

  addEresource: async (title, author, category, accessType, pdfUrl) => {
    await mockDB.delay(100);
    const res = JSON.parse(localStorage.getItem('acad_eresources') || '[]');
    const newRes = {
      id: 'eres-' + Math.random().toString(36).substr(2, 9),
      title,
      author,
      category,
      accessType: accessType || 'Open Access',
      pdfUrl: pdfUrl || '#'
    };
    res.push(newRes);
    localStorage.setItem('acad_eresources', JSON.stringify(res));
    return newRes;
  },

  issueNoDuesClearance: async (studentId) => {
    await mockDB.delay(100);
    const clearances = JSON.parse(localStorage.getItem('acad_no_dues') || '[]');
    const newClearance = {
      id: 'nodues-' + Math.random().toString(36).substr(2, 9),
      studentId,
      issuedAt: new Date().toISOString().split('T')[0],
      status: 'cleared',
      issuedBy: 'Chief Librarian'
    };
    clearances.push(newClearance);
    localStorage.setItem('acad_no_dues', JSON.stringify(clearances));
    return newClearance;
  },

  // --- HOD DEPARTMENT MANAGEMENT SERVICES ---
  logHODAudit: async (action, module, details, user) => {
    const logs = JSON.parse(localStorage.getItem('acad_audit_logs') || '[]');
    const newLog = {
      logId: 'log-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      user: user?.fullName || 'Dr. Alan Turing (HOD)',
      role: 'hod',
      department: user?.department || 'B.Sc. Computer Science (CS)',
      action,
      module,
      details
    };
    logs.unshift(newLog);
    localStorage.setItem('acad_audit_logs', JSON.stringify(logs));
    return newLog;
  },

  getHODAuditLogs: async (dept) => {
    await mockDB.delay(50);
    const logs = JSON.parse(localStorage.getItem('acad_audit_logs') || '[]');
    if (logs.length === 0) {
      const defaultLogs = [
        { logId: 'log-1', date: new Date(Date.now() - 3600000).toISOString(), user: 'Dr. Alan Turing', role: 'hod', department: dept || 'B.Sc. Computer Science (CS)', action: 'Ward Counsellor Assigned', module: 'Ward Counsellors', details: 'Assigned Prof. Ravi Kumar to CSE - Section A (62 Wards)' },
        { logId: 'log-2', date: new Date(Date.now() - 7200000).toISOString(), user: 'Dr. Alan Turing', role: 'hod', department: dept || 'B.Sc. Computer Science (CS)', action: 'Faculty Leave Approved', module: 'Faculty Leaves', details: 'Approved Casual Leave for Prof. Charles Xavier (2 Days)' },
        { logId: 'log-3', date: new Date(Date.now() - 14400000).toISOString(), user: 'Dr. Alan Turing', role: 'hod', department: dept || 'B.Sc. Computer Science (CS)', action: 'Attendance Unlocked', module: 'Attendance Unlocks', details: 'Unlocked Machine Learning period 3 for Prof. Ravi Kumar' },
        { logId: 'log-4', date: new Date(Date.now() - 28800000).toISOString(), user: 'Dr. Alan Turing', role: 'hod', department: dept || 'B.Sc. Computer Science (CS)', action: 'Announcement Created', module: 'Announcements', details: 'Posted Mid-Term Review Meeting for CSE Faculty' }
      ];
      localStorage.setItem('acad_audit_logs', JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return logs.filter(l => !l.department || l.department.toLowerCase().includes('cse') || l.department === dept || dept === 'All');
  },

  getHODStats: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(80);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const isDeptMatch = (d) => !d || d === dept || (dept.includes('CS') && d.includes('CS')) || (dept.includes('AI') && d.includes('AI'));
    
    const deptStudents = users.filter(u => u.role === 'student' && isDeptMatch(u.department));
    const deptFaculty = users.filter(u => u.role === 'faculty' && isDeptMatch(u.department));
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const deptLeaves = leaves.filter(l => l.applicantRole === 'faculty' && isDeptMatch(l.department));
    
    const pendingLeaves = deptLeaves.filter(l => l.status === 'pending').length;
    const approvedLeavesMonth = deptLeaves.filter(l => l.status === 'approved').length;
    const rejectedLeavesMonth = deptLeaves.filter(l => l.status === 'rejected').length;
    const facultyOnLeaveToday = deptLeaves.filter(l => l.status === 'approved' && new Date(l.startDate || l.fromDate) <= new Date() && new Date(l.endDate || l.toDate) >= new Date()).length;

    const totalStudents = deptStudents.length > 0 ? deptStudents.length : 620;
    const totalFaculty = deptFaculty.length > 0 ? deptFaculty.length : 25;
    const presentToday = Math.round(totalStudents * 0.874);
    const absentToday = totalStudents - presentToday;

    return {
      totalFaculty,
      totalStudents,
      totalWards: totalStudents,
      presentToday,
      absentToday,
      attendancePercentage: 87.4,
      facultyOnLeaveToday: facultyOnLeaveToday || 3,
      pendingLeaves: pendingLeaves || 6,
      approvedLeavesThisMonth: approvedLeavesMonth || 14,
      rejectedLeavesThisMonth: rejectedLeavesMonth || 4,
      deptSectionsCount: 4,
      counsellorsCount: 3,
      academicYear: '2025-2026',
      currentSemester: 'Semester 6',
      graphs: {
        daily: [
          { name: 'Mon', Present: 540, Absent: 80 },
          { name: 'Tue', Present: 565, Absent: 55 },
          { name: 'Wed', Present: 530, Absent: 90 },
          { name: 'Thu', Present: 572, Absent: 48 },
          { name: 'Fri', Present: 550, Absent: 70 },
          { name: 'Sat', Present: 510, Absent: 110 }
        ],
        weekly: [
          { name: 'Week 1', Attendance: 84.5 },
          { name: 'Week 2', Attendance: 88.2 },
          { name: 'Week 3', Attendance: 91.0 },
          { name: 'Week 4', Attendance: 87.4 }
        ],
        monthly: [
          { name: 'May', Attendance: 85.0 },
          { name: 'Jun', Attendance: 86.8 },
          { name: 'Jul', Attendance: 89.2 },
          { name: 'Aug', Attendance: 87.4 }
        ],
        sectionWise: [
          { section: 'Section A', Attendance: 91.2, Students: 62 },
          { section: 'Section B', Attendance: 86.5, Students: 58 },
          { section: 'Section C', Attendance: 88.0, Students: 61 },
          { section: 'Section D', Attendance: 84.0, Students: 59 }
        ],
        workload: [
          { faculty: 'Prof. Xavier', hours: 18 },
          { faculty: 'Prof. Ravi', hours: 22 },
          { faculty: 'Prof. Priya', hours: 16 },
          { faculty: 'Prof. Arun', hours: 24 },
          { faculty: 'Prof. Suresh', hours: 20 }
        ],
        leaveStats: [
          { type: 'Casual', count: 12 },
          { type: 'Sick', count: 8 },
          { type: 'Emergency', count: 4 },
          { type: 'Personal', count: 5 }
        ]
      }
    };
  },

  getHODAnalytics: async (dept) => {
    return await mockDB.getHODStats(dept);
  },

  getDepartmentsList: async () => {
    await mockDB.delay(20);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const configuredDepts = new Set([...KBN_BRANCHES, 'B.Sc. Computer Science (CS)', 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)']);
    users.forEach(u => {
      if (u.department && u.department !== 'N/A' && u.department !== 'All') {
        configuredDepts.add(u.department);
      }
    });
    return Array.from(configuredDepts);
  },

  getAllActiveFacultyUsers: async () => {
    await mockDB.delay(30);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const defaultUsers = typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : [];
    const combined = [...users, ...defaultUsers];

    const activeFaculty = [];
    const seenUids = new Set();

    combined.forEach(u => {
      const uid = u.uid || u.id;
      if (!uid || seenUids.has(uid)) return;

      const role = (u.role || '').toLowerCase();
      const isInactive = u.accountStatus === 'inactive' || u.status === 'inactive';

      if (!isInactive && (role === 'faculty' || role === 'counsellor' || role === 'staff' || role === 'teacher' || role === 'professor' || role === 'hod' || !role)) {
        seenUids.add(uid);
        activeFaculty.push({
          uid: uid,
          id: uid,
          facultyId: u.employeeId || u.facultyId || uid,
          employeeId: u.employeeId || u.facultyId || uid,
          fullName: u.fullName || u.name || 'Prof. Faculty',
          name: u.fullName || u.name || 'Prof. Faculty',
          email: u.email || 'faculty@kbn.edu',
          phone: u.mobile || u.phoneNumber || u.contactNumber || '9876543211',
          mobile: u.mobile || u.phoneNumber || u.contactNumber || '9876543211',
          department: u.department || 'CSE',
          semester: u.semester || 'Semester 1',
          section: u.section || 'Section A',
          academicYear: u.academicYear || '2026-2027',
          designation: u.designation || 'Faculty',
          status: u.status || 'Active'
        });
      }
    });

    if (activeFaculty.length === 0) {
      activeFaculty.push(
        { uid: 'fac-1', id: 'fac-1', facultyId: 'FAC001', fullName: 'Dr. Bruce Banner', email: 'bruce.banner@kbn.edu', phone: '9876543210', department: 'B.Sc. Computer Science (CS)', designation: 'Professor', status: 'active' },
        { uid: 'fac-2', id: 'fac-2', facultyId: 'FAC002', fullName: 'Prof. Ravi Kumar', email: 'ravi.kumar@kbn.edu', phone: '9876543211', department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)', designation: 'Associate Professor', status: 'active' }
      );
    }

    return activeFaculty;
  },

  getFacultyByDepartment: async (dept) => {
    const all = await mockDB.getAllActiveFacultyUsers();
    if (!dept || dept === 'All') return all;

    const targetDept = dept.toUpperCase().trim();
    return all.filter(f => {
      const fDept = (f.department || '').toUpperCase().trim();
      return fDept === targetDept || isDepartmentMatch(fDept, targetDept);
    });
  },

  getStudentCountForSection: async (dept, section) => {
    await mockDB.delay(20);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = users.filter(u => u.role === 'student' && (!dept || u.department === dept) && u.section === section);
    if (students.length > 0) return students.length;
    const sectionCounts = { 'Section A': 62, 'Section B': 58, 'Section C': 61, 'Section D': 59 };
    return sectionCounts[section] || 60;
  },

  getDepartmentStudentCount: async (dept) => {
    await mockDB.delay(20);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const students = users.filter(u => u.role === 'student' && (!dept || u.department === dept));
    if (students.length > 0) return students.length;
    return 181;
  },

  // --- DEDICATED WARD COUNSELLOR ASSIGNMENTS COLLECTION SERVICES ---
  getWardCounsellorAssignments: async (dept = null) => {
    await mockDB.delay(50);
    let assignments = JSON.parse(localStorage.getItem('acad_ward_counsellor_assignments') || '[]');
    
    // Fallback/sync with legacy storage key if empty
    if (assignments.length === 0) {
      const legacy = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
      if (legacy.length > 0) {
        assignments = legacy.map(c => ({
          id: c.id || 'wca-legacy-' + Math.random().toString(36).substr(2, 6),
          facultyId: c.facultyId || 'FAC001',
          facultyName: c.facultyName || 'Dr. Ravi Kumar',
          facultyEmail: c.facultyEmail || 'ravi.kumar@kbn.edu',
          facultyPhone: c.facultyPhone || '9876543211',
          department: c.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
          departmentCode: c.departmentCode || 'AI_ML',
          semester: c.semester || 'Semester 6',
          section: c.section || 'A',
          academicYear: c.academicYear || '2026-2027',
          role: 'ward_counsellor',
          status: (c.status || '').toLowerCase() === 'active' ? 'active' : 'inactive',
          assignedBy: c.assignedBy || 'hod-1',
          assignedByName: c.assignedByName || 'HOD',
          assignedAt: c.assignedAt || new Date().toISOString()
        }));
      } else {
        // Initial seed assignment document
        assignments = [
          {
            id: 'wca-seed-1',
            facultyId: 'fac-2',
            facultyName: 'Dr. Ravi Kumar',
            facultyEmail: 'ravi.kumar@kbn.edu',
            facultyPhone: '9876543211',
            department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
            departmentCode: 'AI_ML',
            semester: 'Semester 6',
            section: 'A',
            academicYear: '2026-2027',
            role: 'ward_counsellor',
            status: 'active',
            assignedBy: 'hod-1',
            assignedByName: 'Dr. Alan Turing',
            assignedAt: new Date().toISOString()
          }
        ];
      }
      localStorage.setItem('acad_ward_counsellor_assignments', JSON.stringify(assignments));
    }

    if (dept && dept !== 'All') {
      const targetDept = dept.toUpperCase().trim();
      return assignments.filter(a => {
        const aDept = (a.department || '').toUpperCase().trim();
        return aDept === targetDept || isDepartmentMatch(aDept, targetDept);
      });
    }
    return assignments;
  },

  getWardCounsellors: async (dept = 'B.Sc. Computer Science (CS)') => {
    return await mockDB.getWardCounsellorAssignments(dept);
  },

  getActiveBranchWardCounsellor: async (dept) => {
    await mockDB.delay(20);
    const assignments = await mockDB.getWardCounsellorAssignments(dept);
    return assignments.find(a => (a.status === 'active' || a.status === 'Active'));
  },

  checkActiveAssignmentForScope: async (department, semester, section, academicYear) => {
    await mockDB.delay(30);
    const assignments = await mockDB.getWardCounsellorAssignments();
    const deptNorm = (department || '').toUpperCase().trim();
    const semNorm = (semester || '').trim().toLowerCase();
    const secNorm = (section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
    const ayNorm = (academicYear || '').trim();

    return assignments.find(a => {
      if (a.status !== 'active' && a.status !== 'Active') return false;
      const aDept = (a.department || '').toUpperCase().trim();
      const aSem = (a.semester || '').trim().toLowerCase();
      const aSec = (a.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
      const aAY = (a.academicYear || '').trim();

      const matchDept = aDept === deptNorm || isDepartmentMatch(aDept, deptNorm);
      const matchSem = aSem === semNorm;
      const matchSec = aSec === secNorm;
      const matchAY = !ayNorm || !aAY || aAY === ayNorm;

      return matchDept && matchSem && matchSec && matchAY;
    });
  },

  saveWardCounsellorAssignment: async (data, hodUser = null) => {
    await mockDB.delay(100);
    const assignments = await mockDB.getWardCounsellorAssignments();

    const cleanSec = (data.section || 'A').trim().toUpperCase().replace(/^SECTION\s+/i, '');

    // 1. Deactivate existing active assignment for exact scope if replacing
    assignments.forEach(a => {
      const matchDept = isDepartmentMatch(a.department, data.department);
      const matchSem = (a.semester || '').trim().toLowerCase() === (data.semester || '').trim().toLowerCase();
      const matchSec = (a.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '') === cleanSec;
      const matchAY = !data.academicYear || !a.academicYear || (a.academicYear || '').trim() === (data.academicYear || '').trim();

      if ((a.status === 'active' || a.status === 'Active') && matchDept && matchSem && matchSec && matchAY) {
        a.status = 'inactive';
        a.deactivatedAt = new Date().toISOString();
        a.deactivatedBy = hodUser?.fullName || 'HOD';
      }
    });

    const newDoc = {
      id: 'wca-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      wardCounsellorId: data.wardCounsellorId || data.facultyId,
      wardCounsellorName: data.wardCounsellorName || data.facultyName,
      facultyId: data.wardCounsellorId || data.facultyId,
      facultyName: data.wardCounsellorName || data.facultyName,
      branch: data.branch || data.department,
      department: data.branch || data.department,
      departmentCode: (data.branch || data.department || '').includes('AI') ? 'AI_ML' : (data.branch || data.department || '').includes('CS') ? 'CSE' : 'DEPT',
      semester: data.semester,
      section: cleanSec,
      academicYear: data.academicYear || '2026-2027',
      role: 'ward_counsellor',
      status: 'active',
      assignedBy: hodUser?.uid || 'hod-1',
      assignedByName: hodUser?.fullName || 'HOD',
      assignedAt: new Date().toISOString()
    };

    assignments.unshift(newDoc);
    localStorage.setItem('acad_ward_counsellor_assignments', JSON.stringify(assignments));

    // Also update legacy format array
    const legacyCounsellors = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
    legacyCounsellors.unshift({
      ...newDoc,
      assignedSection: `Section ${newDoc.section}`,
      status: 'Active'
    });
    localStorage.setItem('acad_ward_counsellors', JSON.stringify(legacyCounsellors));

    // Firestore sync if available
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'wardCounsellorAssignments'), {
          ...newDoc,
          assignedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }

    // Audit log
    await mockDB.logHODAudit(
      'Assign Branch Ward Counsellor',
      'Ward Counsellors',
      `Assigned ${newDoc.wardCounsellorName} as Ward Counsellor for ${newDoc.department} (${newDoc.semester}, Section ${newDoc.section}, AY ${newDoc.academicYear})`,
      hodUser
    );

    return newDoc;
  },

  assignBranchWardCounsellor: async (dept, facultyId, hodUser = null, extraScope = {}) => {
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const faculty = users.find(u => u.uid === facultyId || u.employeeId === facultyId) || {};
    
    return await mockDB.saveWardCounsellorAssignment({
      facultyId: faculty.uid || facultyId,
      facultyName: faculty.fullName || faculty.name || extraScope.facultyName || 'Dr. Ravi Kumar',
      facultyEmail: faculty.email || extraScope.facultyEmail || 'ravi.kumar@kbn.edu',
      facultyPhone: faculty.mobile || faculty.phoneNumber || extraScope.facultyPhone || '9876543211',
      department: dept || faculty.department || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
      semester: extraScope.semester || 'Semester 6',
      section: extraScope.section || 'A',
      academicYear: extraScope.academicYear || '2026-2027'
    }, hodUser);
  },

  assignWardCounsellorV2: async (dept, section, facultyId, hodUser = null) => {
    return await mockDB.assignBranchWardCounsellor(dept, facultyId, hodUser, { section });
  },

  deactivateWardCounsellorAssignment: async (assignmentId, hodUser = null) => {
    await mockDB.delay(100);
    const assignments = await mockDB.getWardCounsellorAssignments();
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      assignments[idx].status = 'inactive';
      assignments[idx].deactivatedAt = new Date().toISOString();
      assignments[idx].deactivatedBy = hodUser?.fullName || 'HOD';
      localStorage.setItem('acad_ward_counsellor_assignments', JSON.stringify(assignments));

      // Also deactivate in legacy array
      const legacy = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
      const legIdx = legacy.findIndex(c => c.id === assignmentId);
      if (legIdx !== -1) {
        legacy[legIdx].status = 'Inactive';
        localStorage.setItem('acad_ward_counsellors', JSON.stringify(legacy));
      }
    }
    return true;
  },

  removeWardCounsellorV2: async (counsellorId, hodUser = null) => {
    return await mockDB.deactivateWardCounsellorAssignment(counsellorId, hodUser);
  },

  getStudentWardCounsellorDynamic: async (student) => {
    await mockDB.delay(30);
    if (!student) return null;
    const assignments = await mockDB.getWardCounsellorAssignments();

    const sDept = (student.department || student.branch || '').toUpperCase().trim();
    const sSem = (student.semester || '').trim().toLowerCase();
    const sSec = (student.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
    const sAY = (student.academicYear || '').trim();

    const activeMatch = assignments.find(a => {
      if (a.status !== 'active' && a.status !== 'Active') return false;

      const aDept = (a.department || '').toUpperCase().trim();
      const aSem = (a.semester || '').trim().toLowerCase();
      const aSec = (a.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
      const aAY = (a.academicYear || '').trim();

      const matchDept = !sDept || aDept === sDept || isDepartmentMatch(aDept, sDept);
      const matchSem = !sSem || !aSem || aSem === sSem;
      const matchSec = !sSec || !aSec || aSec === sSec;
      const matchAY = !sAY || !aAY || aAY === sAY;

      return matchDept && matchSem && matchSec && matchAY;
    });

    if (activeMatch) {
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const fac = users.find(u => u.uid === activeMatch.facultyId || u.email === activeMatch.facultyEmail) || {};

      return {
        id: activeMatch.id,
        facultyId: activeMatch.facultyId,
        fullName: activeMatch.facultyName || fac.fullName || fac.name || 'Dr. Ravi Kumar',
        facultyName: activeMatch.facultyName || fac.fullName || fac.name || 'Dr. Ravi Kumar',
        designation: fac.designation || 'Associate Professor & Ward Counsellor',
        department: activeMatch.department || student.department,
        semester: activeMatch.semester || student.semester || 'Semester 6',
        section: activeMatch.section || student.section || 'A',
        academicYear: activeMatch.academicYear || student.academicYear || '2026-2027',
        email: activeMatch.facultyEmail || fac.email || 'ravi.kumar@kbn.edu',
        facultyEmail: activeMatch.facultyEmail || fac.email || 'ravi.kumar@kbn.edu',
        mobile: activeMatch.facultyPhone || fac.mobile || fac.phoneNumber || '9876543211',
        phoneNumber: activeMatch.facultyPhone || fac.phoneNumber || fac.mobile || '9876543211',
        facultyPhone: activeMatch.facultyPhone || '9876543211',
        employeeId: fac.employeeId || activeMatch.facultyId || 'FAC001',
        officeHours: fac.officeHours || 'Mon - Fri: 3:00 PM - 5:00 PM',
        profilePhotoUrl: fac.photo || fac.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        photo: fac.photo || fac.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
    }

    return null;
  },

  getStudentWardCounsellor: async (student) => {
    return await mockDB.getStudentWardCounsellorDynamic(student);
  },

  getFacultyWardAssignment: async (facultyId) => {
    await mockDB.delay(30);
    const assignments = await mockDB.getWardCounsellorAssignments();
    return assignments.find(a => (a.status === 'active' || a.status === 'Active') && (a.facultyId === facultyId || a.facultyEmail === facultyId));
  },

  // --- FACULTY TEACHING ASSIGNMENTS (facultyAssignments) ---
  getFacultyAssignments: async (facultyId = null, dept = null) => {
    await mockDB.delay(30);
    let fsList = [];

    // Query Firestore courseAllocations if available
    if (isFirebaseConfigured && db) {
      try {
        const allocRef = collection(db, 'courseAllocations');
        const snap = await getDocs(allocRef);
        snap.forEach(docSnap => {
          const d = docSnap.data();
          fsList.push({ id: docSnap.id, ...d });
        });
      } catch (e) {
        console.warn("[Firestore] Error fetching courseAllocations:", e);
      }
    }

    let localAssignments = JSON.parse(localStorage.getItem('acad_faculty_assignments') || 'null');
    if (!localAssignments) {
      localAssignments = [
        {
          id: 'fa-seed-1',
          facultyId: 'fac-2',
          facultyName: 'Prof. Ravi Kumar',
          email: 'ravi.kumar@kbn.edu',
          phone: '9876543211',
          department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
          departmentCode: 'AI_ML',
          semester: 'Semester 6',
          section: 'A',
          academicYear: '2026-2027',
          subject: 'Artificial Intelligence',
          subjectCode: 'AI601',
          status: 'active',
          assignedBy: 'hod-1',
          assignedByName: 'Dr. Alan Turing',
          assignedAt: new Date().toISOString()
        },
        {
          id: 'fa-seed-2',
          facultyId: 'fac-2',
          facultyName: 'Prof. Ravi Kumar',
          email: 'ravi.kumar@kbn.edu',
          phone: '9876543211',
          department: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
          departmentCode: 'AI_ML',
          semester: 'Semester 6',
          section: 'A',
          academicYear: '2026-2027',
          subject: 'Machine Learning',
          subjectCode: 'ML602',
          status: 'active',
          assignedBy: 'hod-1',
          assignedByName: 'Dr. Alan Turing',
          assignedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('acad_faculty_assignments', JSON.stringify(localAssignments));
    }

    const combinedMap = new Map();
    [...fsList, ...localAssignments].forEach(item => {
      const key = item.id || `${item.facultyEmail || item.email}_${item.subject}`;
      if (key) combinedMap.set(key, item);
    });

    let filtered = Array.from(combinedMap.values());

    if (facultyId) {
      const fKey = String(facultyId).toLowerCase().trim();
      const matched = filtered.filter(a => 
        String(a.facultyId || '').toLowerCase().trim() === fKey || 
        String(a.email || '').toLowerCase().trim() === fKey ||
        String(a.facultyEmail || '').toLowerCase().trim() === fKey
      );
      if (matched.length > 0) {
        filtered = matched;
      }
    }

    if (dept && dept !== 'All') {
      const targetDept = dept.toUpperCase().trim();
      const deptFiltered = filtered.filter(a => {
        const aDept = (a.department || a.branch || '').toUpperCase().trim();
        return aDept === targetDept || isDepartmentMatch(aDept, targetDept);
      });
      if (deptFiltered.length > 0) {
        filtered = deptFiltered;
      }
    }

    // GRACEFUL FALLBACK FOR UNASSIGNED FACULTY: Always return an active scope so new faculty accounts are never locked out
    if (filtered.length === 0 || (facultyId && !filtered.some(a => (a.status || '').toLowerCase() === 'active'))) {
      const defaultDept = dept || 'B.Sc. Computer Science (CS)';
      const fallbackAssignment = {
        id: `fa-auto-${Date.now()}`,
        facultyId: facultyId || 'faculty-user',
        facultyName: 'Faculty Member',
        email: facultyId || '',
        facultyEmail: facultyId || '',
        department: defaultDept,
        branch: defaultDept,
        departmentCode: 'CS',
        semester: 'Semester 1',
        section: 'A',
        academicYear: '2025-2026',
        subject: 'Computer Science Fundamentals',
        subjectCode: 'CS101',
        status: 'active',
        assignedBy: 'System Auto-Scope',
        assignedAt: new Date().toISOString()
      };
      filtered = [fallbackAssignment];
    }

    return filtered;
  },

  saveFacultyAssignment: async (data, hodUser = null) => {
    await mockDB.delay(100);
    const assignments = await mockDB.getFacultyAssignments();

    const cleanSec = (data.section || 'A').trim().toUpperCase().replace(/^SECTION\s+/i, '');

    const newDoc = {
      id: 'fa-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      facultyId: data.facultyId,
      facultyName: data.facultyName,
      email: data.email || data.facultyEmail,
      phone: data.phone || data.facultyPhone || '9876543211',
      department: data.department,
      departmentCode: data.departmentCode || (data.department.includes('AI') ? 'AI_ML' : data.department.includes('CS') ? 'CSE' : 'DEPT'),
      semester: data.semester,
      section: cleanSec,
      academicYear: data.academicYear || '2026-2027',
      subject: data.subject,
      subjectCode: data.subjectCode || 'SUB101',
      status: 'active',
      assignedBy: hodUser?.uid || 'hod-1',
      assignedByName: hodUser?.fullName || 'HOD',
      assignedAt: new Date().toISOString()
    };

    assignments.unshift(newDoc);
    localStorage.setItem('acad_faculty_assignments', JSON.stringify(assignments));

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'facultyAssignments'), {
          ...newDoc,
          assignedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }

    await mockDB.logHODAudit(
      'Assign Faculty Teaching Scope',
      'Faculty Directory',
      `Assigned ${newDoc.facultyName} to teach ${newDoc.subject} (${newDoc.department}, ${newDoc.semester}, Section ${newDoc.section}, AY ${newDoc.academicYear})`,
      hodUser
    );

    return newDoc;
  },

  deactivateFacultyAssignment: async (assignmentId, hodUser = null) => {
    await mockDB.delay(100);
    const assignments = await mockDB.getFacultyAssignments();
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      assignments[idx].status = 'inactive';
      assignments[idx].deactivatedAt = new Date().toISOString();
      assignments[idx].deactivatedBy = hodUser?.fullName || 'HOD';
      localStorage.setItem('acad_faculty_assignments', JSON.stringify(assignments));
    }
    return true;
  },

  verifyFacultyScopeAccess: async (facultyId, department, semester, section, subject, academicYear) => {
    await mockDB.delay(20);
    const assignments = await mockDB.getFacultyAssignments(facultyId);
    if (!assignments || assignments.length === 0) return false;

    const deptNorm = (department || '').toUpperCase().trim();
    const semNorm = (semester || '').trim().toLowerCase();
    const secNorm = (section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
    const subjNorm = (subject || '').trim().toLowerCase();
    const ayNorm = (academicYear || '').trim();

    return assignments.some(a => {
      if (a.status !== 'active' && a.status !== 'Active') return false;
      const aDept = (a.department || '').toUpperCase().trim();
      const aSem = (a.semester || '').trim().toLowerCase();
      const aSec = (a.section || '').trim().toUpperCase().replace(/^SECTION\s+/i, '');
      const aSubj = (a.subject || '').trim().toLowerCase();
      const aAY = (a.academicYear || '').trim();

      const matchDept = !deptNorm || aDept === deptNorm || isDepartmentMatch(aDept, deptNorm);
      const matchSem = !semNorm || !aSem || aSem === semNorm;
      const matchSec = !secNorm || !aSec || aSec === secNorm;
      const matchSubj = !subjNorm || !aSubj || aSubj === subjNorm;
      const matchAY = !ayNorm || !aAY || aAY === ayNorm;

      return matchDept && matchSem && matchSec && matchSubj && matchAY;
    });
  },

  // --- FACULTY LEAVE MANAGEMENT ---
  applyFacultyLeave: async (leaveData, facultyUser) => {
    await mockDB.delay(100);
    const leaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    const newLeave = {
      id: 'fl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      leaveId: 'fl-' + Date.now(),
      facultyId: facultyUser?.uid || facultyUser?.id || 'fac-2',
      facultyName: facultyUser?.fullName || facultyUser?.name || 'Prof. Faculty',
      email: facultyUser?.email || 'faculty@kbn.edu',
      phone: facultyUser?.mobile || facultyUser?.phoneNumber || '9876543211',
      department: facultyUser?.department || 'CSE',
      leaveType: leaveData.leaveType || 'Casual Leave',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      totalDays: leaveData.totalDays || 1,
      reason: leaveData.reason,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };
    leaves.unshift(newLeave);
    localStorage.setItem('acad_faculty_leaves', JSON.stringify(leaves));

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'facultyLeaves'), {
          ...newLeave,
          submittedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }
    return newLeave;
  },

  getFacultyLeavesForHOD: async (hodDept) => {
    await mockDB.delay(50);
    const leaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    if (!hodDept || hodDept === 'All') return leaves;
    const targetDept = hodDept.toUpperCase().trim();
    return leaves.filter(l => {
      const lDept = (l.department || '').toUpperCase().trim();
      return lDept === targetDept || isDepartmentMatch(lDept, targetDept);
    });
  },

  reviewFacultyLeave: async (leaveId, status, rejectionReason = '', hodUser = null) => {
    await mockDB.delay(100);
    const leaves = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    const idx = leaves.findIndex(l => l.id === leaveId || l.leaveId === leaveId);
    if (idx !== -1) {
      leaves[idx].status = status;
      leaves[idx].reviewedAt = new Date().toISOString();
      leaves[idx].reviewedBy = hodUser?.fullName || 'HOD';
      if (status === 'Rejected') {
        leaves[idx].rejectionReason = rejectionReason;
      }
      localStorage.setItem('acad_faculty_leaves', JSON.stringify(leaves));
    }
    return true;
  },

  updateHODProfile: async (hodUid, profileData, hodUser = null) => {
    await mockDB.delay(100);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === hodUid || u.email === hodUser?.email);
    
    // Only allow permitted editable fields
    const updatedFields = {
      profilePhotoUrl: profileData.profilePhotoUrl !== undefined ? profileData.profilePhotoUrl : users[idx]?.profilePhotoUrl,
      mobile: profileData.mobile || users[idx]?.mobile || '9876543210',
      officeRoom: profileData.officeRoom || users[idx]?.officeRoom || 'Room 304, Tech Block',
      officeHours: profileData.officeHours || users[idx]?.officeHours || 'Mon - Fri: 10:00 AM - 4:00 PM',
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...updatedFields
      };
      localStorage.setItem('acad_users', JSON.stringify(users));
      
      // Update logged in user state in localStorage if matching
      const currentUser = JSON.parse(localStorage.getItem('acad_user') || '{}');
      if (currentUser.uid === hodUid || currentUser.email === users[idx].email) {
        const updatedCurrentUser = { ...currentUser, ...updatedFields };
        localStorage.setItem('acad_user', JSON.stringify(updatedCurrentUser));
      }
    }

    await mockDB.logHODAudit(
      'HOD Profile Updated',
      'Settings',
      `Updated mobile: ${updatedFields.mobile}, Room: ${updatedFields.officeRoom}`,
      hodUser
    );

    return users[idx] || updatedFields;
  },

  updateUserProfilePhoto: async (uid, photoUrl) => {
    await mockDB.delay(80);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === uid || u.employeeId === uid);
    if (idx !== -1) {
      users[idx].profilePhotoUrl = photoUrl || null;
      localStorage.setItem('acad_users', JSON.stringify(users));
    }

    const currentUser = JSON.parse(localStorage.getItem('acad_user') || '{}');
    if (currentUser.uid === uid || currentUser.employeeId === uid) {
      currentUser.profilePhotoUrl = photoUrl || null;
      localStorage.setItem('acad_user', JSON.stringify(currentUser));
    }

    const students = JSON.parse(localStorage.getItem('acad_students') || '[]');
    const sIdx = students.findIndex(s => s.uid === uid || s.studentId === uid);
    if (sIdx !== -1) {
      students[sIdx].profilePhotoUrl = photoUrl || null;
      localStorage.setItem('acad_students', JSON.stringify(students));
    }

    return { uid, profilePhotoUrl: photoUrl || null };
  },

  getHODProfileStats: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(50);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const facultyCount = users.filter(u => u.role === 'faculty' && (!dept || u.department === dept)).length || 25;
    const studentCount = users.filter(u => u.role === 'student' && (!dept || u.department === dept)).length || 620;
    const activeCounsellor = await mockDB.getActiveBranchWardCounsellor(dept);
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length || 6;

    return {
      facultyCount: facultyCount > 0 ? facultyCount : 25,
      studentCount: studentCount > 0 ? studentCount : 620,
      sectionsCount: 4,
      wardCounsellorName: activeCounsellor?.facultyName || 'Prof. Ravi Kumar',
      attendancePercentage: 87.4,
      pendingLeavesCount: pendingLeaves
    };
  },

  getStudentWardCounsellor: async (student) => {
    await mockDB.delay(30);
    if (!student) return null;
    const counsellors = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
    const activeAssignment = counsellors.find(c => 
      c.status === 'Active' && 
      (c.assignedSection === student.section || c.section === student.section) &&
      (!student.department || c.department === student.department || (student.department.includes('CS') && c.department.includes('CS')))
    );

    if (activeAssignment) {
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const fac = users.find(u => u.uid === activeAssignment.facultyId) || {};
      return {
        fullName: activeAssignment.facultyName,
        designation: activeAssignment.designation || fac.designation || 'Associate Professor',
        department: activeAssignment.department,
        email: activeAssignment.facultyEmail || fac.email || 'counsellor@kbn.edu',
        mobile: fac.mobile || fac.contactNumber || '9876543210',
        employeeId: fac.employeeId || 'WC-CSE-01',
        officeHours: 'Mon - Fri: 3:00 PM - 5:00 PM'
      };
    }

    // Fallback if explicit assignment object matches student.counsellorId
    if (student.counsellorId) {
      const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
      const fac = users.find(u => u.uid === student.counsellorId) || {};
      if (fac.fullName) {
        return {
          fullName: fac.fullName,
          designation: fac.designation || 'Ward Counsellor',
          department: fac.department || student.department,
          email: fac.email,
          mobile: fac.mobile || fac.contactNumber || '9876543210',
          employeeId: fac.employeeId || 'WC-01',
          officeHours: 'Mon - Fri: 3:00 PM - 5:00 PM'
        };
      }
    }

    return null;
  },

  getFacultyWardAssignment: async (facultyId) => {
    await mockDB.delay(30);
    const counsellors = JSON.parse(localStorage.getItem('acad_ward_counsellors') || '[]');
    return counsellors.find(c => c.status === 'Active' && c.facultyId === facultyId);
  },

  saveWardStudentRemark: async (counsellorId, rollNumber, remarkText, category = 'General', hodUser = null) => {
    await mockDB.delay(50);
    const remarks = JSON.parse(localStorage.getItem('acad_ward_remarks') || '[]');
    const newRemark = {
      id: 'rem-' + Math.random().toString(36).substr(2, 8),
      counsellorId,
      rollNumber,
      category,
      remarkText,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    remarks.unshift(newRemark);
    localStorage.setItem('acad_ward_remarks', JSON.stringify(remarks));
    return newRemark;
  },

  getWardsBySection: async (dept = 'B.Sc. Computer Science (CS)', section = 'Section A') => {
    await mockDB.delay(80);
    const mockWards = [
      { rollNumber: 'CSE-2023-001', name: 'John Doe', attendance: 92.4, internalMarks: 88, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Low', remarks: 'Consistent performance in lab sessions' },
      { rollNumber: 'CSE-2023-002', name: 'Avala Anand Babu', attendance: 68.5, internalMarks: 54, assignmentStatus: 'Pending', feeStatus: 'Partial', academicRisk: 'High', remarks: 'Requires attendance counseling and extra tutorial support' },
      { rollNumber: 'CSE-2023-003', name: 'Dasika Sarath Kumar', attendance: 74.0, internalMarks: 62, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Medium', remarks: 'Low attendance alert in 1st period' },
      { rollNumber: 'CSE-2023-004', name: 'Shaik Naadia Tasleem', attendance: 95.8, internalMarks: 94, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Low', remarks: 'Top department performer' },
      { rollNumber: 'CSE-2023-005', name: 'Chikati Yugala Sri', attendance: 81.2, internalMarks: 76, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Low', remarks: 'Active classroom participant' },
      { rollNumber: 'CSE-2023-006', name: 'Orsu Brahmaiah', attendance: 71.0, internalMarks: 58, assignmentStatus: 'Pending', feeStatus: 'Pending', academicRisk: 'High', remarks: 'Parent-Teacher Meeting scheduled' },
      { rollNumber: 'CSE-2023-007', name: 'Gundala Venkat', attendance: 89.0, internalMarks: 82, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Low', remarks: 'Good project work' },
      { rollNumber: 'CSE-2023-008', name: 'Patan Mastan', attendance: 78.4, internalMarks: 70, assignmentStatus: 'Submitted', feeStatus: 'Paid', academicRisk: 'Low', remarks: 'Satisfactory' }
    ];
    return mockWards;
  },

  getFacultyLeavesForHOD: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(80);
    let leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    let facultyLeaves = leaves.filter(l => l.applicantRole === 'faculty');

    if (facultyLeaves.length === 0) {
      facultyLeaves = [
        {
          leaveId: 'fleave-101',
          facultyId: 'fac-2',
          facultyName: 'Prof. Ravi Kumar',
          facultyCode: 'FAC-CSE-02',
          department: dept || 'B.Sc. Computer Science (CS)',
          leaveType: 'Casual Leave',
          startDate: '2026-08-15',
          endDate: '2026-08-16',
          fromDate: '2026-08-15',
          toDate: '2026-08-16',
          numberOfDays: 2,
          reason: 'Attending IEEE International Conference on AI & ML',
          supportingDocument: 'conference_invitation.pdf',
          appliedDate: '2026-08-08',
          status: 'pending',
          applicantRole: 'faculty'
        },
        {
          leaveId: 'fleave-102',
          facultyId: 'fac-3',
          facultyName: 'Prof. Priya Sharma',
          facultyCode: 'FAC-CSE-03',
          department: dept || 'B.Sc. Computer Science (CS)',
          leaveType: 'Sick Leave',
          startDate: '2026-08-12',
          endDate: '2026-08-13',
          fromDate: '2026-08-12',
          toDate: '2026-08-13',
          numberOfDays: 2,
          reason: 'High fever and viral infection prescribed medical rest',
          supportingDocument: 'medical_certificate.pdf',
          appliedDate: '2026-08-09',
          status: 'pending',
          applicantRole: 'faculty'
        },
        {
          leaveId: 'fleave-103',
          facultyId: 'fac-1',
          facultyName: 'Prof. Charles Xavier',
          facultyCode: 'FAC-CSE-01',
          department: dept || 'B.Sc. Computer Science (CS)',
          leaveType: 'Personal Leave',
          startDate: '2026-08-01',
          endDate: '2026-08-02',
          fromDate: '2026-08-01',
          toDate: '2026-08-02',
          numberOfDays: 2,
          reason: 'Personal family engagement',
          supportingDocument: null,
          appliedDate: '2026-07-28',
          status: 'approved',
          approvedByRole: 'hod',
          applicantRole: 'faculty'
        },
        {
          leaveId: 'fleave-104',
          facultyId: 'fac-4',
          facultyName: 'Prof. Arun',
          facultyCode: 'FAC-CSE-04',
          department: dept || 'B.Sc. Computer Science (CS)',
          leaveType: 'Casual Leave',
          startDate: '2026-08-05',
          endDate: '2026-08-06',
          fromDate: '2026-08-05',
          toDate: '2026-08-06',
          numberOfDays: 2,
          reason: 'Urgent home maintenance work',
          supportingDocument: null,
          appliedDate: '2026-08-03',
          status: 'rejected',
          rejectionReason: 'Leave cannot be approved because internal examinations are scheduled during this period.',
          applicantRole: 'faculty'
        }
      ];
      const merged = [...leaves, ...facultyLeaves];
      localStorage.setItem('acad_leave_requests', JSON.stringify(merged));
    }
    return facultyLeaves;
  },

  checkLeaveConflicts: async (facultyId, startDate, endDate, dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(50);
    const leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const approvedFacultyLeaves = leaves.filter(l => l.applicantRole === 'faculty' && l.status === 'approved');

    const warnings = [];

    // 1. Overlapping leaves count
    const overlapping = approvedFacultyLeaves.filter(l => {
      const s = new Date(l.startDate || l.fromDate);
      const e = new Date(l.endDate || l.toDate);
      const reqS = new Date(startDate);
      const reqE = new Date(endDate);
      return (s <= reqE && e >= reqS);
    });

    if (overlapping.length > 0) {
      warnings.push(`⚠ Warning: ${overlapping.length} faculty member(s) (${overlapping.map(o => o.facultyName).join(', ')}) are already on approved leave during this period.`);
    }

    // 2. Class schedule conflict check
    warnings.push(`⚠ Conflict: Faculty member has 4 scheduled lectures/labs during requested leave duration.`);

    // 3. Exam check
    const reqS = new Date(startDate);
    const reqE = new Date(endDate);
    const examDate = new Date('2026-08-16');
    if (reqS <= examDate && reqE >= examDate) {
      warnings.push(`⚠ Warning: Mid-1 Internal Examinations are scheduled on 16-Aug-2026.`);
    }

    return warnings;
  },

  reviewFacultyLeave: async (leaveId, action, rejectionReason = '', hodUser = null) => {
    await mockDB.delay(100);
    let leaves = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    const idx = leaves.findIndex(l => l.leaveId === leaveId || l.id === leaveId);
    let updatedLeave = null;

    if (idx !== -1) {
      leaves[idx].status = action;
      leaves[idx].reviewedAt = new Date().toISOString();
      leaves[idx].reviewedBy = hodUser?.fullName || 'Dr. Alan Turing (HOD)';
      if (action === 'rejected') {
        leaves[idx].rejectionReason = rejectionReason || 'Leave request declined by HOD.';
      }
      updatedLeave = leaves[idx];
      localStorage.setItem('acad_leave_requests', JSON.stringify(leaves));

      // Create notification for faculty
      const notifications = JSON.parse(localStorage.getItem('acad_notifications') || '[]');
      notifications.unshift({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        targetUid: leaves[idx].facultyId,
        title: `Faculty Leave ${action.toUpperCase()}`,
        message: action === 'approved' 
          ? `Your leave request from ${leaves[idx].startDate} to ${leaves[idx].endDate} has been approved by HOD.`
          : `Your leave request was rejected. Reason: ${rejectionReason}`,
        type: action === 'approved' ? 'success' : 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('acad_notifications', JSON.stringify(notifications));

      // Log Audit Log
      await mockDB.logHODAudit(
        `Faculty Leave ${action.toUpperCase()}`,
        'Faculty Leaves',
        `${action.toUpperCase()} leave request for ${leaves[idx].facultyName} (${leaves[idx].leaveType}, ${leaves[idx].numberOfDays} Days). ${action === 'rejected' ? 'Reason: ' + rejectionReason : ''}`,
        hodUser
      );
    }
    return updatedLeave;
  },

  getFacultyWorkload: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(80);
    return [
      { facultyId: 'fac-1', name: 'Prof. Charles Xavier', designation: 'Senior Professor', subjects: ['Data Structures', 'Operating Systems'], classesPerWeek: 14, hoursPerWeek: 18, attendance: 96.5, leavesTaken: 2, status: 'Normal' },
      { facultyId: 'fac-2', name: 'Prof. Ravi Kumar', designation: 'Associate Professor', subjects: ['Machine Learning', 'Python Programming'], classesPerWeek: 18, hoursPerWeek: 24, attendance: 92.0, leavesTaken: 4, status: 'High' },
      { facultyId: 'fac-3', name: 'Prof. Priya Sharma', designation: 'Assistant Professor', subjects: ['Database Management Systems', 'Java'], classesPerWeek: 12, hoursPerWeek: 16, attendance: 94.2, leavesTaken: 1, status: 'Normal' },
      { facultyId: 'fac-4', name: 'Prof. Arun', designation: 'Assistant Professor', subjects: ['Web Technologies', 'Software Engineering'], classesPerWeek: 20, hoursPerWeek: 26, attendance: 89.5, leavesTaken: 5, status: 'Overloaded' },
      { facultyId: 'fac-5', name: 'Prof. Suresh Reddy', designation: 'Associate Professor', subjects: ['Computer Networks', 'Deep Learning'], classesPerWeek: 10, hoursPerWeek: 14, attendance: 98.0, leavesTaken: 0, status: 'Low' }
    ];
  },

  getMonthlyFacultyLeaveReport: async (dept = 'B.Sc. Computer Science (CS)', month = 'August', year = '2026', facultyId = 'All') => {
    await mockDB.delay(100);
    const facultyList = [
      { facultyName: 'Prof. Charles Xavier', totalLeaves: 3, approved: 3, rejected: 0, pending: 0, totalDays: 5 },
      { facultyName: 'Prof. Ravi Kumar', totalLeaves: 5, approved: 4, rejected: 1, pending: 0, totalDays: 8 },
      { facultyName: 'Prof. Priya Sharma', totalLeaves: 4, approved: 3, rejected: 0, pending: 1, totalDays: 6 },
      { facultyName: 'Prof. Arun', totalLeaves: 6, approved: 3, rejected: 2, pending: 1, totalDays: 10 },
      { facultyName: 'Prof. Suresh Reddy', totalLeaves: 2, approved: 2, rejected: 0, pending: 0, totalDays: 3 }
    ];

    const filtered = facultyId === 'All' ? facultyList : facultyList.filter(f => f.facultyName.includes(facultyId));

    const totalRequests = filtered.reduce((acc, curr) => acc + curr.totalLeaves, 0);
    const approved = filtered.reduce((acc, curr) => acc + curr.approved, 0);
    const rejected = filtered.reduce((acc, curr) => acc + curr.rejected, 0);
    const pending = filtered.reduce((acc, curr) => acc + curr.pending, 0);
    const totalDays = filtered.reduce((acc, curr) => acc + curr.totalDays, 0);

    return {
      month,
      year,
      summary: {
        totalRequests,
        approved,
        rejected,
        pending,
        totalDays,
        avgDaysPerFaculty: (totalDays / filtered.length).toFixed(1)
      },
      tableData: filtered,
      charts: {
        trend: [
          { week: 'Week 1', Approved: 6, Rejected: 1, Pending: 2 },
          { week: 'Week 2', Approved: 8, Rejected: 2, Pending: 1 },
          { week: 'Week 3', Approved: 5, Rejected: 1, Pending: 0 },
          { week: 'Week 4', Approved: 5, Rejected: 1, Pending: 0 }
        ],
        typeDistribution: [
          { name: 'Casual Leave', value: 14 },
          { name: 'Sick Leave', value: 8 },
          { name: 'Emergency Leave', value: 4 },
          { name: 'Personal Leave', value: 6 }
        ]
      }
    };
  },

  getDepartmentAcademicPerformance: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(80);
    return {
      avgInternalMarks: 78.5,
      mid1Average: 76.2,
      mid2Average: 80.8,
      assignmentAverage: 88.5,
      subjectPerformance: [
        { subject: 'Data Structures', avgMarks: 82.4 },
        { subject: 'Machine Learning', avgMarks: 74.8 },
        { subject: 'Database Management', avgMarks: 84.0 },
        { subject: 'Operating Systems', avgMarks: 79.2 },
        { subject: 'Web Technologies', avgMarks: 86.5 }
      ],
      sectionPerformance: [
        { section: 'Section A', avgMarks: 81.5 },
        { section: 'Section B', avgMarks: 76.8 },
        { section: 'Section C', avgMarks: 79.4 },
        { section: 'Section D', avgMarks: 74.0 }
      ],
      topPerformers: [
        { rollNumber: 'CSE-2023-004', name: 'Shaik Naadia Tasleem', section: 'Section A', marks: 96.5 },
        { rollNumber: 'CSE-2023-001', name: 'John Doe', section: 'Section A', marks: 92.4 },
        { rollNumber: 'CSE-2023-007', name: 'Gundala Venkat', section: 'Section B', marks: 89.0 }
      ],
      lowPerformers: [
        { rollNumber: 'CSE-2023-002', name: 'Avala Anand Babu', section: 'Section A', marks: 54.0 },
        { rollNumber: 'CSE-2023-006', name: 'Orsu Brahmaiah', section: 'Section C', marks: 58.0 }
      ]
    };
  },

  getDepartmentAnnouncements: async (dept = 'B.Sc. Computer Science (CS)') => {
    await mockDB.delay(60);
    let ann = JSON.parse(localStorage.getItem('acad_announcements') || '[]');
    if (ann.length === 0) {
      ann = [
        {
          id: 'ann-1',
          title: 'Department Faculty Meeting - Curriculum Review',
          description: 'All CSE faculty members are requested to attend the monthly academic curriculum progress meeting.',
          targetAudience: 'All Faculty',
          department: dept,
          date: '2026-08-12',
          priority: 'High',
          createdBy: 'Dr. Alan Turing (HOD)'
        },
        {
          id: 'ann-2',
          title: 'Ward Counsellor Student Review Deadline',
          description: 'All Ward Counsellors must submit Mid-Semester student attendance and risk reports.',
          targetAudience: 'Ward Counsellors',
          department: dept,
          date: '2026-08-15',
          priority: 'Medium',
          createdBy: 'Dr. Alan Turing (HOD)'
        }
      ];
      localStorage.setItem('acad_announcements', JSON.stringify(ann));
    }
    return ann;
  },

  createDepartmentAnnouncement: async (annData, hodUser = null) => {
    await mockDB.delay(100);
    let ann = JSON.parse(localStorage.getItem('acad_announcements') || '[]');
    const newAnn = {
      id: 'ann-' + Math.random().toString(36).substr(2, 9),
      title: annData.title,
      description: annData.description,
      targetAudience: annData.targetAudience || 'All Faculty',
      department: hodUser?.department || 'B.Sc. Computer Science (CS)',
      date: new Date().toISOString().split('T')[0],
      priority: annData.priority || 'Normal',
      attachment: annData.attachment || null,
      createdBy: hodUser?.fullName || 'Dr. Alan Turing (HOD)'
    };
    ann.unshift(newAnn);
    localStorage.setItem('acad_announcements', JSON.stringify(ann));

    await mockDB.logHODAudit(
      'Announcement Created',
      'Announcements',
      `Created department announcement: "${newAnn.title}" for ${newAnn.targetAudience}`,
      hodUser
    );
    return newAnn;
  },

  assignFacultyCourse: async (facultyId, subjectName, branch, semester, section) => {
    await mockDB.delay(100);
    const allocs = JSON.parse(localStorage.getItem('acad_subject_allocations') || '[]');
    const newAlloc = {
      allocationId: 'alloc-' + Math.random().toString(36).substr(2, 9),
      facultyId,
      subjectName,
      branch: branch || 'CSE',
      semester: semester || 'Semester 6',
      section: section || 'A'
    };
    allocs.push(newAlloc);
    localStorage.setItem('acad_subject_allocations', JSON.stringify(allocs));
    return newAlloc;
  },

  getCurriculumProgress: async (dept) => {
    await mockDB.delay(50);
    const progress = JSON.parse(localStorage.getItem('acad_curriculum_progress') || '[]');
    if (progress.length === 0) {
      const defaultModules = [
        { id: 'curr-1', subject: 'Machine Learning', faculty: 'Prof. Ravi Kumar', branch: dept || 'B.Sc. Computer Science (CS)', semester: 'Semester 6', totalUnits: 5, completedUnits: 4, remainingUnits: 1, progressPercentage: 80, status: 'On Track' },
        { id: 'curr-2', subject: 'Deep Learning', faculty: 'Prof. Suresh Reddy', branch: dept || 'B.Sc. Computer Science (CS)', semester: 'Semester 6', totalUnits: 5, completedUnits: 3, remainingUnits: 2, progressPercentage: 60, status: 'On Track' },
        { id: 'curr-3', subject: 'Python Programming', faculty: 'Prof. Ravi Kumar', branch: dept || 'B.Sc. Computer Science (CS)', semester: 'Semester 6', totalUnits: 5, completedUnits: 4.5, remainingUnits: 0.5, progressPercentage: 90, status: 'Ahead of Schedule' },
        { id: 'curr-4', subject: 'Data Structures', faculty: 'Prof. Charles Xavier', branch: dept || 'B.Sc. Computer Science (CS)', semester: 'Semester 6', totalUnits: 5, completedUnits: 3.8, remainingUnits: 1.2, progressPercentage: 76, status: 'On Track' }
      ];
      localStorage.setItem('acad_curriculum_progress', JSON.stringify(defaultModules));
      return defaultModules;
    }
    return progress.filter(p => !p.branch || p.branch === dept || dept === 'All');
  },

  saveAttendanceBatch: async (records, facultyId, facultyName) => {
    await mockDB.delay(100);
    const now = new Date().toISOString();

    const formattedRecords = records.map(r => {
      const stId = r.studentId || r.rollNumber || `stud-${Math.random().toString(36).substr(2, 6)}`;
      const safeSubject = (r.subject || 'general').replace(/[\/\s\.\(\)]/g, '_');
      const safeDate = (r.date || new Date().toISOString().split('T')[0]).replace(/\//g, '-');
      const pNum = Number(r.period || r.lecturePeriod || 1);
      const docId = `${stId}_${safeSubject}_${safeDate}_p${pNum}`.replace(/[\/\s]/g, '_');
      const mainDocId = `${stId}_${safeSubject}_${safeDate}`.replace(/[\/\s]/g, '_');

      return {
        id: docId,
        docId,
        mainDocId,
        studentId: stId,
        studentUid: stId,
        rollNumber: r.rollNumber || stId,
        studentName: r.studentName || 'Student',
        department: r.department || r.branch || 'General',
        branch: r.department || r.branch || 'General',
        semester: r.semester || 'Semester 6',
        section: r.section || 'Section A',
        subject: r.subject || 'General',
        lecturePeriod: pNum,
        period: pNum,
        facultyId: facultyId || r.facultyId || 'fac-1',
        facultyName: facultyName || r.facultyName || 'Faculty',
        date: r.date || safeDate,
        status: r.status || 'present',
        remarks: r.remarks || '',
        createdAt: now,
        updatedAt: now
      };
    });

    if (isFirebaseConfigured && db) {
      try {
        for (const rec of formattedRecords) {
          // 1. Update individual period doc
          const dRef = doc(db, 'attendance', rec.docId);
          await setDoc(dRef, {
            ...rec,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          // 2. Update unified Student + Subject + Date document (period1Status to period5Status)
          const pKey = `period${rec.period}`;
          const pStatusKey = `period${rec.period}Status`;
          const mainRef = doc(db, 'attendance', rec.mainDocId);
          await setDoc(mainRef, {
            studentId: rec.studentId,
            rollNumber: rec.rollNumber,
            studentName: rec.studentName,
            department: rec.department,
            semester: rec.semester,
            section: rec.section,
            subject: rec.subject,
            date: rec.date,
            [pStatusKey]: rec.status,
            [pKey]: {
              status: rec.status,
              remarks: rec.remarks,
              facultyId: rec.facultyId,
              facultyName: rec.facultyName,
              updatedAt: now
            },
            updatedAt: serverTimestamp()
          }, { merge: true });

          // Dispatch alert notification for absent status
          if (rec.status === 'absent' && rec.studentId) {
            try {
              await addDoc(collection(db, 'notifications'), {
                studentId: rec.studentId,
                rollNumber: rec.rollNumber,
                title: 'Absence Alert',
                content: `You were marked ABSENT for ${rec.subject} (Period ${rec.period}) on ${rec.date}.`,
                type: 'attendance',
                read: false,
                createdAt: now
              });
            } catch (e) {
              console.warn("Absence notification dispatch failed:", e);
            }
          }
        }
        return true;
      } catch (err) {
        console.error("Firestore saveAttendanceBatch error, saving to local backup:", err);
      }
    }

    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    formattedRecords.forEach(rec => {
      const idx = attendance.findIndex(a => 
        (a.studentId === rec.studentId || a.rollNumber === rec.rollNumber) && 
        a.subject === rec.subject && 
        a.date === rec.date && 
        Number(a.period || a.lecturePeriod) === Number(rec.period)
      );
      if (idx !== -1) {
        attendance[idx] = { ...attendance[idx], ...rec };
      } else {
        attendance.push(rec);
      }
    });
    localStorage.setItem('acad_attendance', JSON.stringify(attendance));
    return true;
  },

  saveAttendanceCorrection: async (data) => {
    await mockDB.delay(100);
    const now = new Date().toISOString();
    const { studentId, rollNumber, studentName, subject, date, period, oldStatus, newStatus, editedBy, facultyId, reason } = data;

    const stId = studentId || rollNumber;
    const safeSubject = (subject || 'general').replace(/[\/\s\.\(\)]/g, '_');
    const safeDate = (date || new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    const pNum = Number(period || 1);
    const docId = `${stId}_${safeSubject}_${safeDate}_p${pNum}`.replace(/[\/\s]/g, '_');

    const historyEntry = {
      studentId: stId,
      rollNumber: rollNumber || stId,
      studentName: studentName || 'Student',
      subject,
      date,
      period: pNum,
      oldStatus,
      newStatus,
      editedBy: editedBy || 'Faculty',
      facultyId: facultyId || 'fac-1',
      reason: reason || 'Attendance correction',
      editedAt: now,
      createdAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        const dRef = doc(db, 'attendance', docId);
        await setDoc(dRef, {
          status: newStatus,
          isEdited: true,
          lastEditedBy: editedBy || 'Faculty',
          lastEditedAt: now,
          lastReason: reason || 'Attendance correction',
          updatedAt: serverTimestamp()
        }, { merge: true });

        await addDoc(collection(db, 'attendance_history'), {
          ...historyEntry,
          editedAt: serverTimestamp()
        });

        return true;
      } catch (err) {
        console.error("Firestore saveAttendanceCorrection error:", err);
      }
    }

    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const idx = attendance.findIndex(a => 
      (a.studentId === stId || a.rollNumber === rollNumber) && 
      a.subject === subject && 
      a.date === date && 
      Number(a.period || a.lecturePeriod) === pNum
    );
    if (idx !== -1) {
      attendance[idx] = { 
        ...attendance[idx], 
        status: newStatus, 
        isEdited: true, 
        lastEditedBy: editedBy, 
        lastEditedAt: now, 
        lastReason: reason 
      };
      localStorage.setItem('acad_attendance', JSON.stringify(attendance));
    }

    const history = JSON.parse(localStorage.getItem('acad_attendance_history') || '[]');
    history.unshift(historyEntry);
    localStorage.setItem('acad_attendance_history', JSON.stringify(history));
    return true;
  },

  subscribeClassAttendance: (branch, semester, section, date, subject, period, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'attendance'));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(a => {
              if (branch && a.department !== branch && a.branch !== branch) return false;
              if (semester && a.semester !== semester) return false;
              if (date && a.date !== date) return false;
              if (section && a.section !== section && a.section !== `Section ${section}`) return false;
              if (subject && a.subject !== subject) return false;
              if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
              return true;
            });
          callback(list);
        }, (err) => {
          console.error("subscribeClassAttendance onSnapshot error:", err);
          const local = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
          callback(local);
        });
      } catch (e) {
        console.error("subscribeClassAttendance error:", e);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const filtered = local.filter(a => {
      if (branch && a.department !== branch && a.branch !== branch) return false;
      if (semester && a.semester !== semester) return false;
      if (date && a.date !== date) return false;
      if (section && a.section !== section && a.section !== `Section ${section}`) return false;
      if (subject && a.subject !== subject) return false;
      if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
      return true;
    });
    callback(filtered);
    return () => {};
  },

  subscribeStudentAttendance: (studentId, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'attendance'));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(a => a.studentId === studentId || a.rollNumber === studentId);
          callback(list);
        });
      } catch (e) {
        console.error("subscribeStudentAttendance error:", e);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    callback(local.filter(a => a.studentId === studentId || a.rollNumber === studentId));
    return () => {};
  },

  subscribeAttendanceHistory: (studentId, date, subject, period, callback) => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'attendance_history'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(h => 
            (h.studentId === studentId || h.rollNumber === studentId) &&
            (!date || h.date === date) &&
            (!subject || h.subject === subject) &&
            (!period || Number(h.period) === Number(period))
          )
          .sort((a, b) => new Date(b.editedAt || 0) - new Date(a.editedAt || 0));
        callback(list);
      });
    }
    const history = JSON.parse(localStorage.getItem('acad_attendance_history') || '[]');
    const list = history.filter(h => 
      (h.studentId === studentId || h.rollNumber === studentId) &&
      (!date || h.date === date) &&
      (!subject || h.subject === subject) &&
      (!period || Number(h.period) === Number(period))
    );
    callback(list);
    return () => {};
  },

  getAttendanceByFilter: async (branch, semester, date, section, subject, period) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'attendance'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => {
          if (branch && a.department !== branch && a.branch !== branch) return false;
          if (semester && a.semester !== semester) return false;
          if (date && a.date !== date) return false;
          if (section && a.section !== section && a.section !== `Section ${section}`) return false;
          if (subject && a.subject !== subject) return false;
          if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
          return true;
        });
      } catch (e) {
        console.error("Firestore getAttendanceByFilter error:", e);
      }
    }

    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    return attendance.filter(a => {
      if (branch && a.department !== branch && a.branch !== branch) return false;
      if (semester && a.semester !== semester) return false;
      if (date && a.date !== date) return false;
      if (section && a.section !== section && a.section !== `Section ${section}`) return false;
      if (subject && a.subject !== subject) return false;
      if (period && Number(a.period || a.lecturePeriod) !== Number(period)) return false;
      return true;
    });
  },

  subscribeClassAttendance: (branch, semester, section, date, subject, period, callback) => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'attendance'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => 
            (a.department === branch || a.branch === branch) &&
            a.semester === semester &&
            (date ? a.date === date : true) &&
            (subject ? a.subject === subject : true) &&
            (period ? Number(a.period || a.lecturePeriod) === Number(period) : true)
          );
        callback(list);
      });
    }
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const list = attendance.filter(a => 
      (a.department === branch || a.branch === branch) &&
      a.semester === semester &&
      (date ? a.date === date : true) &&
      (subject ? a.subject === subject : true) &&
      (period ? Number(a.period || a.lecturePeriod) === Number(period) : true)
    );
    callback(list);
    return () => {};
  },

  subscribeStudentAttendance: (studentId, rollNumber, callback) => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'attendance'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => a.studentId === studentId || (rollNumber && a.rollNumber === rollNumber));
        callback(list);
      });
    }
    const attendance = JSON.parse(localStorage.getItem('acad_attendance') || '[]');
    const list = attendance.filter(a => a.studentId === studentId || (rollNumber && a.rollNumber === rollNumber));
    callback(list);
    return () => {};
  },

  getStudentsByBranchAndSemester: async (branch, semester, section) => {
    await mockDB.delay(50);

    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'students'));
        let students = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

        if (students.length === 0) {
          const profileSnap = await getDocs(collection(db, 'profiles'));
          students = profileSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.role === 'student');
        }

        if (branch) {
          students = students.filter(s => s.department === branch || s.branch === branch);
        }
        if (semester) {
          students = students.filter(s => !s.semester || s.semester === semester);
        }
        if (section) {
          students = students.filter(s => !s.section || s.section === section || s.section === `Section ${section}`);
        }

        if (students.length > 0) return students;
      } catch (err) {
        console.error("Firestore getStudentsByBranchAndSemester error:", err);
      }
    }

    let list = [...SEEDED_STUDENTS];
    if (branch) {
      list = list.filter(s => s.department === branch || s.branch === branch);
    }
    if (semester) {
      list = list.filter(s => !s.semester || s.semester === semester);
    }
    if (section) {
      list = list.filter(s => !s.section || s.section === section || s.section === `Section ${section}`);
    }
    return list;
  },

  getStudentLeaves: async (studentId) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'student_leaves'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (studentId) return list.filter(l => l.studentId === studentId);
        return list;
      } catch (e) {
        console.error("Firestore getStudentLeaves error:", e);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_student_leaves') || '[]');
    if (studentId) return local.filter(l => l.studentId === studentId);
    return local;
  },

  applyStudentLeave: async (studentId, leaveData) => {
    await mockDB.delay(100);
    const deptVal = leaveData.department || leaveData.branch || 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
    const semVal = leaveData.semester || 'Semester 2';
    const secVal = leaveData.section || 'Section A';

    const newLeave = {
      id: `student-leave-${Date.now()}`,
      leaveId: `student-leave-${Date.now()}`,
      studentId: studentId || 'stud-cse',
      applicantId: studentId || 'stud-cse',
      uid: studentId || 'stud-cse',
      studentName: leaveData.studentName || 'Student',
      applicantName: leaveData.studentName || 'Student',
      rollNumber: leaveData.rollNumber || '',
      department: deptVal,
      branch: deptVal,
      semester: semVal,
      section: secVal,
      leaveType: leaveData.leaveType || 'Casual Leave',
      fromDate: leaveData.fromDate || leaveData.startDate || new Date().toISOString().split('T')[0],
      startDate: leaveData.fromDate || leaveData.startDate || new Date().toISOString().split('T')[0],
      toDate: leaveData.toDate || leaveData.endDate || new Date().toISOString().split('T')[0],
      endDate: leaveData.toDate || leaveData.endDate || new Date().toISOString().split('T')[0],
      reason: leaveData.reason || 'Personal Work',
      status: 'Pending',
      applicantRole: 'student',
      appliedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      approvedBy: '',
      rejectionReason: ''
    };

    if (isFirebaseConfigured && db) {
      try {
        const ref1 = await addDoc(collection(db, 'leaves'), newLeave);
        newLeave.id = ref1.id;
        newLeave.leaveId = ref1.id;
      } catch (e) {
        console.error("FIREBASE ERROR (collection leaves):", e);
      }
      try {
        await addDoc(collection(db, 'student_leaves'), newLeave);
      } catch (e) {
        console.error("FIREBASE ERROR (collection student_leaves):", e);
      }
      try {
        await addDoc(collection(db, 'leave_requests'), newLeave);
      } catch (e) {
        console.error("FIREBASE ERROR (collection leave_requests):", e);
      }
    }

    const local1 = JSON.parse(localStorage.getItem('acad_student_leaves') || '[]');
    local1.unshift(newLeave);
    localStorage.setItem('acad_student_leaves', JSON.stringify(local1));

    const local2 = JSON.parse(localStorage.getItem('acad_leave_requests') || '[]');
    local2.unshift(newLeave);
    localStorage.setItem('acad_leave_requests', JSON.stringify(local2));

    return newLeave;
  },

  getFacultyLeaves: async (facultyId) => {
    await mockDB.delay(50);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'faculty_leaves'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (facultyId) return list.filter(l => l.facultyId === facultyId);
        return list;
      } catch (e) {
        console.error("Firestore getFacultyLeaves error:", e);
      }
    }
    const local = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    if (facultyId) return local.filter(l => l.facultyId === facultyId);
    return local;
  },

  applyFacultyLeave: async (facultyId, leaveData) => {
    await mockDB.delay(100);
    const newLeave = {
      id: `faculty-leave-${Date.now()}`,
      facultyId: facultyId || 'fac-cse',
      facultyName: leaveData.facultyName || 'Faculty Member',
      department: leaveData.department || 'CSE',
      leaveType: leaveData.leaveType || 'Casual Leave',
      fromDate: leaveData.fromDate || new Date().toISOString().split('T')[0],
      toDate: leaveData.toDate || new Date().toISOString().split('T')[0],
      reason: leaveData.reason || 'Academic / Personal',
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      approvedBy: '',
      rejectionReason: ''
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'faculty_leaves'), newLeave);
      } catch (e) {
        console.error("Firestore applyFacultyLeave error:", e);
      }
    }

    const local = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    local.unshift(newLeave);
    localStorage.setItem('acad_faculty_leaves', JSON.stringify(local));
    return newLeave;
  },

  updateStudentLeaveStatus: async (leaveId, status, approverName, rejectionReason = '') => {
    await mockDB.delay(50);
    const local = JSON.parse(localStorage.getItem('acad_student_leaves') || '[]');
    const idx = local.findIndex(l => l.id === leaveId || l.leaveId === leaveId);
    if (idx !== -1) {
      local[idx].status = status;
      local[idx].approvedBy = approverName;
      if (rejectionReason) local[idx].rejectionReason = rejectionReason;
      localStorage.setItem('acad_student_leaves', JSON.stringify(local));

      try {
        const studentId = local[idx].studentId || local[idx].uid;
        if (studentId) {
          await mockDB.addNotification(
            studentId,
            `Leave Application ${status}`,
            `Your leave application (${local[idx].fromDate} to ${local[idx].toDate}) was ${status} by ${approverName || 'Ward Counsellor'}.`
          );
        }
      } catch (e) {
        console.warn("Student leave status notification error:", e.message);
      }
    }
    return { success: true };
  },

  updateFacultyLeaveStatus: async (leaveId, status, approverName, rejectionReason = '') => {
    await mockDB.delay(50);
    const local = JSON.parse(localStorage.getItem('acad_faculty_leaves') || '[]');
    const idx = local.findIndex(l => l.id === leaveId || l.leaveId === leaveId);
    if (idx !== -1) {
      local[idx].status = status;
      local[idx].approvedBy = approverName;
      if (rejectionReason) local[idx].rejectionReason = rejectionReason;
      localStorage.setItem('acad_faculty_leaves', JSON.stringify(local));

      try {
        const facultyId = local[idx].facultyId;
        if (facultyId) {
          await mockDB.addNotification(
            facultyId,
            `Faculty Leave ${status}`,
            `Your leave application (${local[idx].fromDate} to ${local[idx].toDate}) was ${status} by ${approverName || 'HOD'}.`
          );
        }
      } catch (e) {
        console.warn("Faculty leave status notification error:", e.message);
      }
    }
    return { success: true };
  },

  updateUserProfilePhoto: async (userId, photoUrl) => {
    await mockDB.delay(50);
    const users = JSON.parse(localStorage.getItem('acad_users') || '[]');
    const idx = users.findIndex(u => u.uid === userId || u.id === userId);
    if (idx !== -1) {
      users[idx].profilePhotoUrl = photoUrl;
      users[idx].photo = photoUrl;
      localStorage.setItem('acad_users', JSON.stringify(users));
    }

    if (isFirebaseConfigured && db && userId) {
      try {
        const userRef = doc(db, 'profiles', userId);
        await setDoc(userRef, { profilePhotoUrl: photoUrl, photo: photoUrl, updatedAt: new Date().toISOString() }, { merge: true });
        console.log('[Firestore] Profile photo updated in Firestore:', userId);
      } catch (err) {
        console.error('[Firestore] setDoc profile photo failed:', err);
      }
    }
    return { success: true, photoUrl };
  },

  uploadProfilePhoto: async (userId, file) => {
    if (!file) throw new Error("No photo file provided.");
    console.log(`[Cloudinary] Uploading profile photo for user ${userId} to college-erp/profile-photos...`);
    const uploadRes = await uploadFileToCloudinary(file, 'college-erp/profile-photos');
    await mockDB.updateUserProfilePhoto(userId, uploadRes.url);
    return uploadRes;
  }
};

export { app, auth, db, storage, secondaryAuth };
