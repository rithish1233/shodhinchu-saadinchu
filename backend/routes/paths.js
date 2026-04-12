const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Path = require('../models/Path');
const { authMiddleware, hostOnly } = require('../middleware/auth');

// Generate QR code for a validation code
const generateQR = async (validationCode) => {
  try {
    // The QR encodes JUST the validation code string
    // When scanned, the app reads this code and sends it to the backend for validation
    const qrDataUrl = await QRCode.toDataURL(validationCode, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      },
      width: 300
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    throw err;
  }
};

// GET all paths (host only)
router.get('/', authMiddleware, hostOnly, async (req, res) => {
  try {
    const paths = await Path.find().sort('pathNumber');
    res.json(paths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single path (host only)
router.get('/:id', authMiddleware, hostOnly, async (req, res) => {
  try {
    const path = await Path.findById(req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE path (host only)
router.post('/', authMiddleware, hostOnly, async (req, res) => {
  try {
    const { pathNumber, pathColor, pathColorInTelugu, pathName, places } = req.body;

    // Validate
    if (!pathNumber || !pathColor) {
      return res.status(400).json({ error: 'Path number and color are required' });
    }
    if (pathNumber < 1 || pathNumber > 12) {
      return res.status(400).json({ error: 'Path number must be between 1 and 12' });
    }

    // Check if path number already exists
    const existing = await Path.findOne({ pathNumber });
    if (existing) {
      return res.status(400).json({ error: `Path number ${pathNumber} already exists` });
    }

    // Process places - generate unique validation codes and QR codes
    const processedPlaces = [];
    for (let i = 0; i < (places || []).length; i++) {
      const place = places[i];
      const validationCode = uuidv4(); // Unique permanent code
      const qrCodeDataUrl = await generateQR(validationCode);
      
      processedPlaces.push({
        placeNumber: i + 1,
        placeName: place.placeName || `Place ${i + 1}`,
        clue: place.clue || '',
        clueInEnglish: place.clueInEnglish || '',
        validationCode,
        qrCodeDataUrl,
        isDestination: i === 4 // 5th place is destination
      });
    }

    const newPath = new Path({
      pathNumber,
      pathColor: pathColor.trim(),
      pathColorInTelugu: pathColorInTelugu || '',
      pathName: pathName || `Path ${pathNumber}`,
      places: processedPlaces
    });

    await newPath.save();
    res.status(201).json(newPath);
  } catch (err) {
    console.error('Create path error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ADD/UPDATE places for a path
router.put('/:id/places', authMiddleware, hostOnly, async (req, res) => {
  try {
    const { places } = req.body;
    const path = await Path.findById(req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });

    if (places.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 places allowed per path' });
    }

    const processedPlaces = [];
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      // Keep existing validation code if place already exists, else generate new
      const existingPlace = path.places.find(p => p.placeNumber === i + 1);
      const validationCode = existingPlace?.validationCode || uuidv4();
      
      // Regenerate QR only if new place
      let qrCodeDataUrl = existingPlace?.qrCodeDataUrl || '';
      if (!existingPlace || place.regenerateQR) {
        qrCodeDataUrl = await generateQR(validationCode);
      }

      processedPlaces.push({
        placeNumber: i + 1,
        placeName: place.placeName || `Place ${i + 1}`,
        clue: place.clue || '',
        clueInEnglish: place.clueInEnglish || '',
        validationCode,
        qrCodeDataUrl,
        isDestination: i === 4
      });
    }

    path.places = processedPlaces;
    await path.save();
    res.json(path);
  } catch (err) {
    console.error('Update places error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE path meta (color, name)
router.put('/:id', authMiddleware, hostOnly, async (req, res) => {
  try {
    const { pathColor, pathColorInTelugu, pathName } = req.body;
    const path = await Path.findById(req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });

    if (pathColor) path.pathColor = pathColor.trim();
    if (pathColorInTelugu !== undefined) path.pathColorInTelugu = pathColorInTelugu;
    if (pathName) path.pathName = pathName;

    await path.save();
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE path (host only)
router.delete('/:id', authMiddleware, hostOnly, async (req, res) => {
  try {
    const path = await Path.findByIdAndDelete(req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });
    res.json({ message: 'Path deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET QR codes for a path (for printing)
router.get('/:id/qrcodes', authMiddleware, hostOnly, async (req, res) => {
  try {
    const path = await Path.findById(req.params.id);
    if (!path) return res.status(404).json({ error: 'Path not found' });
    
    const qrData = path.places.map(place => ({
      placeNumber: place.placeNumber,
      placeName: place.placeName,
      validationCode: place.validationCode,
      qrCodeDataUrl: place.qrCodeDataUrl,
      isDestination: place.isDestination
    }));
    
    res.json({ pathNumber: path.pathNumber, pathColor: path.pathColor, places: qrData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
