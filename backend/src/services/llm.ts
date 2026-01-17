/**
 * Mock LLM service
 * Provides calm, non-judgmental responses
 * Interface ready for future OpenAI integration
 */

/**
 * Mock response templates
 * Short, calm responses that acknowledge without judgment
 */
const responseTemplates = [
  "I might be wrong, but it sounds like something's been on your mind.",
  "We can pause for a moment if that feels helpful.",
  "That makes sense to me.",
  "I'm here with you.",
  "Take your time.",
  "I hear you.",
  "That sounds like it matters to you.",
  "I'm listening.",
  "Thank you for sharing that.",
  "I understand.",
];

/**
 * Generate a mock AI response based on input
 * @param input - User's message
 * @returns Calm, generic response
 */
export const generateResponse = (input: string): string => {
  // Simple mock: select response based on input length/hash
  // In production, this will call OpenAI API
  const hash = input.length % responseTemplates.length;
  return responseTemplates[hash];
};

