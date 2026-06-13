const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true },
  current_stage: { type: Number, default: 1 },
  unlocked_levels: {
    stage_1: { type: [Number], default: [1] }, // Level 1 langsung terbuka
    stage_2: { type: [Number], default: [] }
  },
  mistakes_log: [
    {
      level: Number,
      sign_name: String,
      wrong_option_selected: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  is_completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);