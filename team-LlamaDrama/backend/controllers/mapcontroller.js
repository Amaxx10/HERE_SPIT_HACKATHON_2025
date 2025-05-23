import axios from 'axios';
import { Feature } from '../models/features.js';

export const storeFeatures = async (req, res) => {
  try {
    const features = req.body;

    // Validate the input
    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ message: 'Invalid input: Expected array of features' });
    }

    // Filter out features with null/undefined required fields and transform
    const transformedFeatures = features
      .filter(f => f && Object.keys(f).length > 0)
      .map(f => ({
        objectId: f.objectId || undefined, // Use undefined instead of null
        customerId: f.customerId || undefined,
        postalArea: f.postalArea || '',
        fullPostal: f.fullPostal || '',
        recType: f.recType || 'S',
        geoLevel: f.geoLevel || undefined,
        ntCity: f.ntCity || '',
        county: f.county || '',
        state: f.state || '',
        display: {
          lineId: f.display?.lineId || undefined,
          latitude: f.display?.latitude || undefined,
          longitude: f.display?.longitude || undefined
        },
        routing: {
          lineId: f.routing?.lineId || undefined,
          latitude: f.routing?.latitude || undefined,
          longitude: f.routing?.longitude || undefined
        },
        address: {
          houseNumber: f.address?.houseNumber || '',
          buildingName: f.address?.buildingName || '',
          streetName: f.address?.streetName || '',
          tmoStreet: f.address?.tmoStreet || ''
        },
        hdb: f.hdb || 'N',
        nearest: {
          fid: f.nearest?.fid || undefined,
          distance: f.nearest?.distance || undefined,
          coordinates: {
            x: f.nearest?.coordinates?.x || undefined,
            y: f.nearest?.coordinates?.y || undefined
          }
        }
      }));

    if (transformedFeatures.length === 0) {
      return res.status(400).json({ message: 'No valid features to store' });
    }

    // Store the features in the database
    await Feature.insertMany(transformedFeatures, { ordered: false });

    return res.status(201).json({ 
      message: 'Features stored successfully',
      count: transformedFeatures.length 
    });
  } catch (error) {
    console.error('Error storing features:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const getFeaturesInBounds = async (req, res) => {
  try {
    const { north, south, east, west } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({ message: 'Missing bounds parameters' });
    }

    const features = await Feature.find({
      'display.latitude': { $gte: parseFloat(south), $lte: parseFloat(north) },
      'display.longitude': { $gte: parseFloat(west), $lte: parseFloat(east) }
    });

    return res.status(200).json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
