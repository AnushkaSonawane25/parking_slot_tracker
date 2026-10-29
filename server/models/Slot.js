const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      unique: true,
      trim: true,
    },
    slotOrder: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Available', 'Occupied'],
        message: '{VALUE} is not a valid status. Must be Available or Occupied.',
      },
      default: 'Available',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: null,
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike / Two-Wheeler', 'EV', null],
      default: null,
    },
    userRole: {
      type: String,
      enum: ['Student', 'Faculty', 'Visitor', null],
      default: null,
    },
    occupiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Slot', slotSchema);
