const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  placeNumber: { type: Number, required: true }, // which place they completed
  placeName: { type: String },
  arrivedAt: { type: Date, default: Date.now },
  validationCode: { type: String } // code they scanned
});

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  teamMembers: [{ type: String }], // member names
  assignedPathNumber: { type: Number, required: true },
  assignedPathColor: { type: String, required: true },
  pincode: { type: String, required: true }, // 4-6 digit pin
  // Login = pincode + pathColor combination
  currentPlaceIndex: { type: Number, default: 0 }, // 0=haven't started, 1=at place 1, etc.
  progress: [ProgressSchema],
  gameStartedAt: { type: Date, default: null },
  gameCompletedAt: { type: Date, default: null },
  completionTimeMinutes: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  hasStarted: { type: Boolean, default: false },
  hasCompleted: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now }
});

// Generate unique pincode
TeamSchema.statics.generatePincode = function() {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = mongoose.model('Team', TeamSchema);
