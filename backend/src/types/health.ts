export type HeartRateSample = {
  bpm: number;
  timestamp: number;
};

export type HealthPayload = {
  userId: string;
  heartRate?: HeartRateSample;
  source: 'watch' | 'phone' | 'manual';
};


