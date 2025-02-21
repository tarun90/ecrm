import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    categoryId: {  // Add this field
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Campaign = mongoose.model('Campaign', CampaignSchema);

export default Campaign;
