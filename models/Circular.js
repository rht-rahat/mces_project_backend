const mongoose = require('mongoose');

const CircularSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  jobCategory: {
    type: String,
    required: true
  },
  salaryRange: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.Circular || mongoose.model('Circular', CircularSchema);
