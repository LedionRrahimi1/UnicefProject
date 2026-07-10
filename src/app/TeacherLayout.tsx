import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, BookOpen, BarChart3, Settings,
  Bell, Search, ChevronLeft, ChevronRight, LogOut, Accessibility,
  Award, Menu, X,
} from "lucide-react";
import { useApp } from "./store";
import AccessibilityPanel from "./AccessibilityPanel";
import { Toaster } from "sonner";

const navItems = [
  { to: "/teacher/dashboard", icon: LayoutDashboard, label: "Paneli" },
  { to: "/teacher/classes", icon: Users, label: "Klasat" },
  { to: "/teacher/materials", icon: BookOpen, label: "Materialet" },
  { to: "/teacher/analytics", icon: BarChart3, label: "Analitika" },
  { to: "/teacher/rewards", icon: Award, label: "Yjet dhe titujt" },
  { to: "/teacher/settings", icon: Settings, label: "Cilësimet" },
];

export default function TeacherLayout() {
  const { user, logout, setAccessibilityOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 p-4 mb-2 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base">L</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">LexoLehtë AI</p>
            <p className="text-xs text-muted-foreground">Mësuese</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t border-sidebar-border ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={16} />
          {!collapsed && "Dil"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute left-full top-6 -ml-3 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted" aria-label="Hap menunë">
            <Menu size={20} />
          </button>
          <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5">
            <Search size={15} className="text-muted-foreground" />
            <input placeholder="Kërko..." className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground" aria-label="Kërko" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Njoftimet">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
            <button onClick={() => setAccessibilityOpen(true)} className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Aksesueshmëria">
              <Accessibility size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm ml-1">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>

      <AccessibilityPanel />
      <Toaster richColors position="top-right" />
    </div>
  );
}
