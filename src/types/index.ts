export type FeeStatus = 'paid' | 'pending' | 'overdue';

export type AttendanceStatus = 'P' | 'A' | 'L'; // Present, Absent, Late

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  initials: string;
  class: string;
  batchId?: string;
  subjects: string[];
  monthlyFee: number;
  pendingAmount: number;
  daysLate: number;
  feeStatus: FeeStatus;
  lastPaymentDate?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  joiningDate: string;
  avatarColor: string; // Tailwind color class or hex
  address?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  class: string;
  subject?: string;
  markedAt: string;
  markedBy?: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  amount: number;
  date: string;
  month: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  referenceNo?: string;
  notes?: string;
  collectedBy: string;
}

export interface MonthlyReportData {
  student: Student;
  month: string; // e.g. "November 2026"
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  feeStatus: FeeStatus;
  pendingAmount: number;
  remarks: string;
}

export interface InstituteSettings {
  instituteName: string;
  tagline: string;
  teacherName: string;
  phone: string;
  email: string;
  address: string;
  upiId: string;
  currencySymbol: string;
  lateFeeGraceDays: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isSupabaseConnected?: boolean;
}

export type UserRole = 'admin' | 'teacher';

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'fee_reminder' | 'payment_confirmation' | 'absent_alert' | 'monthly_report' | 'custom';
  template: string;
}
