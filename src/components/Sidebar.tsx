import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  FileText,
  Settings,
  MessageCircle,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';

export type PageId = 'dashboard' | 'students' | 'fees' | 'attendance' | 'reports' | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount?: number;
  totalStudents?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isMobileOpen,
  onCloseMobile,
  pendingCount = 0,
  totalStudents = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as PageId,
      label: 'Main Dashboard',
      description: 'Fees Overview & Quick Actions',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? `${pendingCount} due` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 font-bold',
    },
    {
      id: 'students' as PageId,
      label: 'Students',
      description: 'Directory, Classes & Profiles',
      icon: Users,
      badge: totalStudents > 0 ? `${totalStudents}` : undefined,
      badgeColor: 'bg-blue-100 text-blue-700 font-bold',
    },
    {
      id: 'fees' as PageId,
      label: 'Fees Management',
      description: 'Ledger, Receipts & Dues',
      icon: CreditCard,
    },
    {
      id: 'attendance' as PageId,
      label: 'Attendance',
      description: 'Daily P/A Register & Matrix',
      icon: CalendarCheck,
    },
    {
      id: 'reports' as PageId,
      label: 'Monthly Reports',
      description: 'Parent Reports, PDF & WhatsApp',
      icon: FileText,
    },
    {
      id: 'settings' as PageId,
      label: 'Settings',
      description: 'Institute, Supabase & Templates',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Navigation Links */}
      <div className="space-y-1.5 flex-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Management Console
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="leading-tight font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] font-normal leading-tight mt-0.5 ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-600' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* WhatsApp Quick Tip Card at bottom of sidebar */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Ready</span>
          </div>
          <p className="text-[11px] text-emerald-700/90 mt-1 leading-snug">
            1-click reminders, absent alerts & printable PDF monthly report cards configured.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-100 flex-shrink-0 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-800">Navigation Menu</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
