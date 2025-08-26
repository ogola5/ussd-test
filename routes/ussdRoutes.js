import express from 'express';
import { handleUssd } from '../controllers/ussdController.js';

const router = express.Router();

router.post('/', handleUssd);

export default router;
