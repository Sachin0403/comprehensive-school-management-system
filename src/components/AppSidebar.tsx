import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, BookOpen, MessageSquare, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/gradebook', label: 'Gradebook', icon: BookOpen },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function AppSidebar({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">EduSync</h1>
          <p className="text-[11px] text-sidebar-foreground/60">School Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-sidebar-primary text-white shadow-md shadow-sidebar-primary/30'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-white truncate">{user?.firstName || user?.email}</p>
          <p className="text-[11px] text-sidebar-foreground/50 truncate">{user?.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </aside>
    </>
  );
}
