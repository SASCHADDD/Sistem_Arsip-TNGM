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

const { verifyToken, authorizeRoles, requireWilayah } = require('../middlewares/Auth.Middleware');
const { handleUpload, handleUploadEksternal } = require('../middlewares/Upload.Middleware');
const { ensureInternalReportOwner, ensureExternalReportOwner, ensureAdminReportScope } = require('../authorization/ReportAccess.Middleware');
const adminRoles = authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah');
const staffRole = authorizeRoles('staff');
const eksternalRole = authorizeRoles('eksternal');
const mitraRole = authorizeRoles('mitra');

// --- PUBLIC ROUTES (Form options) ---
router.get('/form-options', formController.getFormOptions);

// --- AUTHENTICATED ROUTES Eksternal & Mitra (wajib login) ---
router.post('/submit-eksternal', verifyToken, eksternalRole, handleUploadEksternal, submitController.submitLaporanEksternal);
router.post('/submit-mitra', verifyToken, mitraRole, handleUploadEksternal, submitController.submitLaporanMitra);
router.put('/eksternal/:id', verifyToken, authorizeRoles('eksternal', 'mitra'), ensureExternalReportOwner, handleUploadEksternal, manageController.updateLaporanEksternal);
router.get('/riwayat-eksternal', verifyToken, eksternalRole, riwayatController.getRiwayatEksternal);
router.get('/riwayat-mitra', verifyToken, mitraRole, riwayatController.getRiwayatMitra);

// --- USER ROUTES ---
router.post('/submit', verifyToken, staffRole, handleUpload, submitController.submitLaporan);
router.get('/stats', verifyToken, staffRole, dashboardController.getUserDashboardStats);
router.get('/activity', verifyToken, staffRole, activityController.getUserActivityLog);
router.get('/riwayat', verifyToken, staffRole, riwayatController.getRiwayatLaporan);
router.get('/detail/:id', verifyToken, authorizeRoles('staff', 'admin_balai', 'admin_wilayah', 'kepala_wilayah', 'eksternal', 'mitra'), requireWilayah, detailController.getdetaillaporan);
router.delete('/:id', verifyToken, staffRole, manageController.deleteLaporan);
router.put('/:id', verifyToken, staffRole, ensureInternalReportOwner, handleUpload, manageController.updateLaporan);

// --- ADMIN ROUTES ---
router.post('/admin/input-arsip', verifyToken, adminRoles, requireWilayah, handleUpload, manageController.inputArsipLama);
router.put('/admin/upload-susulan/:source/:id', verifyToken, adminRoles, requireWilayah, ensureAdminReportScope, handleUpload, manageController.uploadSusulan);
router.get('/admin/stats', verifyToken, adminRoles, requireWilayah, dashboardController.getAdminDashboardStats);
router.get('/admin/activity', verifyToken, adminRoles, requireWilayah, activityController.getAdminActivityLog);
router.put('/verify/:id', verifyToken, adminRoles, requireWilayah, verifikasiController.verifyLaporan);
router.get('/admin/approved', verifyToken, adminRoles, requireWilayah, verifikasiController.getAllApprovedReports);
router.get('/pending', verifyToken, adminRoles, requireWilayah, verifikasiController.getAllPendingReports);

module.exports = router;
