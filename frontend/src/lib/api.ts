import { getAccessToken } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, error: ApiErrorShape) {
    super(error.message);
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}

/**
 * Sanitizes user text inputs on the client before sending to the backend or rendering.
 * Strips null bytes and HTML angle-bracket tags to prevent reflected injection.
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  return input
    .replace(/\0/g, '')
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates external resource URLs so only safe https:// or http:// links can be opened.
 * Blocks javascript:, data:, and vbscript: URLs.
 */
export function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Centralized fetch wrapper that:
 * - Attaches Authorization: Bearer <Supabase JWT>
 * - Enforces a 15s request timeout (AbortController)
 * - Handles 401 (Session Expired) and 403 (Admin Guard) consistently
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 15000, headers, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = await getAccessToken();
    const mergedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    if (token) {
      mergedHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: 'omit', // JWT is passed explicitly in Authorization header
    });

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('learnova:session-expired'));
      throw new ApiClientError(401, {
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Please log in again.',
      });
    }

    if (response.status === 403) {
      window.dispatchEvent(new CustomEvent('learnova:forbidden'));
      throw new ApiClientError(403, {
        code: 'FORBIDDEN',
        message: "You don't have permission to view this page.",
      });
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errShape: ApiErrorShape = data?.error || {
        code: 'API_ERROR',
        message: response.statusText || 'Request failed',
      };
      throw new ApiClientError(response.status, errShape);
    }

    return data as T;
  } finally {
    clearTimeout(timer);
  }
}
