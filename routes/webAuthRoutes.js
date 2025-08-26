import express from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { registerAdmin, registerUser, login } from '../controllers/authController.js';

const router = express.Router();

// Register Admin
router.post('/auth/register-admin',
  body('name').isString().trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation,
  registerAdmin
);

// Register Normal User
router.post('/auth/register',
  body('name').isString().trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation,
  registerUser
);

// Login
router.post('/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  handleValidation,
  login
);

export default router;
