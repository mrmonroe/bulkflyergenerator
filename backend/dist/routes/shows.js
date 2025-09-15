"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../config/database"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM shows WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
            res.json({ shows: result.rows });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT * FROM shows WHERE id = $1 AND user_id = $2', [id, req.user.id]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Show not found' });
                return;
            }
            res.json({ show: result.rows[0] });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, validation_1.validateShow, async (req, res) => {
    try {
        const showData = req.body;
        const client = await database_1.default.connect();
        try {
            const result = await client.query('INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [
                req.user.id,
                showData.date,
                showData.venue_name,
                showData.venue_address,
                showData.city_state,
                showData.show_time,
                showData.event_type
            ]);
            res.status(201).json({ show: result.rows[0] });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error creating show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, validation_1.validateShow, async (req, res) => {
    try {
        const { id } = req.params;
        const showData = req.body;
        const client = await database_1.default.connect();
        try {
            const result = await client.query('UPDATE shows SET date = $1, venue_name = $2, venue_address = $3, city_state = $4, show_time = $5, event_type = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 RETURNING *', [
                showData.date,
                showData.venue_name,
                showData.venue_address,
                showData.city_state,
                showData.show_time,
                showData.event_type,
                id,
                req.user.id
            ]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Show not found' });
                return;
            }
            res.json({ show: result.rows[0] });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const client = await database_1.default.connect();
        try {
            const result = await client.query('DELETE FROM shows WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Show not found' });
                return;
            }
            res.json({ message: 'Show deleted successfully' });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/bulk', auth_1.authenticateToken, async (req, res) => {
    try {
        const { shows } = req.body;
        if (!Array.isArray(shows) || shows.length === 0) {
            res.status(400).json({ error: 'Shows array is required' });
            return;
        }
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const createdShows = [];
            for (const showData of shows) {
                const result = await client.query('INSERT INTO shows (user_id, date, venue_name, venue_address, city_state, show_time, event_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [
                    req.user.id,
                    showData.date,
                    showData.venue_name,
                    showData.venue_address,
                    showData.city_state,
                    showData.show_time,
                    showData.event_type
                ]);
                createdShows.push(result.rows[0]);
            }
            await client.query('COMMIT');
            res.status(201).json({ shows: createdShows, count: createdShows.length });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error bulk creating shows:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=shows.js.map