import { Student, MonthlyReportData, InstituteSettings } from '../types';

/**
 * Clean phone number for WhatsApp:
 * Removes spaces, dashes, parentheses. Ensures international format like 919876543210
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.length === 10) {
    // Default to India country code 91 if 10 digits
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

/**
 * Build WhatsApp click-to-chat URL
 */
export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const cleaned = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

/**
 * Open WhatsApp in a new tab/window
 */
export const openWhatsApp = (phone: string, message: string): void => {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Template generators
 */

// 1. Fee Reminder (matches user requirement exactly)
export const getFeeReminderMessage = (student: Student, instituteName: string = 'Apex Scholastic Academy'): string => {
  const firstName = student.name.split(' ')[0];
  const formattedAmount = student.pendingAmount.toLocaleString('en-IN');
  return `Dear Parent, this is a reminder that ₹${formattedAmount} fees for your child ${firstName} are pending. Kindly clear the payment. Thank you.`;
};

// 2. Fee Reminder with extra context (due days, UPI)
export const getDetailedFeeReminderMessage = (
  student: Student, 
  settings: InstituteSettings
): string => {
  const firstName = student.name.split(' ')[0];
  const formattedAmount = student.pendingAmount.toLocaleString('en-IN');
  const lateText = student.daysLate > 0 ? ` (${student.daysLate} days overdue)` : '';
  
  return `Dear Parent,

This is a gentle reminder from *${settings.instituteName}* that tuition fees of *₹${formattedAmount}* for your ward *${firstName}* (${student.class}) are currently pending${lateText}.

Please arrange to clear the outstanding dues.
UPI ID for payment: *${settings.upiId}*

Kindly share the transaction screenshot once paid.

Thank you,
*${settings.instituteName}*
📞 ${settings.phone}`;
};

// 3. Payment Confirmation
export const getPaymentConfirmationMessage = (
  studentName: string,
  amount: number,
  receiptNo: string,
  date: string,
  settings: InstituteSettings
): string => {
  const formattedAmount = amount.toLocaleString('en-IN');
  return `Dear Parent,

We have received payment of *₹${formattedAmount}* for *${studentName}* (Receipt No: *${receiptNo}*) on ${date}.

Thank you for your prompt payment!

Warm regards,
*${settings.instituteName}*
📞 ${settings.phone}`;
};

// 4. Student Absent Alert
export const getAbsentAlertMessage = (
  student: Student,
  date: string,
  settings: InstituteSettings
): string => {
  return `Dear Parent,

This is to inform you that your child *${student.name}* (${student.class}) was marked *ABSENT* for coaching classes today, *${date}*.

If this absence was unplanned or you need study materials, please contact the institute office.

Regards,
*${settings.instituteName}*
📞 ${settings.phone}`;
};

// 5. Monthly Attendance & Progress Report
export const getMonthlyReportMessage = (
  report: MonthlyReportData,
  settings: InstituteSettings
): string => {
  const student = report.student;
  const statusEmoji = report.attendancePercentage >= 85 ? '🌟' : report.attendancePercentage >= 75 ? '👍' : '⚠️';
  const feeStatusText = report.feeStatus === 'paid' ? 'Paid in Full' : `Pending: ₹${report.pendingAmount.toLocaleString('en-IN')}`;

  return `📊 *Monthly Attendance & Progress Report*
*${settings.instituteName}*

Student: *${student.name}* (Roll: ${student.rollNo})
Class: *${student.class}*
Month: *${report.month}*

🗓️ Total Working Days: *${report.totalWorkingDays}*
✅ Present Days: *${report.presentDays}*
❌ Absent Days: *${report.absentDays}*
📈 Attendance Rate: *${report.attendancePercentage}%* ${statusEmoji}

💰 Fee Status: *${feeStatusText}*
📝 Teacher's Remarks: _${report.remarks}_

Thank you for your continued partnership in your child's education!
📞 Contact: ${settings.phone}`;
};
