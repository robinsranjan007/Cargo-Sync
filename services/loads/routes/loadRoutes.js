import express from 'express';
import {
  createLoad,
  getLoads,
  getLoad,
  updateLoadStatus,
  assignCarrier
} from '../controllers/loadController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createLoad);
router.get('/', getLoads);
router.get('/:id', getLoad);
router.patch('/:id/status', updateLoadStatus);
router.patch('/:id/carrier', assignCarrier);

export default router;