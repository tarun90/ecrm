const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: String,
  zipCode: String
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  billing_address: {
    type: addressSchema,
    required: true
  },
  shipping_address: addressSchema
}, {
  timestamps: true
});

module.exports =  mongoose.model('Customer', customerSchema);