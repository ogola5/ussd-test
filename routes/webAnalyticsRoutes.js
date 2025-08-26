// routes/webAnalyticsRoutes.js
import express from 'express';
import { query } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics (no auth required)
router.get('/analytics',
  query('from').optional().isISO8601().toDate(),
  query('to').optional().isISO8601().toDate(),
  handleValidation,
  getAnalytics
);

export default router;
