const mongoose = require('mongoose');

const SliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  actionUrl: {
    type: String,
    default: '/'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Slider || mongoose.model('Slider', SliderSchema);
