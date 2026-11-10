import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  IndianRupee,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { Student, InstituteSettings, UserRole } from '../types';

interface StudentsPageProps {
  students: Student[];
  settings: InstituteSettings;
  role: UserRole;
  onOpenNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onSelectStudent: (student: Student) => void;
  onOpenPayment: (studentId: string) => void;
  showToast: (msg: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  students,
  settings,
  role,
  onOpenNewStudent,
  onEditStudent,
  onDeleteStudent,
  onSelectStudent,
  onOpenPayment,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const classesList = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (feeFilter === 'paid' && s.feeStatus !== 'paid') return false;
      if (feeFilter === 'pending' && s.pendingAmount === 0) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.parentPhone.includes(q) ||
          s.parentName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedClass, feeFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Student Directory &bull; Complete Profile & History
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students, assign batches & subjects, store parent contacts & audit history
          </p>
        </div>

        <button
          onClick={onOpenNewStudent}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, roll no, or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setFeeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                feeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeeFilter('paid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                feeFilter === 'paid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFeeFilter('pending')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                feeFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Students Directory Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Students Enrolled Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Your student list is clean. Click below to add your first real student with class, subjects, and parent contact.
          </p>
          <button
            onClick={onOpenNewStudent}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll First Student</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${student.avatarColor} font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {student.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {student.rollNo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditStudent(student)}
                      title="Edit Student"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {role === 'admin' && (
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        title="Delete Student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Class & Subjects */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Enrolled Class:</span>
                    <span className="font-bold text-slate-800">{student.class}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Subjects:</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                      {student.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Parent Contact Card */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Parent Details
                    </span>
                    <span className="font-semibold text-slate-800">{student.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp:
                    </span>
                    <span className="font-bold text-slate-800">{student.parentPhone}</span>
                  </div>
                </div>

                {/* Fee Bar */}
                <div className="mt-3 flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    Monthly: <b>₹{student.monthlyFee.toLocaleString('en-IN')}</b>
                  </span>
                  <span
                    className={`font-bold ${
                      student.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {student.pendingAmount > 0
                      ? `Due: ₹${student.pendingAmount.toLocaleString('en-IN')}`
                      : 'All Paid'}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectStudent(student)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View History</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPayment(student.id)}
                  className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Fee</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
