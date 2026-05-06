const express = require('express');
const router = express.Router();
const submitController = require('../controllers/laporan/Submit');
const detailController = require('../controllers/laporan/Detail');
const riwayatController = require('../controllers/laporan/Riwayat');
const manageController = require('../controllers/laporan/Manage');
const verifikasiController = require('../controllers/laporan/Verifikasi');
const dashboardController = require('../controllers/laporan/Dashboard');
const activityController = require('../controllers/laporan/Activity');
const formController = require('../controllers/laporan/Form');

const { verifyToken } = require('../middlewares/Auth.Middleware');
const { configureUpload, handleUpload, handleUploadEksternal } = require('../middlewares/Upload.Middleware');

// --- PUBLIC ROUTES (Form options) ---
router.get('/form-options', formController.getFormOptions);

// --- AUTHENTICATED ROUTES Eksternal & Mitra (wajib login) ---
router.post('/submit-eksternal', verifyToken, handleUploadEksternal, submitController.submitLaporanEksternal);
router.post('/submit-mitra', verifyToken, handleUploadEksternal, submitController.submitLaporanMitra);

// --- USER ROUTES ---
router.post('/submit', verifyToken, handleUpload, submitController.submitLaporan);
router.get('/stats', verifyToken, dashboardController.getUserDashboardStats);
router.get('/activity', verifyToken, activityController.getUserActivityLog);
router.get('/riwayat', verifyToken, riwayatController.getRiwayatLaporan);
router.get('/detail/:id', verifyToken, detailController.getdetaillaporan);
router.delete('/:id', verifyToken, manageController.deleteLaporan);
router.put('/:id', verifyToken, handleUpload, manageController.updateLaporan);

// --- ADMIN ROUTES ---
router.post('/admin/input-arsip', verifyToken, handleUpload, manageController.inputArsipLama);
router.put('/admin/upload-susulan/:source/:id', verifyToken, handleUpload, manageController.uploadSusulan);
router.get('/admin/stats', verifyToken, dashboardController.getAdminDashboardStats);
router.get('/admin/activity', verifyToken, activityController.getAdminActivityLog);
router.put('/verify/:id', verifyToken, verifikasiController.verifyLaporan);
router.get('/admin/approved', verifyToken, verifikasiController.getAllApprovedReports);
router.get('/pending', verifyToken, verifikasiController.getAllPendingReports);

module.exports = router;
