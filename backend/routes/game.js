const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Path = require('../models/Path');
const { authMiddleware, teamOnly } = require('../middleware/auth');

// GET current clue for team
router.get('/current-clue', authMiddleware, teamOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.user.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.hasCompleted) {
      return res.json({
        status: 'completed',
        message: 'Congratulations! You have completed the treasure hunt!',
        messageInTelugu: 'అభినందనలు! మీరు నిధి వేటను పూర్తి చేశారు!',
        completionTime: team.completionTimeMinutes
      });
    }

    // Find the path
    const path = await Path.findOne({ pathNumber: team.assignedPathNumber });
    if (!path) return res.status(404).json({ error: 'Assigned path not found' });

    const currentIndex = team.currentPlaceIndex; // 0 = show clue for place 1, etc.
    
    if (currentIndex >= path.places.length) {
      return res.json({ status: 'completed', message: 'Hunt complete!' });
    }

    const currentPlace = path.places[currentIndex];
    
    // How many places completed
    const completedCount = team.progress.length;
    
    res.json({
      status: 'active',
      teamName: team.teamName,
      pathColor: team.assignedPathColor,
      currentStep: currentIndex + 1, // 1-indexed for display
      totalSteps: path.places.length,
      completedSteps: completedCount,
      clue: currentPlace.clue,
      clueInEnglish: currentPlace.clueInEnglish,
      placeName: currentPlace.placeName, // Don't reveal full name in clue view
      isDestination: currentPlace.isDestination,
      progress: team.progress.map(p => ({
        placeNumber: p.placeNumber,
        placeName: p.placeName,
        arrivedAt: p.arrivedAt
      }))
    });
  } catch (err) {
    console.error('Get current clue error:', err);
    res.status(500).json({ error: err.message });
  }
});

// VALIDATE QR code / manual code entry - THE CORE GAME MECHANIC
// When team scans QR at a location, they submit the code here
router.post('/validate-code', authMiddleware, teamOnly, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required', errorInTelugu: 'కోడ్ అవసరం' });
    }

    const team = await Team.findById(req.user.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.hasCompleted) {
      return res.status(400).json({ 
        error: 'You have already completed the hunt!',
        errorInTelugu: 'మీరు ఇప్పటికే పూర్తి చేశారు!'
      });
    }

    // Find the path
    const path = await Path.findOne({ pathNumber: team.assignedPathNumber });
    if (!path) return res.status(404).json({ error: 'Path not found' });

    const currentIndex = team.currentPlaceIndex;
    if (currentIndex >= path.places.length) {
      return res.status(400).json({ error: 'Hunt already completed' });
    }

    const currentPlace = path.places[currentIndex];
    const submittedCode = code.trim();

    // VALIDATE: Does the submitted code match the current place's validation code?
    if (submittedCode !== currentPlace.validationCode) {
      return res.status(400).json({
        success: false,
        error: 'Wrong location! This QR code is not for your current destination.',
        errorInTelugu: 'తప్పు స్థలం! ఈ QR కోడ్ మీ ప్రస్తుత గమ్యస్థానానికి కాదు.',
        hint: `You are looking for: ${currentPlace.placeName}`
      });
    }

    // ✅ CORRECT! Record progress
    team.progress.push({
      placeNumber: currentPlace.placeNumber,
      placeName: currentPlace.placeName,
      arrivedAt: new Date(),
      validationCode: submittedCode
    });

    // Move to next place
    team.currentPlaceIndex = currentIndex + 1;

    let responseData = {
      success: true,
      message: 'Correct! You found the location!',
      messageInTelugu: 'సరైనది! మీరు స్థలాన్ని కనుగొన్నారు!',
      completedPlace: currentPlace.placeName,
      completedPlaceNumber: currentPlace.placeNumber
    };

    // Check if this was the LAST place (destination)
    if (currentPlace.isDestination || team.currentPlaceIndex >= path.places.length) {
      team.hasCompleted = true;
      team.gameCompletedAt = new Date();
      if (team.gameStartedAt) {
        const diffMs = team.gameCompletedAt - team.gameStartedAt;
        team.completionTimeMinutes = Math.round(diffMs / 60000 * 10) / 10;
      }
      
      responseData = {
        ...responseData,
        status: 'completed',
        message: '🎉 Congratulations! You reached the destination!',
        messageInTelugu: '🎉 అభినందనలు! మీరు గమ్యస్థానానికి చేరుకున్నారు!',
        completionTime: team.completionTimeMinutes
      };

      // Emit to host dashboard
      if (req.io) {
        req.io.to('host-room').emit('team-completed', {
          teamId: team._id,
          teamName: team.teamName,
          pathColor: team.assignedPathColor,
          completionTimeMinutes: team.completionTimeMinutes,
          completedAt: team.gameCompletedAt
        });
      }
    } else {
      // Emit progress update to host
      const nextPlace = path.places[team.currentPlaceIndex];
      responseData.nextClue = nextPlace.clue;
      responseData.nextClueInEnglish = nextPlace.clueInEnglish;
      responseData.nextStep = team.currentPlaceIndex + 1;
      responseData.status = 'active';

      if (req.io) {
        req.io.to('host-room').emit('team-progress', {
          teamId: team._id,
          teamName: team.teamName,
          pathColor: team.assignedPathColor,
          currentPlaceIndex: team.currentPlaceIndex,
          completedPlace: currentPlace.placeName
        });
      }
    }

    await team.save();
    res.json(responseData);
  } catch (err) {
    console.error('Validate code error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET team's own progress (no standings, no other teams)
router.get('/my-progress', authMiddleware, teamOnly, async (req, res) => {
  try {
    const team = await Team.findById(req.user.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    res.json({
      teamName: team.teamName,
      pathColor: team.assignedPathColor,
      hasStarted: team.hasStarted,
      hasCompleted: team.hasCompleted,
      currentPlaceIndex: team.currentPlaceIndex,
      completionTimeMinutes: team.completionTimeMinutes,
      progress: team.progress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
