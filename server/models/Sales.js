import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  sales_number: {
    type: String,
    required: true,
    unique: true
  },
  sales_date: {
      type: Date,
      default: Date.now
    },
sales_updated_date: {
    type: Date,
    default: Date.now
    },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" }, // Ensure this exists!

  sales_person: {
    type: String,
    required: true
  },
  grand_total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  activities: {
    type: String,
    enum: ['magento_dadicated', 'seo', 'magento_suport_package', 'suport_package'],
    default: 'suport_package'
  },
  status: {
    type: String,
    enum: ['in_progress', 'on_hold', 'completed'],
    default: 'in_progress'
  }
}, {
  timestamps: true
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;
