import express from 'express';
import Activities from '../models/Activities.js';
import auth from '../middleware/auth.js';
const router = express.Router();


// Get all activities with optional search
router.get('/', auth, async (req, res) => {
    try {
        const { search = '' } = req.query;
        const activities = await Activities.find({
            name: new RegExp(search, 'i')
        }).sort({ categoryName: 1 });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

// Create new category
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Activities name is required' });
        }

        const existingActivity = await Activities.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (existingActivity) {
            return res.status(400).json({ message: 'Activities already exists' });
        }

        const activity = new Activities({ name: name });
        await activity.save();

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error creating activities' });
    }
});

export default router;