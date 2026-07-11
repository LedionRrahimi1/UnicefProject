import React from "react";
import { Link } from "react-router";
import { Users, BookOpen, CheckCircle, TrendingUp, Plus, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";
import { useApp } from "./store";
import { useT } from "./useT";
import { MOCK_STUDENTS, WEEKLY_PROGRESS_DATA, SKILLS_DATA, ACTIVITY_ITEMS } from "./mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const activityIcons: Record<string, React.ElementType> = { CheckCircle, HelpCircle, Users };

export default function TeacherDashboard() {
  const { user } = useApp();
  const { t } = useT();
  const atRisk = MOCK_STUDENTS.filter(s => s.status === "needs-support");

  const statCards = [
    { label: t("common.students"), value: "24", icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("td.activeMaterials"), value: "8", icon: BookOpen, color: "bg-success-muted text-success-muted-foreground" },
    { label: t("td.completedTasks"), value: "16", icon: CheckCircle, color: "bg-secondary text-secondary-foreground" },
    { label: t("td.avgScore"), value: "74%", icon: TrendingUp, color: "bg-warning-muted text-warning-muted-foreground" },
  ];

  return (
    <div className="ui-page">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t("td.welcome", { name: user?.name?.split(" ")[0] ?? "" })}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("td.alert")}
          </p>
        </div>
        <Link to="/teacher/materials/new" className="ui-btn-primary">
          <Plus size={18} /> {t("td.createMaterial")}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(card => (
          <div key={card.label} className="ui-card p-4 sm:p-5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={22} />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 ui-card p-5 sm:p-6">
          <h2 className="ui-section-title mb-5">{t("td.classProgress")}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WEEKLY_PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#5B4FE8" strokeWidth={2.5} dot={{ r: 4, fill: "#5B4FE8" }} name={t("td.avgScore")} />
              <Line type="monotone" dataKey="completion" stroke="#3D9B74" strokeWidth={2.5} dot={{ r: 4, fill: "#3D9B74" }} name={t("td.completion")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="ui-card p-5 sm:p-6">
          <h2 className="ui-section-title mb-5">{t("td.recentActivity")}</h2>
          <div className="space-y-4">
            {ACTIVITY_ITEMS.map(item => {
              const Icon = activityIcons[item.icon] ?? CheckCircle;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground leading-snug font-medium">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ui-card p-5 sm:p-6">
        <h2 className="ui-section-title mb-5">{t("td.classSkills")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SKILLS_DATA.map(skill => (
            <div key={skill.name} className="space-y-2.5">
              <div className="flex justify-between text-sm gap-2">
                <span className="font-semibold text-foreground">{skill.name}</span>
                <span className="text-muted-foreground font-bold">{skill.value}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${skill.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ui-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h2 className="ui-section-title flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" /> {t("td.needSupport")}
          </h2>
          <Link to="/teacher/classes" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 min-h-10">
            {t("td.viewAll")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {atRisk.map(s => (
            <div key={s.id} className="border border-warning/20 bg-warning-muted rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">
                  {s.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{t("common.class")} {s.class}</p>
                </div>
                <span className="text-sm font-extrabold text-warning-muted-foreground">{s.score}%</span>
              </div>
              {s.alertReason && (
                <p className="text-xs text-warning-muted-foreground leading-relaxed mb-3">{s.alertReason}</p>
              )}
              <Link to={`/teacher/students/${s.id}`}
                className="block text-center text-xs font-bold py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-10">
                {t("td.viewProgress")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
