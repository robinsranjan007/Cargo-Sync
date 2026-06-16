import express from 'express';
import {
  updateLocation,
  getLocation,
  getAllLocations
} from '../controllers/trackingController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/location', updateLocation);
router.get('/location/:loadId', getLocation);
router.get('/locations', getAllLocations);

export default router;