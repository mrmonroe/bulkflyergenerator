"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShow = exports.validateRefreshToken = exports.validateLogin = exports.validateRegister = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    (0, express_validator_1.body)('first_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('last_name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name must be between 1 and 100 characters'),
    exports.handleValidationErrors
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
exports.validateRefreshToken = [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
    exports.handleValidationErrors
];
exports.validateShow = [
    (0, express_validator_1.body)('date')
        .notEmpty()
        .withMessage('Date is required'),
    (0, express_validator_1.body)('venue_name')
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Venue name is required and must be between 1 and 255 characters'),
    (0, express_validator_1.body)('venue_address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Venue address must be less than 500 characters'),
    (0, express_validator_1.body)('city_state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City/State must be less than 100 characters'),
    (0, express_validator_1.body)('show_time')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Show time must be less than 50 characters'),
    (0, express_validator_1.body)('event_type')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Event type must be less than 100 characters'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map