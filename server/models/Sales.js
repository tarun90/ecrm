import mongoose from 'mongoose';

// Sales Schema
const salesSchema = new mongoose.Schema({
  sales_number: {
    type: String,
    unique: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  technology: {
    type: String,
    required: true,
  },
  grand_total: {
    type: Number,
    required: true,
    min: [0, 'Grand total cannot be negative'],
  },
  activities: {
    type: String,
    default: 'No activities specified',
  },
  status: {
    type: String,
    default: 'in_progress',
  },
  sales_date: {
    type: Date,
    default: Date.now,
  },
  sales_updated_date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// ✅ Pre-save Hook for Auto-generating `sales_number`
salesSchema.pre('save', async function (next) {
  if (this.isNew && !this.sales_number) {
    try {
      const lastSale = await mongoose.model('Sales').findOne().sort({ createdAt: -1 });
      const newNumber = lastSale && lastSale.sales_number
        ? parseInt(lastSale.sales_number.replace('SO-', ''), 10) + 1
        : 1;

      this.sales_number = `SO-${String(newNumber).padStart(5, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// ✅ Pre-save Hook to Update `sales_updated_date` on Save
salesSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.sales_updated_date = Date.now();
  }
  next();
});

// ✅ Pre-update Hook to Update `sales_updated_date` on findOneAndUpdate
salesSchema.pre('findOneAndUpdate', function (next) {
  this.set({ sales_updated_date: Date.now() });
  next();
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;
