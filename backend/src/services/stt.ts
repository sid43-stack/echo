/**
 * Mock Speech-to-Text service
 * Converts audio buffer to text
 * Interface ready for real STT service integration (e.g., OpenAI Whisper)
 */

/**
 * Convert audio buffer to text
 * @param audioBuffer - Audio file buffer
 * @returns Transcribed text
 */
export const speechToText = async (audioBuffer: Buffer): Promise<string> => {
  // Mock implementation: return placeholder text
  // In production, this will call real STT service (e.g., OpenAI Whisper)
  return "I am feeling a little tired today";
};

