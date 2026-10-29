const mongoose = require('mongoose');

// Schema definition for each parking slot
// This represents the structure of documents stored in MongoDB
const slotSchema = new mongoose.Schema(
  {
    // Slot label displayed to the user (e.g., "P1", "P2", ... "P12")
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      unique: true,
      trim: true,
    },
    // Numeric order (1 to 12) to ensure slots are sorted properly
    slotOrder: {
      type: Number,
      required: true,
    },
    // Current status of the parking slot: only "Available" or "Occupied"
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Available', 'Occupied'],
        message: '{VALUE} is not a valid status. Must be Available or Occupied.',
      },
      default: 'Available',
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the Mongoose model
module.exports = mongoose.model('Slot', slotSchema);
