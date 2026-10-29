const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Slot = require('../models/Slot');

router.get('/', async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotOrder: 1 });
    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    console.error('Error fetching slots:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching parking slots',
      error: error.message,
    });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, vehicleNumber, vehicleType, userRole } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Slot ID format',
    });
  }

  if (!status || !['Available', 'Occupied'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be either 'Available' or 'Occupied'",
    });
  }

  try {
    const updateData = { status };

    if (status === 'Occupied') {
      if (typeof vehicleNumber !== 'string' || !vehicleNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle License Plate Number is required for check-in.',
        });
      }
      updateData.vehicleNumber = vehicleNumber.trim().toUpperCase();
      updateData.vehicleType = vehicleType || 'Car';
      updateData.userRole = userRole || 'Student';
      updateData.occupiedAt = new Date();
    } else {
      updateData.vehicleNumber = null;
      updateData.vehicleType = null;
      updateData.userRole = null;
      updateData.occupiedAt = null;
    }

    const updatedSlot = await Slot.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Slot ${updatedSlot.slotNumber} updated to ${updatedSlot.status}`,
      data: updatedSlot,
    });
  } catch (error) {
    console.error('Error updating slot:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating parking slot',
      error: error.message,
    });
  }
});

router.post('/reset', async (req, res) => {
  try {
    await Slot.updateMany(
      {},
      {
        status: 'Available',
        vehicleNumber: null,
        vehicleType: null,
        userRole: null,
        occupiedAt: null,
      }
    );

    const resetSlots = await Slot.find().sort({ slotOrder: 1 });

    res.status(200).json({
      success: true,
      message: 'All parking slots have been reset to Available',
      data: resetSlots,
    });
  } catch (error) {
    console.error('Error resetting slots:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting parking slots',
      error: error.message,
    });
  }
});

module.exports = router;
