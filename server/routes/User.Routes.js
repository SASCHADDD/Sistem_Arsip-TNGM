const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/User');
const { verifyToken, authorizeRoles, requireWilayah } = require('../middlewares/Auth.Middleware');

// Route untuk mendapatkan daftar semua staf
router.get(
    '/staff',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    requireWilayah,
    userController.getAllStaff
);

// Route untuk mendapatkan rekapitulasi penilaian seluruh staf (untuk ekspor/dataset)
router.get(
    '/staff-rekap',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    requireWilayah,
    userController.getStaffAssessmentRekap
);

// Route untuk mendapatkan detail profil beserta statistik dari staf tertentu
router.get(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff'),
    requireWilayah,
    userController.getStaffDetail
);

// Route untuk memperbarui data staf
router.put(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    requireWilayah,
    userController.updateStaff
);

// Route untuk menghapus akun staf
router.delete(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    requireWilayah,
    userController.deleteStaff
);

module.exports = router;
