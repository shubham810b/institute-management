import React, { useState } from 'react';
import { X, Calendar, CreditCard, User, Phone, BookOpen, Clock, AlertTriangle, FileText, Send, CheckCircle2, Award } from 'lucide-react';
import { Student, AttendanceRecord, FeeTransaction, InstituteSettings } from '../types';
import { calculateMonthlyReport } from '../services/storage';
import { printMonthlyReport, printReceipt } from '../services/pdfGenerator';
import { getFeeReminderMessage, getMonthlyReportMessage } from '../services/whatsapp';

interface StudentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  attendanceRecords: AttendanceRecord[];
  transactions: FeeTransaction[];
  settings: InstituteSettings;
  onOpenWhatsApp: (phone: string, msg: string, name: string, studentName: string) => void;
  onOpenPayment: (studentId: string) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  isOpen,
  onClose,
  student,
  attendanceRecords,
  transactions,
  settings,
  onOpenWhatsApp,
  onOpenPayment,
  onEditStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'fees'>('attendance');

  if (!isOpen || !student) return null;

  // Filter student-specific records
  const studentAttendance = attendanceRecords
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const studentTransactions = transactions
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const monthlyReport = calculateMonthlyReport(student, attendanceRecords);

  const handlePrintReport = () => {
    printMonthlyReport(monthlyReport, settings);
  };

  const handleSendReportWA = () => {
    const msg = getMonthlyReportMessage(monthlyReport, settings);
    onOpenWhatsApp(student.parentPhone, msg, student.parentName, student.name);
  };

  const handleSendReminderWA = () => {
    const msg = getFeeReminderMessage(student, settings.instituteName);
    onOpenWhatsApp(student.parentPhone, msg, student.parentName, student.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header Profile Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-6 py-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl ${student.avatarColor} font-bold text-xl flex items-center justify-center shadow-lg ring-4 ring-white/10`}
              >
                {student.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {student.rollNo}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>{student.class}</span>
                  </span>
                  <span>&bull;</span>
                  <span>{student.subjects.join(', ')}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Parent: {student.parentName} ({student.parentPhone})</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar inside Header */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Attendance</div>
              <div className="text-lg font-bold text-emerald-400">
                {monthlyReport.attendancePercentage}%
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Monthly Fee</div>
              <div className="text-lg font-bold text-white">
                ₹{student.monthlyFee.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Due Amount</div>
              <div
                className={`text-lg font-bold ${
                  student.pendingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                ₹{student.pendingAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance History</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'fees'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fee Payments & Receipts</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Monthly Report Card</span>
            </button>

            {student.pendingAmount > 0 && (
              <button
                onClick={handleSendReminderWA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Fee Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recent Attendance Log (Daily P/A)
                </h4>
                <span className="text-xs text-slate-400">
                  {studentAttendance.length} records found
                </span>
              </div>

              {studentAttendance.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No attendance records logged yet for this student.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {studentAttendance.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                            rec.status === 'P'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {rec.status}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {rec.date}
                          </div>
                          <div className="text-xs text-slate-400">
                            Marked at {rec.markedAt || '09:00 AM'}
                          </div>
                        </div>
                      </div>

                      <div>
                        {rec.status === 'P' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fee Transactions & Receipts
                </h4>
                <button
                  onClick={() => onOpenPayment(student.id)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Record New Payment
                </button>
              </div>

              {studentTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No previous payments recorded for this student.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {studentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {tx.receiptNo}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {tx.paymentMode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Date: {tx.date} &bull; Month: {tx.month}
                        </div>
                        {tx.notes && (
                          <div className="text-xs text-slate-400 mt-1 italic">
                            "{tx.notes}"
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-emerald-600">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => printReceipt(tx, settings)}
                          className="mt-1 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => onEditStudent(student)}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600"
          >
            Edit Student Details
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendReportWA}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Full Report on WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
