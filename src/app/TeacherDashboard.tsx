import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, BookOpen, CheckCircle, TrendingUp, Plus, AlertTriangle, HelpCircle, BarChart3, ArrowRight } from "lucide-react";
import { useApp } from "./store";
import { MOCK_STUDENTS, WEEKLY_PROGRESS_DATA, SKILLS_DATA, ACTIVITY_ITEMS } from "./mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

const statCards = [
  { label: "Nxënës", value: "24", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Materiale aktive", value: "8", icon: BookOpen, color: "bg-success-muted text-success-muted-foreground" },
  { label: "Detyra të kryera", value: "16", icon: CheckCircle, color: "bg-secondary text-secondary-foreground" },
  { label: "Rezultat mesatar", value: "74%", icon: TrendingUp, color: "bg-warning-muted text-warning-muted-foreground" },
];

const activityIcons: Record<string, React.ElementType> = { CheckCircle, HelpCircle, Users };

export default function TeacherDashboard() {
  const { user } = useApp();
  const atRisk = MOCK_STUDENTS.filter(s => s.status === "needs-support");

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mirë se erdhe, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Keni 3 nxënës që mund të kenë nevojë për mbështetje.</p>
        </div>
        <Link to="/teacher/materials/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25">
          <Plus size={18} /> Krijo material të ri
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-card rounded-2xl p-5 border border-border">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Progress chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Progresi i klasës</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WEEKLY_PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#6D5EF5" strokeWidth={2.5} dot={{ r: 4, fill: "#6D5EF5" }} name="Rezultati mesatar" />
              <Line type="monotone" dataKey="completion" stroke="#5B9A7A" strokeWidth={2.5} dot={{ r: 4, fill: "#5B9A7A" }} name="% Përfundim" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Aktiviteti i fundit</h2>
          <div className="space-y-3">
            {ACTIVITY_ITEMS.map(item => {
              const Icon = activityIcons[item.icon] ?? CheckCircle;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills chart */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4">Aftësitë e klasës</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SKILLS_DATA.map(skill => (
            <div key={skill.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{skill.name}</span>
                <span className="text-muted-foreground">{skill.value}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${skill.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-risk students */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" /> Nxënës që mund të kenë nevojë për mbështetje
          </h2>
          <Link to="/teacher/classes" className="text-sm text-primary hover:underline flex items-center gap-1">
            Shiko të gjithë <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {atRisk.map(s => (
            <div key={s.id} className="border border-warning/25 bg-warning-muted rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Klasa {s.class}</p>
                </div>
                <span className="ml-auto text-sm font-bold text-warning-muted-foreground">{s.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.alertReason}</p>
              <Link to={`/teacher/students/${s.id}`}
                className="block text-center text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Shiko progresin
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
