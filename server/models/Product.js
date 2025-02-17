import mongoose from 'mongoose';

const outreachSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  website: String,
  linkedin: String,
  country: String,
  status: {
    type: String,
    enum: ['Unassigned', 'Not Contacted', 'Contacted', 'Followup', 'Converted to Deal'],
    default: 'Unassigned'
  },
  region: String,
  campaign: String,
  createdBy: String,
  assignedTo: String
});

const Outreach = mongoose.model('Outreach', outreachSchema);

export default Outreach;
