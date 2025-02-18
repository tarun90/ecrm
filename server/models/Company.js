import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  companyOwner: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Prospect', 'Partner', 'Reseller', 'Vendor', 'Other']
  },
  websiteUrl: {
    type: String,
    required: true
  },
  timeZone: {
    type: String,
    required: true
  },
  city: String,
  stateRegion: String,
  country: String,
  postalCode: String,
  numberOfEmployees: Number,
  annualRevenue: String,
  description: String,
  linkedinPage: String,
  phoneNumber: String,
  email:String,
  Currency:String,
  webTechnologies: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Company = mongoose.model('Company', companySchema);

export default Company;