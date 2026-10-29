const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Slot = require('../models/Slot');

const JWT_SECRET = process.env.JWT_SECRET || 'college_parking_secret_jwt_key_2025';

/**
 * Middleware: Verify that user is authenticated and has Admin role
 * Students, Visitors, and unauthenticated requests are blocked from modifying slots
 */
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Admin accounts can control parking slots.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Admin has permission to mark slots or reset parking.',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in as Admin.',
    });
  }
};

/**
 * @route   GET /api/slots
 * @desc    Get all 12 parking slots sorted by slotOrder
 * @access  Public (Everyone, Students, Faculty, Visitors can view status)
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all slots from MongoDB and sort them in numerical order (P1 to P12)
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

/**
 * @route   PATCH /api/slots/:id
 * @desc    Update a parking slot's status (Available <-> Occupied)
 * @access  Admin Only
 */
router.patch('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Slot ID format',
    });
  }

  // Validate status value
  if (!status || !['Available', 'Occupied'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be either 'Available' or 'Occupied'",
    });
  }

  try {
    // Find the slot by ID and update its status
    const updatedSlot = await Slot.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true } // Return updated doc & run schema validations
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

/**
 * @route   POST /api/slots/reset
 * @desc    Reset all parking slots to "Available"
 * @access  Admin Only
 */
router.post('/reset', verifyAdmin, async (req, res) => {
  try {
    // Update all slot documents in MongoDB to status "Available"
    await Slot.updateMany({}, { status: 'Available' });

    // Fetch the updated list to send back to the frontend
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
