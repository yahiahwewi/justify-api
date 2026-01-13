import { type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import { tokenStore } from '../store.js';

export const generateToken = (req: Request, res: Response): void => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Check if token already exists for this email (optional, but good practice)
  // For now, following requirements: generate a token.
  const token = randomUUID();
  tokenStore.set(token, email);

  res.json({ token });
};
