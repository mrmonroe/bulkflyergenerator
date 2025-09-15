"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded.type !== 'access') {
            res.status(401).json({ error: 'Invalid token type' });
            return;
        }
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
            if (result.rows.length === 0) {
                res.status(401).json({ error: 'User not found or inactive' });
                return;
            }
            req.user = result.rows[0];
            next();
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded.type !== 'access') {
            next();
            return;
        }
        const client = await database_1.default.connect();
        try {
            const result = await client.query('SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
            if (result.rows.length > 0) {
                req.user = result.rows[0];
            }
        }
        finally {
            client.release();
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map