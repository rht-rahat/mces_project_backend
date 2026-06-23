const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Notification = require('../models/Notification');
const dbHelper = require('../models/modelHelper');

// Active Server-Sent Events (SSE) connections for admins
let adminClients = [];

// Broadcast a notification to all connected admins
const sendNotificationToAdmins = (notification) => {
  const payload = JSON.stringify(notification);
  console.log(`Broadcasting SSE notification to ${adminClients.length} admin clients.`);
  adminClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
};

// Establish SSE stream endpoint for Admins (Real-time updates)
router.get('/stream', (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*' // Enable CORS for SSE stream
  });

  // Send initial ping to establish connection
  res.write('data: {"type": "ping"}\n\n');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  adminClients.push(newClient);

  console.log(`Admin SSE client connected. Total clients: ${adminClients.length}`);

  // Monitor client disconnects
  req.on('close', () => {
    adminClients = adminClients.filter(client => client.id !== clientId);
    console.log(`Admin SSE client disconnected. Total clients: ${adminClients.length}`);
  });
});

// GET /api/notifications - Fetch all notifications (Admin Only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const list = await dbHelper.find(Notification, 'notifications', {}, { createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read (Admin Only)
router.patch('/:id/read', auth, admin, async (req, res) => {
  try {
    const updated = await dbHelper.findByIdAndUpdate(Notification, 'notifications', req.params.id, { isRead: true });
    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/:id/status - Update Appointment Status (Admin Only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be pending, accepted, or rejected.' });
  }

  try {
    const updated = await dbHelper.findByIdAndUpdate(Notification, 'notifications', req.params.id, { 
      status: status,
      isRead: true // স্ট্যাটাস চেঞ্জ করলে নোটিফিকেশনটি অটোমেটিক পঠিত (Read) হয়ে যাবে
    });

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/notifications/clear - Clear all notifications (Admin Only)
router.delete('/clear', auth, admin, async (req, res) => {
  try {
    if (dbHelper.isConnected()) {
      await Notification.deleteMany({});
    } else {
      const store = dbHelper.getDB();
      store.notifications = [];
      dbHelper.saveDB(store);
    }
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  router,
  sendNotificationToAdmins,
  adminClients
};