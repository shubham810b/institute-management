import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Trash2, BookOpen, User, Phone, Mail, IndianRupee, MapPin } from 'lucide-react';
import { Student } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSave: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  showToast: (msg: string) => void;
}

const AVAILABLE_CLASSES = [
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 - JEE',
  'Class 11 - NEET',
  'Class 12 - PCM',
  'Class 12 - PCB',
  'Class 12 - Commerce',
];

const AVAILABLE_SUBJECTS = [
  'Maths',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Accounts',
  'Economics',
];

const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-amber-600 text-white',
  'bg-cyan-600 text-white',
];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSave,
  onDelete,
  showToast,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [subjects, setSubjects] = useState<string[]>(['Maths']);
  const [monthlyFee, setMonthlyFee] = useState<number>(3500);
  const [pendingAmount, setPendingAmount] = useState<number>(3500);
  const [daysLate, setDaysLate] = useState<number>(0);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setRollNo(studentToEdit.rollNo);
      setStudentClass(studentToEdit.class);
      setSubjects(studentToEdit.subjects);
      setMonthlyFee(studentToEdit.monthlyFee);
      setPendingAmount(studentToEdit.pendingAmount);
      setDaysLate(studentToEdit.daysLate);
      setParentName(studentToEdit.parentName);
      setParentPhone(studentToEdit.parentPhone);
      setParentEmail(studentToEdit.parentEmail || '');
      setAddress(studentToEdit.address || '');
      setNotes(studentToEdit.notes || '');
      setAvatarColor(studentToEdit.avatarColor || AVATAR_COLORS[0]);
    } else {
      // Reset defaults for new student
      setName('');
      setRollNo(`APX-${Math.floor(1000 + Math.random() * 9000)}`);
      setStudentClass('Class 10');
      setSubjects(['Maths', 'Science']);
      setMonthlyFee(3500);
      setPendingAmount(3500);
      setDaysLate(0);
      setParentName('');
      setParentPhone('+91 ');
      setParentEmail('');
      setAddress('');
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleSubject = (sub: string) => {
    if (subjects.includes(sub)) {
      if (subjects.length > 1) {
        setSubjects(subjects.filter((s) => s !== sub));
      } else {
        showToast('At least one subject must be assigned.');
      }
    } else {
      setSubjects([...subjects, sub]);
    }
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'ST';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Student name is required.');
      return;
    }

    if (!parentName.trim()) {
      showToast('Parent name is required.');
      return;
    }

    if (!parentPhone.trim() || parentPhone.replace(/\D/g, '').length < 10) {
      showToast('Valid parent WhatsApp phone number is required (at least 10 digits).');
      return;
    }

    const feeStatus = pendingAmount === 0 ? 'paid' : (daysLate > 7 ? 'overdue' : 'pending');

    const updatedStudent: Student = {
      id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
      name: name.trim(),
      rollNo: rollNo.trim(),
      initials: getInitials(name),
      class: studentClass,
      subjects,
      monthlyFee: Number(monthlyFee),
      pendingAmount: Number(pendingAmount),
      daysLate: Number(daysLate),
      feeStatus,
      lastPaymentDate: studentToEdit?.lastPaymentDate,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || undefined,
      joiningDate: studentToEdit?.joiningDate || new Date().toISOString().split('T')[0],
      avatarColor,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(updatedStudent);
    showToast(studentToEdit ? 'Student record updated successfully!' : 'New student added successfully!');
    onClose();
  };

  const handleDelete = () => {
    if (!studentToEdit || !onDelete) return;
    if (window.confirm(`Are you sure you want to delete ${studentToEdit.name}? This will remove all associated records.`)) {
      onDelete(studentToEdit.id);
      showToast(`Student ${studentToEdit.name} deleted.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {studentToEdit ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Manage enrollment, class assignment, fees & parent contact
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Student Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Roll / ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Academic & Class Assignment */}
          <div>
            <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Class & Subject Enrollment</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Class / Grade *
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Enrolled Subjects *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map((sub) => {
                    const isSelected = subjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Fees Structure */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" />
              <span>Fee Configuration</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Fee (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Pending (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={pendingAmount}
                  onChange={(e) => setPendingAmount(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Days Overdue / Late
                </label>
                <input
                  type="number"
                  min="0"
                  value={daysLate}
                  onChange={(e) => setDaysLate(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Parent Contact Information */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Parent WhatsApp & Contact Info</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent WhatsApp Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Used for automated reminders & attendance alerts
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Flat/House, Locality"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Teacher Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teacher Remarks / Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Strong in calculus, requested weekend batch."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          {studentToEdit && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Student</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'Save Changes' : 'Enroll Student'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
