import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { InstituteSettings } from '../types';
import { testSupabaseConnection, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  onSaveSettings: (settings: InstituteSettings) => void;
  showToast: (msg: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  showToast,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      showToast('Supabase connection verified successfully!');
      onSaveSettings({
        ...settings,
        supabaseUrl,
        supabaseAnonKey,
        isSupabaseConnected: true,
      });
    } else {
      showToast('Connection test failed. See message details.');
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    showToast('SQL schema copied! Paste into Supabase SQL Editor.');
  };

  const handleDisconnect = () => {
    onSaveSettings({
      ...settings,
      supabaseUrl: '',
      supabaseAnonKey: '',
      isSupabaseConnected: false,
    });
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    showToast('Switched to Local Database Mode.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 px-6 py-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Supabase Database Integration</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Connect your cloud PostgreSQL database & sync real-time records
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              settings.isSupabaseConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  settings.isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide">
                  {settings.isSupabaseConnected ? 'Active Cloud Mode' : 'Local Storage Mode'}
                </div>
                <div className="text-xs text-slate-600">
                  {settings.isSupabaseConnected
                    ? 'Connected to live Supabase project database.'
                    : 'Currently using reactive local storage with instant demo data.'}
                </div>
              </div>
            </div>

            {settings.isSupabaseConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs font-mono py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full text-xs font-mono py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* SQL Schema helper */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                1-Click Supabase SQL Table Generator
              </span>
              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Copy this schema into your Supabase Dashboard &rarr; SQL Editor to generate the `students`, `attendance`, `fee_transactions`, and `institute_settings` tables with full RLS security.
            </p>
            <div className="max-h-32 overflow-y-auto bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[10px] leading-relaxed">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            disabled={testing || !supabaseUrl || !supabaseAnonKey}
            onClick={handleTestConnection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all transform active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test & Connect'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
