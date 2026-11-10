import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, IndianRupee, MessageSquare, Receipt, Sparkles } from 'lucide-react';
import { Student, FeeTransaction, InstituteSettings } from '../types';
import { printReceipt } from '../services/pdfGenerator';
import { getPaymentConfirmationMessage } from '../services/whatsapp';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  settings: InstituteSettings;
  onPaymentSuccess: (transaction: FeeTransaction, updatedStudent: Student) => void;
  onRequestWhatsApp?: (student: Student, message: string) => void;
  showToast: (msg: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  settings,
  onPaymentSuccess,
  onRequestWhatsApp,
  showToast,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(
    initialStudentId || (students[0]?.id ?? '')
  );
  
  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const [amount, setAmount] = useState<number>(
    currentStudent?.pendingAmount || currentStudent?.monthlyFee || 0
  );
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer'>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('Monthly tuition fee');
  const [month, setMonth] = useState('November 2026');
  const [sendWhatsAppPrompt, setSendWhatsAppPrompt] = useState(true);

  // Update amount when student selection changes
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const s = students.find((st) => st.id === id);
    if (s) {
      setAmount(s.pendingAmount > 0 ? s.pendingAmount : s.monthlyFee);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (amount <= 0) {
      showToast('Please enter a valid payment amount.');
      return;
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const transaction: FeeTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentClass: currentStudent.class,
      amount: Number(amount),
      date: todayStr,
      month,
      paymentMode,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim(),
      collectedBy: settings.teacherName || 'Admin Office',
    };

    // Calculate new pending balance
    const newPending = Math.max(0, currentStudent.pendingAmount - Number(amount));
    const newStatus = newPending === 0 ? 'paid' : (currentStudent.daysLate > 0 ? 'overdue' : 'pending');

    const updatedStudent: Student = {
      ...currentStudent,
      pendingAmount: newPending,
      feeStatus: newStatus,
      daysLate: newPending === 0 ? 0 : currentStudent.daysLate,
      lastPaymentDate: todayStr,
    };

    onPaymentSuccess(transaction, updatedStudent);
    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${currentStudent.name}!`);

    if (sendWhatsAppPrompt && onRequestWhatsApp) {
      const confirmationMsg = getPaymentConfirmationMessage(
        currentStudent.name,
        Number(amount),
        receiptNo,
        todayStr,
        settings
      );
      onRequestWhatsApp(currentStudent, confirmationMsg);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Record Fee Payment</h3>
              <p className="text-xs text-blue-100 mt-0.5">Generate Instant Receipt & Update Balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.class} ({st.pendingAmount > 0 ? `₹${st.pendingAmount.toLocaleString('en-IN')} pending` : 'Paid'})
                </option>
              ))}
            </select>
          </div>

          {currentStudent && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Monthly Fee:</span>{' '}
                <span className="font-bold text-slate-800">
                  ₹{currentStudent.monthlyFee.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Current Outstanding:</span>{' '}
                <span
                  className={`font-bold ${
                    currentStudent.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  ₹{currentStudent.pendingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Amount and Month in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Billing Month / Term
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. November 2026"
                className="w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['UPI', 'Cash', 'Card', 'Bank Transfer'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Reference No & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ref / Txn ID
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="UPI ref or Cheque #"
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Remarks / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Tuition fee"
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Send WhatsApp checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 cursor-pointer">
            <input
              type="checkbox"
              checked={sendWhatsAppPrompt}
              onChange={(e) => setSendWhatsAppPrompt(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-xs font-medium text-emerald-900">
              Prompt to send WhatsApp payment confirmation receipt to parent
            </span>
          </label>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
