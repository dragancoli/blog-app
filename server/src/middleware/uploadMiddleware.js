// src/middleware/uploadMiddleware.js
const multer = require('multer');

// Koristićemo memoriju za privremeno čuvanje fajla pre slanja na Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;