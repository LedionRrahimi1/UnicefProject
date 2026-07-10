export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  class?: string;
}

export interface VocabWord {
  word: string;
  definition: string;
  synonym: string;
  example: string;
  translation: string;
}

export type QuestionType = "multiple" | "yesno" | "short" | "mainidea";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correct: string | number;
  hint?: string;
  feedback: string;
}

export type MaterialStatus = "draft" | "review" | "approved" | "published";

export interface Material {
  id: string;
  title: string;
  subject: string;
  class: string;
  originalText: string;
  simplifiedText: string;
  summary: string;
  keyPoints: string[];
  vocabulary: VocabWord[];
  quiz: QuizQuestion[];
  teacherNotes: string;
  status: MaterialStatus;
  createdAt: string;
  studentCount: number;
  completionRate: number;
  estimatedMinutes: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  age: number;
  readingLevel: string;
  score: number;
  completedMaterials: number;
  status: "active" | "needs-support" | "excellent";
  alertReason?: string;
  preferredFont: string;
  audioEnabled: boolean;
  language: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  studentCount: number;
  activeMaterials: number;
  averageScore: number;
}

export interface Assignment {
  id: string;
  materialId: string;
  studentId: string;
  deadline: string;
  startDate: string;
  allowRetry: boolean;
  showAnswers: boolean;
  enableAudio: boolean;
  message?: string;
  status: "pending" | "in-progress" | "completed";
  score?: number;
  completedAt?: string;
  timeSpentMinutes?: number;
  wordsOpened?: number;
  audioUsed?: boolean;
  attempts?: number;
}

export type XPSourceType = "material" | "quiz" | "vocabulary" | "level" | "badge" | "teacher" | "improvement";

export interface XPTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  sourceType: XPSourceType;
  sourceId?: string;
  awardedBy: "system" | "teacher";
  teacherId?: string;
  createdAt: string;
}

export interface StudentLevel {
  studentId: string;
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercentage: number;
}

export type BadgeCategory = "reading" | "comprehension" | "vocabulary" | "progress" | "audio" | "quiz" | "level" | "teacher" | "special";
export type BadgeRarity = "common" | "uncommon" | "rare" | "special" | "teacher";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  conditionType: string;
  conditionValue?: number;
  xpReward: number;
  isAutomatic: boolean;
  isSecret: boolean;
  isEnabled: boolean;
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAt: string;
  awardedBy: "system" | "teacher";
  teacherId?: string;
  teacherMessage?: string;
}

export interface BadgeProgress {
  studentId: string;
  badgeId: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
}

export interface AccessibilitySettings {
  fontSize: number;
  lineSpacing: number;
  letterSpacing: number;
  highContrast: boolean;
  darkMode: boolean;
  readingFont: "inter" | "lexend" | "atkinson";
  reducedMotion: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  icon: string;
}
