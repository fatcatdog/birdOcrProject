const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Image = require('../models/Image');
const router = express.Router();
const path = require('path');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      userId: req.userId,
      imageUrl: `/uploads/${req.file.filename}`
    });
    await image.save();
    res.status(201).json({ message: 'Image uploaded', image });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's images
router.get('/gallery', auth, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Simple Auth message 
router.get('/auth', auth, async (req, res) => {
  try {
    res.status(200)
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;