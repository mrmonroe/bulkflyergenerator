"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', validation_1.validateRegister, async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;
        const client = await database_1.default.connect();
        try {
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                res.status(409).json({ error: 'User with this email already exists' });
                return;
            }
            const saltRounds = 12;
            const password_hash = await bcryptjs_1.default.hash(password, saltRounds);
            const result = await client.query('INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at', [email, password_hash, first_name, last_name]);
            const user = result.rows[0];
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user.id, user.email);
            await client.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
            const response = {
                user,
                accessToken,
                refreshToken
            };
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.status(201).json(response);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', validation_1.validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT id, email, password_hash, first_name, last_name, created_at FROM users WHERE email = $1 AND is_active = true', [email]);
            if (result.rows.length === 0) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            const user = result.rows[0];
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user.id, user.email);
            await client.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
            const response = {
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
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.json(response);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/refresh', validation_1.validateRefreshToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = (0, jwt_1.verifyToken)(refreshToken);
        if (decoded.type !== 'refresh') {
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT u.id, u.email, u.first_name, u.last_name, u.created_at FROM users u JOIN refresh_tokens rt ON u.id = rt.user_id WHERE rt.token = $1 AND rt.expires_at > NOW() AND u.is_active = true', [refreshToken]);
            if (result.rows.length === 0) {
                res.status(401).json({ error: 'Invalid or expired refresh token' });
                return;
            }
            const user = result.rows[0];
            const { accessToken } = (0, jwt_1.generateTokenPair)(user.id, user.email);
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
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
router.post('/logout', auth_1.authenticateToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const client = await database_1.default.connect();
            try {
                await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
            }
            finally {
                client.release();
            }
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', auth_1.authenticateToken, (req, res) => {
    res.json({ user: req.user });
});
router.post('/logout-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const client = await database_1.default.connect();
        try {
            await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
        }
        finally {
            client.release();
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out from all devices successfully' });
    }
    catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map