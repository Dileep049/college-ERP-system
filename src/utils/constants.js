// Centralized College Departments & Branches Configuration
export { DEPARTMENTS, COLLEGE_DEPARTMENTS, KBN_BRANCHES, DEPARTMENT_NAMES } from './departments.js';

// Centralized Canonical Sections (Strictly Section A and Section B)
export const KBN_SECTIONS = ['Section A', 'Section B'];
export const COLLEGE_SECTIONS = KBN_SECTIONS;

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

export const normalizeSection = (sec) => {
  if (!sec) return 'Section A';
  const s = String(sec).trim();
  if (s === 'All' || s.toUpperCase() === 'ALL') return 'All';
  if (s === 'A' || s === 'Section A' || s === 'Sec A') return 'Section A';
  if (s === 'B' || s === 'Section B' || s === 'Sec B') return 'Section B';
  return 'Section A';
};

