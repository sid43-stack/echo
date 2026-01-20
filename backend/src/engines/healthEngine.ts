import { HealthPayload, HeartRateSample } from '../types/health';

export type HealthSignal = 'baseline_set' | 'normal' | 'elevated' | 'low';

type HealthState = {
  baselineBpm: number | null;
  lastSample?: HeartRateSample;
};

const healthStateByUser: Map<string, HealthState> = new Map();

export const getOrCreateHealthState = (userId: string): HealthState => {
  let state = healthStateByUser.get(userId);
  if (!state) {
    state = { baselineBpm: null };
    healthStateByUser.set(userId, state);
  }
  return state;
};

export const processHealthPayload = (payload: HealthPayload): HealthSignal => {
  const { userId, heartRate } = payload;
  const state = getOrCreateHealthState(userId);

  if (!heartRate) {
    return 'normal';
  }

  state.lastSample = heartRate;

  if (state.baselineBpm === null) {
    state.baselineBpm = heartRate.bpm;
    return 'baseline_set';
  }

  const baseline = state.baselineBpm;
  const bpm = heartRate.bpm;

  if (bpm > baseline + 15) {
    return 'elevated';
  }

  if (bpm < baseline - 15) {
    return 'low';
  }

  return 'normal';
};


