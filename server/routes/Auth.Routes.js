const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/Auth');
const { verifyToken, authorizeRoles } = require('../middlewares/Auth.Middleware');
const { configureUpload } = require('../middlewares/Upload.Middleware');
const uploadProfile = configureUpload('profile');

router.post('/register', authController.register);

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
  uploadProfile.single('foto'),
  authController.uploadPhoto
);

router.put(
  '/change-password',
  verifyToken,
  authController.changePassword
);


module.exports = router;
