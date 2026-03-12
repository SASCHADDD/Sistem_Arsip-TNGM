const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/Laporan.Controller');
const { verifyToken } = require('../middlewares/Auth.Middleware');
const configureUpload = require('../middlewares/Upload.Middleware');

// Konfigurasi upload untuk folder 'laporan'
const uploadLaporan = configureUpload('laporan');

// Helper handle upload untuk internal
const handleUpload = (req, res, next) => {
    const upload = uploadLaporan.fields([
        { name: 'file_dokumen', maxCount: 1 },
        { name: 'file_lampiran', maxCount: 1 }
    ]);

    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message || 'Gagal mengupload file' });
        }
        next();
    });
};

// Helper handle upload untuk form EKSTERNAL (public)
const handleUploadEksternal = (req, res, next) => {
    const upload = uploadLaporan.fields([
        { name: 'file', maxCount: 1 },
        { name: 'hardfile', maxCount: 1 }
    ]);

    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message || 'Gagal mengupload file eksternal' });
        }
        next();
    });
};

// --- PUBLIC ROUTES (Eksternal & Mitra) ---
router.post('/submit-eksternal', handleUploadEksternal, laporanController.submitLaporanEksternal);
router.post('/submit-mitra', handleUploadEksternal, laporanController.submitLaporanMitra);

// Route untuk mengambil opsi form laporan (bisa diakses publik untuk eksternal form)
router.get('/form-options', laporanController.getFormOptions);


// --- USER ROUTES ---

// Route untuk submit laporan
router.post(
    '/submit',
    verifyToken,
    handleUpload,
    laporanController.submitLaporan
);

// Route untuk statistik dashboard user
router.get('/stats', verifyToken, laporanController.getUserDashboardStats);

// Route untuk aktivitas user (dashboard user)
router.get('/activity', verifyToken, laporanController.getUserActivityLog);

// Route untuk mengambil riwayat laporan user
router.get('/riwayat', verifyToken, laporanController.getRiwayatLaporan);

// Route untuk detail laporan
router.get('/detail/:id', verifyToken, laporanController.getdetaillaporan);

// Route untuk hapus laporan
router.delete('/:id', verifyToken, laporanController.deleteLaporan);

// Route untuk update laporan
router.put(
    '/:id',
    verifyToken,
    handleUpload,
    laporanController.updateLaporan
);

// --- ADMIN ROUTES ---

// Route untuk input arsip lama (Backlog Entry) oleh Admin
router.post(
    '/admin/input-arsip',
    verifyToken,
    handleUpload,
    laporanController.inputArsipLama
);

// Route untuk upload PDF susulan oleh Admin
router.put(
    '/admin/upload-susulan/:source/:id',
    verifyToken,
    handleUpload,
    laporanController.uploadSusulan
);

// Route untuk statistik dashboard admin
router.get('/admin/stats', verifyToken, laporanController.getAdminDashboardStats);

// Route untuk aktivitas admin (dashboard admin)
router.get('/admin/activity', verifyToken, laporanController.getAdminActivityLog);

// Route untuk verifikasi laporan (Admin)
router.put('/verify/:id', verifyToken, laporanController.verifyLaporan);

// Route untuk mengambil semua laporan approved (Admin - Data Laporan)
router.get('/admin/approved', verifyToken, laporanController.getAllApprovedReports);

// Route untuk mengambil semua laporan pending (Admin)
router.get('/pending', verifyToken, laporanController.getAllPendingReports);

module.exports = router;
