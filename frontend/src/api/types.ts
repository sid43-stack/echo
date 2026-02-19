/**
 * API response types aligned with backend (read-only mirror).
 * Backend routes/schemas are final; these types are for frontend typing only.
 */

/** Chat message from backend (POST /chat/send, GET /chat/history) */
export interface ApiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

/** Response from POST /chat/send */
export interface ApiChatSendResponse {
  userMessage: ApiChatMessage;
  assistantMessage: ApiChatMessage;
  healthAlert?: boolean; // True if abnormal health patterns detected
}

/** Call session from backend (POST /call/start, POST /call/end, GET /call/status/:callId) */
export interface ApiCallSession {
  id: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
}

/** Call log entry (GET /call/logs) */
export interface ApiCallLog {
  id: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

/** Health metric from backend (GET /health/history) */
export interface ApiHealthMetric {
  id: string;
  heartRate: number;
  steps: number | null;
  source: string;
  recordedAt: string;
}

/** Health checkpoint with extended data (POST /health/checkpoint, GET /health/history) */
export interface ApiHealthCheckpoint {
  id: string;
  heartRate: number;
  steps: number | null;
  sleepHours: number | null;
  moodScore: number | null;
  source: string;
  recordedAt: string;
}

/** Response from POST /health/checkpoint */
export interface ApiHealthCheckpointResponse {
  ok: boolean;
  checkpoint?: ApiHealthCheckpoint;
  error?: string;
}

/** Health trend analysis response (GET /health/analysis) */
export interface ApiHealthAnalysis {
  avgHeartRate: number;
  abnormalSpikes: boolean;
  stepDecline: boolean;
  lowSleep: boolean;
  moodTrend: 'improving' | 'declining' | 'stable' | 'unknown';
  summary: string;
}

/** Response from POST /health/ingest */
export interface ApiHealthIngestResponse {
  ok: boolean;
  stored?: ApiHealthMetric;
  warning?: string;
}

/** Response from GET /system/health */
export interface ApiSystemHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  db: 'connected' | 'unreachable';
}

/** API error payload (backend 4xx/5xx JSON) */
export interface ApiErrorBody {
  error?: string;
  ok?: boolean;
  paused?: boolean;
}
