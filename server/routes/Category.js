import express from 'express';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js'; 
const router = express.Router();


// Get all categories with optional search
router.get('/', auth, async (req, res) => {
    try {
        const { search = '' } = req.query;
        const categories = await Category.find({
            categoryName: new RegExp(search, 'i')
        }).sort({ categoryName: 1 });
        
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Create new category
router.post('/', auth, async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName || !categoryName.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const existingCategory = await Category.findOne({ 
            categoryName: new RegExp(`^${categoryName}$`, 'i')
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ categoryName });
        await category.save();
        
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update category
router.put('/:id', auth, async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName || !categoryName.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const existingCategory = await Category.findOne({
            categoryName: new RegExp(`^${categoryName}$`, 'i'),
            _id: { $ne: req.params.id }
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { categoryName },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully', status:200 });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
});

export default router;