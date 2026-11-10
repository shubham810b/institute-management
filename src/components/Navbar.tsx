import React from 'react';
import { Menu, Search, PlusCircle, CreditCard, Database, Bell, Shield, UserCheck } from 'lucide-react';
import { InstituteSettings, UserRole } from '../types';

interface NavbarProps {
  settings: InstituteSettings;
  role: UserRole;
  onRoleToggle: () => void;
  onOpenNewStudent: () => void;
  onOpenPayment: () => void;
  onOpenSupabaseModal: () => void;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  role,
  onRoleToggle,
  onOpenNewStudent,
  onOpenPayment,
  onOpenSupabaseModal,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
                E
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                  {settings.instituteName}
                </h1>
                <p className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
                  Coaching Institute Management
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search students by name, roll no, or phone..."
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right: Quick Actions, Supabase Status & Role */}
          <div className="flex items-center gap-2.5">
            {/* Supabase status badge */}
            <button
              onClick={onOpenSupabaseModal}
              title="Supabase Database Settings"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                settings.isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{settings.isSupabaseConnected ? 'Supabase Connected' : 'Local / Supabase'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={onRoleToggle}
              title="Click to toggle between Admin and Teacher role"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span className="capitalize">{role} Mode</span>
            </button>

            {/* Quick Action: Record Payment */}
            <button
              onClick={onOpenPayment}
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collect Fee</span>
            </button>

            {/* Quick Action: Add Student */}
            <button
              onClick={onOpenNewStudent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Student</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
