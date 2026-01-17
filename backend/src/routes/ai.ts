import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { generateResponse } from '../services/llm';
import { analyzeSafety } from '../engines/safetyEngine';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /ai/respond
 * Protected route - requires authentication
 * Accepts user message and returns AI response
 * Runs safety engine before AI processing
 */
router.post('/respond', authenticate, (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Run safety engine BEFORE AI
    const safetyAnalysis = analyzeSafety(message);

    logger.info('Safety analysis completed', {
      userId: req.user?.id,
      riskLevel: safetyAnalysis.riskLevel,
    });

    // High risk: do not call AI, return calm pause message
    if (safetyAnalysis.riskLevel === 'high') {
      res.status(200).json({
        response: "I'm here with you. We can pause for a moment if that feels helpful.",
      });
      return;
    }

    // Generate response using mock LLM service
    // Pass riskLevel to AI context for future use
    // In production, this will call OpenAI API
    const response = generateResponse(message);

    logger.info('AI response generated', {
      userId: req.user?.id,
      messageLength: message.length,
      riskLevel: safetyAnalysis.riskLevel,
    });

    res.status(200).json({
      response,
    });
  } catch (error) {
    logger.error('AI response error', { error });
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;

