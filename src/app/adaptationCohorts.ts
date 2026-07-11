import type { LearningProfile, Student } from "./types";

export type AdaptationCohortKey =
  | "visual-basic"
  | "visual"
  | "audio-basic"
  | "basic"
  | "audio"
  | "advanced"
  | "standard";

export interface AdaptationCohort {
  key: AdaptationCohortKey;
  label: string;
  studentIds: string[];
  /** Hints passed to AI for this group only. */
  learnerHints: string[];
  /** Optional override of simplification level 1–3. */
  levelOverride?: number;
  /** Force illustrations for this cohort. */
  forceVisuals: boolean;
}

function profileHints(profile?: LearningProfile | null): string[] {
  if (!profile) return [];
  return [
    ...profile.preferredFormats,
    ...profile.supportNeeds,
    ...profile.teacherRecommendations,
  ].filter(Boolean);
}

function isVisual(stu: Student, profile?: LearningProfile | null): boolean {
  if (stu.visualPreferred) return true;
  const blob = profileHints(profile).join(" ").toLowerCase();
  return /vizual|figur|ilustr|visual|picture|image/.test(blob);
}

function isAudio(stu: Student, profile?: LearningProfile | null): boolean {
  if (stu.audioEnabled) return true;
  const blob = profileHints(profile).join(" ").toLowerCase();
  return /audio|zë|degjo|dëgjo|listen|tts/.test(blob);
}

function isBasic(stu: Student, profile?: LearningProfile | null): boolean {
  if (/bazik|basic|fillestar/i.test(stu.readingLevel)) return true;
  if (stu.status === "needs-support") return true;
  const blob = profileHints(profile).join(" ").toLowerCase();
  return /bazik|thjesht|ngadal|support|vështir|veshtir/.test(blob);
}

function isAdvanced(stu: Student): boolean {
  return /avanc|advanced|lart/i.test(stu.readingLevel) || stu.status === "excellent";
}

/** Assign each student to exactly one preference cohort. */
export function cohortKeyForStudent(
  stu: Student,
  profile?: LearningProfile | null
): AdaptationCohortKey {
  const visual = isVisual(stu, profile);
  const audio = isAudio(stu, profile);
  const basic = isBasic(stu, profile);
  const advanced = isAdvanced(stu);

  if (visual && basic) return "visual-basic";
  if (visual) return "visual";
  if (audio && basic) return "audio-basic";
  if (basic) return "basic";
  if (audio) return "audio";
  if (advanced) return "advanced";
  return "standard";
}

const COHORT_META: Record<
  AdaptationCohortKey,
  { label: string; baseHints: string[]; levelOverride?: number; forceVisuals: boolean }
> = {
  "visual-basic": {
    label: "Vizual · Bazik",
    baseHints: [
      "Mëson më mirë me figura dhe ilustrime.",
      "Përdor gjuhë shumë të thjeshtë, fjali të shkurtra dhe shembuj konkretë nga jeta e përditshme.",
      "Shpjego hap pas hapi; shmang fjalorin e rëndë.",
    ],
    levelOverride: 1,
    forceVisuals: true,
  },
  visual: {
    label: "Vizual",
    baseHints: [
      "Mëson më mirë me figura dhe ilustrime — përfshi shembuj vizualë dhe përshkrime konkrete.",
      "Lidh çdo ide me diçka që mund të imagjinohet ose vizatohet.",
    ],
    forceVisuals: true,
  },
  "audio-basic": {
    label: "Audio · Bazik",
    baseHints: [
      "Preferon dëgjim / audio: shkruaj fjali të qarta që lexohen mirë me zë.",
      "Tekst shumë i thjeshtë, i shkurtër, me ritëm të qartë.",
    ],
    levelOverride: 1,
    forceVisuals: false,
  },
  basic: {
    label: "Bazik",
    baseHints: [
      "Nxënës me nevojë për mbështetje: thjeshtëso fort, fjali të shkurtra, shembuj të jetës së përditshme.",
      "Përsërit idetë kryesore me fjalë të tjera.",
    ],
    levelOverride: 1,
    forceVisuals: false,
  },
  audio: {
    label: "Audio",
    baseHints: [
      "Preferon audio: strukturo tekstin që të dëgjohet mirë (fjali të qarta, pa fraza shumë të gjata).",
    ],
    forceVisuals: false,
  },
  advanced: {
    label: "Avancuar",
    baseHints: [
      "Nxënës i avancuar: mund të mbajë më shumë detaje, por mbetet i qartë dhe i strukturuar.",
      "Shto pyetje që nxisin të menduarit, jo vetëm kujtesën.",
    ],
    levelOverride: 3,
    forceVisuals: false,
  },
  standard: {
    label: "Standard",
    baseHints: [
      "Adaptim standard për nivel mesatar: i qartë, i balancuar, i përshtatshëm për klasën.",
    ],
    forceVisuals: false,
  },
};

/**
 * Group selected students into adaptation cohorts.
 * Students with the same needs share one generated material.
 */
export function buildAdaptationCohorts(
  students: Student[],
  profilesByStudentId: Map<string, LearningProfile | null | undefined>
): AdaptationCohort[] {
  const buckets = new Map<AdaptationCohortKey, string[]>();

  for (const stu of students) {
    const profile = profilesByStudentId.get(stu.id);
    const key = cohortKeyForStudent(stu, profile);
    const list = buckets.get(key) ?? [];
    list.push(stu.id);
    buckets.set(key, list);
  }

  const cohorts: AdaptationCohort[] = [];
  for (const [key, studentIds] of buckets) {
    const meta = COHORT_META[key];
    const extra = new Set<string>();
    for (const sid of studentIds) {
      profileHints(profilesByStudentId.get(sid)).forEach(h => extra.add(h));
    }
    cohorts.push({
      key,
      label: meta.label,
      studentIds,
      learnerHints: [...meta.baseHints, ...Array.from(extra)].slice(0, 12),
      levelOverride: meta.levelOverride,
      forceVisuals: meta.forceVisuals,
    });
  }

  // Stable order for UI / generation
  const order: AdaptationCohortKey[] = [
    "visual-basic",
    "visual",
    "audio-basic",
    "basic",
    "audio",
    "advanced",
    "standard",
  ];
  cohorts.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return cohorts;
}
