const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const slotRoutes = require('./routes/slotRoutes');
const Slot = require('./models/Slot');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parking_tracker';

// Middleware
app.use(cors()); // Allows frontend running on another port (e.g., 5173) to communicate
app.use(express.json()); // Parses incoming JSON request bodies

// Root endpoint to verify server is running
app.get('/', (req, res) => {
  res.send({
    message: 'Parking Slot Tracker API is running smoothly',
    status: 'UP',
  });
});

// API Routes
app.use('/api/slots', slotRoutes);

/**
 * Seed function to ensure 12 parking slots (P1 to P12) exist in MongoDB.
 * If slots already exist, it will NOT duplicate them.
 */
const seedInitialSlots = async () => {
  try {
    const existingCount = await Slot.countDocuments();
    if (existingCount === 0) {
      console.log('No slots found in database. Initializing 12 parking slots (P1 to P12)...');
      
      const defaultSlots = [];
      for (let i = 1; i <= 12; i++) {
        defaultSlots.push({
          slotNumber: `P${i}`,
          slotOrder: i,
          status: 'Available',
        });
      }

      await Slot.insertMany(defaultSlots);
      console.log('Successfully seeded 12 parking slots into MongoDB.');
    } else {
      console.log(`Database already contains ${existingCount} parking slots.`);
    }
  } catch (error) {
    console.error('Error during initial slot seeding:', error.message);
  }
};

// Connect to MongoDB and start the Express server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    // Check and seed initial slots if needed
    await seedInitialSlots();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.error('Please ensure MongoDB Community Server is installed and running.');
    process.exit(1);
  });
