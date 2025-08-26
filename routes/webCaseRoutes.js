import express from 'express';
import { body, param } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { createCase, getMyCases, getCaseById } from '../controllers/caseController.js';

const router = express.Router();

// Create new case (no token required)
router.post('/cases',
  body('title').isString().isLength({ min: 3 }),
  body('type').isIn(['land', 'gbv', 'other']),
  body('county').isString().isLength({ min: 2 }),
  handleValidation,
  createCase
);

// Get all cases (no token required)
router.get('/cases', getMyCases);

// Get a single case (no token required)
router.get('/cases/:id',
  param('id').isMongoId(),
  handleValidation,
  getCaseById
);

export default router;
