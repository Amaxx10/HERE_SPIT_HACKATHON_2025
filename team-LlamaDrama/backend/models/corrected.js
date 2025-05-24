import mongoose from 'mongoose';

const correctedSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 2;
            },
            message: 'Coordinates must be an array of exactly 2 numbers'
        }
    },
    poi_type: {
        type: String,
        required: true
    },
    initial_issues: {
        type: [String],
        default: []
    },
    suspicion_score: {
        type: Number,
        default: 0
    },
    algorithmic_analysis: {
        type: Object,
        required: true
    },
    visual_verification: {
        type: Object,
        required: true
    }
}, {
    timestamps: true,
    collection: 'corrected'
});

// Add index for faster queries
correctedSchema.index({ address: 1 });
correctedSchema.index({ coordinates: '2dsphere' });

export const Corrected = mongoose.model('Corrected', correctedSchema);
