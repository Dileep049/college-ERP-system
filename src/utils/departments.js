/**
 * Centralized Canonical College Departments / Branches Configuration
 * Single Source of Truth across all components, dropdowns, filters, and queries.
 */

export const DEPARTMENTS = [
  'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
  'B.Sc. Computer Science (CS)',
  'Bachelor of Computer Applications (BCA)',
  'B.Com. (Computers)',
  'B.Sc. Data Science / Data Analysis'
];

export const COLLEGE_DEPARTMENTS = DEPARTMENTS;
export const KBN_BRANCHES = DEPARTMENTS;

export const DEPARTMENT_NAMES = {
  AIML: 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)',
  CS: 'B.Sc. Computer Science (CS)',
  BCA: 'Bachelor of Computer Applications (BCA)',
  BCOM: 'B.Com. (Computers)',
  DATA_SCIENCE: 'B.Sc. Data Science / Data Analysis'
};

export const normalizeDepartment = (dept) => {
  if (!dept) return 'B.Sc. Computer Science (CS)';
  const str = String(dept).toUpperCase().trim();
  if (str === 'ALL' || str === 'ALL DEPARTMENTS' || str === 'ALL BRANCHES' || str === 'N/A') return 'All';
  if (str.includes('AI') || str.includes('ARTIFICIAL') || str.includes('MACHINE LEARNING') || str === 'AIML') {
    return 'B.Sc. Artificial Intelligence & Machine Learning (AI & ML)';
  }
  if (str.includes('DATA SCIENCE') || str.includes('DATA ANALYSIS') || str.includes('DATA ANALYTICS') || str === 'DS') {
    return 'B.Sc. Data Science / Data Analysis';
  }
  if (str.includes('BCA') || str.includes('BACHELOR OF COMPUTER APPLICATIONS') || str.includes('APPLICATIONS')) {
    return 'Bachelor of Computer Applications (BCA)';
  }
  if (str.includes('B.COM') || str.includes('BCOM') || str.includes('COMMERCE')) {
    return 'B.Com. (Computers)';
  }
  if (str.includes('COMPUTER SCIENCE') || str.includes('CS') || str.includes('CSE')) {
    return 'B.Sc. Computer Science (CS)';
  }
  const matched = COLLEGE_DEPARTMENTS.find(d => d.toUpperCase() === str || str.includes(d.toUpperCase()));
  if (matched) return matched;
  return 'B.Sc. Computer Science (CS)';
};

export const isDepartmentMatch = (studentDept, targetDept) => {
  if (!targetDept || !studentDept) return true;
  if (studentDept === 'All' || targetDept === 'All') return true;
  const sNorm = normalizeDepartment(studentDept);
  
  if (Array.isArray(targetDept)) {
    if (targetDept.length === 0) return true;
    return targetDept.some(d => {
      const tNorm = normalizeDepartment(d);
      return tNorm === 'All' || sNorm === 'All' || tNorm === sNorm || d === 'All Departments' || d === 'All';
    });
  }
  
  const tNorm = normalizeDepartment(targetDept);
  return tNorm === 'All' || sNorm === 'All' || tNorm === sNorm || targetDept === 'All Departments' || targetDept === 'All';
};

export default DEPARTMENTS;
