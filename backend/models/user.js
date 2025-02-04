const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  tokens: Object,
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema); 