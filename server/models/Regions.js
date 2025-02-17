import mongoose from 'mongoose';

const RegionSchema = new mongoose.Schema(
  {
    regionName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
  },
  {
    timestamps: true
  }
);

const Region = mongoose.model('Region', RegionSchema);

export default Region;