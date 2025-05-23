import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
    objectId: {
        type: Number,
        sparse: true,  // Changed from unique to sparse index
        index: true
    },
    customerId: {
        type: Number,
        index: true
    },
    postalArea: String,
    fullPostal: String,
    recType: {
        type: String,
        enum: ['S'], // Add other valid types if they exist
        default: 'S'
    },
    geoLevel: {
        type: Number,
    },
    ntCity: {
        type: String,
        index: true
    },
    county: String,
    state: String,
    display: {
        lineId: Number,
        latitude: Number,
        longitude: Number
    },
    routing: {
        lineId: Number,
        latitude: Number,
        longitude: Number
    },
    address: {
        houseNumber: String,
        buildingName: String,
        streetName: String,
        tmoStreet: String
    },
    hdb: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    nearest: {
        fid: Number,
        distance: Number,
        coordinates: {
            x: Number,
            y: Number
        }
    }
}, {
    timestamps: true
});

// Create compound indexes for location-based queries
featureSchema.index({ 'display.latitude': 1, 'display.longitude': 1 });
featureSchema.index({ 'routing.latitude': 1, 'routing.longitude': 1 });

// Create indexes for common query fields
featureSchema.index({ fullPostal: 1 });
featureSchema.index({ 'address.streetName': 1 });

export const Feature = mongoose.model('Feature', featureSchema);
