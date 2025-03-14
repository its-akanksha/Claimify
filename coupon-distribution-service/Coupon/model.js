const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['available', 'claimed'],
    default: 'available'
  },
  assignedTo: {
    type: String, 
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
