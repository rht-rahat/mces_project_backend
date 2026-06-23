const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  clientRole: {
    type: String,
    required: true
  },
  reviewText: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
