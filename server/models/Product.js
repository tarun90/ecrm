import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description_short: String,
  description_long: String,
  product_type: {
    type: String,
    enum: ['physical', 'digital', 'subscription', 'service'],
    required: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  billing_frequency: String,
  term: String,
  url: String,
  unit_cost: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  tax_rate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model('products', productSchema);

export default Product;