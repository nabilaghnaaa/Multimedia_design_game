const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Mengimpor Routes
const levelRoutes = require('./routes/levelRoutes');
const progressRoutes = require('./routes/progressRoutes'); // <-- TAMBAHAN BARU

// Menggunakan Routes
app.use('/api/levels', levelRoutes);
app.use('/api/progress', progressRoutes); // <-- TAMBAHAN BARU

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Berhasil terhubung ke MongoDB!'))
  .catch((err) => console.error('🔴 Gagal terhubung ke MongoDB:', err));

app.get('/', (req, res) => {
    res.json({ message: "Server Traffic Sign Adventure menyala dengan aman! 🚦" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server backend berjalan mulus di http://localhost:${PORT}`);
});