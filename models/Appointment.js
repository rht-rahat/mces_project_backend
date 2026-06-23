const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  serviceName: {
    type: String,
    default: 'General Consultation'
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  date: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
