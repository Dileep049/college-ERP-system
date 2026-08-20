import { COLLEGE_DEPARTMENTS, KBN_SEMESTERS, BRANCH_SUBJECT_MAP } from '../services/firebase';

/**
 * Reusable Production Data Integrity & Schema Validation Utilities
 */

export const validateStudent = (student) => {
  const errors = [];
  if (!student) return { isValid: false, errors: ['Student object is null or undefined'] };

  if (!student.rollNumber || String(student.rollNumber).trim() === '') {
    errors.push('rollNumber is required and must be non-empty');
  }
  if (!student.studentName && !student.fullName && !student.name) {
    errors.push('studentName is required');
  }
  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push(`Invalid email format: ${student.email}`);
  }
  if (student.phoneNumber && !/^\+?[0-9\s-]{10,15}$/.test(String(student.phoneNumber).trim())) {
    errors.push(`Invalid phoneNumber format: ${student.phoneNumber}`);
  }
  if (student.semester && !KBN_SEMESTERS.includes(student.semester) && !student.semester.startsWith('Semester')) {
    errors.push(`Unrecognized semester format: ${student.semester}`);
  }
  if (student.status && !['active', 'inactive', 'suspended', 'graduated'].includes(String(student.status).toLowerCase())) {
    errors.push(`Invalid student status: ${student.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAttendance = (record) => {
  const errors = [];
  if (!record) return { isValid: false, errors: ['Attendance record is null or undefined'] };

  if (!record.studentId && !record.rollNumber) {
    errors.push('studentId or rollNumber is required');
  }
  if (!record.date || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    errors.push(`Invalid date format (expected YYYY-MM-DD): ${record.date}`);
  }
  if (!record.subject && !record.subjectId) {
    errors.push('subject is required');
  }
  
  const periodNum = Number(record.period || record.lecturePeriod);
  if (isNaN(periodNum) || periodNum < 1 || periodNum > 5) {
    errors.push(`Invalid period number (${record.period || record.lecturePeriod}). Must be an integer between 1 and 5`);
  }

  const validStatuses = ['present', 'absent', 'leave', 'leave_approved', 'late'];
  if (!record.status || !validStatuses.includes(String(record.status).toLowerCase())) {
    errors.push(`Invalid attendance status (${record.status}). Must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateInternalMarks = (mark) => {
  const errors = [];
  if (!mark) return { isValid: false, errors: ['Mark record is null or undefined'] };

  if (!mark.studentId && !mark.rollNumber) {
    errors.push('studentId or rollNumber is required');
  }
  if (!mark.subject && !mark.subjectId) {
    errors.push('subject is required');
  }

  const mid1 = Number(mark.midTerm1 !== undefined ? mark.midTerm1 : (mark.mid1 !== undefined ? mark.mid1 : 0));
  const mid2 = Number(mark.midTerm2 !== undefined ? mark.midTerm2 : (mark.mid2 !== undefined ? mark.mid2 : 0));
  const assignments = Number(mark.assignments !== undefined ? mark.assignments : (mark.assignmentMarks !== undefined ? mark.assignmentMarks : 0));

  if (isNaN(mid1) || mid1 < 0 || mid1 > 20) {
    errors.push(`Mid-Term 1 mark (${mid1}) must be between 0 and 20`);
  }
  if (isNaN(mid2) || mid2 < 0 || mid2 > 20) {
    errors.push(`Mid-Term 2 mark (${mid2}) must be between 0 and 20`);
  }
  if (isNaN(assignments) || assignments < 0 || assignments > 10) {
    errors.push(`Assignments mark (${assignments}) must be between 0 and 10`);
  }

  const expectedTotal = mid1 + mid2 + assignments;
  if (mark.total !== undefined && Number(mark.total) !== expectedTotal) {
    errors.push(`Total mark mismatch: stored total (${mark.total}) !== calculated sum (${expectedTotal})`);
  }
  if (expectedTotal > 50) {
    errors.push(`Total mark (${expectedTotal}) exceeds maximum allowed of 50`);
  }

  return {
    isValid: errors.length === 0,
    calculatedTotal: expectedTotal,
    errors
  };
};

export const validateSubjectAllocation = (alloc) => {
  const errors = [];
  if (!alloc) return { isValid: false, errors: ['Allocation object is null or undefined'] };

  if (!alloc.facultyId) {
    errors.push('facultyId is required');
  }
  if (!alloc.department && !alloc.branch) {
    errors.push('department/branch is required');
  }
  if (!alloc.semester) {
    errors.push('semester is required');
  }
  if (!alloc.subjectName && !alloc.subjectId) {
    errors.push('subjectName is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAssignment = (assign) => {
  const errors = [];
  if (!assign) return { isValid: false, errors: ['Assignment object is null or undefined'] };

  if (!assign.title || assign.title.trim() === '') {
    errors.push('title is required');
  }
  if (!assign.subject) {
    errors.push('subject is required');
  }
  if (!assign.dueDate) {
    errors.push('dueDate is required');
  }
  if (!assign.facultyId) {
    errors.push('facultyId is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePlacementApplication = (app) => {
  const errors = [];
  if (!app) return { isValid: false, errors: ['Application object is null or undefined'] };

  if (!app.driveId) {
    errors.push('driveId is required');
  }
  if (!app.studentId && !app.rollNumber) {
    errors.push('studentId or rollNumber is required');
  }
  if (app.status && !['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].includes(app.status)) {
    errors.push(`Invalid placement application status: ${app.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLeaveRequest = (leave) => {
  const errors = [];
  if (!leave) return { isValid: false, errors: ['Leave request is null or undefined'] };

  if (!leave.studentId && !leave.applicantId && !leave.facultyId) {
    errors.push('Applicant identifier is required');
  }
  if (!leave.startDate || !leave.endDate) {
    errors.push('startDate and endDate are required');
  }
  if (new Date(leave.startDate) > new Date(leave.endDate)) {
    errors.push(`startDate (${leave.startDate}) cannot be after endDate (${leave.endDate})`);
  }
  if (leave.status && !['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(leave.status)) {
    errors.push(`Invalid leave status: ${leave.status}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
