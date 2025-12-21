import { body, validationResult } from 'express-validator';

import { Request, Response, NextFunction } from 'express';

 

export const validateRegistration = [

  body('email').isEmail().withMessage('Invalid email address'),

  body('password')

    .isLength({ min: 6 })

    .withMessage('Password must be at least 6 characters'),

  body('firstName').notEmpty().withMessage('First name is required'),

  body('lastName').notEmpty().withMessage('Last name is required'),

];

 

export const validateLogin = [

  body('email').isEmail().withMessage('Invalid email address'),

  body('password').notEmpty().withMessage('Password is required'),

];

 

export const validateMessage = [

  body('content').notEmpty().withMessage('Message content is required'),

  body('chatId').isUUID().withMessage('Invalid chat ID'),

];

 

export const handleValidationErrors = (

  req: Request,

  res: Response,

  next: NextFunction

) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({ errors: errors.array() });

  }

  next();

};