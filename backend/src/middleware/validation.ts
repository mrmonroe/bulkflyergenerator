import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors
];

export const validateShow = [
  body('date')
    .notEmpty()
    .withMessage('Date is required'),
  body('venue_name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Venue name is required and must be between 1 and 255 characters'),
  body('venue_address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Venue address must be less than 500 characters'),
  body('city_state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City/State must be less than 100 characters'),
  body('show_time')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Show time must be less than 50 characters'),
  body('event_type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Event type must be less than 100 characters'),
  handleValidationErrors
];
