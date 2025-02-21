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
    designation: {
        type: String,
        trim: true
    },
    city: {
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
    leadStatus: {
        type: String,
        enum: ['-','Nurturing', 'Lost', 'Intrested'],
        default: '-'
    },
    priority: {
        type: String,
        enum: ['-','Low', 'Medium', 'High'],
        default: '-'
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
    },
    sourceFile: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

// Add index for efficient querying
// outReachSchema.index({  campaign: 1 }, { unique: true });

const OutReach = mongoose.model('OutReach', outReachSchema);

export default OutReach;