/**
 * MOCK AI RESPONSES
 * 
 * In a production app, these would come from an AI backend (e.g., OpenAI, Anthropic).
 * This file simulates the AI's emotional intelligence and response generation.
 * 
 * Each response includes:
 * - reply: The AI's text message
 * - emotion: Detected emotional state (would be ML-classified in production)
 * - driftScore: How "lost" or "drifting" the user feels (0-100)
 * - suggestion: Recommended wellness activity
 */

export interface MockAIResponse {
  reply: string;
  emotion: 'lonely' | 'anxious' | 'sad' | 'calm' | 'hopeful';
  driftScore: number;
  suggestion: 'breathing' | 'meditation' | 'movement' | 'chat' | null;
}

// Keyword-based response mapping (simplified NLP simulation)
const responsePatterns: Record<string, MockAIResponse[]> = {
  lonely: [
    {
      reply: "I'm really glad you reached out. Nights can feel heavy sometimes, but you've taken a brave step by sharing how you feel.",
      emotion: 'lonely',
      driftScore: 72,
      suggestion: 'breathing',
    },
    {
      reply: "Being alone with your thoughts late at night is tough. I'm here with you, and what you're feeling is completely valid.",
      emotion: 'lonely',
      driftScore: 78,
      suggestion: 'chat',
    },
  ],
  anxious: [
    {
      reply: "It sounds like your mind is racing. That's exhausting. Would you like to try a simple breathing exercise together?",
      emotion: 'anxious',
      driftScore: 85,
      suggestion: 'breathing',
    },
    {
      reply: "Anxiety often visits us in the quiet hours. Let's slow down together. You're safe here.",
      emotion: 'anxious',
      driftScore: 80,
      suggestion: 'meditation',
    },
  ],
  sad: [
    {
      reply: "I hear you, and I'm sorry you're going through this. Sometimes sadness just needs space to exist. I'm here to sit with you.",
      emotion: 'sad',
      driftScore: 70,
      suggestion: 'chat',
    },
    {
      reply: "Tears can be healing. Whatever you're feeling right now, it's okay. You don't have to carry this alone.",
      emotion: 'sad',
      driftScore: 75,
      suggestion: 'meditation',
    },
  ],
  stressed: [
    {
      reply: "College life can be overwhelming. Let's take a moment to decompress. Your wellbeing matters more than any deadline.",
      emotion: 'anxious',
      driftScore: 68,
      suggestion: 'movement',
    },
    {
      reply: "Stress has a way of building up, especially late at night. You're doing your best, and that's enough.",
      emotion: 'anxious',
      driftScore: 65,
      suggestion: 'breathing',
    },
  ],
  sleep: [
    {
      reply: "Sleep troubles are common when our minds won't quiet down. Let's try to create some calm together.",
      emotion: 'anxious',
      driftScore: 60,
      suggestion: 'breathing',
    },
  ],
  default: [
    {
      reply: "Thank you for sharing that with me. I'm here to listen, and there's no rush. Take all the time you need.",
      emotion: 'calm',
      driftScore: 50,
      suggestion: null,
    },
    {
      reply: "I appreciate you opening up. Sometimes just putting words to our feelings can help. What's on your mind?",
      emotion: 'calm',
      driftScore: 45,
      suggestion: 'chat',
    },
    {
      reply: "You're not alone in this moment. Whatever brought you here tonight, I'm glad you're reaching out.",
      emotion: 'hopeful',
      driftScore: 55,
      suggestion: null,
    },
  ],
};

/**
 * Simulates AI response generation based on user input
 * In production, this would be an API call to an ML model
 * 
 * @param userMessage - The user's chat message
 * @returns A mock AI response with emotional analysis
 */
export function generateMockResponse(userMessage: string): MockAIResponse {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simple keyword detection (real app would use NLP/ML)
  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('no one')) {
    return randomChoice(responsePatterns.lonely);
  }
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared') || lowerMessage.includes('panic')) {
    return randomChoice(responsePatterns.anxious);
  }
  if (lowerMessage.includes('sad') || lowerMessage.includes('cry') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    return randomChoice(responsePatterns.sad);
  }
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much') || lowerMessage.includes('exam')) {
    return randomChoice(responsePatterns.stressed);
  }
  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes("can't rest")) {
    return randomChoice(responsePatterns.sleep);
  }
  
  return randomChoice(responsePatterns.default);
}

/**
 * Helper function to pick a random response from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Initial greeting message from the AI
 */
export const initialAIMessage: MockAIResponse = {
  reply: "Hi there. I'm here with you tonight. This is a safe space to share whatever's on your mind. How are you feeling right now?",
  emotion: 'calm',
  driftScore: 40,
  suggestion: null,
};

/**
 * Session summary messages based on final drift score
 */
export function getSessionSummary(startDrift: number, endDrift: number): string {
  const improvement = startDrift - endDrift;
  
  if (improvement > 20) {
    return "You seem much calmer than when you started. That's wonderful progress for tonight.";
  } else if (improvement > 10) {
    return "I noticed you've settled a bit since we started talking. Small steps matter.";
  } else if (improvement > 0) {
    return "Even though tonight was heavy, you showed up for yourself. That takes courage.";
  } else {
    return "Some nights are harder than others. Remember, tomorrow is a new day, and you're not alone.";
  }
}
