const mongoose = require('mongoose');

const PassportSchema = new mongoose.Schema({
  holderName: {
    type: String,
    required: true
  },
  passportNumber: {
    type: String, // Will contain encrypted string: "iv:encryptedData"
    required: true
  },
  submissionDate: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'In Process', 'Approved', 'Rejected'],
    default: 'Submitted'
  }
}, { timestamps: true });

module.exports = mongoose.models.Passport || mongoose.model('Passport', PassportSchema);
