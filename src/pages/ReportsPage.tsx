import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Send,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Printer,
  Sparkles,
  Award,
} from 'lucide-react';
import { Student, AttendanceRecord, InstituteSettings } from '../types';
import { calculateMonthlyReport } from '../services/storage';
import { printMonthlyReport } from '../services/pdfGenerator';
import { getMonthlyReportMessage } from '../services/whatsapp';

interface ReportsPageProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: InstituteSettings;
  onOpenWhatsApp: (phone: string, msg: string, parentName: string, studentName: string) => void;
  showToast: (msg: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  students,
  attendanceRecords,
  settings,
  onOpenWhatsApp,
  showToast,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, selectedClass, searchQuery]);

  const handleDownloadPdf = (student: Student) => {
    const report = calculateMonthlyReport(student, attendanceRecords, selectedMonth);
    printMonthlyReport(report, settings);
    showToast(`Generating PDF report for ${student.name}...`);
  };

  const handleSendWhatsApp = (student: Student) => {
    const report = calculateMonthlyReport(student, attendanceRecords, selectedMonth);
    const msg = getMonthlyReportMessage(report, settings);
    onOpenWhatsApp(student.parentPhone, msg, student.parentName, student.name);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            Automated Parent Progress Reports &bell; Monthly Summary
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Parent Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Download professional PDF report cards or send directly to parents via WhatsApp
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-purple-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2026-11">November 2026 (Current)</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Classes</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const report = calculateMonthlyReport(student, attendanceRecords, selectedMonth);
          const isWarning = report.attendancePercentage < 75;

          return (
            <div
              key={student.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Student details */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${student.avatarColor} font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      {student.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {student.rollNo} &bull; {student.class}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      report.attendancePercentage >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.attendancePercentage >= 75
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {report.attendancePercentage}% Attendance
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Working</div>
                    <div className="font-bold text-slate-800 mt-0.5">{report.totalWorkingDays} Days</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2">
                    <div className="text-[10px] text-emerald-600 uppercase font-semibold">Present</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{report.presentDays} Days</div>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2">
                    <div className="text-[10px] text-rose-600 uppercase font-semibold">Absent</div>
                    <div className="font-bold text-rose-700 mt-0.5">{report.absentDays} Days</div>
                  </div>
                </div>

                {/* Remarks & Fee Summary */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 text-[11px] text-purple-900 leading-snug">
                    <span className="font-bold">Faculty Observation:</span> "{report.remarks}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                    <span>Fee Status:</span>
                    <span className={`font-bold ${report.feeStatus === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {report.feeStatus === 'paid' ? 'Paid in Full' : `Pending ₹${report.pendingAmount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(student)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(student)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
