import express from 'express';
import pool from '../config/database';
import { validateShow } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { Show, ShowCreate } from '../types';

const router = express.Router();

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
        'INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          req.user!.id,
          showData.date,
          showData.venue_name,
          showData.venue_address,
          showData.city_state,
          showData.show_time,
          showData.event_type
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
        'UPDATE shows SET date = $1, venue_name = $2, venue_address = $3, city_state = $4, show_time = $5, event_type = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 RETURNING *',
        [
          showData.date,
          showData.venue_name,
          showData.venue_address,
          showData.city_state,
          showData.show_time,
          showData.event_type,
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
          'INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [
            req.user!.id,
            showData.date,
            showData.venue_name,
            showData.venue_address,
            showData.city_state,
            showData.show_time,
            showData.event_type
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
