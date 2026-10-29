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

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send({
    message: 'Parking Slot Tracker API is running smoothly',
    status: 'UP',
  });
});

app.use('/api/slots', slotRoutes);
app.use('/api/auth', authRoutes);

const seedInitialSlots = async () => {
  const existingCount = await Slot.countDocuments();
  if (existingCount) {
    console.log(`Database already contains ${existingCount} parking slots.`);
    return;
  }

  const slots = Array.from({ length: 12 }, (_, index) => ({
    slotNumber: `P${index + 1}`,
    slotOrder: index + 1,
    status: 'Available',
  }));

  await Slot.insertMany(slots);
  console.log('Successfully seeded 12 parking slots into MongoDB.');
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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
    await seedInitialSlots();
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
