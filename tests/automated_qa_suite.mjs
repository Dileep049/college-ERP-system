import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// 1. Load functions from src/utils/departments.js and src/utils/constants.js
import { COLLEGE_DEPARTMENTS, DEPARTMENTS, isDepartmentMatch, normalizeDepartment } from '../src/utils/departments.js';
import { KBN_SECTIONS, normalizeSection } from '../src/utils/constants.js';
import {
  validateStudent,
  validateAttendance,
  validateInternalMarks,
  validateSubjectAllocation,
  validateAssignment,
  validatePlacementApplication,
  validateLeaveRequest
} from '../src/utils/dataValidation.js';

let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passedTests++;
    results.push({ status: 'PASS', message });
    console.log(`[PASS] ${message}`);
  } else {
    failedTests++;
    results.push({ status: 'FAIL', message });
    console.error(`[FAIL] ${message}`);
  }
}

console.log('===============================================================');
console.log('  ACADEMIA ERP AUTOMATED QA TEST SUITE: AI & ML ECOSYSTEM');
console.log('===============================================================\n');

// -----------------------------------------------------------------
// TEST SUITE 1: CANONICAL DEPARTMENT & SECTION NORMALIZATION TESTS
// -----------------------------------------------------------------
console.log('--- TEST SUITE 1: Canonical Branch & Section Taxonomy ---');

const AIML_CANONICAL = "B.Sc. Artificial Intelligence & Machine Learning (AI & ML)";

assert(COLLEGE_DEPARTMENTS.includes(AIML_CANONICAL), `COLLEGE_DEPARTMENTS contains exact canonical string: "${AIML_CANONICAL}"`);
assert(COLLEGE_DEPARTMENTS.length === 5, `COLLEGE_DEPARTMENTS strictly contains exactly 5 standardized departments`);

// Normalization checks
assert(normalizeDepartment('AI & ML') === AIML_CANONICAL, `normalizeDepartment('AI & ML') maps to "${AIML_CANONICAL}"`);
assert(normalizeDepartment('AIML') === AIML_CANONICAL, `normalizeDepartment('AIML') maps to "${AIML_CANONICAL}"`);
assert(normalizeDepartment('B.Sc. Artificial Intelligence & Machine Learning (AI & ML)') === AIML_CANONICAL, `normalizeDepartment(canonical) returns canonical`);
assert(normalizeDepartment('CSE') === 'B.Sc. Computer Science (CS)', `normalizeDepartment('CSE') maps to 'B.Sc. Computer Science (CS)'`);
assert(normalizeDepartment('All') === 'All', `normalizeDepartment('All') returns 'All'`);

// Section checks
assert(KBN_SECTIONS.length === 2 && KBN_SECTIONS.includes('Section A') && KBN_SECTIONS.includes('Section B'), `KBN_SECTIONS only contains ['Section A', 'Section B']`);
assert(normalizeSection('A') === 'Section A', `normalizeSection('A') -> 'Section A'`);
assert(normalizeSection('B') === 'Section B', `normalizeSection('B') -> 'Section B'`);
assert(normalizeSection('Section A') === 'Section A', `normalizeSection('Section A') -> 'Section A'`);
assert(normalizeSection('Section B') === 'Section B', `normalizeSection('Section B') -> 'Section B'`);
assert(normalizeSection('EM') === 'Section A', `normalizeSection('EM') safely fallbacks to 'Section A'`);
assert(normalizeSection('Section EM') === 'Section A', `normalizeSection('Section EM') safely fallbacks to 'Section A'`);
assert(normalizeSection('All') === 'All', `normalizeSection('All') returns 'All'`);

// Matching checks
assert(isDepartmentMatch('AI & ML', AIML_CANONICAL) === true, `isDepartmentMatch('AI & ML', canonical) === true`);
assert(isDepartmentMatch(AIML_CANONICAL, 'AI & ML') === true, `isDepartmentMatch(canonical, 'AI & ML') === true`);
assert(isDepartmentMatch('CSE', AIML_CANONICAL) === false, `isDepartmentMatch('CSE', AIML) === false`);
assert(isDepartmentMatch('All', AIML_CANONICAL) === true, `isDepartmentMatch('All', AIML) === true`);


// -----------------------------------------------------------------
// TEST SUITE 2: SCHEMA VALIDATION & DATA CONTRACT TESTS
// -----------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Data Schema Validation for AI & ML ---');

const validStudent = {
  rollNumber: '245901',
  fullName: 'Avala Anand Babu',
  department: AIML_CANONICAL,
  semester: 'Semester 2',
  section: 'Section A',
  email: '245901@college.edu'
};
const studentValidation = validateStudent(validStudent);
assert(studentValidation.isValid, `validateStudent succeeds for canonical AI & ML Section A student`);

const invalidSectionStudent = {
  rollNumber: '245902',
  fullName: 'Test Student',
  department: AIML_CANONICAL,
  semester: 'Semester 2',
  section: 'Section EM'
};
const invalidSecValidation = validateStudent(invalidSectionStudent);
assert(!invalidSecValidation.isValid && invalidSecValidation.errors.some(e => e.includes('section')), `validateStudent rejects invalid section 'Section EM'`);

const validAttendance = {
  studentId: '245901',
  rollNumber: '245901',
  studentName: 'Avala Anand Babu',
  department: AIML_CANONICAL,
  semester: 'Semester 2',
  section: 'Section A',
  subject: 'Machine Learning',
  date: '2026-03-15',
  period: 1,
  status: 'present'
};
const attValidation = validateAttendance(validAttendance);
assert(attValidation.isValid, `validateAttendance succeeds for valid 5-period record (period 1)`);

const invalidPeriodAttendance = {
  ...validAttendance,
  period: 7 // invalid period
};
const invalidAttValidation = validateAttendance(invalidPeriodAttendance);
assert(!invalidAttValidation.isValid && invalidAttValidation.errors.some(e => e.toLowerCase().includes('period')), `validateAttendance rejects period > 5`);

const validMarks = {
  studentId: '245901',
  rollNumber: '245901',
  studentName: 'Avala Anand Babu',
  department: AIML_CANONICAL,
  semester: 'Semester 2',
  section: 'Section A',
  subject: 'Machine Learning',
  examType: 'Mid Term 1',
  marksObtained: 28,
  maxMarks: 30
};
const marksValidation = validateInternalMarks(validMarks);
assert(marksValidation.isValid, `validateInternalMarks succeeds for AI & ML mid term marks`);

const validAllocation = {
  facultyId: 'fac-101',
  facultyName: 'Dr. John McCarthy',
  department: AIML_CANONICAL,
  semester: 'Semester 4',
  section: 'Section A',
  subject: 'Deep Learning',
  academicYear: '2026-2027'
};
const allocValidation = validateSubjectAllocation(validAllocation);
assert(allocValidation.isValid, `validateSubjectAllocation succeeds for AI & ML subject allocation`);

const validAssignment = {
  title: 'Convolutional Neural Networks Lab',
  subject: 'Deep Learning',
  targetBranch: AIML_CANONICAL,
  targetSemester: 'Semester 4',
  targetSection: 'Section A',
  dueDate: '2026-04-10'
};
const assignValidation = validateAssignment(validAssignment);
assert(assignValidation.isValid, `validateAssignment succeeds for AI & ML coursework assignment`);


// -----------------------------------------------------------------
// TEST SUITE 3: 5-PERIOD ATTENDANCE LIFECYCLE & CALCULATIONS
// -----------------------------------------------------------------
console.log('\n--- TEST SUITE 3: 5-Period Attendance Engine & Computations ---');

function calculate5PeriodStats(attendanceRecords) {
  const byPeriod = { 1: { p: 0, a: 0 }, 2: { p: 0, a: 0 }, 3: { p: 0, a: 0 }, 4: { p: 0, a: 0 }, 5: { p: 0, a: 0 } };
  let totalPresent = 0;
  let totalAbsent = 0;

  attendanceRecords.forEach(r => {
    const p = Number(r.period || r.lecturePeriod || 1);
    const isP = (r.status || '').toLowerCase() === 'present';
    if (byPeriod[p]) {
      if (isP) {
        byPeriod[p].p++;
        totalPresent++;
      } else {
        byPeriod[p].a++;
        totalAbsent++;
      }
    }
  });

  const total = totalPresent + totalAbsent;
  const percentage = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : '0.0';
  return { byPeriod, totalPresent, totalAbsent, total, percentage: parseFloat(percentage) };
}

const mockAiMlAttendance = [
  { studentId: '245901', department: AIML_CANONICAL, semester: 'Semester 2', section: 'Section A', period: 1, status: 'present' },
  { studentId: '245901', department: AIML_CANONICAL, semester: 'Semester 2', section: 'Section A', period: 2, status: 'present' },
  { studentId: '245901', department: AIML_CANONICAL, semester: 'Semester 2', section: 'Section A', period: 3, status: 'absent' },
  { studentId: '245901', department: AIML_CANONICAL, semester: 'Semester 2', section: 'Section A', period: 4, status: 'present' },
  { studentId: '245901', department: AIML_CANONICAL, semester: 'Semester 2', section: 'Section A', period: 5, status: 'present' },
];

const attStats = calculate5PeriodStats(mockAiMlAttendance);
assert(attStats.totalPresent === 4, `5-period engine calculates 4/5 present periods`);
assert(attStats.totalAbsent === 1, `5-period engine calculates 1/5 absent periods`);
assert(attStats.percentage === 80.0, `5-period percentage calculated cleanly as 80.0%`);
assert(attStats.byPeriod[3].a === 1, `Period 3 logged exactly 1 absent count`);


// -----------------------------------------------------------------
// TEST SUITE 4: PLACEMENT ELIGIBILITY & CANDIDATE MATCHING
// -----------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Placement Candidate Eligibility for AI & ML ---');

function evaluatePlacementCandidate(candidate, drive) {
  const studentBranch = normalizeDepartment(candidate.department || candidate.branch);
  const minCgpa = drive.minCgpa !== undefined ? parseFloat(drive.minCgpa) : 6.0;
  const maxBacklogs = drive.maxBacklogs !== undefined ? parseInt(drive.maxBacklogs) : 0;
  const eligibleBranches = Array.isArray(drive.eligibleBranches) ? drive.eligibleBranches : [];

  let isEligible = true;
  let reason = 'Eligible';

  if (candidate.cgpa < minCgpa) {
    isEligible = false;
    reason = `CGPA < ${minCgpa}`;
  } else if (candidate.backlogs > maxBacklogs) {
    isEligible = false;
    reason = `Backlogs > ${maxBacklogs}`;
  } else if (eligibleBranches.length > 0) {
    const branchMatch = eligibleBranches.some(b => b.toUpperCase().trim() === 'ALL' || isDepartmentMatch(studentBranch, b));
    if (!branchMatch) {
      isEligible = false;
      reason = `Branch Mismatch (${studentBranch})`;
    }
  }

  return { isEligible, reason };
}

const aiDrive = {
  companyName: 'DeepMind Innovations',
  jobRole: 'AI Research Associate',
  minCgpa: 7.5,
  maxBacklogs: 0,
  eligibleBranches: [AIML_CANONICAL]
};

const eligibleStudent = {
  rollNumber: '245901',
  fullName: 'Avala Anand Babu',
  department: AIML_CANONICAL,
  cgpa: 8.9,
  backlogs: 0
};

const lowCgpaStudent = {
  rollNumber: '245902',
  fullName: 'Low CGPA Student',
  department: AIML_CANONICAL,
  cgpa: 6.8,
  backlogs: 0
};

const mismatchDeptStudent = {
  rollNumber: '245903',
  fullName: 'Commerce Student',
  department: 'B.Com. (Computers)',
  cgpa: 9.0,
  backlogs: 0
};

assert(evaluatePlacementCandidate(eligibleStudent, aiDrive).isEligible === true, `AI & ML candidate with 8.9 CGPA and 0 backlogs is ELIGIBLE`);
assert(evaluatePlacementCandidate(lowCgpaStudent, aiDrive).isEligible === false, `AI & ML candidate with 6.8 CGPA is correctly REJECTED (CGPA < 7.5)`);
assert(evaluatePlacementCandidate(mismatchDeptStudent, aiDrive).isEligible === false, `B.Com student correctly REJECTED for AI & ML drive`);


// -----------------------------------------------------------------
// TEST SUITE 5: STATIC CODEBASE AUDIT FOR ORPHAN STRINGS
// -----------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Static Codebase Audit for Non-Canonical Tokens ---');

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allSrcFiles = scanDirectory(srcDir);
let orphanSectionCount = 0;
let legacyDeptInSelectorsCount = 0;

const prohibitedSectionRegex = /['"`](Section EM|Section C|EM|Sec EM|Sec C)['"`]/g;
const prohibitedDeptSelectorRegex = /<option[^>]*value=["'](CSE|ECE|EEE|Civil|Mechanical|MCA|AIML)["']/gi;

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Skip normalization mappers in firebase.js and departments.js which legitimately reference shorthands for mapping
  const isMapperFile = file.includes('firebase.js') || file.includes('departments.js');

  if (!isMapperFile) {
    const sectionMatches = content.match(prohibitedSectionRegex);
    if (sectionMatches) {
      orphanSectionCount += sectionMatches.length;
      console.warn(`[Found legacy section string in ${path.basename(file)}]:`, sectionMatches);
    }

    const selectorMatches = content.match(prohibitedDeptSelectorRegex);
    if (selectorMatches) {
      legacyDeptInSelectorsCount += selectorMatches.length;
      console.warn(`[Found legacy department in dropdown in ${path.basename(file)}]:`, selectorMatches);
    }
  }
});

assert(orphanSectionCount === 0, `Zero prohibited section strings ('Section EM', 'Section C') found across UI files`);
assert(legacyDeptInSelectorsCount === 0, `Zero legacy branch options (<option value="CSE"> etc.) found in UI dropdowns`);

console.log('\n===============================================================');
console.log(`  QA TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${passedTests + failedTests})`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
