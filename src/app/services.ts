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
  synthesizeAlbanianSpeech,
  synthesizeEnglishSpeech,
  chunkTextForTTS,
  generateEducationalIllustration,
  type AdaptMaterialOptions,
  type AdaptedMaterial,
} from "./openai";
import {
  generatePostLessonIntelligence,
  generateFlashcardsFromMaterial,
  explainWrongAnswerWithAI,
  generateEasierQuestionWithAI,
} from "./openaiLearning";
import {
  getMaterials, setMaterials,
  getAssignments, setAssignments,
  getStudents, setStudents, getClasses, setClasses,
  normalizeClassName, studentsInClass,
  publishMaterialToStudents,
  getLearningProfile, upsertLearningProfile,
  addLearningReport, getReportByAssignment, getReportsForStudent,
  upsertFlashcardsForMaterial, getFlashcardsForMaterial,
  addMemoryBooster, getMemoryBoosterByAssignment, getMemoryBoostersForStudent,
} from "./localDb";
import {
  countEvents,
  getSessionMinutes,
  clearSessionStart,
} from "./learningTracker";
import type {
  LearningProfile,
  LearningReport,
  Flashcard,
  MemoryBoosterPack,
  SessionMetrics,
  WrongQuestionDetail,
} from "./types";

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
      englishText: data.englishText ?? "",
      illustrations: data.illustrations ?? [],
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
  async create(input: {
    name: string;
    class: string;
    age: number;
    readingLevel?: string;
    audioEnabled?: boolean;
    visualPreferred?: boolean;
  }): Promise<Student> {
    await delay(200);
    const name = input.name.trim();
    if (!name) throw new Error("Emri i nxënësit është i detyrueshëm.");
    if (!input.class.trim()) throw new Error("Zgjidh klasën.");
    if (!input.age || input.age < 5 || input.age > 20) throw new Error("Mosha duhet të jetë midis 5 dhe 20.");

    const student: Student = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      class: normalizeClassName(input.class),
      age: input.age,
      readingLevel: input.readingLevel || "Mesatar",
      score: 0,
      completedMaterials: 0,
      status: "active",
      preferredFont: "lexend",
      audioEnabled: input.audioEnabled ?? true,
      visualPreferred: input.visualPreferred ?? false,
      language: "sq",
    };
    setStudents([student, ...getStudents()]);

    // Keep class studentCount in sync
    setClasses(getClasses().map(c => {
      if (normalizeClassName(c.name) !== normalizeClassName(input.class)) return c;
      return { ...c, studentCount: studentsInClass(c.name).length };
    }));

    return student;
  },
  async update(id: string, patch: Partial<Student>): Promise<Student | undefined> {
    await delay(150);
    const all = getStudents();
    const idx = all.findIndex(s => s.id === id);
    if (idx < 0) return undefined;
    const updated = { ...all[idx], ...patch, id };
    const next = [...all];
    next[idx] = updated;
    setStudents(next);
    return updated;
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
  async complete(
    id: string,
    score: number,
    wordsOpened: number,
    audioUsed: boolean,
    extras?: { timeSpentMinutes?: number }
  ): Promise<void> {
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
        ...(extras?.timeSpentMinutes != null ? { timeSpentMinutes: extras.timeSpentMinutes } : {}),
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

  async generateAudio(text: string, lang: "sq" | "en" = "sq"): Promise<string> {
    const blob = lang === "en"
      ? await synthesizeEnglishSpeech(text)
      : await synthesizeAlbanianSpeech(text);
    return URL.createObjectURL(blob);
  },

  async generateAudioChunks(text: string, lang: "sq" | "en" = "sq"): Promise<string[]> {
    const parts = chunkTextForTTS(text);
    const urls: string[] = [];
    for (const part of parts) {
      const blob = lang === "en"
        ? await synthesizeEnglishSpeech(part)
        : await synthesizeAlbanianSpeech(part);
      urls.push(URL.createObjectURL(blob));
    }
    return urls;
  },

  async generateIllustration(prompt: string): Promise<string> {
    return generateEducationalIllustration(prompt);
  },

  async generateFlashcards(material: {
    id: string;
    title: string;
    subject: string;
    simplifiedText: string;
    keyPoints?: string[];
    vocabulary?: { word: string; definition: string }[];
  }): Promise<Flashcard[]> {
    const raw = await generateFlashcardsFromMaterial({
      title: material.title,
      subject: material.subject,
      text: material.simplifiedText,
      keyPoints: material.keyPoints,
      vocabulary: material.vocabulary,
    });
    const cards: Flashcard[] = raw.map((c, i) => ({
      id: `fc-${material.id}-${i}-${Date.now()}`,
      materialId: material.id,
      front: c.front,
      back: c.back,
      type: c.type,
    }));
    upsertFlashcardsForMaterial(material.id, cards);
    return cards;
  },

  async explainWrongAnswer(input: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    topic: string;
    visualPreferred?: boolean;
  }) {
    return explainWrongAnswerWithAI(input);
  },

  async generateEasierQuestion(input: {
    original: QuizQuestion;
    topic: string;
    subject: string;
    visualPreferred?: boolean;
  }): Promise<QuizQuestion> {
    return generateEasierQuestionWithAI(input);
  },
};

// ── Learning intelligence (reports, profile, memory booster) ──────────────────

function isoPlusDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

export const learningService = {
  async getProfile(studentId: string): Promise<LearningProfile | undefined> {
    await delay(80);
    return getLearningProfile(studentId);
  },

  async getReportsForStudent(studentId: string): Promise<LearningReport[]> {
    await delay(80);
    return getReportsForStudent(studentId);
  },

  async getReportByAssignment(assignmentId: string): Promise<LearningReport | undefined> {
    await delay(80);
    return getReportByAssignment(assignmentId);
  },

  async getFlashcards(materialId: string): Promise<Flashcard[]> {
    await delay(80);
    return getFlashcardsForMaterial(materialId);
  },

  async getMemoryBoosters(studentId: string): Promise<MemoryBoosterPack[]> {
    await delay(80);
    return getMemoryBoostersForStudent(studentId);
  },

  async getMemoryBoosterByAssignment(assignmentId: string): Promise<MemoryBoosterPack | undefined> {
    await delay(80);
    return getMemoryBoosterByAssignment(assignmentId);
  },

  /** Build metrics from tracked events + quiz outcome, then run AI pipeline. */
  async runPostLessonAnalysis(input: {
    studentId: string;
    materialId: string;
    assignmentId: string;
    score: number;
    attempts: number;
    wrongQuestions: WrongQuestionDetail[];
    hintCount: number;
  }): Promise<{ report: LearningReport; profile: LearningProfile; booster: MemoryBoosterPack }> {
    const material = getMaterials().find(m => m.id === input.materialId);
    const explainCount = countEvents(input.studentId, input.materialId, "explain");
    const audioPlayCount = countEvents(input.studentId, input.materialId, "audio");
    const vocabOpened = countEvents(input.studentId, input.materialId, "vocab");
    const simplifiedUsed = countEvents(input.studentId, input.materialId, "simplified_view") > 0
      || Boolean(material?.simplifiedText);
    const timeSpentMinutes = getSessionMinutes(input.studentId, input.materialId);

    const metrics: SessionMetrics = {
      studentId: input.studentId,
      materialId: input.materialId,
      assignmentId: input.assignmentId,
      score: input.score,
      timeSpentMinutes,
      attempts: input.attempts,
      explainCount,
      audioPlayCount,
      simplifiedUsed,
      vocabOpened,
      hintCount: input.hintCount,
      wrongQuestions: input.wrongQuestions,
      topic: material?.title ?? "Material",
      subject: material?.subject ?? "",
    };

    const existing = getLearningProfile(input.studentId);
    const student = getStudents().find(s => s.id === input.studentId);
    const ai = await generatePostLessonIntelligence(metrics, existing, {
      visualPreferred: Boolean(student?.visualPreferred),
    });

    const report: LearningReport = {
      id: `rep-${Date.now()}`,
      studentId: input.studentId,
      materialId: input.materialId,
      assignmentId: input.assignmentId,
      performanceSummary: ai.performanceSummary,
      strengths: ai.strengths,
      difficulties: ai.difficulties,
      recommendations: ai.recommendations,
      nextLessonSteps: ai.nextLessonSteps,
      patterns: ai.patterns,
      teacherRecommendations: ai.teacherRecommendations,
      studentMessage: ai.studentMessage,
      studyPlan: ai.studyPlan,
      fullTeacherReport: ai.fullTeacherReport,
      createdAt: new Date().toISOString(),
    };
    addLearningReport(report);

    const profile: LearningProfile = {
      studentId: input.studentId,
      traits: ai.profileUpdate.traits.length ? ai.profileUpdate.traits : (existing?.traits ?? []),
      strengths: ai.profileUpdate.strengths.length ? ai.profileUpdate.strengths : (existing?.strengths ?? []),
      supportNeeds: ai.profileUpdate.supportNeeds.length
        ? ai.profileUpdate.supportNeeds
        : (existing?.supportNeeds ?? []),
      preferredFormats: ai.profileUpdate.preferredFormats.length
        ? ai.profileUpdate.preferredFormats
        : (existing?.preferredFormats ?? []),
      teacherRecommendations: ai.profileUpdate.teacherRecommendations.length
        ? ai.profileUpdate.teacherRecommendations
        : (existing?.teacherRecommendations ?? []),
      updatedAt: new Date().toISOString(),
      sessionCount: (existing?.sessionCount ?? 0) + 1,
    };
    upsertLearningProfile(profile);

    const boosterCards: Flashcard[] = (ai.memoryBooster.flashcards || [])
      .filter(c => c.front && c.back)
      .slice(0, 5)
      .map((c, i) => ({
        id: `mb-fc-${input.assignmentId}-${i}`,
        materialId: input.materialId,
        front: c.front,
        back: c.back,
        type: (c.type === "definition" || c.type === "concept" || c.type === "quick"
          ? c.type
          : "quick") as Flashcard["type"],
      }));

    // Also merge into material flashcards store if empty
    if (getFlashcardsForMaterial(input.materialId).length === 0 && boosterCards.length) {
      upsertFlashcardsForMaterial(input.materialId, boosterCards.map((c, i) => ({
        ...c,
        id: `fc-${input.materialId}-mb-${i}`,
      })));
    }

    const booster: MemoryBoosterPack = {
      id: `mb-${Date.now()}`,
      studentId: input.studentId,
      materialId: input.materialId,
      assignmentId: input.assignmentId,
      shortSummary: ai.memoryBooster.shortSummary,
      flashcards: boosterCards,
      reviewQuestions: (ai.memoryBooster.reviewQuestions || []).slice(0, 5),
      reviewSchedule: {
        after1Day: isoPlusDays(1),
        after3Days: isoPlusDays(3),
        after7Days: isoPlusDays(7),
      },
      createdAt: new Date().toISOString(),
    };
    addMemoryBooster(booster);

    await assignmentService.complete(
      input.assignmentId,
      input.score,
      vocabOpened,
      audioPlayCount > 0,
      { timeSpentMinutes }
    );

    clearSessionStart(input.studentId, input.materialId);

    return { report, profile, booster };
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
