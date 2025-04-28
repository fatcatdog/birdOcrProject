// backend/cronJobs.js
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const Image = require('./models/Image');

// Helper: Get files older than a certain date
const getOldFiles = async (dir, days) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const files = await fs.readdir(dir);
  const oldFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isFile() && stats.mtime < cutoff) {
      oldFiles.push(filePath);
    }
  }
  return oldFiles;
};

// Cron Job 1: Clean up unreferenced files older than 30 days
const cleanupOldFiles = cron.schedule('0 0 * * *', async () => {
  // Runs daily at midnight
  try {
    console.log('Running file cleanup job...');
    const uploadsDir = path.join(__dirname, '../uploads'); // Adjust path to your uploads folder
    const oldFiles = await getOldFiles(uploadsDir, 30); // Files older than 30 days

    // Get all filenames in the database
    const dbImages = await Image.find({}, 'filename');
    const dbFilenames = dbImages.map((img) => img.filename);

    // Delete files not in the database
    for (const filePath of oldFiles) {
      const filename = path.basename(filePath);
      if (!dbFilenames.includes(filename)) {
        await fs.unlink(filePath);
        console.log(`Deleted unreferenced file: ${filename}`);
      }
    }
    console.log('File cleanup completed.');
  } catch (err) {
    console.error('File cleanup error:', err.message);
  }
}, {
  scheduled: false, // Don't start automatically
});

// Cron Job 2: Remove expired tokens (if applicable)
const cleanupTokens = cron.schedule('0 */6 * * *', async () => {
  // Runs every 6 hours
  try {
    console.log('Running token cleanup job...');
    // Example: Hypothetical Token model for refresh tokens
    const Token = mongoose.model('Token', new mongoose.Schema({
      token: String,
      userId: mongoose.Schema.Types.ObjectId,
      expiresAt: Date,
    }));
    const result = await Token.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Deleted ${result.deletedCount} expired tokens.`);
  } catch (err) {
    console.error('Token cleanup error:', err.message);
  }
}, {
  scheduled: false, // Don't start automatically
});

const countImagesToday = cron.schedule('* * * * *', async () => {
    // Runs daily at 23:55
    try {
      console.log('Running daily image count job...');
  
      // Define the start and end of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Midnight today
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today
  
      // Count images where uploadedAt is within today
      const count = await Image.countDocuments({
        uploadedAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
  
      // Log the result
      const logMessage = `Images created on ${todayStart.toISOString().split('T')[0]}: ${count}\n`;
      console.log(logMessage);
  
      // Optionally save to a file
      const logFile = path.join(__dirname, './logs/image-counts.log');
      await fs.appendFile(logFile, logMessage);
  
    } catch (err) {
      console.error('Image count job error:', err.message);
      // Optionally log errors to a file
      await fs.appendFile(
        path.join(__dirname, '../logs/error.log'),
        `Error in image count job (${new Date().toISOString()}): ${err.message}\n`
      );
    }
  }, {
    scheduled: false, // Don't start automatically
  });

module.exports = { countImagesToday, cleanupOldFiles, cleanupTokens };