import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prisma/client.js';

const router = express.Router();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === originalHash;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, experience_level } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        role,
        experience_level
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    if (!verifyPassword(password, user.password)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
