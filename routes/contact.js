const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const dbHelper = require('../models/modelHelper');
const { sendNotificationToAdmins } = require('./notifications');

// POST /api/contact - Submit contact form or appointment request
router.post('/', async (req, res) => {
  const { name, email, phone, message, type, serviceName, date } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    const isAppointment = type === 'appointment';
    const notifType = isAppointment ? 'appointment' : 'contact_form';
    const notifTitle = isAppointment ? 'New Appointment Request' : 'New Contact Submission';
    const detailMessage = isAppointment 
      ? `Appointment requested by ${name} (${phone || 'No phone'}) for service: ${serviceName || 'General Consultation'}. Info: ${message}`
      : `${name} (${email}) sent a message: "${message}"`;

    // Save notification in database
    const notification = await dbHelper.create(Notification, 'notifications', {
      type: notifType,
      title: notifTitle,
      message: detailMessage
    });

    // If appointment, also create Appointment record
    if (isAppointment) {
      await dbHelper.create(Appointment, 'appointments', {
        name,
        email,
        phone: phone || '',
        message,
        serviceName: serviceName || 'General Consultation',
        date: date || '',
        status: 'pending'
      });
    }

    // Push real-time notification to connected admins
    sendNotificationToAdmins(notification);

    res.json({
      message: isAppointment 
        ? 'Appointment request submitted successfully. We will contact you soon.' 
        : 'Message sent successfully. Thank you for contacting us.'
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
