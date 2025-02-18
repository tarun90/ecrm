import express from 'express';
import Company from '../models/Company.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';
import Deal from '../models/Deal.js';
import Contact from '../models/Contact.js';
const router = express.Router();

// Create a new company
router.post('/', auth, async (req, res) => {
  try {
    const company = new Company({
      companyName: req.body.companyName,
      companyOwner: req.body.companyOwner,
      industry: req.body.industry,
      type: req.body.type,
      city: req.body.city,
      stateRegion: req.body.stateRegion,
      country: req.body.country,
      postalCode: req.body.postalCode,
      numberOfEmployees: req.body.numberOfEmployees,
      annualRevenue: req.body.annualRevenue,
      timeZone: req.body.timeZone,
      description: req.body.description,
      linkedinPage: req.body.linkedinPage,
      webTechnologies: req.body.webTechnologies,
      websiteUrl: req.body.websiteUrl,
      createdBy: req.user?.user._id,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      Currency: req.body.Currency
    });

    // Optional: Check for existing company before saving
    const existingCompany = await Company.findOne({ 
      companyName: { 
        $regex: new RegExp(`^${req.body.companyName.trim()}$`, 'i') 
      } 
    });
    
    if (existingCompany) {
      return res.status(400).json({ 
        message: 'A company with this name already exists'
      });
    }

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Error creating company',
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
router.get('/view/:id', auth, async (req, res) => {
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
  try {
    const companyId = req.params.id;

    // Check if company exists
    let company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company details
    company.companyName = req.body.companyName || company.companyName;
    company.companyOwner = req.body.companyOwner || company.companyOwner;
    company.industry = req.body.industry || company.industry;
    company.type = req.body.type || company.type;
    company.city = req.body.city || company.city;
    company.stateRegion = req.body.stateRegion || company.stateRegion;
    company.country = req.body.country || company.country;
    company.postalCode = req.body.postalCode || company.postalCode;
    company.numberOfEmployees = req.body.numberOfEmployees || company.numberOfEmployees;
    company.annualRevenue = req.body.annualRevenue || company.annualRevenue;
    company.timeZone = req.body.timeZone || company.timeZone;
    company.description = req.body.description || company.description;
    company.linkedinPage = req.body.linkedinPage || company.linkedinPage;
    company.webTechnologies = req.body.webTechnologies || company.webTechnologies;
    company.websiteUrl = req.body.websiteUrl || company.websiteUrl;
    company.phoneNumber = req.body.phoneNumber || company.phoneNumber;
    company.email = req.body.email || company.email;
    company.Currency = req.bodyCurrency || company.Currency;

    // Check if the updated company name already exists (excluding itself)
    const existingCompany = await Company.findOne({ 
      companyName: { 
        $regex: new RegExp(`^${req.body.companyName.trim()}$`, 'i') 
      }, 
      _id: { $ne: companyId }
    });

    if (existingCompany) {
      return res.status(400).json({ 
        message: 'A company with this name already exists' 
      });
    }

    // Save the updated company
    await company.save();

    res.status(200).json(company);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Error updating company',
      error: error
    }); 
  }
});
// Delete company
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if company is associated with any deals or contacts
    const existingDeals = await Deal.findOne({ company: req.params.id });
    const existingContacts = await Contact.findOne({ company: req.params.id });

    if (existingDeals || existingContacts) {
      return res.status(200).json({ 
        message: 'Cannot delete company as it is associated with deals or contacts. Please remove these associations first.',
        status:500
      });
    }

    // If no associations found, proceed with deletion
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      createdBy: req?.user?.user._id
    });

    if (!company) {
      return res.status(200).json({ message: 'Company not found',status:500 });
    }

    return res.status(200).json({ 
      message: 'Company deleted successfully.',
      status:200
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting company',
      error: error.message,
      status:500
    });
  }
});

// API to fetch only companyName and _id
router.get('/names', auth, async (req, res) => {
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

    const companies = await Company.find(filter).select("companyName _id");
    res.json(companies);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching companies',
      error: error.message 
    });
  }
});


export default router;
