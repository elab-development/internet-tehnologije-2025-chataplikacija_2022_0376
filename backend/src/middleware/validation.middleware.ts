import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map((err: any) =>
      extractedErrors.push({ [err.param]: err.msg })
    );

    res.status(422).json({
      error: 'Validation failed',
      errors: extractedErrors,
    });
  };
};

// Common validation rules
import { body, param, query } from 'express-validator';

export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  ],
  login: [
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

export const conversationValidation = {
  create: [
    body('type')
      .isIn(['private', 'group'])
      .withMessage('Type must be either private or group'),
    body('participantIds')
      .isArray({ min: 1 })
      .withMessage('At least one participant is required'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
  ],
};

export const messageValidation = {
  create: [
    body('conversationId').isUUID().withMessage('Invalid conversation ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 5000 })
      .withMessage('Message must not exceed 5000 characters'),
    body('type')
      .optional()
      .isIn(['text', 'file', 'image', 'video'])
      .withMessage('Invalid message type'),
  ],
  edit: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 5000 })
      .withMessage('Message must not exceed 5000 characters'),
  ],
};

export const reportValidation = {
  create: [
    body('messageId').isUUID().withMessage('Invalid message ID'),
    body('reason')
      .isIn([
        'spam',
        'harassment',
        'hate_speech',
        'inappropriate_content',
        'violence',
        'other',
      ])
      .withMessage('Invalid report reason'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
  ],
};