/**
 * Time utility functions
 */

/**
 * Get current timestamp as ISO string
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get current Unix timestamp in seconds
 */
export const getUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Calculate duration in seconds between two dates
 */
export const calculateDurationSeconds = (start: Date, end: Date): number => {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
};
