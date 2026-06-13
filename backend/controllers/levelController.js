const Level = require('../models/Level');

// 1. Fungsi untuk menyuntikkan data rambu (Seeding)
exports.seedLevels = async (req, res) => {
    try {
        await Level.deleteMany();

        const initialLevels = [
            // ============ STAGE 1: RAMBU PERINGATAN (Level 1-5) ============
            {
                stage: 1,
                level: 1,
                sign_name: "Tikungan Tajam",
                sign_category: "Rambu Peringatan",
                assets: {
                    sign_icon: "/signs/rambu_1-removebg-preview.png",
                    scene_background: "/backgrounds/backgrounds.png",
                    consequence_animation: "tikungan"
                },
                question: "Kamu melihat rambu Tikungan Tajam di depan. Apa tindakan yang paling aman?",
                options: [
                    {
                        option_text: "🐢 Mengurangi kecepatan sebelum menikung agar tetap stabil dan terkendali.",
                        is_correct: true,
                        feedback_message: "✅ Benar! Mengurangi kecepatan sebelum tikungan sangat penting agar kendaraan tidak slip atau keluar dari jalur!"
                    },
                    {
                        option_text: "🏎️ Tetap berkendara dengan cepat agar bisa melewati tikungan lebih cepat.",
                        is_correct: false,
                        feedback_message: "❌ Bahaya! Melaju cepat di tikungan tajam bisa membuat kendaraan kehilangan kendali, keluar jalur, atau bertabrakan dengan kendaraan lain!"
                    }
                ]
            },
            {
                stage: 1,
                level: 2,
                sign_name: "Jalan Licin / Bergelombang / Berlubang",
                sign_category: "Rambu Peringatan",
                assets: {
                    sign_icon: "/signs/rambu 2.1.png",
                    scene_background: "/backgrounds/backgrounds.png",
                    consequence_animation: "licin"
                },
                question: "Di depan terdapat rambu Jalan Licin / Bergelombang / Berlubang. Bagaimana kamu harus bersikap?",
                options: [
                    {
                        option_text: "🐌 Kurangi kecepatan dan hindari gerakan mendadak agar tidak tergelincir.",
                        is_correct: true,
                        feedback_message: "✅ Betul! Mengurangi kecepatan dan berkendara dengan tenang mencegah ban kehilangan cengkeraman atau terjatuh akibat lubang!"
                    },
                    {
                        option_text: "💨 Mengerem mendadak tepat saat melewati lubang atau jalan licin.",
                        is_correct: false,
                        feedback_message: "❌ Kurang tepat! Mengerem mendadak di jalan licin atau berlubang justru bisa membuat ban selip dan membuatmu kehilangan keseimbangan!"
                    }
                ]
            },
            {
                stage: 1,
                level: 3,
                sign_name: "Penyeberangan Pejalan Kaki",
                sign_category: "Rambu Peringatan",
                assets: {
                    sign_icon: "/signs/rambu 2.2.png",
                    scene_background: "/backgrounds/backgrounds.png",
                    consequence_animation: "zebra"
                },
                question: "Kamu mendekati rambu Penyeberangan Pejalan Kaki (Zebra Cross). Tindakan apa yang tepat?",
                options: [
                    {
                        option_text: "👀 Kurangi kecepatan dan siap berhenti jika ada pejalan kaki yang menyeberang.",
                        is_correct: true,
                        feedback_message: "✅ Luar biasa! Di area penyeberangan, kamu harus selalu waspada dan siap memberikan prioritas kepada pejalan kaki!"
                    },
                    {
                        option_text: "🚗 Tetap melaju karena saat ini tidak ada pejalan kaki yang terlihat.",
                        is_correct: false,
                        feedback_message: "❌ Salah! Pejalan kaki bisa muncul tiba-tiba. Kamu harus selalu melambat di dekat zebra cross untuk menghindari kecelakaan!"
                    }
                ]
            },
            {
                stage: 1,
                level: 4,
                sign_name: "Persimpangan",
                sign_category: "Rambu Peringatan",
                assets: {
                    sign_icon: "/signs/rambu 2.3.png",
                    scene_background: "/backgrounds/backgrounds.png",
                    consequence_animation: "persimpangan"
                },
                question: "Ada rambu Persimpangan di depanmu. Apa tindakan aman yang harus dilakukan?",
                options: [
                    {
                        option_text: "👀 Perlambat laju kendaraan dan lihat ke kiri-kanan sebelum menyeberang.",
                        is_correct: true,
                        feedback_message: "✅ Hebat! Memastikan persimpangan aman dari arah lain sebelum melintas adalah kunci menghindari tabrakan!"
                    },
                    {
                        option_text: "📯 Langsung melintas dengan cepat sambil membunyikan klakson keras.",
                        is_correct: false,
                        feedback_message: "❌ Berbahaya! Klakson tidak akan menghentikan kendaraan dari arah lain yang melaju kencang. Kamu tetap harus memperlambat kendaraan dan waspada!"
                    }
                ]
            },
            {
                stage: 1,
                level: 5,
                sign_name: "Lalu Lintas Dua Arah",
                sign_category: "Rambu Peringatan",
                assets: {
                    sign_icon: "/signs/rambu 2.4.png",
                    scene_background: "/backgrounds/backgrounds.png",
                    consequence_animation: "dua_arah"
                },
                question: "Ada rambu Lalu Lintas Dua Arah di depan. Apa yang harus kamu perhatikan?",
                options: [
                    {
                        option_text: "🐢 Tetap berkendara di lajur kiri dan waspada terhadap kendaraan dari arah depan.",
                        is_correct: true,
                        feedback_message: "✅ Benar! Tetap di lajur kiri memastikan jalur untuk arah berlawanan tetap aman dan bebas dari benturan!"
                    },
                    {
                        option_text: "🏎️ Bebas menggunakan seluruh badan jalan karena jalanan terlihat sepi.",
                        is_correct: false,
                        feedback_message: "❌ Salah! Menggunakan tengah jalan di jalur dua arah sangat berbahaya karena kendaraan dari arah depan bisa muncul kapan saja!"
                    }
                ]
            },

            // ============ STAGE 2: RAMBU LARANGAN & PRIORITAS (Level 6-12) ============
            {
                stage: 2,
                level: 6,
                sign_name: "Batas Kecepatan Maksimum",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 3.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "kecepatan"
                },
                question: "Kamu melihat rambu Batas Kecepatan Maksimum 40 km/jam. Tindakan apa yang benar?",
                options: [
                    {
                        option_text: "🐢 Menjaga kecepatan kendaraan agar berada di bawah atau tepat 40 km/jam.",
                        is_correct: true,
                        feedback_message: "✅ Tepat sekali! Batas kecepatan dipasang demi keselamatan agar kamu memiliki waktu cukup untuk bereaksi jika ada bahaya!"
                    },
                    {
                        option_text: "💨 Terus melaju dengan kecepatan tinggi karena merasa jalanan kosong.",
                        is_correct: false,
                        feedback_message: "❌ Bahaya! Kecepatan yang terlalu tinggi membuat jarak pengereman menjadi lebih jauh dan meningkatkan risiko tabrakan parah!"
                    }
                ]
            },
            {
                stage: 2,
                level: 7,
                sign_name: "Dilarang Menyalip",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 4 .png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "menyalip"
                },
                question: "Ada rambu Dilarang Menyalip di jalan yang berliku. Apa keputusan terbaikmu?",
                options: [
                    {
                        option_text: "⏳ Tetap berada di jalurmu dan sabar berkendara di belakang kendaraan lain.",
                        is_correct: true,
                        feedback_message: "✅ Keren! Rambu dilarang menyalip biasanya dipasang di jalan berliku atau sempit karena pandangan terhalang. Kesabaranmu menyelamatkan nyawa!"
                    },
                    {
                        option_text: "🏎️ Memaksakan menyalip dengan cepat karena kendaraan di depan terlalu lambat.",
                        is_correct: false,
                        feedback_message: "❌ Sangat berisiko! Menyalip di area terlarang bisa membuatmu bertabrakan adu kambing dengan kendaraan dari arah berlawanan!"
                    }
                ]
            },
            {
                stage: 2,
                level: 8,
                sign_name: "Dilarang Masuk",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 2.5.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "dilarang_masuk"
                },
                question: "Kamu melihat rambu Dilarang Masuk di ujung jalan. Apa yang harus dilakukan?",
                options: [
                    {
                        option_text: "🛑 Mematuhi rambu, tidak masuk, dan mencari rute alternatif.",
                        is_correct: true,
                        feedback_message: "✅ Luar biasa! Mematuhi rambu dilarang masuk mencegahmu melawan arus yang sangat berbahaya bagi keselamatan!"
                    },
                    {
                        option_text: "👀 Tetap masuk karena jalan tersebut merupakan jalan pintas yang lebih dekat.",
                        is_correct: false,
                        feedback_message: "❌ Salah! Jalan pintas tidak ada gunanya jika membahayakan nyawa. Melanggar rambu dilarang masuk berarti melawan arus lalu lintas!"
                    }
                ]
            },
            {
                stage: 2,
                level: 9,
                sign_name: "Dilarang Berhenti",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 2.6.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "dilarang_berhenti"
                },
                question: "Kamu melihat rambu Dilarang Berhenti (huruf S dengan coretan merah). Apa yang harus kamu lakukan?",
                options: [
                    {
                        option_text: "🚗 Terus berjalan mencari tempat yang aman dan legal jika ingin berhenti.",
                        is_correct: true,
                        feedback_message: "✅ Bagus! Berhenti di area dilarang berhenti dapat mengganggu arus lalu lintas dan meningkatkan risiko tabrak belakang!"
                    },
                    {
                        option_text: "⏱️ Berhenti sebentar di bawah rambu untuk menelepon atau memeriksa ponsel.",
                        is_correct: false,
                        feedback_message: "❌ Tidak boleh! Berhenti di bawah rambu Dilarang Berhenti (meskipun sebentar) tetap melanggar aturan dan membahayakan pengguna jalan lain!"
                    }
                ]
            },
            {
                stage: 2,
                level: 10,
                sign_name: "Beri Prioritas",
                sign_category: "Rambu Prioritas",
                assets: {
                    sign_icon: "/signs/rambu 7.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "prioritas"
                },
                question: "Kamu berada di jalan kecil dan melihat rambu Beri Prioritas (segitiga terbalik merah-putih). Apa tindakanmu?",
                options: [
                    {
                        option_text: "⛔ Perlambat kendaraan dan beri jalan kepada kendaraan di jalan utama terlebih dahulu.",
                        is_correct: true,
                        feedback_message: "✅ Benar! Memberikan prioritas kepada kendaraan di jalan utama mencegah terjadinya tabrakan di persimpangan!"
                    },
                    {
                        option_text: "🏎️ Melaju lebih cepat agar bisa masuk ke jalan utama sebelum kendaraan lain lewat.",
                        is_correct: false,
                        feedback_message: "❌ Bahaya! Memotong jalan utama tanpa memberi prioritas bisa berakibat fatal karena kendaraan di jalan utama melaju dengan kecepatan konstan!"
                    }
                ]
            },
            {
                stage: 2,
                level: 11,
                sign_name: "Dilarang Belok Kanan / Kiri",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 5.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "belok"
                },
                question: "Terdapat rambu Dilarang Belok Kanan. Padahal, tujuanmu ada di sebelah kanan. Apa tindakanmu?",
                options: [
                    {
                        option_text: "⬅️ Tetap lurus atau belok kiri mengikuti jalur, lalu mencari rute memutar yang aman.",
                        is_correct: true,
                        feedback_message: "✅ Hebat! Mematuhi larangan belok menjaga keteraturan arus lalu lintas dan menghindarkanmu dari tabrakan frontal!"
                    },
                    {
                        option_text: "➡️ Tetap belok kanan secara cepat selagi tidak ada petugas kepolisian.",
                        is_correct: false,
                        feedback_message: "❌ Kurang tepat! Aturan lalu lintas dibuat untuk keselamatan, bukan hanya ketika ada polisi. Melanggar belokan bisa membentur arus dari arah lain!"
                    }
                ]
            },
            {
                stage: 2,
                level: 12,
                sign_name: "Dilarang Putar Balik",
                sign_category: "Rambu Larangan",
                assets: {
                    sign_icon: "/signs/rambu 8.png",
                    scene_background: "/backgrounds/baground2.png",
                    consequence_animation: "putar_balik"
                },
                question: "Kamu terlewat jalan dan melihat rambu Dilarang Putar Balik. Apa keputusanmu?",
                options: [
                    {
                        option_text: "🚗 Terus melaju mencari tempat putar balik resmi atau persimpangan terdekat.",
                        is_correct: true,
                        feedback_message: "✅ Sempurna! Putar balik di tempat terlarang sangat berbahaya karena menghambat arus jalan raya dan memicu tabrak belakang!"
                    },
                    {
                        option_text: "🔄 Langsung berputar balik dengan cepat karena merasa jalanan sedang senggang.",
                        is_correct: false,
                        feedback_message: "❌ Bahaya! Putar balik membutuhkan ruang yang aman. Melakukannya di tempat terlarang membahayakan dirimu dan pengendara lain yang melaju lurus!"
                    }
                ]
            }
        ];

        await Level.insertMany(initialLevels);
        res.status(201).json({ 
            message: "✅ 12 data rambu lalu lintas berhasil disuntikkan ke database! 🚗🚦", 
            total: initialLevels.length 
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal memasukkan data rambu", error: error.message });
    }
};

// 2. Ambil semua level
exports.getAllLevels = async (req, res) => {
    try {
        const levels = await Level.find().sort({ stage: 1, level: 1 });
        res.status(200).json(levels);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data level", error: error.message });
    }
};

// 3. Ambil satu level berdasarkan nomor level
exports.getLevelByNumber = async (req, res) => {
    try {
        const levelNumber = parseInt(req.params.levelNumber);
        const level = await Level.findOne({ level: levelNumber });
        if (!level) {
            return res.status(404).json({ message: `Level ${levelNumber} tidak ditemukan!` });
        }
        res.status(200).json(level);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data level", error: error.message });
    }
};