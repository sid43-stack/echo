/**
 * Safety Engine
 * Analyzes user messages for risk indicators
 * Simple keyword-based logic (v1)
 * Extensible for future improvements
 */

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export interface SafetyAnalysis {
  riskLevel: RiskLevel;
  reason: string;
}

// High risk keywords
const highRiskKeywords = ['suicide', 'kill myself', 'end it all'];

// Medium risk keywords
const mediumRiskKeywords = ['hopeless', 'worthless', "can't go on"];

// Low risk keywords
const lowRiskKeywords = ['stressed', 'anxious', 'overwhelmed'];

/**
 * Analyze message for safety risk
 * @param input - User's message
 * @returns Safety analysis with risk level and reason
 */
export const analyzeSafety = (input: string): SafetyAnalysis => {
  const lowerInput = input.toLowerCase();

  // Check for high risk keywords
  for (const keyword of highRiskKeywords) {
    if (lowerInput.includes(keyword)) {
      return {
        riskLevel: 'high',
        reason: 'High risk content detected',
      };
    }
  }

  // Check for medium risk keywords
  for (const keyword of mediumRiskKeywords) {
    if (lowerInput.includes(keyword)) {
      return {
        riskLevel: 'medium',
        reason: 'Medium risk content detected',
      };
    }
  }

  // Check for low risk keywords
  for (const keyword of lowRiskKeywords) {
    if (lowerInput.includes(keyword)) {
      return {
        riskLevel: 'low',
        reason: 'Low risk content detected',
      };
    }
  }

  // No risk detected
  return {
    riskLevel: 'none',
    reason: 'No risk indicators found',
  };
};

