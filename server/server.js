const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const slotRoutes = require('./routes/slotRoutes');
const Slot = require('./models/Slot');

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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
    await seedInitialSlots();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
