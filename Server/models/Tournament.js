const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  prize: { type: Number, required: true, min: 0 },
  entryFee: { type: Number, default: 0, min: 0 },
  maxPlayers: { type: Number, required: true, min: 1 },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  registrationDeadline: { type: Date },
  format: {
    type: String,
    enum: ['Single Elimination', 'Double Elimination', 'Round Robin', 'League'],
    default: 'Single Elimination'
  },
  class: {
    type: String,
    enum: ['Hạng H', 'Hạng I', 'Hạng H & I'],
    default: 'Hạng H & I'
  },
  status: {
    type: String,
    enum: ['upcoming', 'registering', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  rules: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

tournamentSchema.index({ status: 1, date: 1 });

let Tournament = mongoose.models.Tournament;
if (!Tournament) {
  Tournament = mongoose.model('Tournament', tournamentSchema);
}
module.exports = Tournament;
