import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  IndianRupee,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { Student, FeeTransaction, InstituteSettings } from '../types';
import { printReceipt } from '../services/pdfGenerator';
import { getPaymentConfirmationMessage } from '../services/whatsapp';

interface FeesPageProps {
  students: Student[];
  transactions: FeeTransaction[];
  settings: InstituteSettings;
  onOpenPayment: () => void;
  onOpenWhatsApp: (phone: string, msg: string, parentName: string, studentName: string) => void;
  showToast: (msg: string) => void;
}

export const FeesPage: React.FC<FeesPageProps> = ({
  students,
  transactions,
  settings,
  onOpenPayment,
  onOpenWhatsApp,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');

  const totalCollected = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalPending = useMemo(() => {
    return students.reduce((sum, s) => sum + s.pendingAmount, 0);
  }, [students]);

  const upiTotal = useMemo(() => {
    return transactions.filter((t) => t.paymentMode === 'UPI').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const cashTotal = useMemo(() => {
    return transactions.filter((t) => t.paymentMode === 'Cash').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (modeFilter !== 'all' && t.paymentMode !== modeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.studentName.toLowerCase().includes(q) ||
          t.receiptNo.toLowerCase().includes(q) ||
          t.studentClass.toLowerCase().includes(q) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [transactions, modeFilter, searchQuery]);

  const handlePrint = (tx: FeeTransaction) => {
    printReceipt(tx, settings);
  };

  const handleResendWhatsApp = (tx: FeeTransaction) => {
    const student = students.find((s) => s.id === tx.studentId);
    if (!student) {
      showToast('Student contact not found.');
      return;
    }
    const msg = getPaymentConfirmationMessage(
      tx.studentName,
      tx.amount,
      tx.receiptNo,
      tx.date,
      settings
    );
    onOpenWhatsApp(student.parentPhone, msg, student.parentName, student.name);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Tuition Ledger &bull; Instant Receipt Generation
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Fees Management & Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit all incoming payments, generate computerized receipts & verify transactions
          </p>
        </div>

        <button
          onClick={onOpenPayment}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95 self-start md:self-auto"
        >
          <CreditCard className="w-4 h-4 text-emerald-300" />
          <span>+ Collect Payment Now</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Revenue Cleared
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all terms & batches</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            UPI & Digital Payments
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">
            ₹{upiTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Instant bank settlements</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cash Collections
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            ₹{cashTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Reception / In-person desk</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search receipt #, student, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3.5 px-6">Receipt #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Month / Term</th>
                <th className="py-3.5 px-4">Mode & Ref</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">
                      {tx.receiptNo}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">{tx.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{tx.studentName}</td>
                    <td className="py-4 px-4 text-slate-600">{tx.studentClass}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{tx.month}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {tx.paymentMode}
                      </span>
                      {tx.referenceNo && (
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {tx.referenceNo}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600 text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePrint(tx)}
                          title="Print Receipt PDF"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleResendWhatsApp(tx)}
                          title="Send Confirmation via WhatsApp"
                          className="p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
