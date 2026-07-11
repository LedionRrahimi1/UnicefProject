import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft, Headphones, BookOpen, Award, Clock, FileText, Star,
  Sparkles, Brain, AlertCircle, ImageIcon,
} from "lucide-react";
import { studentService, gamificationService, learningService, materialService } from "./services";
import type { Student, StudentLevel, LearningProfile, LearningReport, Material } from "./types";
import { WEEKLY_PROGRESS_DATA } from "./mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useT } from "./useT";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [student, setStudent] = useState<Student | null>(null);
  const [level, setLevel] = useState<StudentLevel | null>(null);
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [reports, setReports] = useState<LearningReport[]>([]);
  const [materialsById, setMaterialsById] = useState<Record<string, Material>>({});
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      studentService.getById(id),
      gamificationService.getStudentLevel(id),
      learningService.getProfile(id),
      learningService.getReportsForStudent(id),
      materialService.getAll(),
    ]).then(([s, lvl, prof, reps, mats]) => {
      setStudent(s ?? null);
      setLevel(lvl);
      setProfile(prof ?? null);
      setReports(reps);
      const map: Record<string, Material> = {};
      mats.forEach(m => { map[m.id] = m; });
      setMaterialsById(map);
    });
  }, [id]);

  if (!student) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const latestRecs = profile?.teacherRecommendations?.length
    ? profile.teacherRecommendations
    : reports[0]?.teacherRecommendations ?? [];

  return (
    <div className="max-w-4xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> {t("sp2.back")}
      </button>

      <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
          {student.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground text-sm">{t("common.class")} {student.class} · {student.age} · {student.readingLevel}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {level && (
              <>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{t("sd.level", { n: level.level })}</span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Star size={11} className="text-primary" fill="currentColor" /> {level.totalXP} {t("common.stars")}</span>
              </>
            )}
            {student.visualPreferred && (
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <ImageIcon size={11} /> {t("common.visual")}
              </span>
            )}
            {student.audioEnabled && (
              <span className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <Headphones size={11} /> {t("common.audio")}
              </span>
            )}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={student.visualPreferred}
              onChange={async e => {
                const next = e.target.checked;
                const updated = await studentService.update(student.id, { visualPreferred: next });
                if (updated) setStudent(updated);
              }}
            />
            {t("sp2.visualPref")}
          </label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <FileText size={14} /> {t("sp2.assign")}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Award size={14} /> {t("sp2.awardTitle")}
          </button>
        </div>
      </div>

      {/* AI Learning Profile */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Brain size={16} className="text-primary" /> {t("sp2.aiProfile")}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {t("sp2.aiProfileHint")}
          {profile ? ` · ${profile.sessionCount} sesione` : ""}
        </p>
        {!profile ? (
          <p className="text-sm text-muted-foreground">{t("sp2.noProfile")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: t("sp2.learnsBest"), items: profile.preferredFormats },
              { title: t("sp2.strengths"), items: profile.strengths },
              { title: t("sp2.supportNeeds"), items: profile.supportNeeds },
              { title: t("sp2.traits"), items: profile.traits },
            ].map(block => (
              <div key={block.title} className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{block.title}</p>
                {block.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <ul className="space-y-1.5">
                    {block.items.map((item, i) => (
                      <li key={i} className="text-sm text-foreground flex gap-2">
                        <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher recommendations */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-primary" /> {t("sp2.teacherRecs")}
        </h2>
        {latestRecs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("sp2.noRecs")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {latestRecs.map((r, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">{r}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">{t("sp2.stats")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: t("sp2.completedMats"), value: student.completedMaterials },
              { icon: Star, label: t("sp2.avgScore"), value: `${student.score}%` },
              { icon: Headphones, label: t("sp2.audioOn"), value: student.audioEnabled ? t("common.yes") : t("common.no") },
              { icon: Clock, label: t("sp2.prefFont"), value: student.preferredFont },
            ].map(s => (
              <div key={s.label} className="bg-muted/40 rounded-xl p-3">
                <s.icon size={15} className="text-muted-foreground mb-1.5" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Vështirësi / modele (AI)</h2>
          <div className="space-y-2.5">
            {(profile?.supportNeeds?.length ? profile.supportNeeds : reports[0]?.difficulties ?? []).slice(0, 5).map(d => (
              <div key={d} className="flex items-center gap-2.5 p-3 bg-warning-muted rounded-xl border border-warning/20">
                <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                <span className="text-sm text-warning-muted-foreground">{d}</span>
              </div>
            ))}
            {!profile?.supportNeeds?.length && !reports[0]?.difficulties?.length && (
              <p className="text-sm text-muted-foreground">Nuk ka të dhëna ende.</p>
            )}
          </div>
          {reports[0]?.patterns?.length ? (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Modele të të nxënit</p>
              {reports[0].patterns.map((p, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2">
                  <AlertCircle size={12} className="text-primary mt-0.5 shrink-0" /> {p}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Progresi gjatë kohës</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={WEEKLY_PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} name={t("common.score")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Learning Reports */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText size={16} className="text-primary" /> {t("sp2.reports")}
          </h2>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("sp2.noReports")}</p>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => {
                const mat = materialsById[rep.materialId];
                const open = openReportId === rep.id;
                return (
                  <div key={rep.id} className="border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenReportId(open ? null : rep.id)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/40"
                    >
                      <div>
                        <p className="text-sm font-medium">{mat?.title ?? t("common.materials")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(rep.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "sq-AL")}</p>
                      </div>
                      <span className="text-xs text-primary">{open ? t("sp2.closeReport") : t("sp2.openReport")}</span>
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{rep.fullTeacherReport}</p>
                        {rep.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Rekomandime</p>
                            <ul className="space-y-1">
                              {rep.recommendations.map((r, i) => (
                                <li key={i} className="text-sm">• {r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {rep.nextLessonSteps.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Hapat për mësimin tjetër</p>
                            <ul className="space-y-1">
                              {rep.nextLessonSteps.map((r, i) => (
                                <li key={i} className="text-sm">• {r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
