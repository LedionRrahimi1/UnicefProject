import type { Assignment, ClassGroup, Material, Student, StudentBadge, User, UserRole, XPTransaction } from "./types";
import { createEphemeralAuthClient, getSupabase } from "./supabase";

/** DB row shape (snake_case) for public.materials */
type MaterialRow = {
  id: string;
  title: string;
  subject: string;
  class: string;
  original_text: string;
  simplified_text: string;
  summary: string;
  key_points: unknown;
  vocabulary: unknown;
  quiz: unknown;
  english_text: string;
  teacher_notes: string;
  illustrations: unknown;
  status: Material["status"];
  created_at: string;
  student_count: number;
  completion_rate: number;
  estimated_minutes: number;
  target_student_ids: unknown;
  adaptation_group_id: string | null;
  adaptation_key: string | null;
  adaptation_label: string | null;
  audio_enabled: boolean | null;
  enabled_sections: unknown;
  teacher_id?: string | null;
};

type AssignmentRow = {
  id: string;
  material_id: string;
  student_id: string;
  deadline: string | null;
  start_date: string | null;
  allow_retry: boolean;
  show_answers: boolean;
  enable_audio: boolean;
  message: string | null;
  status: Assignment["status"];
  score: number | null;
  completed_at: string | null;
  time_spent_minutes: number | null;
  words_opened: number | null;
  audio_used: boolean | null;
  attempts: number;
};

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function rowToMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    title: row.title ?? "",
    subject: row.subject ?? "",
    class: row.class ?? "",
    originalText: row.original_text ?? "",
    simplifiedText: row.simplified_text ?? "",
    summary: row.summary ?? "",
    keyPoints: asArray<string>(row.key_points),
    vocabulary: asArray(row.vocabulary),
    quiz: asArray(row.quiz),
    englishText: row.english_text ?? "",
    teacherNotes: row.teacher_notes ?? "",
    illustrations: asArray<string>(row.illustrations),
    status: row.status ?? "draft",
    createdAt: row.created_at ?? new Date().toISOString().split("T")[0],
    studentCount: row.student_count ?? 0,
    completionRate: row.completion_rate ?? 0,
    estimatedMinutes: row.estimated_minutes ?? 15,
    targetStudentIds: Array.isArray(row.target_student_ids)
      ? (row.target_student_ids as string[])
      : undefined,
    adaptationGroupId: row.adaptation_group_id ?? undefined,
    adaptationKey: row.adaptation_key ?? undefined,
    adaptationLabel: row.adaptation_label ?? undefined,
    audioEnabled: row.audio_enabled ?? undefined,
    enabledSections: (row.enabled_sections as Material["enabledSections"]) ?? undefined,
    teacherId: row.teacher_id ?? undefined,
  };
}

export function materialToRow(mat: Material): MaterialRow {
  return {
    id: mat.id,
    title: mat.title,
    subject: mat.subject,
    class: mat.class,
    original_text: mat.originalText,
    simplified_text: mat.simplifiedText,
    summary: mat.summary,
    key_points: mat.keyPoints ?? [],
    vocabulary: mat.vocabulary ?? [],
    quiz: mat.quiz ?? [],
    english_text: mat.englishText ?? "",
    teacher_notes: mat.teacherNotes ?? "",
    illustrations: mat.illustrations ?? [],
    status: mat.status,
    created_at: mat.createdAt,
    student_count: mat.studentCount ?? 0,
    completion_rate: mat.completionRate ?? 0,
    estimated_minutes: mat.estimatedMinutes ?? 15,
    target_student_ids: mat.targetStudentIds ?? null,
    adaptation_group_id: mat.adaptationGroupId ?? null,
    adaptation_key: mat.adaptationKey ?? null,
    adaptation_label: mat.adaptationLabel ?? null,
    audio_enabled: mat.audioEnabled ?? null,
    enabled_sections: mat.enabledSections ?? null,
    teacher_id: mat.teacherId ?? null,
  };
}

export function rowToAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    materialId: row.material_id,
    studentId: row.student_id,
    deadline: row.deadline ?? "",
    startDate: row.start_date ?? "",
    allowRetry: row.allow_retry,
    showAnswers: row.show_answers,
    enableAudio: row.enable_audio,
    message: row.message ?? undefined,
    status: row.status,
    score: row.score ?? undefined,
    completedAt: row.completed_at ?? undefined,
    timeSpentMinutes: row.time_spent_minutes ?? undefined,
    wordsOpened: row.words_opened ?? undefined,
    audioUsed: row.audio_used ?? undefined,
    attempts: row.attempts ?? 0,
  };
}

export function assignmentToRow(a: Assignment): AssignmentRow {
  return {
    id: a.id,
    material_id: a.materialId,
    student_id: a.studentId,
    deadline: a.deadline || null,
    start_date: a.startDate || null,
    allow_retry: a.allowRetry,
    show_answers: a.showAnswers,
    enable_audio: a.enableAudio,
    message: a.message ?? null,
    status: a.status,
    score: a.score ?? null,
    completed_at: a.completedAt ?? null,
    time_spent_minutes: a.timeSpentMinutes ?? null,
    words_opened: a.wordsOpened ?? null,
    audio_used: a.audioUsed ?? null,
    attempts: a.attempts ?? 0,
  };
}

function throwSb(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

// ── Materials API ─────────────────────────────────────────────────────────────

export async function sbGetMaterials(): Promise<Material[]> {
  const { data, error } = await getSupabase()
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throwSb(error, "Nuk u lexuan materialet nga Supabase.");
  return (data as MaterialRow[]).map(rowToMaterial);
}

export async function sbGetMaterialById(id: string): Promise<Material | undefined> {
  const { data, error } = await getSupabase()
    .from("materials")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwSb(error, "Nuk u gjet materiali.");
  return data ? rowToMaterial(data as MaterialRow) : undefined;
}

export async function sbUpsertMaterial(mat: Material): Promise<Material> {
  const row = materialToRow(mat);
  const { data, error } = await getSupabase()
    .from("materials")
    .upsert({ ...row, updated_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) throwSb(error, "Nuk u ruajt materiali në Supabase.");
  return rowToMaterial(data as MaterialRow);
}

export async function sbDeleteMaterial(id: string): Promise<void> {
  const { error } = await getSupabase().from("materials").delete().eq("id", id);
  if (error) throwSb(error, "Nuk u fshi materiali.");
}

// ── Assignments API (needed for publish) ──────────────────────────────────────

export async function sbGetAssignments(): Promise<Assignment[]> {
  const { data, error } = await getSupabase().from("assignments").select("*");
  if (error) throwSb(error, "Nuk u lexuan detyrat.");
  return (data as AssignmentRow[]).map(rowToAssignment);
}

export async function sbGetAssignmentsForStudent(studentId: string): Promise<Assignment[]> {
  const { data, error } = await getSupabase()
    .from("assignments")
    .select("*")
    .eq("student_id", studentId)
    .order("start_date", { ascending: false });
  if (error) throwSb(error, "Nuk u lexuan detyrat e nxënësit.");
  return (data as AssignmentRow[]).map(rowToAssignment);
}

export async function sbUpsertAssignments(list: Assignment[]): Promise<void> {
  if (list.length === 0) return;
  const rows = list.map(assignmentToRow);
  const { error } = await getSupabase().from("assignments").upsert(rows);
  if (error) throwSb(error, "Nuk u ruajtën detyrat.");
}

export async function sbGetAssignmentById(id: string): Promise<Assignment | undefined> {
  const { data, error } = await getSupabase()
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwSb(error, "Nuk u gjet detyra.");
  return data ? rowToAssignment(data as AssignmentRow) : undefined;
}

export async function sbDeleteAssignmentsForMaterial(materialId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("assignments")
    .delete()
    .eq("material_id", materialId);
  if (error) throwSb(error, "Nuk u fshinë detyrat e materialit.");
}

// ── Profiles / Auth helpers ───────────────────────────────────────────────────

type ProfileRow = {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  class: string | null;
};

export async function sbGetProfile(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throwSb(error, "Nuk u lexua profili.");
  if (!data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    name: row.name || row.email || "Përdorues",
    email: row.email || "",
    role: row.role,
    class: row.class ?? undefined,
  };
}

export async function sbUpsertProfile(user: User): Promise<void> {
  const { error } = await getSupabase().from("profiles").upsert({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    class: user.class ?? null,
  });
  if (error) throwSb(error, "Nuk u ruajt profili.");
}

export async function sbRegisterTeacher(name: string, email: string, password: string): Promise<User> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim(), role: "teacher" } },
  });
  if (error) throwSb(error, "Regjistrimi i mësuesit dështoi.");
  if (!data.user) throw new Error("Regjistrimi dështoi — kontrollo Auth settings (Confirm email).");

  const user: User = {
    id: data.user.id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: "teacher",
  };
  await sbUpsertProfile(user);
  return user;
}

export async function sbSignIn(email: string, password: string): Promise<User> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throwSb(error, "Email ose fjalëkalimi është i gabuar.");
  if (!data.user) throw new Error("Hyrja dështoi.");

  let profile = await sbGetProfile(data.user.id);
  if (!profile) {
    const meta = data.user.user_metadata ?? {};
    const metaRole = meta.role === "student" || meta.role === "teacher" ? meta.role : null;
    if (!metaRole) {
      throw new Error(
        "Profili mungon. Në Supabase SQL ekzekuto: insert into profiles (id, email, name, role) values ('" +
          data.user.id +
          "', '" +
          (data.user.email ?? "") +
          "', 'Emri', 'student');"
      );
    }
    profile = {
      id: data.user.id,
      name: (meta.name as string) || data.user.email || "Përdorues",
      email: data.user.email || email,
      role: metaRole,
      class: meta.class as string | undefined,
    };
    await sbUpsertProfile(profile);
  }
  return enrichUserFromRoster(profile);
}

/** Keep profile.class in sync with the students roster row. */
export async function enrichUserFromRoster(user: User): Promise<User> {
  if (user.role !== "student") return user;
  try {
    const stu = await sbGetStudentById(user.id);
    if (!stu) return user;
    if (user.class === stu.class) return { ...user, class: stu.class };
    const next: User = { ...user, class: stu.class };
    await sbUpsertProfile(next);
    return next;
  } catch {
    return user;
  }
}

export async function sbSignOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

export async function sbGetSessionUser(): Promise<User | null> {
  const { data } = await getSupabase().auth.getSession();
  if (!data.session?.user) return null;
  const profile = await sbGetProfile(data.session.user.id);
  if (!profile) return null;
  return enrichUserFromRoster(profile);
}

function randomJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Classes ───────────────────────────────────────────────────────────────────

type ClassRow = {
  id: string;
  teacher_id: string;
  name: string;
  join_code: string;
};

export function rowToClass(row: ClassRow, extras?: Partial<ClassGroup>): ClassGroup {
  return {
    id: row.id,
    name: row.name,
    teacherId: row.teacher_id,
    joinCode: row.join_code,
    studentCount: extras?.studentCount ?? 0,
    activeMaterials: extras?.activeMaterials ?? 0,
    averageScore: extras?.averageScore ?? 0,
  };
}

export async function sbGetClassesForTeacher(teacherId: string): Promise<ClassGroup[]> {
  const { data, error } = await getSupabase()
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: true });
  if (error) throwSb(error, "Nuk u lexuan klasat.");
  const classes = (data as ClassRow[]).map(r => rowToClass(r));
  const students = await sbGetStudentsForTeacher(teacherId);
  let mats: Material[] = [];
  try {
    mats = await sbGetMaterials();
  } catch {
    mats = [];
  }

  return classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    const classNameNorm = normalizeLoose(c.name);
    const classMats = mats.filter(
      m => normalizeLoose(m.class) === classNameNorm && m.status === "published"
    );
    return {
      ...c,
      studentCount: classStudents.length,
      activeMaterials: classMats.length,
      averageScore: c.averageScore,
    };
  });
}

function normalizeLoose(name: string): string {
  return name.replace(/^klasa\s+/i, "").trim().toLowerCase();
}

export async function sbCreateClass(teacherId: string, name: string): Promise<ClassGroup> {
  const clean = name.trim();
  if (!clean) throw new Error("Emri i klasës është i detyrueshëm.");
  const id = `cls-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const join_code = randomJoinCode();
  const { data, error } = await getSupabase()
    .from("classes")
    .insert({ id, teacher_id: teacherId, name: clean, join_code })
    .select("*")
    .single();
  if (error) throwSb(error, "Nuk u krijua klasa.");
  return rowToClass(data as ClassRow);
}

export async function sbGetClassByJoinCode(code: string): Promise<ClassRow | null> {
  const { data, error } = await getSupabase()
    .from("classes")
    .select("*")
    .eq("join_code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) throwSb(error, "Nuk u gjet klasa.");
  return data as ClassRow | null;
}

export async function sbGetClassById(id: string): Promise<ClassRow | null> {
  const { data, error } = await getSupabase()
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwSb(error, "Nuk u gjet klasa.");
  return data as ClassRow | null;
}

// ── Students ──────────────────────────────────────────────────────────────────

type StudentRow = {
  id: string;
  teacher_id: string;
  class_id: string;
  name: string;
  email: string;
  class_name: string;
  age: number;
  reading_level: string;
  score: number;
  completed_materials: number;
  status: Student["status"];
  preferred_font: string;
  audio_enabled: boolean;
  visual_preferred: boolean;
  language: string;
};

export function rowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    class: row.class_name,
    classId: row.class_id,
    teacherId: row.teacher_id,
    age: row.age,
    readingLevel: row.reading_level,
    score: row.score,
    completedMaterials: row.completed_materials,
    status: row.status,
    preferredFont: row.preferred_font,
    audioEnabled: row.audio_enabled,
    visualPreferred: row.visual_preferred,
    language: row.language,
  };
}

export async function sbGetStudentsForTeacher(teacherId: string): Promise<Student[]> {
  const { data, error } = await getSupabase()
    .from("students")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throwSb(error, "Nuk u lexuan nxënësit.");
  return (data as StudentRow[]).map(rowToStudent);
}

export async function sbGetStudentsByClassId(classId: string): Promise<Student[]> {
  const { data, error } = await getSupabase()
    .from("students")
    .select("*")
    .eq("class_id", classId)
    .order("name", { ascending: true });
  if (error) throwSb(error, "Nuk u lexuan nxënësit e klasës.");
  return (data as StudentRow[]).map(rowToStudent);
}

export async function sbGetStudentsByClassName(className: string): Promise<Student[]> {
  const { data, error } = await getSupabase().from("students").select("*");
  if (error) throwSb(error, "Nuk u lexuan nxënësit.");
  const norm = normalizeLoose(className);
  return (data as StudentRow[])
    .map(rowToStudent)
    .filter(s => normalizeLoose(s.class) === norm);
}

export async function sbGetStudentById(id: string): Promise<Student | undefined> {
  const { data, error } = await getSupabase()
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwSb(error, "Nuk u gjet nxënësi.");
  return data ? rowToStudent(data as StudentRow) : undefined;
}

export async function sbCreateStudentAccount(input: {
  teacherId: string;
  classId: string;
  name: string;
  email: string;
  password: string;
  age: number;
  readingLevel?: string;
  audioEnabled?: boolean;
  visualPreferred?: boolean;
}): Promise<Student> {
  const cls = await sbGetClassById(input.classId);
  if (!cls) throw new Error("Klasa nuk u gjet.");
  if (cls.teacher_id !== input.teacherId) throw new Error("Nuk ke të drejtë mbi këtë klasë.");

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name) throw new Error("Emri i nxënësit është i detyrueshëm.");
  if (!email.includes("@")) throw new Error("Email i pavlefshëm.");
  if (input.password.length < 6) throw new Error("Fjalëkalimi duhet të ketë së paku 6 karaktere.");

  const ephemeral = createEphemeralAuthClient();
  const { data, error } = await ephemeral.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        name,
        role: "student",
        class: cls.name.replace(/^Klasa\s+/i, ""),
      },
    },
  });
  if (error) throwSb(error, "Nuk u krijua llogaria e nxënësit.");
  if (!data.user) {
    throw new Error(
      "Llogaria nuk u krijua. Çaktivizo 'Confirm email' te Supabase → Authentication → Providers → Email."
    );
  }

  const userId = data.user.id;
  const className = cls.name.replace(/^Klasa\s+/i, "").trim() || cls.name;

  await sbUpsertProfile({
    id: userId,
    name,
    email,
    role: "student",
    class: className,
  });

  const row = {
    id: userId,
    teacher_id: input.teacherId,
    class_id: input.classId,
    name,
    email,
    class_name: className,
    age: input.age,
    reading_level: input.readingLevel || "Mesatar",
    score: 0,
    completed_materials: 0,
    status: "active" as const,
    preferred_font: "lexend",
    audio_enabled: input.audioEnabled ?? true,
    visual_preferred: input.visualPreferred ?? false,
    language: "sq",
  };

  const { data: inserted, error: insErr } = await getSupabase()
    .from("students")
    .insert(row)
    .select("*")
    .single();
  if (insErr) throwSb(insErr, "Llogaria u krijua, por profili i nxënësit nuk u ruajt.");
  return rowToStudent(inserted as StudentRow);
}

export async function sbRegisterStudentAccount(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Emri është i detyrueshëm.");
  if (password.length < 6) throw new Error("Fjalëkalimi duhet të ketë së paku 6 karaktere.");

  const sb = getSupabase();
  const { data, error } = await sb.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { name: cleanName, role: "student" } },
  });
  if (error) throwSb(error, "Regjistrimi i nxënësit dështoi.");
  if (!data.user) {
    throw new Error(
      "Regjistrimi dështoi. Çaktivizo 'Confirm email' te Supabase Auth settings."
    );
  }

  const user: User = {
    id: data.user.id,
    name: cleanName,
    email: cleanEmail,
    role: "student",
  };
  await sbUpsertProfile(user);
  return user;
}

export async function sbJoinClassWithCode(
  userId: string,
  joinCode: string,
  extras?: { age?: number }
): Promise<{ student: Student; user: User }> {
  const cls = await sbGetClassByJoinCode(joinCode);
  if (!cls) throw new Error("Kodi i klasës nuk është i saktë.");

  const existing = await sbGetStudentById(userId);
  if (existing) {
    throw new Error("Je tashmë i regjistruar në një klasë.");
  }

  const profile = await sbGetProfile(userId);
  if (!profile) throw new Error("Profili nuk u gjet. Hyr përsëri.");
  if (profile.role !== "student") {
    throw new Error("Vetëm nxënësit mund të bashkohen në klasë me kod.");
  }

  const className = cls.name.replace(/^Klasa\s+/i, "").trim() || cls.name;
  const row = {
    id: userId,
    teacher_id: cls.teacher_id,
    class_id: cls.id,
    name: profile.name,
    email: profile.email,
    class_name: className,
    age: extras?.age ?? 12,
    reading_level: "Mesatar",
    score: 0,
    completed_materials: 0,
    status: "active" as const,
    preferred_font: "lexend",
    audio_enabled: true,
    visual_preferred: false,
    language: "sq",
  };

  const { data, error } = await getSupabase()
    .from("students")
    .insert(row)
    .select("*")
    .single();
  if (error) throwSb(error, "Nuk u bashkove me klasën.");

  const user: User = { ...profile, class: className };
  await sbUpsertProfile(user);
  return { student: rowToStudent(data as StudentRow), user };
}

/** Optional: register + join in one step if joinCode provided. */
export async function sbRegisterStudentSelf(input: {
  name: string;
  email: string;
  password: string;
  joinCode?: string;
  age?: number;
}): Promise<User> {
  const user = await sbRegisterStudentAccount(input.name, input.email, input.password);
  if (input.joinCode?.trim()) {
    const { user: joined } = await sbJoinClassWithCode(user.id, input.joinCode, { age: input.age });
    return joined;
  }
  return user;
}

export async function sbUpdateStudent(id: string, patch: Partial<Student>): Promise<Student | undefined> {
  const current = await sbGetStudentById(id);
  if (!current) return undefined;
  const next = { ...current, ...patch, id };
  const { data, error } = await getSupabase()
    .from("students")
    .update({
      name: next.name,
      age: next.age,
      reading_level: next.readingLevel,
      score: next.score,
      completed_materials: next.completedMaterials,
      status: next.status,
      preferred_font: next.preferredFont,
      audio_enabled: next.audioEnabled,
      visual_preferred: next.visualPreferred,
      language: next.language,
      class_name: next.class,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throwSb(error, "Nuk u përditësua nxënësi.");
  return rowToStudent(data as StudentRow);
}

// ── Gamification (XP + badges) ────────────────────────────────────────────────

type XpRow = {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  source_type: XPTransaction["sourceType"];
  source_id: string | null;
  awarded_by: XPTransaction["awardedBy"];
  teacher_id: string | null;
  created_at: string;
};

type BadgeEarnRow = {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
  awarded_by: StudentBadge["awardedBy"];
  teacher_id: string | null;
  teacher_message: string | null;
};

function rowToXp(row: XpRow): XPTransaction {
  return {
    id: row.id,
    studentId: row.student_id,
    amount: row.amount,
    reason: row.reason,
    sourceType: row.source_type,
    sourceId: row.source_id ?? undefined,
    awardedBy: row.awarded_by,
    teacherId: row.teacher_id ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToStudentBadge(row: BadgeEarnRow): StudentBadge {
  return {
    id: row.id,
    studentId: row.student_id,
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
    awardedBy: row.awarded_by,
    teacherId: row.teacher_id ?? undefined,
    teacherMessage: row.teacher_message ?? undefined,
  };
}

export async function sbGetXpForStudent(studentId: string): Promise<XPTransaction[]> {
  const { data, error } = await getSupabase()
    .from("xp_transactions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) {
    // Table missing / not migrated yet — don't break the whole student dashboard
    console.warn("[xp]", error.message);
    return [];
  }
  return (data as XpRow[]).map(rowToXp);
}

export async function sbInsertXp(tx: XPTransaction): Promise<void> {
  const { error } = await getSupabase().from("xp_transactions").insert({
    id: tx.id,
    student_id: tx.studentId,
    amount: tx.amount,
    reason: tx.reason,
    source_type: tx.sourceType,
    source_id: tx.sourceId ?? null,
    awarded_by: tx.awardedBy,
    teacher_id: tx.teacherId ?? null,
    created_at: tx.createdAt,
  });
  if (error) throwSb(error, "Nuk u ruajtën yjet.");
}

export async function sbGetBadgesForStudent(studentId: string): Promise<StudentBadge[]> {
  const { data, error } = await getSupabase()
    .from("student_badges")
    .select("*")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false });
  if (error) {
    console.warn("[badges]", error.message);
    return [];
  }
  return (data as BadgeEarnRow[]).map(rowToStudentBadge);
}

export async function sbInsertStudentBadge(badge: StudentBadge): Promise<void> {
  const { error } = await getSupabase().from("student_badges").upsert({
    id: badge.id,
    student_id: badge.studentId,
    badge_id: badge.badgeId,
    earned_at: badge.earnedAt,
    awarded_by: badge.awardedBy,
    teacher_id: badge.teacherId ?? null,
    teacher_message: badge.teacherMessage ?? null,
  }, { onConflict: "student_id,badge_id" });
  if (error) throwSb(error, "Nuk u ruajt titulli.");
}
