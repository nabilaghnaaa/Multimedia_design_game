const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// URL untuk memulai game baru
router.post('/start', progressController.startSession);

// URL untuk mengirim jawaban pemain
router.post('/submit', progressController.submitAnswer);

module.exports = router;