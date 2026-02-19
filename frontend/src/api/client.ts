/**
 * Single API client layer for frontend → backend.
 * Handles: requests, loading states (caller-managed), error handling, timeouts.
 * Backend APIs are final; this file only connects to them.
 */

import { getApiBaseUrl } from './config';
import type {
  ApiChatMessage,
  ApiChatSendResponse,
  ApiCallSession,
  ApiCallLog,
  ApiHealthMetric,
  ApiHealthIngestResponse,
  ApiSystemHealthResponse,
  ApiErrorBody,
} from './types';

const DEFAULT_TIMEOUT_MS = 30000;
const CHAT_SEND_TIMEOUT_MS = 60000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiTimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

export class ApiNetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Read token from localStorage
  const token = localStorage.getItem('token');

  // Build headers object
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await res.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // non-JSON response
      }
    }

    if (!res.ok) {
      const errBody = json as ApiErrorBody | undefined;
      throw new ApiError(
        errBody?.error ?? `Request failed (${res.status})`,
        res.status,
        errBody
      );
    }

    return (json ?? {}) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new ApiTimeoutError('The request took too long. Please try again.');
      }
      throw new ApiNetworkError(err.message || 'Network error');
    }
    throw new ApiNetworkError('Something went wrong');
  }
}

// --- Auth ---

export const auth = {
  /**
   * Register a new user. Returns user + token, automatically stores token.
   */
  async register(email: string, password: string, name?: string): Promise<{ user: { id: string; email: string; name?: string }; token: string }> {
    if (!email || !password) {
      throw new ApiError('Email and password are required', 400);
    }
    const response = await request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      timeoutMs: 15000,
    });
    // Store token after successful registration
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  /**
   * Login user. Returns user + token, automatically stores token.
   */
  async login(email: string, password: string): Promise<{ user: { id: string; email: string; name?: string }; token: string }> {
    if (!email || !password) {
      throw new ApiError('Email and password are required', 400);
    }
    const response = await request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      timeoutMs: 15000,
    });
    // Store token after successful login
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  /**
   * Logout user. Removes token from localStorage.
   */
  logout(): void {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is logged in (has valid token).
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  },
};

// --- Chat ---

export const chat = {
  /**
   * Send a chat message. Returns user + assistant messages from backend.
   * Handles slow responses via longer timeout; caller should show loading state.
   */
  async send(message: string): Promise<ApiChatSendResponse> {
    if (typeof message !== 'string' || message.trim() === '') {
      throw new ApiError('message is required', 400);
    }
    return request<ApiChatSendResponse>('/chat/send', {
      method: 'POST',
      body: { message: message.trim() },
      timeoutMs: CHAT_SEND_TIMEOUT_MS,
    });
  },

  /**
   * Get chat history. Returns empty array on error or empty backend response.
   */
  async history(limit: number = 20): Promise<ApiChatMessage[]> {
    const path = `/chat/history?limit=${Math.max(1, Math.min(100, limit))}`;
    const data = await request<ApiChatMessage[]>(path, { timeoutMs: 15000 });
    return Array.isArray(data) ? data : [];
  },
};

// --- Call ---

export const call = {
  async start(): Promise<ApiCallSession> {
    return request<ApiCallSession>('/call/start', {
      method: 'POST',
      timeoutMs: 15000,
    });
  },

  async end(callId: string): Promise<ApiCallSession> {
    if (typeof callId !== 'string' || callId.trim() === '') {
      throw new ApiError('callId is required', 400);
    }
    return request<ApiCallSession>('/call/end', {
      method: 'POST',
      body: { callId: callId.trim() },
      timeoutMs: 15000,
    });
  },

  async logs(limit: number = 50): Promise<ApiCallLog[]> {
    const path = `/call/logs?limit=${Math.max(1, Math.min(100, limit))}`;
    const data = await request<ApiCallLog[]>(path, { timeoutMs: 15000 });
    return Array.isArray(data) ? data : [];
  },
};

// --- Health ---

export const health = {
  async ingest(heartRate: number, steps?: number | null): Promise<ApiHealthIngestResponse> {
    if (typeof heartRate !== 'number' || !Number.isInteger(heartRate) || heartRate <= 0) {
      throw new ApiError('heartRate must be a positive integer', 400);
    }
    const body: { heartRate: number; steps?: number } = { heartRate };
    if (steps !== undefined && steps !== null) body.steps = steps;
    return request<ApiHealthIngestResponse>('/health/health/ingest', {
      method: 'POST',
      body,
      timeoutMs: 15000,
    });
  },

  async history(limit: number = 50): Promise<ApiHealthMetric[]> {
    const path = `/health/health/history?limit=${Math.max(1, Math.min(100, limit))}`;
    const data = await request<ApiHealthMetric[]>(path, { timeoutMs: 15000 });
    return Array.isArray(data) ? data : [];
  },
};

// --- System ---

export const system = {
  async health(): Promise<ApiSystemHealthResponse> {
    return request<ApiSystemHealthResponse>('/system/health', { timeoutMs: 10000 });
  },
};

// --- User State ---

export interface UserStateRecord {
  id: string;
  userId: string;
  lastInteractionAt: string;
  conversationStreak: number;
  lastMood: string | null;
  energyLevel: string | null;
  lastSummary: string | null;
  preferredMode: string | null;
  updatedAt: string;
}

export interface ConversationReflection {
  id: string;
  userId: string;
  createdAt: string;
  reflection: string;
}

export const userState = {
  async me(): Promise<UserStateRecord> {
    return request<UserStateRecord>('/user-state/me', { timeoutMs: 10000 });
  },

  async updateSummary(data: {
    mood: string;
    energy: string;
    summary: string;
    preferredMode: 'chat' | 'voice';
  }): Promise<UserStateRecord> {
    return request<UserStateRecord>('/user-state/update-summary', {
      method: 'POST',
      body: data,
      timeoutMs: 15000,
    });
  },

  async reflections(): Promise<ConversationReflection[]> {
    const data = await request<ConversationReflection[]>('/user-state/reflections', {
      timeoutMs: 10000,
    });
    return Array.isArray(data) ? data : [];
  },
};

// --- Assistant ---

export interface AssistantStatus {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
}

export const assistant = {
  async status(): Promise<AssistantStatus> {
    return request<AssistantStatus>('/assistant/status', { timeoutMs: 5000 });
  },
};

// --- Blockchain ---

export interface BlockchainProof {
  id: string;
  reflectionId: string;
  userId: string;
  recordHash: string;
  transactionId: string | null;
  appId: string | null;
  status: string;
  createdAt: string;
}

export interface BlockchainVerifyResult {
  verified: boolean;
  recordHash: string;
  transactionId: string | null;
  explorerUrl: string | null;
  error?: string;
}

export interface BlockchainStatus {
  enabled: boolean;
  network: string;
  appId: number;
}

export const blockchain = {
  async connectWallet(walletAddress: string): Promise<{ success: boolean; walletAddress: string }> {
    return request('/blockchain/connect-wallet', {
      method: 'POST',
      body: { walletAddress },
    });
  },

  async getWallet(): Promise<{ walletAddress: string | null }> {
    return request('/blockchain/wallet');
  },

  async disconnectWallet(): Promise<{ success: boolean }> {
    return request('/blockchain/disconnect-wallet', { method: 'POST' });
  },

  async getProofs(): Promise<BlockchainProof[]> {
    const data = await request<BlockchainProof[]>('/blockchain/proofs', { timeoutMs: 10000 });
    return Array.isArray(data) ? data : [];
  },

  async verifyProof(proofId: string): Promise<BlockchainVerifyResult> {
    return request<BlockchainVerifyResult>(`/blockchain/verify/${proofId}`, {
      method: 'POST',
      timeoutMs: 15000,
    });
  },

  async retryProof(proofId: string): Promise<{ success: boolean; txId?: string; error?: string }> {
    return request(`/blockchain/retry/${proofId}`, {
      method: 'POST',
      timeoutMs: 30000,
    });
  },

  async status(): Promise<BlockchainStatus> {
    return request<BlockchainStatus>('/blockchain/status');
  },
};

/** Single API surface for frontend */
export const api = {
  auth,
  chat,
  call,
  health,
  system,
  userState,
  assistant,
  blockchain,
};
