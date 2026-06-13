const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  stage: { type: Number, required: true }, // 1 (Peringatan) atau 2 (Larangan)
  level: { type: Number, required: true },
  sign_name: { type: String, required: true },
  sign_category: { type: String, required: true },
  assets: {
    sign_icon: { type: String, required: true }, // Path gambar rambu
    scene_background: { type: String, required: true }, // Path situasi jalan
    consequence_animation: { type: String } // Path animasi jika salah
  },
  question: { type: String, required: true },
  options: [
    {
      option_text: { type: String, required: true },
      is_correct: { type: Boolean, required: true },
      feedback_message: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);