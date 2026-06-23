require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local static file uploads (will only work locally, not on Vercel)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auto-connect DB before every API request (required for Vercel serverless)
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
const authRoute = require('./routes/auth').router;
const passportsRoute = require('./routes/passports');
const packagesRoute = require('./routes/packages');
const circularsRoute = require('./routes/circulars');
const slidersRoute = require('./routes/sliders');
const reviewsRoute = require('./routes/reviews');
const blogsRoute = require('./routes/blogs');
const notificationsRoute = require('./routes/notifications').router;
const messagesRoute = require('./routes/messages');
const contactRoute = require('./routes/contact');
const galleryRoute = require('./routes/gallery');
const appointmentsRoute = require('./routes/appointments');
const seedRoute = require('./routes/seed');

app.use('/api/auth', authRoute);
app.use('/api/passports', passportsRoute);
app.use('/api/packages', packagesRoute);
app.use('/api/circulars', circularsRoute);
app.use('/api/sliders', slidersRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/blogs', blogsRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/contact', contactRoute);
app.use('/api/gallery', galleryRoute);
app.use('/api/appointments', appointmentsRoute);
app.use('/api/seed', seedRoute);

// Base route
app.get('/', (req, res) => {
  res.send('MCES Platform Backend API is running...');
});

// Start Server (only locally when not on Vercel)
if (!process.env.VERCEL) {
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  };
  startServer();
}

module.exports = app;
