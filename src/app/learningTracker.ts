import type { LearningEvent, LearningEventType } from "./types";

const EVENTS_KEY = "mesolehte_learning_events_v1";
const SESSION_START_KEY = "mesolehte_session_start_v1";

function loadEvents(): LearningEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LearningEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: LearningEvent[]) {
  // Keep last 500 events to avoid unbounded growth
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-500)));
}

export function trackLearningEvent(input: {
  studentId: string;
  materialId: string;
  assignmentId?: string;
  type: LearningEventType;
  detail?: string;
}): LearningEvent {
  const event: LearningEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    studentId: input.studentId,
    materialId: input.materialId,
    assignmentId: input.assignmentId,
    type: input.type,
    detail: input.detail,
    createdAt: new Date().toISOString(),
  };
  const all = loadEvents();
  all.push(event);
  saveEvents(all);
  return event;
}

export function getEventsForSession(studentId: string, materialId: string): LearningEvent[] {
  return loadEvents().filter(e => e.studentId === studentId && e.materialId === materialId);
}

export function countEvents(
  studentId: string,
  materialId: string,
  type: LearningEventType
): number {
  return getEventsForSession(studentId, materialId).filter(e => e.type === type).length;
}

export function markSessionStart(studentId: string, materialId: string) {
  const key = `${studentId}:${materialId}`;
  const map = loadSessionStarts();
  if (!map[key]) {
    map[key] = Date.now();
    localStorage.setItem(SESSION_START_KEY, JSON.stringify(map));
  }
}

export function getSessionMinutes(studentId: string, materialId: string): number {
  const key = `${studentId}:${materialId}`;
  const map = loadSessionStarts();
  const start = map[key];
  if (!start) return 5;
  const mins = Math.max(1, Math.round((Date.now() - start) / 60000));
  return Math.min(mins, 120);
}

function loadSessionStarts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SESSION_START_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function getAllLearningEvents(): LearningEvent[] {
  return loadEvents();
}

export function clearSessionStart(studentId: string, materialId: string) {
  const key = `${studentId}:${materialId}`;
  const map = loadSessionStarts();
  delete map[key];
  localStorage.setItem(SESSION_START_KEY, JSON.stringify(map));
}
