const express = require('express');
const router = express.Router();
const userController = require('../controllers/User.Controller');
const { verifyToken, authorizeRoles } = require('../middlewares/Auth.Middleware');

// Route untuk mendapatkan daftar semua staf
router.get(
    '/staff',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    userController.getAllStaff
);

// Route untuk mendapatkan detail profil beserta statistik dari staf tertentu
router.get(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    userController.getStaffDetail
);

// Route untuk memperbarui data staf
router.put(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    userController.updateStaff
);

// Route untuk menghapus akun staf
router.delete(
    '/staff/:id',
    verifyToken,
    authorizeRoles('admin_balai', 'admin_wilayah', 'kepala_wilayah'),
    userController.deleteStaff
);

module.exports = router;
