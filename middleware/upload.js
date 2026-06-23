const multer = require('multer');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const handleUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const fileBuffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const publicId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (!isConfigured()) {
      return res.status(500).json({ error: 'Cloudinary is not configured. Set CLOUDINARY_* env vars.' });
    }

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'mces_platform',
        public_id: publicId
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'File upload to Cloudinary failed.' });
        }
        req.fileUrl = result.secure_url;
        req.filePublicId = result.public_id;
        next();
      }
    ).end(fileBuffer);
  } catch (error) {
    console.error('Upload middleware error:', error);
    res.status(500).json({ error: 'File upload processing failed.' });
  }
};

module.exports = {
  uploadSingle: upload.single('file'),
  handleUpload
};
