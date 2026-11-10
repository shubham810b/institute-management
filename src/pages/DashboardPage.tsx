import React, { useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  MessageCircle,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  Calendar,
} from 'lucide-react';
import { Student, FeeTransaction, InstituteSettings } from '../types';
import { StatCard } from '../components/StatCard';
import { getFeeReminderMessage } from '../services/whatsapp';

interface DashboardPageProps {
  students: Student[];
  transactions: FeeTransaction[];
  settings: InstituteSettings;
  searchQuery: string;
  onOpenWhatsApp: (phone: string, msg: string, parentName: string, studentName: string) => void;
  onOpenPayment: (studentId?: string) => void;
  onSelectStudent: (student: Student) => void;
  onNavigateToAttendance: () => void;
  onNavigateToReports: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  students,
  transactions,
  settings,
  searchQuery,
  onOpenWhatsApp,
  onOpenPayment,
  onSelectStudent,
  onNavigateToAttendance,
  onNavigateToReports,
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Compute metrics
  const totalStudents = students.length;
  
  const totalFeesCollected = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalPendingFees = useMemo(() => {
    return students.reduce((acc, s) => acc + s.pendingAmount, 0);
  }, [students]);

  const overduePayments = useMemo(() => {
    return students
      .filter((s) => s.daysLate > 7 && s.pendingAmount > 0)
      .reduce((acc, s) => acc + s.pendingAmount, 0);
  }, [students]);

  const overdueCount = students.filter((s) => s.daysLate > 7 && s.pendingAmount > 0).length;
  const pendingCount = students.filter((s) => s.pendingAmount > 0).length;

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Status filter
      if (filter === 'paid' && s.feeStatus !== 'paid') return false;
      if (filter === 'pending' && s.pendingAmount === 0) return false;
      if (filter === 'overdue' && (s.feeStatus !== 'overdue' || s.pendingAmount === 0)) return false;

      // Class filter
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNo.toLowerCase().includes(q);
        const matchesPhone = s.parentPhone.includes(q);
        const matchesSubject = s.subjects.some((sub) => sub.toLowerCase().includes(q));
        if (!matchesName && !matchesRoll && !matchesPhone && !matchesSubject) return false;
      }

      return true;
    });
  }, [students, filter, selectedClass, searchQuery]);

  // Distinct classes for dropdown
  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class)));
  }, [students]);

  const handleReminderClick = (s: Student) => {
    const msg = getFeeReminderMessage(s, settings.instituteName);
    onOpenWhatsApp(s.parentPhone, msg, s.parentName, s.name);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome & Actions Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Academic Session 2026-27 &bull; November Term
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Fees & Institute Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fee tracking, automated WhatsApp payment reminders & attendance sync
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onOpenPayment()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>+ Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* 1. Main Dashboard Metrics – 4 Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled across 8 batches"
          icon={Users}
          variant="blue"
          trend={{ value: '+8%', isPositive: true }}
        />

        {/* Total Fees Collected */}
        <StatCard
          title="Total Fees Collected"
          value={`${settings.currencySymbol}${totalFeesCollected.toLocaleString('en-IN')}`}
          subtitle={`${transactions.length} receipts verified`}
          icon={CreditCard}
          variant="green"
          trend={{ value: '+14%', isPositive: true }}
        />

        {/* Pending Fees */}
        <StatCard
          title="Pending Fees"
          value={`${settings.currencySymbol}${totalPendingFees.toLocaleString('en-IN')}`}
          subtitle={`${pendingCount} students pending`}
          icon={Clock}
          variant="amber"
          trend={{ value: '-5%', isPositive: true }}
        />

        {/* Overdue Payments */}
        <StatCard
          title="Overdue Payments"
          value={`${settings.currencySymbol}${overduePayments.toLocaleString('en-IN')}`}
          subtitle={`${overdueCount} students > 7 days late`}
          icon={AlertCircle}
          variant="rose"
          trend={{ value: 'Action required', isPositive: false }}
        />
      </div>

      {/* Overdue Action Banner if needed */}
      {overdueCount > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {overdueCount} Students have payments overdue past 7 days
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Send instant pre-filled WhatsApp payment reminders with one click to recover dues.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilter('overdue')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <span>View Overdue ({overdueCount})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fees Management Section & Students Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Student Fees Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tabs: All, Paid, Pending, Overdue */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
              {(
                [
                  { id: 'all', label: 'All Students' },
                  { id: 'paid', label: 'Paid' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'overdue', label: 'Overdue' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Class Filter Dropdown */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {/* Student List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3.5 px-6">Student & Roll No</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Subject(s)</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Pending Amount</th>
                <th className="py-3.5 px-4">Days Late</th>
                <th className="py-3.5 px-4">Parent WhatsApp</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(s)}
                  >
                    {/* Student Name & Initials Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl ${s.avatarColor} font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {s.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {s.rollNo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {s.class}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {s.subjects.map((sub) => (
                          <span
                            key={sub}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Fee Status */}
                    <td className="py-4 px-4">
                      {s.feeStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : s.feeStatus === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Pending Amount */}
                    <td className="py-4 px-4 text-right font-bold text-sm">
                      {s.pendingAmount > 0 ? (
                        <span className="text-rose-600">
                          ₹{s.pendingAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </td>

                    {/* Days Late */}
                    <td className="py-4 px-4">
                      {s.daysLate > 0 ? (
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                            s.daysLate >= 10
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.daysLate} Days Late
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">On Time</span>
                      )}
                    </td>

                    {/* Parent WhatsApp Number */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{s.parentPhone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {s.parentName}
                      </div>
                    </td>

                    {/* Action Button: WhatsApp Reminder / Collect Payment */}
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      {s.pendingAmount > 0 ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleReminderClick(s)}
                            title="Send pre-filled WhatsApp reminder"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => onOpenPayment(s.id)}
                            title="Collect Fee"
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectStudent(s)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          View History
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
