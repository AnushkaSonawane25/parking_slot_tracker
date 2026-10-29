const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const slotRoutes = require('./routes/slotRoutes');
const authRoutes = require('./routes/authRoutes');
const Slot = require('./models/Slot');
const User = require('./models/User');

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
app.use('/api/auth', authRoutes);

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

/**
 * Predefine Campus Admin Account in MongoDB
 * Credentials:
 *   Email: admin@college.edu
 *   Password: admin123
 */
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@college.edu';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'Campus Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
      });
      console.log('Successfully created predefined Admin: admin@college.edu / admin123');
    } else {
      // Ensure existing admin account retains the Admin role
      if (existingAdmin.role !== 'Admin') {
        existingAdmin.role = 'Admin';
        await existingAdmin.save();
      }
      console.log('Predefined Admin account ready (admin@college.edu).');
    }
  } catch (error) {
    console.error('Error seeding predefined admin account:', error.message);
  }
};

// Connect to MongoDB and start the Express server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    // Check and seed initial slots & predefined admin
    await seedInitialSlots();
    await seedDefaultAdmin();

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
