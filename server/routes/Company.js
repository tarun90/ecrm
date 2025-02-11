import express from 'express';
import Company from '../models/Company.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Create a new company
router.post('/', auth, async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      createdBy: req.user?.user._id,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        region: req.body.region
      }
    });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating company',
      error: error.message 
    });
  }
});

// Get all companies
router.get('/', auth, async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const filter = { createdBy: req.user.user._id };

    if (searchTerm) {
      filter.$or = [
        { companyName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { industry: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const companies = await Company.find(filter);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching companies',
      error: error.message 
    });
  }
});


// Get company by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id,
      createdBy: req?.user?.user._id 
    });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching company',
      error: error.message 
    });
  }
});

// Update company
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'companyOwner', 'companyName', 'email', 'phone', 'mobile',
    'website', 'industry', 'currency', 'gstin', 'street', 'city',
    'state', 'country', 'region'
  ];
  
  const isValidOperation = updates.every(update => 
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const company = await Company.findOne({
      _id: req.params.id,
      createdBy: req?.user?.user._id
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Handle address fields separately
    const addressFields = ['street', 'city', 'state', 'country', 'region'];
    updates.forEach(update => {
      if (addressFields.includes(update)) {
        company.address[update] = req.body[update];
      } else {
        company[update] = req.body[update];
      }
    });

    await company.save();
    res.json(company);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating company',
      error: error.message 
    });
  }
});

// Delete company
router.delete('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      createdBy: req?.user?.user._id
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting company',
      error: error.message 
    });
  }
});

export default router;
