const cloudinary = require('cloudinary').v2;

let isConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isConfigured = true;
  console.log('Cloudinary configured successfully!');
} else {
  console.log('⚠️ Cloudinary keys not found in .env.');
  console.log('🔄 Running in LOCAL STORAGE FILE UPLOAD mode!');
}

module.exports = {
  cloudinary,
  isConfigured: () => isConfigured
};
