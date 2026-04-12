const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PlaceSchema = new mongoose.Schema({
  placeNumber: { type: Number, required: true }, // 1-5
  placeName: { type: String, required: true },
  clue: { type: String, required: true },
  clueInEnglish: { type: String, default: '' },
  // The QR/code for THIS place is scanned to VALIDATE arrival, then unlock NEXT clue
  // qrCode = unique code embedded in QR, placed physically at this location
  validationCode: { type: String, default: () => uuidv4(), unique: false },
  qrCodeDataUrl: { type: String, default: '' }, // base64 QR image
  isDestination: { type: Boolean, default: false }
});

const PathSchema = new mongoose.Schema({
  pathNumber: { type: Number, required: true, min: 1, max: 12 },
  pathColor: { type: String, required: true },
  pathColorInTelugu: { type: String, default: '' },
  pathName: { type: String, default: '' },
  places: [PlaceSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure each path has exactly 5 places
PathSchema.pre('save', function(next) {
  if (this.places.length > 5) {
    return next(new Error('A path can have at most 5 places'));
  }
  // Mark last place as destination
  if (this.places.length === 5) {
    this.places[4].isDestination = true;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Path', PathSchema);
