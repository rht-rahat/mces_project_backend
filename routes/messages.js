const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Message = require('../models/Message');
const dbHelper = require('../models/modelHelper');

// সেফটি চেকিংয়ের জন্য নোটিফিকেশন ফাংশন ট্রাই-ক্যাচ দিয়ে রিকোয়ার করা
let sendNotificationToAdmins = null;
try {
  // একই ফোল্ডারে থাকলে './notifications' হবে
  const notificationsModule = require('./notifications');
  sendNotificationToAdmins = notificationsModule.sendNotificationToAdmins;
} catch (e) {
  console.log("Notification module auto-import fallback checking...");
  try {
    // এক ফোল্ডার বাইরে থাকলে '../routes/notifications' বা জোড়া পাথ চেক
    const notificationsModule = require('../routes/notifications');
    sendNotificationToAdmins = notificationsModule.sendNotificationToAdmins;
  } catch (err) {
    console.error("Warning: Could not resolve notifications path. Live admin alerts will be bypassed safely.");
  }
}

// User SSE Clients mapping: userId -> array of response objects
let userClients = {};

// Broadcast to a specific user's chat stream
const sendMessageToUser = (userId, message) => {
  const clients = userClients[userId] || [];
  const payload = JSON.stringify(message);
  console.log(`Broadcasting chat message to user ${userId} (${clients.length} clients).`);
  clients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      console.error("Error writing to user SSE client:", err);
    }
  });
};

// SSE stream for a specific user to receive replies in real-time
router.get('/stream/:userId', (req, res) => {
  const { userId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write('data: {"type": "ping"}\n\n');

  const clientId = Date.now();
  const newClient = { id: clientId, res };

  if (!userClients[userId]) {
    userClients[userId] = [];
  }
  userClients[userId].push(newClient);

  console.log(`User chat SSE connected: ${userId}. Active clients: ${userClients[userId].length}`);

  req.on('close', () => {
    if (userClients[userId]) {
      userClients[userId] = userClients[userId].filter(c => c.id !== clientId);
      console.log(`User chat SSE disconnected: ${userId}. Active clients: ${userClients[userId].length}`);
    }
  });
});

// POST /api/messages - User sends a message
router.post('/', async (req, res) => {
  try {
    const { userId, message, senderName } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    const newMessage = await dbHelper.create(Message, 'messages', {
      userId,
      message,
      senderName,
      sender: 'user'
    });

    const msgObj = newMessage.toObject ? newMessage.toObject() : { ...newMessage };
    const normalizedId = (msgObj._id || msgObj.id || "").toString();
    msgObj.id = normalizedId;
    msgObj._id = normalizedId;

    // ১. ইউজার স্ক্রিনে পাঠানো
    sendMessageToUser(userId, msgObj);

    // ২. অ্যাডমিন প্যানেলে রিয়েল-টাইম পুশ (Safe Call)
    if (typeof sendNotificationToAdmins === 'function') {
      sendNotificationToAdmins({
        type: 'chat_message',
        chat: msgObj
      });
    }

    return res.status(201).json(msgObj);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/reply - Admin replies to a user session (Admin Only)
router.post('/reply', auth, admin, async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing field userId or message' });
    }

    const newMessage = await dbHelper.create(Message, 'messages', {
      userId,
      message,
      senderName: 'Admin Support',
      sender: 'admin'
    });

    const msgObj = newMessage.toObject ? newMessage.toObject() : { ...newMessage };
    const normalizedId = (msgObj._id || msgObj.id || "").toString();
    msgObj.id = normalizedId;
    msgObj._id = normalizedId;

    // ইউজারকে লাইভ পাঠানো
    sendMessageToUser(userId, msgObj);

    // অন্য অ্যাডমিনদের লাইভ প্যানেল আপডেট করা
    if (typeof sendNotificationToAdmins === 'function') {
      sendNotificationToAdmins({
        type: 'chat_message',
        chat: msgObj
      });
    }

    return res.status(201).json(msgObj);
  } catch (error) {
    console.error('Send reply error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/history/:userId - Get chat history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await dbHelper.find(Message, 'messages', { userId }, { createdAt: 1 });
    return res.json(list);
  } catch (error) {
    console.error('Fetch chat history error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/threads - Get active chat threads
router.get('/threads', auth, admin, async (req, res) => {
  try {
    const list = await dbHelper.find(Message, 'messages', {}, { createdAt: -1 });
    
    const threadsMap = {};
    list.forEach(msg => {
      const uId = msg.userId;
      if (!threadsMap[uId]) {
        threadsMap[uId] = {
          userId: uId,
          senderName: msg.senderName,
          lastMessage: msg.message,
          updatedAt: msg.createdAt
        };
      }
    });

    return res.json(Object.values(threadsMap));
  } catch (error) {
    console.error('Fetch chat threads error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;