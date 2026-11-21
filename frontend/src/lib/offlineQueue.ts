import type { ConfidenceLevel } from '../data/mockData';

export interface QueuedAnswerPayload {
  clientId: string;
  assessmentId: string;
  questionId: string;
  answer: 'A' | 'B' | 'C' | 'D' | string;
  confidence: ConfidenceLevel;
  responseMs: number;
  revisions: number;
  queuedAt: string;
}

const STORAGE_KEY = 'learnova_offline_answer_queue_v1';

/**
 * Generates an idempotent UUID v4 client_id for every answer submission (NFR04).
 * Ensures offline retries never double-count an answer on the backend.
 */
export function createClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getQueuedAnswers(): QueuedAnswerPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueueAnswer(payload: QueuedAnswerPayload): void {
  const existing = getQueuedAnswers().filter((item) => item.clientId !== payload.clientId);
  existing.push(payload);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}

export function removeQueuedAnswer(clientId: string): void {
  const filtered = getQueuedAnswers().filter((item) => item.clientId !== clientId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
}
