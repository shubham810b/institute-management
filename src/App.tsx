import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  FeeTransaction,
  InstituteSettings,
  WhatsAppTemplate,
  UserRole,
} from './types';
import {
  getStoredStudents,
  saveStoredStudents,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredSettings,
  saveStoredSettings,
  getStoredTemplates,
  saveStoredTemplates,
  resetToDemoData,
} from './services/storage';

// Navigation & Common Components
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { Toast } from './components/Toast';

// Modals
import { WhatsAppModal } from './components/WhatsAppModal';
import { PaymentModal } from './components/PaymentModal';
import { StudentModal } from './components/StudentModal';
import { StudentHistoryModal } from './components/StudentHistoryModal';
import { SupabaseModal } from './components/SupabaseModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { StudentsPage } from './pages/StudentsPage';
import { FeesPage } from './pages/FeesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  // Primary application data state
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => getStoredTransactions());
  const [settings, setSettings] = useState<InstituteSettings>(() => getStoredSettings());
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => getStoredTemplates());

  // UI state
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [role, setRole] = useState<UserRole>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string | null; type?: 'success' | 'error' | 'info' }>({
    message: null,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Modal states
  const [whatsAppModal, setWhatsAppModal] = useState<{
    isOpen: boolean;
    phone: string;
    message: string;
    recipientName: string;
    studentName: string;
    category?: string;
  }>({
    isOpen: false,
    phone: '',
    message: '',
    recipientName: '',
    studentName: '',
    category: 'Reminder',
  });

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    studentId?: string;
  }>({
    isOpen: false,
  });

  const [studentModal, setStudentModal] = useState<{
    isOpen: boolean;
    studentToEdit: Student | null;
  }>({
    isOpen: false,
    studentToEdit: null,
  });

  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    student: Student | null;
  }>({
    isOpen: false,
    student: null,
  });

  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Sync to local storage whenever main collections change
  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  useEffect(() => {
    saveStoredAttendance(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredTemplates(templates);
  }, [templates]);

  // Handlers
  const handleOpenWhatsApp = (
    phone: string,
    message: string,
    recipientName: string,
    studentName: string,
    category: string = 'Notice'
  ) => {
    setWhatsAppModal({
      isOpen: true,
      phone,
      message,
      recipientName,
      studentName,
      category,
    });
  };

  const handleOpenPayment = (studentId?: string) => {
    setPaymentModal({
      isOpen: true,
      studentId,
    });
  };

  const handleOpenNewStudent = () => {
    setStudentModal({
      isOpen: true,
      studentToEdit: null,
    });
  };

  const handleEditStudent = (student: Student) => {
    setStudentModal({
      isOpen: true,
      studentToEdit: student,
    });
  };

  const handleSelectStudent = (student: Student) => {
    setHistoryModal({
      isOpen: true,
      student,
    });
  };

  const handleSaveStudent = (savedStudent: Student) => {
    const exists = students.some((s) => s.id === savedStudent.id);
    let updated: Student[];
    if (exists) {
      updated = students.map((s) => (s.id === savedStudent.id ? savedStudent : s));
    } else {
      updated = [savedStudent, ...students];
    }
    setStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId));
  };

  const handlePaymentSuccess = (transaction: FeeTransaction, updatedStudent: Student) => {
    setTransactions([transaction, ...transactions]);
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleUpdateAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(newRecords);
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setStudents(getStoredStudents());
    setAttendanceRecords(getStoredAttendance());
    setTransactions(getStoredTransactions());
    setSettings(getStoredSettings());
    setTemplates(getStoredTemplates());
  };

  const pendingStudentsCount = students.filter((s) => s.pendingAmount > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        role={role}
        onRoleToggle={() => {
          const nextRole = role === 'admin' ? 'teacher' : 'admin';
          setRole(nextRole);
          showToast(`Switched to ${nextRole === 'admin' ? 'Admin' : 'Teacher'} mode`);
        }}
        onOpenNewStudent={handleOpenNewStudent}
        onOpenPayment={() => handleOpenPayment()}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          pendingCount={pendingStudentsCount}
          totalStudents={students.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              students={students}
              transactions={transactions}
              settings={settings}
              searchQuery={searchQuery}
              onOpenWhatsApp={handleOpenWhatsApp}
              onOpenPayment={handleOpenPayment}
              onSelectStudent={handleSelectStudent}
              onNavigateToAttendance={() => setCurrentPage('attendance')}
              onNavigateToReports={() => setCurrentPage('reports')}
            />
          )}

          {currentPage === 'attendance' && (
            <AttendancePage
              students={students}
              attendanceRecords={attendanceRecords}
              settings={settings}
              role={role}
              onUpdateAttendance={handleUpdateAttendance}
              onOpenWhatsApp={handleOpenWhatsApp}
              showToast={showToast}
            />
          )}

          {currentPage === 'students' && (
            <StudentsPage
              students={students}
              settings={settings}
              role={role}
              onOpenNewStudent={handleOpenNewStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onSelectStudent={handleSelectStudent}
              onOpenPayment={handleOpenPayment}
              showToast={showToast}
            />
          )}

          {currentPage === 'fees' && (
            <FeesPage
              students={students}
              transactions={transactions}
              settings={settings}
              onOpenPayment={() => handleOpenPayment()}
              onOpenWhatsApp={handleOpenWhatsApp}
              showToast={showToast}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              students={students}
              attendanceRecords={attendanceRecords}
              settings={settings}
              onOpenWhatsApp={handleOpenWhatsApp}
              showToast={showToast}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={settings}
              templates={templates}
              role={role}
              onRoleChange={setRole}
              onSaveSettings={setSettings}
              onSaveTemplates={setTemplates}
              onResetDemo={handleResetDemo}
              onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <WhatsAppModal
        isOpen={whatsAppModal.isOpen}
        onClose={() => setWhatsAppModal((prev) => ({ ...prev, isOpen: false }))}
        recipientName={whatsAppModal.recipientName}
        recipientPhone={whatsAppModal.phone}
        studentName={whatsAppModal.studentName}
        defaultMessage={whatsAppModal.message}
        category={whatsAppModal.category}
        onSuccessToast={showToast}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false })}
        students={students}
        initialStudentId={paymentModal.studentId}
        settings={settings}
        onPaymentSuccess={handlePaymentSuccess}
        onRequestWhatsApp={(st, msg) => {
          handleOpenWhatsApp(st.parentPhone, msg, st.parentName, st.name, 'Payment Confirmation');
        }}
        showToast={showToast}
      />

      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, studentToEdit: null })}
        studentToEdit={studentModal.studentToEdit}
        onSave={handleSaveStudent}
        onDelete={handleDeleteStudent}
        showToast={showToast}
      />

      <StudentHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, student: null })}
        student={historyModal.student}
        attendanceRecords={attendanceRecords}
        transactions={transactions}
        settings={settings}
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenPayment={(id) => handleOpenPayment(id)}
        onEditStudent={(s) => {
          setHistoryModal({ isOpen: false, student: null });
          handleEditStudent(s);
        }}
      />

      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        showToast={showToast}
      />

      {/* Floating Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null })}
      />
    </div>
  );
}

export default App;
