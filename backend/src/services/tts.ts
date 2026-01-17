/**
 * Mock Text-to-Speech service
 * Converts text to audio buffer
 * Interface ready for real TTS service integration (e.g., OpenAI TTS)
 */

/**
 * Create minimal WAV file buffer
 * Returns a valid but silent WAV file
 */
const createDummyWavBuffer = (): Buffer => {
  // Minimal WAV file structure (44 bytes header + 1 second of silence)
  const sampleRate = 16000;
  const channels = 1;
  const bitsPerSample = 16;
  const duration = 1; // 1 second
  const dataSize = sampleRate * channels * (bitsPerSample / 8) * duration;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28); // byte rate
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  // Audio data remains zeros (silence)

  return buffer;
};

/**
 * Convert text to audio buffer
 * @param text - Text to convert to speech
 * @returns Audio buffer (WAV format)
 */
export const textToSpeech = async (text: string): Promise<Buffer> => {
  // Mock implementation: return dummy WAV buffer
  // In production, this will call real TTS service (e.g., OpenAI TTS)
  return createDummyWavBuffer();
};

