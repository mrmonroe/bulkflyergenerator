import express from 'express';
import pool from '../config/database';
import { validateShow } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { Show, ShowCreate } from '../types';

const router = express.Router();

// Get all public shows (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in miles, default 50
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT s.*, u.first_name, u.last_name, up.bio, up.profile_photo_url
        FROM shows s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN user_profiles up ON s.user_id = up.user_id
        WHERE s.is_public = true
      `;
      
      const queryParams: any[] = [];
      let paramCount = 0;
      
      // If location is provided, add distance calculation
      if (lat && lng) {
        paramCount++;
        query += ` AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
          AND (
            3959 * acos(
              cos(radians($${paramCount})) * cos(radians(s.latitude)) * 
              cos(radians(s.longitude) - radians($${paramCount + 1})) + 
              sin(radians($${paramCount})) * sin(radians(s.latitude))
            )
          ) <= $${paramCount + 2}`;
        queryParams.push(parseFloat(lat as string), parseFloat(lng as string), parseFloat(radius as string));
      }
      
      query += ` ORDER BY s.date ASC, s.show_time ASC`;
      
      const result = await client.query(query, queryParams);
      
      res.json({ shows: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching public shows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all shows for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM shows WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user!.id]
      );

      res.json({ shows: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific show by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM shows WHERE id = $1 AND user_id = $2',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Show not found' });
        return;
      }

      res.json({ show: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new show
router.post('/', authenticateToken, validateShow, async (req: any, res: any) => {
  try {
    const showData: ShowCreate = req.body;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type, latitude, longitude, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [
          req.user!.id,
          showData.date,
          showData.venue_name,
          showData.venue_address,
          showData.city_state,
          showData.show_time,
          showData.event_type,
          showData.latitude,
          showData.longitude,
          showData.is_public || false
        ]
      );

      res.status(201).json({ show: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a show
router.put('/:id', authenticateToken, validateShow, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const showData: ShowCreate = req.body;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE shows SET date = $1, venue_name = $2, venue_address = $3, city_state = $4, show_time = $5, event_type = $6, latitude = $7, longitude = $8, is_public = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 AND user_id = $11 RETURNING *',
        [
          showData.date,
          showData.venue_name,
          showData.venue_address,
          showData.city_state,
          showData.show_time,
          showData.event_type,
          showData.latitude,
          showData.longitude,
          showData.is_public || false,
          id,
          req.user!.id
        ]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Show not found' });
        return;
      }

      res.json({ show: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating show:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a show
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM shows WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Show not found' });
        return;
      }

      res.json({ message: 'Show deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create shows (for CSV import)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { shows }: { shows: ShowCreate[] } = req.body;
    
    if (!Array.isArray(shows) || shows.length === 0) {
      res.status(400).json({ error: 'Shows array is required' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdShows = [];
      for (const showData of shows) {
        const result = await client.query(
          'INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type, latitude, longitude, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [
            req.user!.id,
            showData.date,
            showData.venue_name,
            showData.venue_address,
            showData.city_state,
            showData.show_time,
            showData.event_type,
            showData.latitude,
            showData.longitude,
            showData.is_public || false
          ]
        );
        createdShows.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ shows: createdShows, count: createdShows.length });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk creating shows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
