import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateTokenPair, verifyToken } from '../utils/jwt';
import { validateLogin, validateRegister, validateRefreshToken } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { UserCreate, LoginRequest, AuthResponse, UserResponse } from '../types';

const router = express.Router();

// Register new user
router.post('/register', validateRegister, async (req: any, res: any) => {
  try {
    const { email, password, first_name, last_name }: UserCreate = req.body;

    // Check if user already exists
    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await client.query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at',
        [email, password_hash, first_name, last_name]
      );

      const user: UserResponse = result.rows[0];
      const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

      // Store refresh token in database
      await client.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] // 30 days
      );

      const response: AuthResponse = {
        user,
        accessToken,
        refreshToken
      };

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, async (req: any, res: any) => {
  try {
    const { email, password }: LoginRequest = req.body;

    const client = await pool.connect();
    try {
      // Find user by email
      const result = await client.query(
        'SELECT id, email, password_hash, first_name, last_name, created_at FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

      // Store refresh token in database
      await client.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] // 30 days
      );

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: user.created_at
        },
        accessToken,
        refreshToken
      };

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', validateRefreshToken, async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const client = await pool.connect();
    try {
      // Check if refresh token exists and is valid
      const result = await client.query(
        'SELECT u.id, u.email, u.first_name, u.last_name, u.created_at FROM users u JOIN refresh_tokens rt ON u.id = rt.user_id WHERE rt.token = $1 AND rt.expires_at > NOW() AND u.is_active = true',
        [refreshToken]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      const user = result.rows[0];
      const { accessToken } = generateTokenPair(user.id, user.email);

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: user.created_at
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const client = await pool.connect();
      try {
        // Remove refresh token from database
        await client.query(
          'DELETE FROM refresh_tokens WHERE token = $1',
          [refreshToken]
        );
      } finally {
        client.release();
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout from all devices
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Remove all refresh tokens for this user
      await client.query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [req.user!.id]
      );
    } finally {
      client.release();
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
