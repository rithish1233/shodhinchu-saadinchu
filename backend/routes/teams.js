const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Path = require('../models/Path');
const { authMiddleware, hostOnly } = require('../middleware/auth');

// Register team (host only)
router.post('/register', authMiddleware, hostOnly, async (req, res) => {
  try {
    const { teamName, teamMembers, assignedPathNumber } = req.body;

    if (!teamName || !assignedPathNumber) {
      return res.status(400).json({ error: 'Team name and path number are required' });
    }

    // Find the path
    const path = await Path.findOne({ pathNumber: assignedPathNumber });
    if (!path) {
      return res.status(404).json({ error: `Path number ${assignedPathNumber} not found. Create the path first.` });
    }

    if (path.places.length < 5) {
      return res.status(400).json({ error: `Path ${assignedPathNumber} doesn't have all 5 places configured yet.` });
    }

    // Generate unique pincode
    let pincode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      pincode = Team.generatePincode();
      const existing = await Team.findOne({ pincode, assignedPathColor: path.pathColor });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Could not generate unique pincode. Try again.' });
    }

    const team = new Team({
      teamName: teamName.trim(),
      teamMembers: teamMembers || [],
      assignedPathNumber,
      assignedPathColor: path.pathColor,
      pincode,
      currentPlaceIndex: 0
    });

    await team.save();

    res.status(201).json({
      team: {
        _id: team._id,
        teamName: team.teamName,
        teamMembers: team.teamMembers,
        assignedPathNumber: team.assignedPathNumber,
        assignedPathColor: team.assignedPathColor,
        pathColorInTelugu: path.pathColorInTelugu,
        pincode: team.pincode,
        registeredAt: team.registeredAt
      },
      credentials: {
        pincode: team.pincode,
        pathColor: team.assignedPathColor,
        loginInstructions: `Login with PIN: ${pincode} and Path Color: ${path.pathColor}`
      }
    });
  } catch (err) {
    console.error('Register team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all teams (host only)
router.get('/', authMiddleware, hostOnly, async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).sort('-registeredAt');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single team (host only)
router.get('/:id', authMiddleware, hostOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete team (host only)
router.delete('/:id', authMiddleware, hostOnly, async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset team progress (host only)
router.post('/:id/reset', authMiddleware, hostOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    team.currentPlaceIndex = 0;
    team.progress = [];
    team.gameStartedAt = null;
    team.gameCompletedAt = null;
    team.completionTimeMinutes = null;
    team.hasStarted = false;
    team.hasCompleted = false;

    await team.save();
    res.json({ message: 'Team progress reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
