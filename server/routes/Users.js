import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js'; 
import mongoose from 'mongoose';
const router = express.Router();
import Department from '../models/Department.js';
// Get all categories with optional search

router.get('/', auth, async (req, res) => {
    try {
        const { search = '', regionId } = req.query;

        // Build the query object
        let query = {};
        
        // First, find the outreach team department
        const outreachDept = await Department.findOne({ name: 'outreach team' });
        if (!outreachDept) {
            return res.status(404).json({ message: 'Outreach Team department not found' });
        }
        
        // Add department filter to query
        query.department = outreachDept._id;
        
        // Add region filter if provided
        if (regionId && mongoose.Types.ObjectId.isValid(regionId)) {
            query.regionId = new mongoose.Types.ObjectId(regionId);
        }

        // Find users based on query
        const users = await User.find(query)
            .populate('department', 'name') // Optionally populate department
            .sort({ name: 1 });

        res.json({ status: 200, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

export default router;