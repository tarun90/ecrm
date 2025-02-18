import express from 'express';
import Sales from '../models/Sales.js'; // Import the Sales model

const router = express.Router();

// Get all sales
router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
  
      const total = await Sales.countDocuments();
      const sales = await Sales.find().populate('contact').skip(skip).limit(pageSize);
  
      res.status(200).json({
        data: sales,
        total,
        page,
        pageSize
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Create an Sales
router.post('/', async (req, res) => {
  try {
    const newSales = new Sales(req.body);
    await newSales.save();
    res.status(201).json(newSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single Sales by ID
router.get('/:id', async (req, res) => {
  try {
    const sales = await Sales.findById(req.params.id);

    if (!sales) {
      return res.status(404).json({ message: 'Sales not found' });
    }
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an Sales by ID
router.put('/:id', async (req, res) => {
  try {
    const sales = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!sales) {
      return res.status(404).json({ message: 'Sales not found' });
    }
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an Sales by ID
router.delete('/:id', async (req, res) => {
  try {
    const sales = await Sales.findByIdAndDelete(req.params.id);
    if (!sales) {
      return res.status(404).json({ message: 'sales not found' });
    }
    res.status(200).json({ message: 'sales deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete multiple Sales by IDs
router.post('/delete-multiple', async (req, res) => {
  try {
    const { salesIds } = req.body;

    if (!salesIds || salesIds.length === 0) {
      return res.status(400).json({ message: 'No Sales IDs provided' });
    }

    // Use deleteMany to delete multiple Sales
    const result = await Sales.deleteMany({ _id: { $in: salesIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No Sales found to delete' });
    }

    res.status(200).json({ message: 'Sales deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
