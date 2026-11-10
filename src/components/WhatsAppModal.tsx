import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, User, AlertCircle } from 'lucide-react';
import { openWhatsApp, cleanPhoneNumber } from '../services/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  studentName: string;
  defaultMessage: string;
  category?: string;
  onSuccessToast?: (msg: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  studentName,
  defaultMessage,
  category = 'Reminder',
  onSuccessToast,
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage, isOpen]);

  if (!isOpen) return null;

  const cleanedPhone = cleanPhoneNumber(recipientPhone);

  const handleSend = () => {
    openWhatsApp(recipientPhone, message);
    if (onSuccessToast) {
      onSuccessToast(`Opening WhatsApp for ${recipientName}...`);
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onSuccessToast) {
      onSuccessToast('Message copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Send WhatsApp Message</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span>Direct WhatsApp Click-to-Chat</span>
                <span className="w-1 h-1 rounded-full bg-white/60"></span>
                <span>{category}</span>
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Recipient Details Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Parent of {studentName}
                </div>
                <div className="text-sm font-bold text-slate-900">{recipientName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp No.</span>
              </div>
              <div className="text-sm font-mono font-semibold text-slate-800">
                {recipientPhone || 'Not Provided'}
              </div>
            </div>
          </div>

          {!recipientPhone && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Warning: No valid WhatsApp phone number found for this student.</span>
            </div>
          )}

          {/* Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message Preview (Editable)
              </label>
              <span className="text-xs text-slate-400">
                {message.length} characters
              </span>
            </div>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner resize-y leading-relaxed"
              placeholder="Type your message here..."
            />
            <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
              <span>💡 You can customize the message above before opening WhatsApp.</span>
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

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
              onClick={handleSend}
              disabled={!recipientPhone}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
