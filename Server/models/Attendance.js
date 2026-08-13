const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  totalHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'absent'
  }
}, { timestamps: true });

// Auto-calculate total hours when checkOutTime is set
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = diff / (1000 * 60 * 60); // Convert milliseconds to hours
    
    if (this.totalHours > 0) {
      this.status = 'present';
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
