import express from 'express';
import prisma from '../prisma/client.js';
import authMiddleware from '../middleware/auth.js';
import { generateFeedbackReport } from '../utils/ai.js';

const router = express.Router();

// Get all sessions for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});

// Create a new session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // e.g., 'Behavioral', 'Technical', 'System Design'
    const session = await prisma.interviewSession.create({
      data: {
        userId: req.user.id,
        type,
        status: 'started'
      }
    });
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating session' });
  }
});

// Get a specific session
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching session' });
  }
});

// Complete a session, provide transcript, and generate feedback
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { transcript } = req.body;
    
    let session = await prisma.interviewSession.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Session already completed' });
    }

    // Generate feedback from the AI
    const feedbackReport = await generateFeedbackReport(transcript, session.type);

    session = await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        transcript,
        feedback_report: feedbackReport,
        status: 'completed'
      }
    });

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error completing session' });
  }
});

export default router;
