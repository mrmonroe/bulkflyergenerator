"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenPair = exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const generateAccessToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email, type: 'access' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email, type: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const generateTokenPair = (userId, email) => {
    return {
        accessToken: (0, exports.generateAccessToken)(userId, email),
        refreshToken: (0, exports.generateRefreshToken)(userId, email),
    };
};
exports.generateTokenPair = generateTokenPair;
//# sourceMappingURL=jwt.js.map