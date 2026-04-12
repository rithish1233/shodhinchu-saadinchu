const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

// Host Login
router.post('/host-login', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.HOST_PASSWORD || 'hostpassword123';
  
  if (password !== correctPassword) {
    return res.status(401).json({ error: 'Invalid host password' });
  }

  const token = jwt.sign(
    { role: 'host', id: 'host' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  res.json({ 
    token, 
    role: 'host',
    message: 'Host login successful' 
  });
});

// Team Login (pincode + pathColor)
router.post('/team-login', async (req, res) => {
  try {
    const { pincode, pathColor } = req.body;

    if (!pincode || !pathColor) {
      return res.status(400).json({ error: 'Pincode and path color are required' });
    }

    // Find team by pincode AND pathColor
    const team = await Team.findOne({ 
      pincode: pincode.toString().trim(),
      assignedPathColor: { $regex: new RegExp(`^${pathColor.trim()}$`, 'i') },
      isActive: true
    });

    if (!team) {
      return res.status(401).json({ error: 'Invalid credentials. Check your pincode and path color.' });
    }

    // Start game timer if first login
    if (!team.hasStarted) {
      team.hasStarted = true;
      team.gameStartedAt = new Date();
      await team.save();
    }

    const token = jwt.sign(
      { role: 'team', id: team._id, teamName: team.teamName, pathNumber: team.assignedPathNumber, pathColor: team.assignedPathColor },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      role: 'team',
      teamName: team.teamName,
      teamId: team._id,
      pathColor: team.assignedPathColor,
      currentPlaceIndex: team.currentPlaceIndex,
      hasCompleted: team.hasCompleted,
      message: 'Team login successful'
    });
  } catch (err) {
    console.error('Team login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
