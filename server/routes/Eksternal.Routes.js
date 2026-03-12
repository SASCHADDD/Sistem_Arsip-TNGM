const express = require('express');
const router = express.Router();
const { loginEksternal, registerEksternal } = require('../controllers/Auth.Controller');
const { getRiwayatEksternal } = require('../controllers/Laporan.Controller');
const { verifyToken } = require('../middlewares/Auth.Middleware');

// POST /api/eksternal/register – Daftarkan akun baru Eksternal/Mitra via API
router.post('/register', registerEksternal);

// POST /api/eksternal/login – Login untuk pengguna eksternal & mitra
router.post('/login', loginEksternal);

// GET /api/eksternal/riwayat – Riwayat laporan eksternal/mitra (wajib login)
router.get('/riwayat', verifyToken, getRiwayatEksternal);

module.exports = router;
