import express from 'express'; 
import auth from '../middleware/auth.js'; 
import Region from '../models/Regions.js';
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { regionName } = req.body;
    
    if (!regionName || !regionName.trim()) {
      return res.status(400).json({ message: 'Region name is required' });
    }

    const existingRegion = await Region.findOne({ 
      regionName: { 
        $regex: new RegExp(`^${regionName.trim()}$`, 'i') 
      } 
    });

    if (existingRegion) {
      return res.status(400).json({ message: 'A region with this name already exists' });
    }

    const region = new Region({
      regionName: regionName.trim(),
      createdBy: req.user?.user._id
    });

    await region.save();
    res.status(201).json(region);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Error creating region', 
      error: error.message 
    });
  }
});

router.get('/', auth, async (req, res) => {
    try {
      const regions = await Region.find().sort({ createdAt: -1 });
      res.status(200).json(regions);
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Error fetching regions',
        error: error.message
      });
    }
  });
  

export default router;

