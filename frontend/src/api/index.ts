/**
 * API connection layer - single entry for frontend → backend.
 * Backend routes are final; this layer only handles requests, loading, and errors.
 */

export { api, ApiError, ApiTimeoutError, ApiNetworkError } from './client';
export { getApiBaseUrl } from './config';
export type {
  ApiChatMessage,
  ApiChatSendResponse,
  ApiCallSession,
  ApiCallLog,
  ApiHealthMetric,
  ApiHealthCheckpoint,
  ApiHealthCheckpointResponse,
  ApiHealthAnalysis,
  ApiHealthIngestResponse,
  ApiSystemHealthResponse,
  ApiErrorBody,
} from './types';
