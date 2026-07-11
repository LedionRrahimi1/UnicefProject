import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, BookOpen, Headphones, RefreshCw } from "lucide-react";
import { analyticsService } from "./services";
import { MOCK_STUDENTS, WEEKLY_PROGRESS_DATA } from "./mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useT } from "./useT";

const classData = [
  { name: "VI-1", score: 68 },
  { name: "VI-2", score: 74 },
  { name: "VII-1", score: 71 },
];
const audioData = [
  { name: "Fotosinteza", usage: 78 },
  { name: "Sistemi Diellor", usage: 62 },
  { name: "Uji", usage: 45 },
];
const errorTypes = [
  { name: "Ideja kryesore", value: 38 },
  { name: "Fjalori", value: 28 },
  { name: "Kuptimi i fjalisë", value: 22 },
  { name: "Detajet", value: 12 },
];
const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export default function TeacherAnalytics() {
  const { t } = useT();
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    analyticsService.getClassOverview().then(setOverview);
  }, []);

  const statCards = overview ? [
    { label: t("ta.avgScore"), value: `${overview.averageScore}%`, icon: TrendingUp, color: "text-primary" },
    { label: t("ta.completion"), value: `${overview.completionRate}%`, icon: BarChart3, color: "text-success" },
    { label: t("ta.avgTime"), value: `${overview.averageTimeMinutes}min`, icon: Clock, color: "text-primary" },
    { label: t("ta.wordsExplained"), value: `${overview.wordsExplained}`, icon: BookOpen, color: "text-warning" },
    { label: t("ta.audioUse"), value: `${overview.audioUsage}%`, icon: Headphones, color: "text-secondary-foreground" },
    { label: t("ta.avgAttempts"), value: `${overview.averageAttempts}`, icon: RefreshCw, color: "text-muted-foreground" },
  ] : [];

  const tableHeaders = [
    t("common.student"),
    t("common.class"),
    t("common.score"),
    t("common.materials"),
    t("ta.avgTime"),
    t("ta.note"),
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">{t("ta.title")}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{t("ta.subtitle")}</p>
      </div>

      {/* Stat cards */}
      {!overview ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-2" /><div className="h-3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map(c => (
            <div key={c.label} className="bg-card rounded-2xl border border-border p-4 text-center">
              <c.icon size={18} className={`${c.color} mx-auto mb-1.5`} />
              <p className="text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Progress over time */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">{t("ta.progressOverTime")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WEEKLY_PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} name={t("common.score")} />
              <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2.5} name={t("ta.completion")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Results by class */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">{t("ta.byClass")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} name={t("ta.avgScore")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error types */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">{t("ta.errorTypes")}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={errorTypes}
                cx="50%"
                cy="45%"
                outerRadius={72}
                dataKey="value"
                label={false}
              >
                {errorTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={48}
                formatter={(name, entry) => {
                  const value = (entry.payload as { value?: number })?.value;
                  return (
                    <span className="text-xs text-foreground">
                      {name}{typeof value === "number" ? ` · ${value}%` : ""}
                    </span>
                  );
                }}
              />
              <Tooltip
                formatter={(value: number | string) => [`${value}%`, t("ta.errorTypes")]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Audio usage */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">{t("ta.audioByMaterial")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={audioData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={80} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="usage" fill="#10b981" radius={[0, 6, 6, 0]} name={t("ta.audioUse")} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">{t("ta.studentsTable")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("ta.studentsHint")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {tableHeaders.map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_STUDENTS.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{s.name[0]}</div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t("common.class")} {s.class}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="font-medium">{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.completedMaterials}</td>
                  <td className="px-4 py-3 text-muted-foreground">16 min</td>
                  <td className="px-4 py-3">
                    {s.alertReason && <span className="text-xs text-warning-muted-foreground bg-warning-muted px-2 py-1 rounded-lg">{s.alertReason}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
