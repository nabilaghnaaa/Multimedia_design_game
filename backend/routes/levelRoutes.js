const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');

// Endpoint seeding data
router.post('/seed', levelController.seedLevels);

// Endpoint ambil semua level
router.get('/', levelController.getAllLevels);

// Endpoint ambil satu level berdasarkan nomor
router.get('/:levelNumber', levelController.getLevelByNumber);

module.exports = router;