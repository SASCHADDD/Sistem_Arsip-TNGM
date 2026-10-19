const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/Auth');
const { verifyToken, authorizeRoles, requireWilayah } = require('../middlewares/Auth.Middleware');
const { configureUpload } = require('../middlewares/Upload.Middleware');
const uploadProfile = configureUpload('profile');
const adminRoles = ['admin_balai', 'admin_wilayah', 'kepala_wilayah'];
const profileOwnerOrAdmin = (req, res, next) => {
  if (Number(req.user.id) !== Number(req.params.id) && req.user.role !== 'admin_balai') {
    return res.status(403).json({ message: 'Anda tidak memiliki hak untuk mengubah foto profil pengguna ini.' });
  }
  next();
};

router.post(
  '/register',
  verifyToken,
  authorizeRoles(...adminRoles),
  requireWilayah,
  authController.register
);

router.post('/login', authController.login);

router.post('/logout', authController.logout);


router.post(
  '/create-admin',
  verifyToken,
  authorizeRoles('admin_balai'),
  authController.createAdmin
);
router.put(
  '/update-user/:id',
  verifyToken,
  authorizeRoles('admin_balai'),
  authController.updateUser
);

router.put(
  '/upload-photo/:id',
  verifyToken,
  profileOwnerOrAdmin,
  uploadProfile.single('foto'),
  authController.uploadPhoto
);

router.put(
  '/change-password',
  verifyToken,
  authController.changePassword
);


module.exports = router;
