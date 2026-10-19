const express = require('express');
const router = express.Router();
const { loginEksternal, registerEksternal } = require('../controllers/auth/Auth');
const { getRiwayatEksternal, getRiwayatMitra } = require('../controllers/laporan/Riwayat');
const { verifyToken } = require('../middlewares/Auth.Middleware');

// POST /api/eksternal/register – Daftarkan akun baru Eksternal/Mitra via API
router.post('/register', registerEksternal);

// POST /api/eksternal/login – Login untuk pengguna eksternal & mitra
router.post('/login', loginEksternal);

// Riwayat laporan (wajib login)
router.get('/riwayat-eksternal', verifyToken, getRiwayatEksternal);
router.get('/riwayat-mitra', verifyToken, getRiwayatMitra);
router.get('/riwayat', verifyToken, (req, res, next) => {
    if (req.user && req.user.role === 'mitra') {
        return getRiwayatMitra(req, res, next);
    }
    return getRiwayatEksternal(req, res, next);
});

module.exports = router;
