import express from 'express';
import Campaign from '../models/Campaign.js';
import Category from '../models/Category.js';
import auth from '../middleware/auth.js'; 
const router = express.Router();

// Create a new campaign
router.post('/', auth, async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const campaign = new Campaign({
      campaignName: req.body.campaignName,
      categoryId: req.body.categoryId,  // Add this
      createdBy: req.user?.user._id
    });

    const existingCampaign = await Campaign.findOne({ 
      campaignName: { 
        $regex: new RegExp(`^${req.body.campaignName.trim()}$`, 'i') 
      } 
    });

    if (existingCampaign) {
      return res.status(400).json({ 
        message: 'A campaign with this name already exists'
      });
    }

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Error creating campaign',
      error: error.message 
    });
  }
});

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const { searchTerm, categoryId } = req.query;
    const filter = {};

    if (searchTerm) {
      filter.campaignName = { $regex: searchTerm, $options: 'i' };
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const campaigns = await Campaign.find(filter)
      .populate('categoryId', 'categoryName') // Add this to get category details
      .exec();
      
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching campaigns',
      error: error.message 
    });
  }
});
// Get campaign by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ 
      _id: req.params.id,
      createdBy: req?.user?.user._id 
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching campaign',
      error: error.message 
    });
  }
});

// Update campaign
router.patch('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    let campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // If category is being updated, verify it exists
    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      campaign.categoryId = req.body.categoryId;
    }

    campaign.campaignName = req.body.campaignName || campaign.campaignName;

    const existingCampaign = await Campaign.findOne({ 
      campaignName: { 
        $regex: new RegExp(`^${req.body.campaignName.trim()}$`, 'i') 
      }, 
      _id: { $ne: campaignId }
    });

    if (existingCampaign) {
      return res.status(400).json({ 
        message: 'A campaign with this name already exists' 
      });
    }

    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Error updating campaign',
      error: error
    }); 
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      createdBy: req?.user?.user._id
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json({ 
      message: 'Campaign deleted successfully.',
      status: 200
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting campaign',
      error: error.message,
      status: 500
    });
  }
});

// API to fetch only campaignName and _id
router.get('/names', auth, async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const filter = { createdBy: req.user.user._id };

    if (searchTerm) {
      filter.campaignName = { $regex: searchTerm, $options: 'i' };
    }

    const campaigns = await Campaign.find(filter).select("campaignName _id");
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching campaigns',
      error: error.message 
    });
  }
});

export default router;
