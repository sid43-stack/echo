import { checkSessionActive } from './sessionEngine';

/**
 * Safety state returned after pre-AI checks.
 * No therapy language or escalation logic — simple pass/fail and reason.
 */
export type SafetyState = {
  safe: boolean;
  reason?: string;
  paused?: boolean;
};

/** Keywords that trigger an unsafe result (distress / abuse). Simple scan only. */
const UNSAFE_KEYWORDS = [
  'suicide',
  'kill myself',
  'self-harm',
  'abuse',
  'threaten',
  'violence',
];

function normalizeForScan(text: string): string {
  return text.toLowerCase().trim();
}

function containsUnsafeKeyword(text: string): boolean {
  const normalized = normalizeForScan(text);
  return UNSAFE_KEYWORDS.some((kw) => normalized.includes(kw));
}

/**
 * Perform simple pre-AI checks: session pause flag and keyword scan.
 * Returns a safety state object. Callers should abort AI flow if !safe.
 *
 * @param text - User input to check
 * @param sessionId - Optional; if provided, session pause is checked
 */
export const checkInput = (text: string, sessionId?: string): SafetyState => {
  if (sessionId !== undefined) {
    const active = checkSessionActive(sessionId);
    if (!active) {
      return { safe: false, reason: 'session paused or inactive', paused: true };
    }
  }

  if (containsUnsafeKeyword(text)) {
    return { safe: false, reason: 'input flagged by keyword scan' };
  }

  return { safe: true };
};
