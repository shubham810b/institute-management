import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  Send,
  Save,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  User,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Student, AttendanceRecord, InstituteSettings, UserRole } from '../types';
import { calculateMonthlyReport } from '../services/storage';
import { getAbsentAlertMessage } from '../services/whatsapp';

interface AttendancePageProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: InstituteSettings;
  role: UserRole;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onOpenWhatsApp: (phone: string, msg: string, parentName: string, studentName: string) => void;
  showToast: (msg: string) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  students,
  attendanceRecords,
  settings,
  role,
  onUpdateAttendance,
  onOpenWhatsApp,
  showToast,
}) => {
  // Current selected date (defaults to Nov 10, 2026)
  const [selectedDate, setSelectedDate] = useState('2026-11-10');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'daily' | 'monthly'>('daily');

  // Distinct classes
  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class)));
  }, [students]);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter students for the current view
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNo.toLowerCase().includes(q);
        const matchesClass = s.class.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesClass) return false;
      }
      return true;
    });
  }, [students, selectedClass, searchQuery]);

  // Get map of attendance for selected date: studentId -> AttendanceRecord
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords
      .filter((r) => r.date === selectedDate)
      .forEach((r) => map.set(r.studentId, r));
    return map;
  }, [attendanceRecords, selectedDate]);

  // Count stats for selected date
  const dateStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    filteredStudents.forEach((s) => {
      const rec = dateAttendanceMap.get(s.id);
      if (rec?.status === 'P') present++;
      if (rec?.status === 'A') absent++;
    });
    const totalMarked = present + absent;
    const rate = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;
    return { present, absent, totalMarked, rate, totalStudents: filteredStudents.length };
  }, [filteredStudents, dateAttendanceMap]);

  // One-click mark single student
  const handleMark = (studentId: string, status: 'P' | 'A') => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.studentId === studentId && r.date === selectedDate
    );

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        status,
        markedAt: nowTime,
      };
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId,
        date: selectedDate,
        status,
        class: student.class,
        markedAt: nowTime,
        markedBy: settings.teacherName,
      };
      updatedRecords = [...attendanceRecords, newRec];
    }

    onUpdateAttendance(updatedRecords);
  };

  // Bulk: Mark All Present
  const handleMarkAll = (status: 'P' | 'A') => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let updatedRecords = [...attendanceRecords];

    filteredStudents.forEach((s) => {
      const idx = updatedRecords.findIndex((r) => r.studentId === s.id && r.date === selectedDate);
      if (idx >= 0) {
        updatedRecords[idx] = { ...updatedRecords[idx], status, markedAt: nowTime };
      } else {
        updatedRecords.push({
          id: `att-${Date.now()}-${s.id}`,
          studentId: s.id,
          date: selectedDate,
          status,
          class: s.class,
          markedAt: nowTime,
          markedBy: settings.teacherName,
        });
      }
    });

    onUpdateAttendance(updatedRecords);
    showToast(`Marked all ${filteredStudents.length} students as ${status === 'P' ? 'Present' : 'Absent'}!`);
  };

  // Send WhatsApp Absent Alert
  const handleSendAbsentAlert = (student: Student) => {
    const msg = getAbsentAlertMessage(student, selectedDate, settings);
    onOpenWhatsApp(student.parentPhone, msg, student.parentName, student.name);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Daily Attendance Register &bull; Auto Percentage Calculation
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Attendance Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            One-click marking with instant WhatsApp absent notifications to parents
          </p>
        </div>

        {/* View Switcher: Daily Register vs Monthly Summary */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setActiveView('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Register
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Summary Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Date & Batch Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate('2026-11-10')}
            className="text-xs font-bold text-blue-600 hover:underline px-2"
          >
            Today
          </button>
        </div>

        {/* Search & Batch Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Classes & Batches</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* Bulk Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <button
              onClick={() => handleMarkAll('P')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
            >
              All Present (P)
            </button>
            <button
              onClick={() => handleMarkAll('A')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              All Absent (A)
            </button>
          </div>
        </div>
      </div>

      {/* Date Attendance Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total in Batch</div>
            <div className="text-xl font-black text-slate-900 mt-1">{dateStats.totalStudents}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Present Today</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{dateStats.present}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Absent Today</div>
            <div className="text-xl font-black text-rose-700 mt-1">{dateStats.absent}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Attendance Rate</div>
            <div className="text-xl font-black text-blue-700 mt-1">{dateStats.rate}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View: Daily Attendance Register */}
      {activeView === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Attendance Register for {selectedDate}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click Present (P) or Absent (A) to toggle instantly
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredStudents.length} Students Listed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No students match your query.
              </div>
            ) : (
              filteredStudents.map((s) => {
                const rec = dateAttendanceMap.get(s.id);
                const isPresent = rec?.status === 'P';
                const isAbsent = rec?.status === 'A';
                const report = calculateMonthlyReport(s, attendanceRecords, selectedDate.substring(0, 7));
                const isFrequentAbsent = report.attendancePercentage < 75;

                return (
                  <div
                    key={s.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Avatar, Name, Class & Percentage */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl ${s.avatarColor} font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0`}
                      >
                        {s.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">({s.rollNo})</span>
                          {isFrequentAbsent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Frequent Absence (&lt;75%)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{s.class}</span>
                          <span>&bull;</span>
                          <span className="text-[11px]">
                            Monthly Attendance:{' '}
                            <b
                              className={
                                report.attendancePercentage >= 85
                                  ? 'text-emerald-600'
                                  : report.attendancePercentage >= 75
                                  ? 'text-blue-600'
                                  : 'text-rose-600'
                              }
                            >
                              {report.attendancePercentage}%
                            </b>{' '}
                            ({report.presentDays}P / {report.absentDays}A)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Present (P) & Absent (A) Buttons & WhatsApp Alert */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Present (P) Button */}
                      <button
                        type="button"
                        onClick={() => handleMark(s.id, 'P')}
                        className={`inline-flex items-center justify-center gap-1.5 w-24 py-2.5 rounded-2xl font-bold text-xs transition-all transform active:scale-95 ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-600 ring-offset-2'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Present (P)</span>
                      </button>

                      {/* Absent (A) Button */}
                      <button
                        type="button"
                        onClick={() => handleMark(s.id, 'A')}
                        className={`inline-flex items-center justify-center gap-1.5 w-24 py-2.5 rounded-2xl font-bold text-xs transition-all transform active:scale-95 ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-600 ring-offset-2'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Absent (A)</span>
                      </button>

                      {/* Quick WhatsApp Alert for Absent */}
                      {isAbsent && (
                        <button
                          type="button"
                          onClick={() => handleSendAbsentAlert(s)}
                          title="Notify parent of absence via WhatsApp"
                          className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden md:inline">Alert Parent</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Monthly Attendance Summary Matrix View */}
      {activeView === 'monthly' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Monthly Attendance Summary (November 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated monthly calculation with frequent absence detection
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-center">Working Days</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Present (P)</th>
                  <th className="py-3 px-4 text-center text-rose-600">Absent (A)</th>
                  <th className="py-3 px-4 text-center">Monthly Attendance %</th>
                  <th className="py-3 px-4">Status / Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const rep = calculateMonthlyReport(s, attendanceRecords, '2026-11');
                  const isWarning = rep.attendancePercentage < 75;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg ${s.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}>
                          {s.initials}
                        </span>
                        <span>{s.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{s.class}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{rep.totalWorkingDays}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{rep.presentDays}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-600">{rep.absentDays}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                            rep.attendancePercentage >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : rep.attendancePercentage >= 75
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800 font-extrabold'
                          }`}
                        >
                          {rep.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isWarning ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> High Absenteeism
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Good Regularity
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
