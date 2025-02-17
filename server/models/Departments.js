// models/Prospect.js
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});

// Add index for efficient querying
departmentSchema.index({ email: 1, campaign: 1 }, { unique: true });

const OutReach = mongoose.model('Department', departmentSchema);

export default OutReach;