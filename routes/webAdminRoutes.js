import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listCases, updateCaseStatus } from '../controllers/caseController.js';

const router = express.Router();

// Admin: list cases with filters
router.get('/admin/cases',
  requireAuth,
  requireRole('admin'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  handleValidation,
  listCases
);

// Admin: update case status
router.put('/admin/cases/:id/status',
  requireAuth,
  requireRole('admin'),
  param('id').isMongoId(),
  body('status').isIn(['submitted', 'in_review', 'resolved', 'rejected']),
  body('note').optional().isString(),
  handleValidation,
  updateCaseStatus
);

export default router;
