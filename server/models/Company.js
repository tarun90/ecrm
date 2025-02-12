import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyOwner: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  phone: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    enum: ['Technology', 'Manufacturing', 'Healthcare', 'Retail', 
           'Financial Services', 'Education', 'Other']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'INR', 'GBP', 'AUD', 'CAD']
  },
  gstin: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;