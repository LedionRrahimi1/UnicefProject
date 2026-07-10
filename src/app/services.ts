import {
  ALL_BADGES, MOCK_STUDENT_BADGES, MOCK_XP_TRANSACTIONS, LEVEL_THRESHOLDS
} from "./mockData";
import type {
  Material, Student, ClassGroup, Assignment,
  Badge, StudentBadge, XPTransaction, StudentLevel, BadgeProgress, QuizQuestion
} from "./types";
import {
  adaptMaterialWithAI,
  explainSentenceWithAI,
  explainWordWithAI,
  translateWithAI,
  type AdaptMaterialOptions,
  type AdaptedMaterial,
} from "./openai";
import {
  getMaterials, setMaterials,
  getAssignments, setAssignments,
  getStudents, getClasses,
  normalizeClassName, studentsInClass,
  publishMaterialToStudents,
} from "./localDb";

export type { AdaptMaterialOptions, AdaptedMaterial };

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, _password: string) {
    await delay(500);
    if (email === "mesuesi@lexolehte.com") {
      return { id: "teacher-1", name: "Arta Osmani", email, role: "teacher" as const };
    }
    if (email === "nxenesi@lexolehte.com") {
      return { id: "stu-1", name: "Ardi Hoxha", email, role: "student" as const, class: "VI-1" };
    }
    throw new Error("Email ose fjalëkalimi është i gabuar.");
  },
};

// ── Materials ─────────────────────────────────────────────────────────────────

export const materialService = {
  async getAll(): Promise<Material[]> {
    await delay(200);
    return getMaterials();
  },
  async getById(id: string): Promise<Material | undefined> {
    await delay(150);
    return getMaterials().find(m => m.id === id);
  },
  async create(data: Partial<Material>): Promise<Material> {
    await delay(300);
    const mat: Material = {
      id: `mat-${Date.now()}`,
      title: data.title ?? "Material i ri",
      subject: data.subject ?? "",
      class: data.class ?? "",
      originalText: data.originalText ?? "",
      simplifiedText: data.simplifiedText ?? "",
      summary: data.summary ?? "",
      keyPoints: data.keyPoints ?? [],
      vocabulary: data.vocabulary ?? [],
      quiz: data.quiz ?? [],
      teacherNotes: data.teacherNotes ?? "",
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      studentCount: 0,
      completionRate: 0,
      estimatedMinutes: data.estimatedMinutes ?? 15,
    };
    setMaterials([mat, ...getMaterials()]);
    return mat;
  },
  async update(id: string, patch: Partial<Material>): Promise<Material | undefined> {
    await delay(200);
    const materials = getMaterials();
    const idx = materials.findIndex(m => m.id === id);
    if (idx < 0) return undefined;
    const updated = { ...materials[idx], ...patch, id };
    const next = [...materials];
    next[idx] = updated;
    setMaterials(next);
    return updated;
  },
  async updateStatus(id: string, status: Material["status"]): Promise<{ assigned: number }> {
    await delay(250);
    const materials = getMaterials();
    const mat = materials.find(m => m.id === id);
    if (!mat) return { assigned: 0 };

    if (status === "published") {
      const created = publishMaterialToStudents({ ...mat, status: "published" });
      return { assigned: created.length };
    }

    setMaterials(materials.map(m => m.id === id ? { ...m, status } : m));
    return { assigned: 0 };
  },
  async delete(id: string): Promise<void> {
    await delay(200);
    setMaterials(getMaterials().filter(m => m.id !== id));
    setAssignments(getAssignments().filter(a => a.materialId !== id));
  },
};

// ── Students ──────────────────────────────────────────────────────────────────

export const studentService = {
  async getAll(): Promise<Student[]> {
    await delay(200);
    return getStudents();
  },
  async getById(id: string): Promise<Student | undefined> {
    await delay(150);
    return getStudents().find(s => s.id === id);
  },
  async getByClass(classId: string): Promise<Student[]> {
    await delay(200);
    const cls = getClasses().find(c => c.id === classId);
    if (!cls) return [];
    return studentsInClass(cls.name);
  },
  async getClasses(): Promise<ClassGroup[]> {
    await delay(200);
    const classes = getClasses();
    const assignments = getAssignments();
    const materials = getMaterials();
    return classes.map(c => {
      const className = normalizeClassName(c.name);
      const students = studentsInClass(c.name);
      const classMaterials = materials.filter(
        m => normalizeClassName(m.class) === className && m.status === "published"
      );
      const classAsgn = assignments.filter(a => students.some(s => s.id === a.studentId));
      const completed = classAsgn.filter(a => a.status === "completed" && a.score != null);
      const averageScore = completed.length
        ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
        : c.averageScore;
      return {
        ...c,
        studentCount: students.length,
        activeMaterials: classMaterials.length,
        averageScore,
      };
    });
  },
};

// ── Assignments ───────────────────────────────────────────────────────────────

export const assignmentService = {
  async getForStudent(studentId: string): Promise<Assignment[]> {
    await delay(200);
    return getAssignments()
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },
  async getById(id: string): Promise<Assignment | undefined> {
    await delay(150);
    return getAssignments().find(a => a.id === id);
  },
  async getByMaterialForStudent(materialId: string, studentId: string): Promise<Assignment | undefined> {
    await delay(100);
    return getAssignments().find(a => a.materialId === materialId && a.studentId === studentId);
  },
  async create(data: Omit<Assignment, "id">): Promise<Assignment> {
    await delay(200);
    const asgn: Assignment = { ...data, id: `asgn-${Date.now()}` };
    setAssignments([asgn, ...getAssignments()]);
    return asgn;
  },
  async markInProgress(id: string): Promise<void> {
    await delay(100);
    setAssignments(getAssignments().map(a =>
      a.id === id && a.status === "pending" ? { ...a, status: "in-progress" as const } : a
    ));
  },
  async complete(id: string, score: number, wordsOpened: number, audioUsed: boolean): Promise<void> {
    await delay(200);
    setAssignments(getAssignments().map(a =>
      a.id === id ? {
        ...a,
        status: "completed" as const,
        score,
        completedAt: new Date().toISOString().split("T")[0],
        wordsOpened,
        audioUsed,
        attempts: (a.attempts ?? 0) + 1,
      } : a
    ));

    // Refresh material completion rate
    const asgn = getAssignments().find(a => a.id === id);
    if (asgn) {
      const related = getAssignments().filter(a => a.materialId === asgn.materialId);
      const done = related.filter(a => a.status === "completed").length;
      const rate = related.length ? Math.round((done / related.length) * 100) : 0;
      setMaterials(getMaterials().map(m =>
        m.id === asgn.materialId ? { ...m, completionRate: rate } : m
      ));
    }
  },
};

// ── AI Service ────────────────────────────────────────────────────────────────

export const aiService = {
  async simplifyText(text: string): Promise<string> {
    const result = await adaptMaterialWithAI({
      text,
      title: "Material",
      subject: "E përgjithshme",
      level: 2,
      length: "mesatar",
      numQuestions: 0,
      includeSummary: false,
      includeKeyPoints: false,
      includeVocab: false,
      includeQuiz: false,
      includeTeacherNotes: false,
      includeTranslation: false,
    });
    return result.simplifiedText;
  },

  async summarizeText(text: string): Promise<string> {
    const result = await adaptMaterialWithAI({
      text,
      title: "Material",
      subject: "E përgjithshme",
      level: 2,
      length: "shkurtër",
      numQuestions: 0,
      includeSummary: true,
      includeKeyPoints: false,
      includeVocab: false,
      includeQuiz: false,
      includeTeacherNotes: false,
      includeTranslation: false,
    });
    return result.summary;
  },

  async generateQuiz(text: string, numQuestions = 5): Promise<QuizQuestion[]> {
    const result = await adaptMaterialWithAI({
      text,
      title: "Material",
      subject: "E përgjithshme",
      level: 2,
      length: "mesatar",
      numQuestions,
      includeSummary: false,
      includeKeyPoints: false,
      includeVocab: false,
      includeQuiz: true,
      includeTeacherNotes: false,
      includeTranslation: false,
    });
    return result.quiz;
  },

  async adaptMaterial(opts: AdaptMaterialOptions): Promise<AdaptedMaterial> {
    return adaptMaterialWithAI(opts);
  },

  async explainWord(word: string): Promise<{ definition: string; synonym: string; example: string }> {
    return explainWordWithAI(word);
  },

  async explainSentence(sentence: string, action?: string): Promise<string> {
    return explainSentenceWithAI(sentence, action);
  },

  async translateText(text: string, lang: string): Promise<string> {
    return translateWithAI(text, lang);
  },

  async generateTeacherNotes(text: string): Promise<string> {
    const result = await adaptMaterialWithAI({
      text,
      title: "Material",
      subject: "E përgjithshme",
      level: 2,
      length: "mesatar",
      numQuestions: 0,
      includeSummary: false,
      includeKeyPoints: false,
      includeVocab: false,
      includeQuiz: false,
      includeTeacherNotes: true,
      includeTranslation: false,
    });
    return result.teacherNotes;
  },

  async generateAudio(_text: string): Promise<string> {
    await delay(400);
    return "mock-audio-url";
  },
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsService = {
  async getClassOverview() {
    await delay(250);
    const assignments = getAssignments();
    const completed = assignments.filter(a => a.status === "completed" && a.score != null);
    const averageScore = completed.length
      ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
      : 0;
    const completionRate = assignments.length
      ? Math.round((completed.length / assignments.length) * 100)
      : 0;
    const averageTimeMinutes = completed.length
      ? Math.round(completed.reduce((s, a) => s + (a.timeSpentMinutes ?? 15), 0) / completed.length)
      : 0;
    const wordsExplained = completed.reduce((s, a) => s + (a.wordsOpened ?? 0), 0);
    const withAudio = completed.filter(a => a.audioUsed).length;
    const audioUsage = completed.length ? Math.round((withAudio / completed.length) * 100) : 0;
    const averageAttempts = assignments.length
      ? Math.round((assignments.reduce((s, a) => s + (a.attempts ?? 0), 0) / assignments.length) * 10) / 10
      : 0;

    return {
      averageScore,
      completionRate,
      averageTimeMinutes,
      wordsExplained,
      audioUsage,
      averageAttempts,
    };
  },
};

// ── Gamification ──────────────────────────────────────────────────────────────

const LS_XP_KEY = "lexolehte_xp";
const LS_BADGES_KEY = "lexolehte_badges";

function loadXP(): XPTransaction[] {
  try {
    const raw = localStorage.getItem(LS_XP_KEY);
    return raw ? JSON.parse(raw) : [...MOCK_XP_TRANSACTIONS];
  } catch { return [...MOCK_XP_TRANSACTIONS]; }
}

function saveXP(txs: XPTransaction[]) {
  localStorage.setItem(LS_XP_KEY, JSON.stringify(txs));
}

function loadStudentBadges(): StudentBadge[] {
  try {
    const raw = localStorage.getItem(LS_BADGES_KEY);
    return raw ? JSON.parse(raw) : [...MOCK_STUDENT_BADGES];
  } catch { return [...MOCK_STUDENT_BADGES]; }
}

function saveStudentBadges(badges: StudentBadge[]) {
  localStorage.setItem(LS_BADGES_KEY, JSON.stringify(badges));
}

function calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progressPercentage: number } {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
  }
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  return { level, currentLevelXP, nextLevelXP, progressPercentage };
}

export const gamificationService = {
  async getStudentLevel(studentId: string): Promise<StudentLevel> {
    await delay(300);
    const txs = loadXP().filter(t => t.studentId === studentId);
    const totalXP = txs.reduce((sum, t) => sum + t.amount, 0);
    const { level, currentLevelXP, nextLevelXP, progressPercentage } = calculateLevel(totalXP);
    return { studentId, level, totalXP, currentLevelXP, nextLevelXP, progressPercentage };
  },

  async getXPHistory(studentId: string): Promise<XPTransaction[]> {
    await delay(300);
    return loadXP().filter(t => t.studentId === studentId).reverse();
  },

  async awardXP(studentId: string, amount: number, reason: string, sourceType: XPTransaction["sourceType"], sourceId?: string, awardedBy: "system" | "teacher" = "system", teacherId?: string): Promise<{ newTotal: number; levelUp: boolean; newLevel: number; previousLevel: number }> {
    await delay(400);
    const txs = loadXP();
    const prevTotal = txs.filter(t => t.studentId === studentId).reduce((s, t) => s + t.amount, 0);
    const prevLevel = calculateLevel(prevTotal).level;
    const newTx: XPTransaction = {
      id: `xp-${Date.now()}`,
      studentId, amount, reason, sourceType, sourceId, awardedBy, teacherId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...txs, newTx];
    saveXP(updated);
    const newTotal = prevTotal + amount;
    const newLevel = calculateLevel(newTotal).level;
    return { newTotal, levelUp: newLevel > prevLevel, newLevel, previousLevel: prevLevel };
  },

  async getBadges(): Promise<Badge[]> {
    await delay(200);
    return [...ALL_BADGES];
  },

  async getStudentBadges(studentId: string): Promise<StudentBadge[]> {
    await delay(300);
    return loadStudentBadges().filter(b => b.studentId === studentId);
  },

  async getBadgeProgress(studentId: string): Promise<BadgeProgress[]> {
    await delay(300);
    const txs = loadXP().filter(t => t.studentId === studentId);
    const earned = loadStudentBadges().filter(b => b.studentId === studentId).map(b => b.badgeId);
    const wordsOpened = txs.filter(t => t.sourceType === "vocabulary").length * 3;
    return ALL_BADGES
      .filter(b => !earned.includes(b.id) && b.isAutomatic && b.conditionValue !== undefined)
      .map(b => {
        let current = 0;
        if (b.conditionType === "materials_completed") current = 3;
        if (b.conditionType === "words_opened") current = wordsOpened;
        return {
          studentId, badgeId: b.id,
          currentValue: Math.min(current, b.conditionValue!),
          targetValue: b.conditionValue!,
          progressPercentage: Math.min(100, Math.round((current / b.conditionValue!) * 100)),
        };
      });
  },

  async unlockBadge(studentId: string, badgeId: string, awardedBy: "system" | "teacher" = "system", teacherId?: string, teacherMessage?: string): Promise<void> {
    await delay(300);
    const existing = loadStudentBadges();
    if (existing.some(b => b.studentId === studentId && b.badgeId === badgeId)) return;
    const newBadge: StudentBadge = {
      id: `sb-${Date.now()}`,
      studentId, badgeId,
      earnedAt: new Date().toISOString().split("T")[0],
      awardedBy, teacherId, teacherMessage,
    };
    saveStudentBadges([...existing, newBadge]);
  },

  async awardTeacherBadge(studentId: string, badgeId: string, teacherId: string, message: string, xpBonus: number): Promise<void> {
    await delay(500);
    await this.unlockBadge(studentId, badgeId, "teacher", teacherId, message);
    if (xpBonus > 0) {
      await this.awardXP(studentId, xpBonus, "Shpërblim nga mësuesja", "teacher", undefined, "teacher", teacherId);
    }
  },

  async getTeacherRewardsOverview(studentIds: string[]) {
    await delay(500);
    return Promise.all(studentIds.map(async id => {
      const level = await this.getStudentLevel(id);
      const badges = await this.getStudentBadges(id);
      return { studentId: id, ...level, badgeCount: badges.length };
    }));
  },

  async getRecentRewards(studentId: string) {
    await delay(300);
    const txs = await this.getXPHistory(studentId);
    const badges = await this.getStudentBadges(studentId);
    return {
      recentXP: txs.slice(0, 5),
      recentBadges: badges.slice(-3).reverse(),
      weeklyXP: txs.filter(t => {
        const d = new Date(t.createdAt);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }).reduce((s, t) => s + t.amount, 0),
    };
  },
};
