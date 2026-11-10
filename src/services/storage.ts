import { Student, AttendanceRecord, FeeTransaction, InstituteSettings, WhatsAppTemplate, MonthlyReportData } from '../types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_TRANSACTIONS, INITIAL_SETTINGS, INITIAL_TEMPLATES } from '../data/initialData';

const KEYS = {
  STUDENTS: 'edupulse_students_v1',
  ATTENDANCE: 'edupulse_attendance_v1',
  TRANSACTIONS: 'edupulse_transactions_v1',
  SETTINGS: 'edupulse_settings_v1',
  TEMPLATES: 'edupulse_templates_v1',
  ACTIVE_ROLE: 'edupulse_active_role_v1',
};

// Local storage helpers
export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students:', e);
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: Student[]): void => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load attendance:', e);
    return INITIAL_ATTENDANCE;
  }
};

export const saveStoredAttendance = (attendance: AttendanceRecord[]): void => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
};

export const getStoredTransactions = (): FeeTransaction[] => {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: FeeTransaction[]): void => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredSettings = (): InstituteSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings:', e);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: InstituteSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredTemplates = (): WhatsAppTemplate[] => {
  try {
    const raw = localStorage.getItem(KEYS.TEMPLATES);
    if (!raw) {
      localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load templates:', e);
    return INITIAL_TEMPLATES;
  }
};

export const saveStoredTemplates = (templates: WhatsAppTemplate[]): void => {
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
};

// Reset demo data
export const resetToDemoData = (): void => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
};

// Monthly calculations for attendance report
export const calculateMonthlyReport = (
  student: Student,
  attendanceRecords: AttendanceRecord[],
  monthYear: string = '2026-11' // YYYY-MM
): MonthlyReportData => {
  // Filter records for student in the given month
  const studentRecords = attendanceRecords.filter(
    (r) => r.studentId === student.id && r.date.startsWith(monthYear)
  );

  // If few records in mock, simulate a realistic 22 working-day basis
  const actualPresent = studentRecords.filter((r) => r.status === 'P').length;
  const actualAbsent = studentRecords.filter((r) => r.status === 'A').length;

  // Derive total days or pad realistically if beginning of month
  const totalLogged = actualPresent + actualAbsent;
  const workingDays = totalLogged > 0 ? Math.max(totalLogged, 15) : 22;
  const presentDays = totalLogged > 0 ? Math.round((actualPresent / Math.max(totalLogged, 1)) * workingDays) : (student.daysLate > 10 ? 14 : 20);
  const absentDays = workingDays - presentDays;
  const attendancePercentage = Math.round((presentDays / workingDays) * 100);

  let remarks = 'Regular in class, maintains good discipline.';
  if (attendancePercentage < 75) {
    remarks = 'Attendance is below 75% requirement. Parent-teacher meeting recommended.';
  } else if (attendancePercentage >= 90) {
    remarks = 'Excellent consistency and active participation in class discussions.';
  } else if (student.pendingAmount > 0) {
    remarks = 'Good academic progress. Please note fee payment is overdue.';
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [yearStr, monthStr] = monthYear.split('-');
  const monthName = `${monthNames[parseInt(monthStr, 10) - 1]} ${yearStr}`;

  return {
    student,
    month: monthName,
    totalWorkingDays: workingDays,
    presentDays,
    absentDays,
    attendancePercentage,
    feeStatus: student.feeStatus,
    pendingAmount: student.pendingAmount,
    remarks
  };
};
