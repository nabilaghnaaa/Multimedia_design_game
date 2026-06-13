const Progress = require('../models/Progress');
const crypto = require('crypto'); // Bawaan Node.js untuk membuat ID unik

// 1. Fungsi untuk memulai petualangan baru
exports.startSession = async (req, res) => {
    try {
        // Membuat ID unik untuk setiap user/anak yang baru main
        const sessionId = crypto.randomUUID(); 
        
        const newProgress = new Progress({
            session_id: sessionId,
            current_stage: 1,
            unlocked_levels: {
                stage_1: [1], // Otomatis membuka level 1 saja di awal
                stage_2: []
            }
        });

        await newProgress.save();
        
        res.status(201).json({ 
            message: "Sesi permainan berhasil dimulai! 🏁", 
            session_id: sessionId,
            progress: newProgress 
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memulai sesi", error: error.message });
    }
};

// 2. Fungsi untuk mengecek dan mencatat jawaban
exports.submitAnswer = async (req, res) => {
    try {
        const { session_id, stage, level, is_correct, sign_name, wrong_option_selected } = req.body;

        // Cari sesi pemain berdasarkan ID
        const progress = await Progress.findOne({ session_id });
        if (!progress) {
            return res.status(404).json({ message: "Sesi tidak ditemukan!" });
        }

        // Jika jawaban SALAH, catat kesalahannya sebagai bahan evaluasi
        if (!is_correct) {
            progress.mistakes_log.push({
                level,
                sign_name,
                wrong_option_selected
            });
            await progress.save();
            return res.status(200).json({ 
                message: "Jawaban salah dicatat. Silakan ulangi level.", 
                progress 
            });
        }

        // Jika jawaban BENAR, buka level selanjutnya (Unlock Level)
        const nextLevel = level + 1;
        
        // Stage 1 memiliki level 1-5, Stage 2 memiliki level 6-12
        if (stage === 1 && nextLevel <= 5) {
            if (!progress.unlocked_levels.stage_1.includes(nextLevel)) {
                progress.unlocked_levels.stage_1.push(nextLevel);
            }
        } else if (stage === 1 && nextLevel === 6) {
            if (!progress.unlocked_levels.stage_2.includes(nextLevel)) {
                progress.unlocked_levels.stage_2.push(nextLevel);
            }
        } else if (stage === 2 && nextLevel <= 12) {
            if (!progress.unlocked_levels.stage_2.includes(nextLevel)) {
                progress.unlocked_levels.stage_2.push(nextLevel);
            }
        }

        await progress.save();
        
        res.status(200).json({ 
            message: "Jawaban benar! Level selanjutnya terbuka. 🔓", 
            progress 
        });

    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan saat memproses jawaban", error: error.message });
    }
};