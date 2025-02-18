import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        trim: true
    },
  },
  {
    timestamps: true
  }
);

const activity = mongoose.model('activities', activitySchema);

export default activity;
