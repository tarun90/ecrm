import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  stage: {
    type: String,
    enum: ['New Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New Leads',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contact: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Contact',
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  closeDate: {
    type: Date,
    required: true,
  },
  notes: String,
  type: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);