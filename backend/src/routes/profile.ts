import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { 
  UserProfileCreate, 
  UserProfileUpdate, 
  UserSocialMediaCreate, 
  UserSocialMediaUpdate,
  CompleteUserProfile,
  INSTRUMENTS,
  GENRES,
  SOCIAL_MEDIA_PLATFORMS
} from '../types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profile-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user!.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get complete user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const userId = req.user!.id;

      // Get user profile
      const profileResult = await client.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      // Get user instruments
      const instrumentsResult = await client.query(
        'SELECT instrument FROM user_instruments WHERE user_id = $1 ORDER BY instrument',
        [userId]
      );

      // Get user genres
      const genresResult = await client.query(
        'SELECT genre FROM user_genres WHERE user_id = $1 ORDER BY genre',
        [userId]
      );

      // Get user social media
      const socialMediaResult = await client.query(
        'SELECT * FROM user_social_media WHERE user_id = $1 ORDER BY platform',
        [userId]
      );

      const profile = profileResult.rows[0] || null;
      const instruments = instrumentsResult.rows.map(row => row.instrument);
      const genres = genresResult.rows.map(row => row.genre);
      const social_media = socialMediaResult.rows;

      const completeProfile: CompleteUserProfile = {
        profile,
        instruments,
        genres,
        social_media
      };

      res.json(completeProfile);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bio }: UserProfileCreate = req.body;
    const userId = req.user!.id;

    const client = await pool.connect();
    try {
      // Check if profile exists
      const existingProfile = await client.query(
        'SELECT id FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await client.query(
          'UPDATE user_profiles SET bio = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [bio, userId]
        );
      } else {
        // Create new profile
        await client.query(
          'INSERT INTO user_profiles (user_id, bio) VALUES ($1, $2)',
          [userId, bio]
        );
      }

      res.json({ message: 'Profile updated successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile photo
router.post('/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;
    const filename = req.file.filename;
    const photoUrl = `/uploads/profile-photos/${filename}`;

    const client = await pool.connect();
    try {
      // Check if profile exists
      const existingProfile = await client.query(
        'SELECT id, profile_photo_filename FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // Delete old photo if it exists
        if (existingProfile.rows[0].profile_photo_filename) {
          const oldPhotoPath = path.join(__dirname, '../../uploads/profile-photos', existingProfile.rows[0].profile_photo_filename);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }

        // Update existing profile
        await client.query(
          'UPDATE user_profiles SET profile_photo_url = $1, profile_photo_filename = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
          [photoUrl, filename, userId]
        );
      } else {
        // Create new profile with photo
        await client.query(
          'INSERT INTO user_profiles (user_id, profile_photo_url, profile_photo_filename) VALUES ($1, $2, $3)',
          [userId, photoUrl, filename]
        );
      }

      return res.json({ 
        message: 'Profile photo uploaded successfully',
        photoUrl,
        filename
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Upload photo error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user instruments
router.post('/instruments', authenticateToken, async (req, res) => {
  try {
    const { instruments }: { instruments: string[] } = req.body;
    const userId = req.user!.id;

    // Validate instruments
    const invalidInstruments = instruments.filter(inst => !INSTRUMENTS.includes(inst));
    if (invalidInstruments.length > 0) {
      return res.status(400).json({ 
        error: `Invalid instruments: ${invalidInstruments.join(', ')}` 
      });
    }

    const client = await pool.connect();
    try {
      // Delete existing instruments
      await client.query(
        'DELETE FROM user_instruments WHERE user_id = $1',
        [userId]
      );

      // Insert new instruments
      if (instruments.length > 0) {
        const values = instruments.map((_, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const params = [userId, ...instruments];
        await client.query(
          `INSERT INTO user_instruments (user_id, instrument) VALUES ${values}`,
          params
        );
      }

      return res.json({ message: 'Instruments updated successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update instruments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user genres
router.post('/genres', authenticateToken, async (req, res) => {
  try {
    const { genres }: { genres: string[] } = req.body;
    const userId = req.user!.id;

    // Validate genres
    const invalidGenres = genres.filter(genre => !GENRES.includes(genre));
    if (invalidGenres.length > 0) {
      return res.status(400).json({ 
        error: `Invalid genres: ${invalidGenres.join(', ')}` 
      });
    }

    const client = await pool.connect();
    try {
      // Delete existing genres
      await client.query(
        'DELETE FROM user_genres WHERE user_id = $1',
        [userId]
      );

      // Insert new genres
      if (genres.length > 0) {
        const values = genres.map((_, index) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        const params = [userId, ...genres];
        await client.query(
          `INSERT INTO user_genres (user_id, genre) VALUES ${values}`,
          params
        );
      }

      return res.json({ message: 'Genres updated successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update genres error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add social media profile
router.post('/social-media', authenticateToken, async (req, res) => {
  try {
    const { platform, username, url }: UserSocialMediaCreate = req.body;
    const userId = req.user!.id;

    // Validate platform
    if (!SOCIAL_MEDIA_PLATFORMS.includes(platform)) {
      return res.status(400).json({ 
        error: `Invalid platform. Must be one of: ${SOCIAL_MEDIA_PLATFORMS.join(', ')}` 
      });
    }

    const client = await pool.connect();
    try {
      // Check if platform already exists for user
      const existing = await client.query(
        'SELECT id FROM user_social_media WHERE user_id = $1 AND platform = $2',
        [userId, platform]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await client.query(
          'UPDATE user_social_media SET username = $1, url = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND platform = $4',
          [username, url, userId, platform]
        );
      } else {
        // Insert new
        await client.query(
          'INSERT INTO user_social_media (user_id, platform, username, url) VALUES ($1, $2, $3, $4)',
          [userId, platform, username, url]
        );
      }

      return res.json({ message: 'Social media profile updated successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update social media error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete social media profile
router.delete('/social-media/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user!.id;

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM user_social_media WHERE user_id = $1 AND platform = $2',
        [userId, platform]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Social media profile not found' });
      }

      return res.json({ message: 'Social media profile deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete social media error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available instruments, genres, and platforms
router.get('/options', (req, res) => {
  res.json({
    instruments: INSTRUMENTS,
    genres: GENRES,
    socialMediaPlatforms: SOCIAL_MEDIA_PLATFORMS
  });
});

export default router;
