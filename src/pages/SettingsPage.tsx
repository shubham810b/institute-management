import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  Phone,
  Mail,
  IndianRupee,
  MessageSquare,
  Database,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  FileCode,
  Download,
  Upload,
} from 'lucide-react';
import { InstituteSettings, WhatsAppTemplate, UserRole } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';

interface SettingsPageProps {
  settings: InstituteSettings;
  templates: WhatsAppTemplate[];
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  onSaveSettings: (settings: InstituteSettings) => void;
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
  onResetDemo: () => void;
  onOpenSupabaseModal: () => void;
  showToast: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  templates,
  role,
  onRoleChange,
  onSaveSettings,
  onSaveTemplates,
  onResetDemo,
  onOpenSupabaseModal,
  showToast,
}) => {
  // Local editable copies
  const [formData, setFormData] = useState<InstituteSettings>({ ...settings });
  const [localTemplates, setLocalTemplates] = useState<WhatsAppTemplate[]>([...templates]);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    showToast('Institute settings saved successfully!');
  };

  const handleTemplateChange = (id: string, newTemplate: string) => {
    setLocalTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, template: newTemplate } : t))
    );
  };

  const handleSaveTemplates = () => {
    onSaveTemplates(localTemplates);
    showToast('WhatsApp message templates updated successfully!');
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    showToast('Supabase SQL schema copied to clipboard!');
  };

  const handleConfirmReset = () => {
    if (window.confirm('Reset all students, attendance and fee records back to initial realistic demo data?')) {
      onResetDemo();
      showToast('All demo records restored to initial state.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            System Configuration &bell; Role-Based Access
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Settings & Institute Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure institute details, WhatsApp notifications, database sync & security permissions
          </p>
        </div>

        {/* Role Toggle Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Active Role:</span>
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => onRoleChange('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Mode
            </button>
            <button
              onClick={() => onRoleChange('teacher')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === 'teacher'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher Mode
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Institute Profile */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Institute Profile & Branding</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institute / Coaching Name *
              </label>
              <input
                type="text"
                required
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Specialization
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Director / Head Teacher
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official UPI ID (For Fee Links)
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Late Fee Grace Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lateFeeGraceDays}
                  onChange={(e) => setFormData({ ...formData, lateFeeGraceDays: Number(e.target.value) })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Campus Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Supabase Cloud Database Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Supabase Database Connection</span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  settings.isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {settings.isSupabaseConnected ? 'Connected' : 'Local Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Connect to your Supabase cloud project for persistent multi-device sync, PostgreSQL database storage, and secure role-based access.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Project SQL Tables</span>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Ready-to-run schema script with tables for students, attendance, and transactions with RLS policies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              <Database className="w-4 h-4" />
              <span>Configure Supabase Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. WhatsApp Notification Templates Editor */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>WhatsApp Notification Templates</span>
          </div>
          <button
            type="button"
            onClick={handleSaveTemplates}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Templates</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Customize message phrasing for automated WhatsApp actions. Available placeholders: <code>{'{student_name}'}</code>, <code>{'{amount}'}</code>, <code>{'{class}'}</code>, <code>{'{date}'}</code>, <code>{'{receipt_no}'}</code>, <code>{'{institute_name}'}</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localTemplates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{tpl.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-mono">
                  {tpl.category}
                </span>
              </div>
              <textarea
                rows={3}
                value={tpl.template}
                onChange={(e) => handleTemplateChange(tpl.id, e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Reset & Maintenance */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Demo Data & Cache Maintenance</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all students, attendance registers, and payment records back to pristine initial state
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirmReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Records</span>
        </button>
      </div>
    </div>
  );
};
