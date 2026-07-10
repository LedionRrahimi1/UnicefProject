import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router";
import { LayoutDashboard, BookOpen, Trophy, Settings, Bell, Accessibility, LogOut, Menu } from "lucide-react";
import { useApp } from "./store";
import AccessibilityPanel from "./AccessibilityPanel";
import { Toaster } from "sonner";

const navItems = [
  { to: "/student/dashboard", icon: LayoutDashboard, label: "Paneli" },
  { to: "/student/rewards", icon: Trophy, label: "Shpërblimet" },
  { to: "/student/settings", icon: Settings, label: "Cilësimet" },
];

export default function StudentLayout() {
  const { user, logout, setAccessibilityOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 p-4 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-base">L</span>
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">LexoLehtë AI</p>
            <p className="text-xs text-muted-foreground">Nxënës</p>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Nxënës</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={16} /> Dil
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-sm">LexoLehtë AI</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-muted rounded-lg"><Menu size={16} /></button>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted" aria-label="Hap menunë">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="relative p-2 rounded-xl hover:bg-muted" aria-label="Njoftimet">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
            <button onClick={() => setAccessibilityOpen(true)} className="p-2 rounded-xl hover:bg-muted" aria-label="Aksesueshmëria">
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

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex border-t border-border bg-card">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <AccessibilityPanel />
      <Toaster richColors position="top-right" />
    </div>
  );
}
