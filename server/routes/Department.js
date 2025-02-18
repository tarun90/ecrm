import express from 'express';
import Department from '../models/Department.js';
import auth from '../middleware/auth.js'; 
const router = express.Router();


// // Get all categories with optional search
// router.get('/', auth, async (req, res) => {
//     try {
//         const { search = '' } = req.query;
//         const categories = await Category.find({
//             categoryName: new RegExp(search, 'i')
//         }).sort({ categoryName: 1 });
        
//         res.json(categories);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching categories' });
//     }
// });

// Create new category
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const existingDept = await Department.findOne({ 
            name: new RegExp(`^${name}$`, 'i')
        });

        if (existingDept) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const dept = new Department({ name: name });
        await dept.save();
        
        res.status(201).json(dept);
    } catch (error) {
        res.status(500).json({ message: 'Error creating Department' });
    }
});

export default router;