import { Student, AttendanceRecord, FeeTransaction, InstituteSettings, WhatsAppTemplate } from '../types';

export const INITIAL_SETTINGS: InstituteSettings = {
  instituteName: 'Apex Coaching Institute',
  tagline: 'Excellence in Academic Coaching',
  teacherName: 'Head Teacher / Admin',
  phone: '+91 98765 00000',
  email: 'admin@coaching.edu',
  address: 'Coaching Campus Address',
  upiId: 'coaching@upi',
  currencySymbol: '₹',
  lateFeeGraceDays: 7,
  isSupabaseConnected: false,
};

// Clean blank slate with no pre-loaded records
export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_TRANSACTIONS: FeeTransaction[] = [];

export const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Pending Fee Reminder (Standard)',
    category: 'fee_reminder',
    template: 'Dear Parent, this is a reminder that ₹{amount} fees for your child {student_name} are pending. Kindly clear the payment. Thank you.'
  },
  {
    id: 'tpl-2',
    title: 'Payment Received Confirmation',
    category: 'payment_confirmation',
    template: 'Dear Parent, we have received payment of ₹{amount} for {student_name} (Receipt #{receipt_no}) on {date}. Thank you for your prompt payment! Regards, {institute_name}.'
  },
  {
    id: 'tpl-3',
    title: 'Student Absent Alert',
    category: 'absent_alert',
    template: 'Dear Parent, this is to notify you that {student_name} ({class}) was marked ABSENT today ({date}). If this was unplanned, please contact the institute office. Regards, {institute_name}.'
  },
  {
    id: 'tpl-4',
    title: 'Monthly Attendance & Performance Report',
    category: 'monthly_report',
    template: '📊 *Monthly Report - {institute_name}*\n\nStudent: *{student_name}*\nClass: {class} | Month: {month}\n\n🗓️ Working Days: {working_days}\n✅ Present: {present_days}\n❌ Absent: {absent_days}\n📈 Attendance: *{attendance_pct}%*\n💰 Fee Status: *{fee_status}*\n\nTeacher\'s Remarks: {remarks}\n\nFor questions, please reply to this number.'
  }
];
