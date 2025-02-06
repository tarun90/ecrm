import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: String,
    ref: 'Product',
    required: true
  },
  product_name: {
    type: String,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit_price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total_price: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
    unique: true
  },
  invoice_date: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    required: true
  },
  customer: {
    type: String,
    ref: 'Customer',  // Reference to the Customer model
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax_amount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  grand_total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  payment_status: {
    type: String,
    enum: ['paid', 'unpaid', 'partially_paid', 'overdue'],
    default: 'unpaid'
  },
  payment_mode: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash']
  },
  notes: String,
  terms_conditions: String,
  signature: String,
  approval_status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
