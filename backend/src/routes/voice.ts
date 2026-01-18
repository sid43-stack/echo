import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { speechToText } from '../services/stt';
import { textToSpeech } from '../services/tts';
import { analyzeSafety } from '../engines/safetyEngine';
import { generateResponse } from '../services/llm';
import { touchSession, getSession } from '../engines/sessionManager';
import { logger } from '../utils/logger';

const router: Router = Router();

// Configure multer for audio file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * POST /voice/process
 * Protected route - requires authentication
 * Requires sessionId in request body
 * Accepts audio file, processes through: audio → STT → safety → AI → TTS → audio
 * Returns audio response (audio/wav)
 */
router.post(
  '/process',
  authenticate,
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }

      // Verify session exists and belongs to user
      const session = getSession(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found or expired' });
        return;
      }

      if (session.userId !== req.user?.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Update session activity timestamp
      touchSession(sessionId);

      if (!req.file) {
        res.status(400).json({ error: 'Audio file is required' });
        return;
      }

      const audioBuffer = req.file.buffer;

      logger.info('Voice processing started', {
        userId: req.user?.id,
        sessionId,
        fileSize: audioBuffer.length,
      });

      // Step 1: Speech-to-Text
      const transcribedText = await speechToText(audioBuffer);

      logger.info('STT completed', {
        userId: req.user?.id,
        text: transcribedText,
      });

      // Step 2: Safety analysis
      const safetyAnalysis = analyzeSafety(transcribedText);

      logger.info('Safety analysis completed', {
        userId: req.user?.id,
        riskLevel: safetyAnalysis.riskLevel,
      });

      // Step 3: Determine response text
      let responseText: string;

      if (safetyAnalysis.riskLevel === 'high') {
        // High risk: return calm pause message
        responseText = "I'm here with you. We can pause for a moment if that feels helpful.";
      } else {
        // Step 4: Generate AI response
        responseText = generateResponse(transcribedText);
      }

      logger.info('AI response generated', {
        userId: req.user?.id,
        riskLevel: safetyAnalysis.riskLevel,
      });

      // Step 5: Text-to-Speech
      const audioResponse = await textToSpeech(responseText);

      logger.info('TTS completed', {
        userId: req.user?.id,
        audioSize: audioResponse.length,
      });

      // Return audio response
      res.setHeader('Content-Type', 'audio/wav');
      res.status(200).send(audioResponse);
    } catch (error) {
      logger.error('Voice processing error', { error });
      res.status(500).json({ error: 'Failed to process voice request' });
    }
  }
);

export default router;

