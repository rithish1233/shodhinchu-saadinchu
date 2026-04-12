const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Path = require('../models/Path');
const { authMiddleware, hostOnly } = require('../middleware/auth');

// Host dashboard overview
router.get('/dashboard', authMiddleware, hostOnly, async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true }).sort('registeredAt');
    const paths = await Path.find().sort('pathNumber');

    const teamsWithDetails = teams.map(team => {
      const path = paths.find(p => p.pathNumber === team.assignedPathNumber);
      return {
        _id: team._id,
        teamName: team.teamName,
        teamMembers: team.teamMembers,
        pathNumber: team.assignedPathNumber,
        pathColor: team.assignedPathColor,
        pathColorInTelugu: path?.pathColorInTelugu || '',
        pincode: team.pincode,
        hasStarted: team.hasStarted,
        hasCompleted: team.hasCompleted,
        currentPlaceIndex: team.currentPlaceIndex,
        totalPlaces: path?.places?.length || 5,
        completionTimeMinutes: team.completionTimeMinutes,
        gameStartedAt: team.gameStartedAt,
        gameCompletedAt: team.gameCompletedAt,
        registeredAt: team.registeredAt,
        progress: team.progress
      };
    });

    // Leaderboard: completed teams sorted by time
    const leaderboard = teamsWithDetails
      .filter(t => t.hasCompleted)
      .sort((a, b) => (a.completionTimeMinutes || 999) - (b.completionTimeMinutes || 999))
      .map((t, i) => ({ ...t, rank: i + 1 }));

    // Active teams
    const activeTeams = teamsWithDetails.filter(t => t.hasStarted && !t.hasCompleted);
    
    // Not started teams
    const notStarted = teamsWithDetails.filter(t => !t.hasStarted);

    res.json({
      summary: {
        totalTeams: teams.length,
        totalPaths: paths.length,
        completedTeams: leaderboard.length,
        activeTeams: activeTeams.length,
        notStartedTeams: notStarted.length
      },
      leaderboard,
      activeTeams,
      notStarted,
      allTeams: teamsWithDetails,
      paths: paths.map(p => ({
        _id: p._id,
        pathNumber: p.pathNumber,
        pathColor: p.pathColor,
        pathColorInTelugu: p.pathColorInTelugu,
        pathName: p.pathName,
        placesCount: p.places.length,
        isComplete: p.places.length === 5
      }))
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard only
router.get('/leaderboard', authMiddleware, hostOnly, async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true, hasCompleted: true })
      .sort('completionTimeMinutes');
    
    const leaderboard = teams.map((team, i) => ({
      rank: i + 1,
      teamName: team.teamName,
      teamMembers: team.teamMembers,
      pathColor: team.assignedPathColor,
      completionTimeMinutes: team.completionTimeMinutes,
      gameStartedAt: team.gameStartedAt,
      gameCompletedAt: team.gameCompletedAt
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset all teams (for new game)
router.post('/reset-all', authMiddleware, hostOnly, async (req, res) => {
  try {
    await Team.updateMany({ isActive: true }, {
      $set: {
        currentPlaceIndex: 0,
        progress: [],
        gameStartedAt: null,
        gameCompletedAt: null,
        completionTimeMinutes: null,
        hasStarted: false,
        hasCompleted: false
      }
    });
    res.json({ message: 'All teams reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
