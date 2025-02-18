import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js'; 
const router = express.Router();


// Get all categories with optional search
router.get('/', auth, async (req, res) => {
    try {
        const { search = '' } = req.query;
        const users = await User.find({}).sort({ name: 1 });
        
        res.json({status:200, users:users});
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

export default router;