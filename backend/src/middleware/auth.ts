import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import pool from '../config/database';
import { UserResponse } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserResponse;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    // Verify user still exists and is active
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      req.user = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      next();
      return;
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    } finally {
      client.release();
    }
    
    next();
  } catch (error) {
    next();
  }
};
