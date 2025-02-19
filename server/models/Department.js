import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
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

const departments = mongoose.model('departments', departmentSchema);

export default departments;
