import { storeFeatures, getFeaturesInBounds, getAllFeatures } from '../controllers/mapcontroller.js';
import express from 'express';

const router = express.Router();
router.get('/allfeatures', getAllFeatures);  // Move this before more specific routes
router.get('/features/bounds', getFeaturesInBounds);
router.post('/store', storeFeatures);

export default router;