// models/Prospect.js
import mongoose from 'mongoose';

const outReachSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Unassigned', 'Not Contacted', 'Contacted', 'Followup', 'Converted to Deal'],
        default: 'Unassigned'
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add index for efficient querying
outReachSchema.index({ email: 1, campaign: 1 }, { unique: true });

const OutReach = mongoose.model('OutReach', outReachSchema);

export default OutReach;