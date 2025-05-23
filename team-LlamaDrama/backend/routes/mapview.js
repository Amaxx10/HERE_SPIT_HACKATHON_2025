import { storeFeatures, getFeaturesInBounds } from '../controllers/mapcontroller.js';
import express from 'express';

const router = express.Router();
router.post('/store', storeFeatures);
router.get('/features/bounds', getFeaturesInBounds);

export default router;