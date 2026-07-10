import {
  MOCK_MATERIALS,
  MOCK_ASSIGNMENTS,
  MOCK_STUDENTS,
  MOCK_CLASSES,
} from "./mockData";
import type { Material, Assignment, Student, ClassGroup } from "./types";

const KEYS = {
  materials: "lexolehte_materials_v1",
  assignments: "lexolehte_assignments_v1",
  students: "lexolehte_students_v1",
  classes: "lexolehte_classes_v1",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Seed once from mock data, then always use localStorage. */
export function getMaterials(): Material[] {
  return load(KEYS.materials, MOCK_MATERIALS);
}

export function setMaterials(materials: Material[]) {
  save(KEYS.materials, materials);
}

export function getAssignments(): Assignment[] {
  return load(KEYS.assignments, MOCK_ASSIGNMENTS);
}

export function setAssignments(assignments: Assignment[]) {
  save(KEYS.assignments, assignments);
}

export function getStudents(): Student[] {
  return load(KEYS.students, MOCK_STUDENTS);
}

export function setStudents(students: Student[]) {
  save(KEYS.students, students);
}

export function getClasses(): ClassGroup[] {
  return load(KEYS.classes, MOCK_CLASSES);
}

export function setClasses(classes: ClassGroup[]) {
  save(KEYS.classes, classes);
}

/** Normalize class labels like "Klasa VI-1" / "VI-1". */
export function normalizeClassName(name: string): string {
  return name.replace(/^Klasa\s+/i, "").trim();
}

export function studentsInClass(className: string): Student[] {
  const target = normalizeClassName(className);
  return getStudents().filter(s => normalizeClassName(s.class) === target);
}

/**
 * When a material is published, create one pending assignment
 * for every student in that material's class (if missing).
 */
export function publishMaterialToStudents(material: Material): Assignment[] {
  const students = studentsInClass(material.class);
  const existing = getAssignments();
  const today = new Date().toISOString().split("T")[0];
  const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const created: Assignment[] = [];

  for (const student of students) {
    const already = existing.some(
      a => a.materialId === material.id && a.studentId === student.id
    );
    if (already) continue;

    created.push({
      id: `asgn-${material.id}-${student.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId: material.id,
      studentId: student.id,
      deadline,
      startDate: today,
      allowRetry: true,
      showAnswers: true,
      enableAudio: true,
      status: "pending",
      attempts: 0,
    });
  }

  if (created.length > 0) {
    setAssignments([...created, ...existing]);
  }

  // Update material stats
  const materials = getMaterials().map(m =>
    m.id === material.id
      ? { ...m, status: "published" as const, studentCount: students.length }
      : m
  );
  setMaterials(materials);

  return created;
}
