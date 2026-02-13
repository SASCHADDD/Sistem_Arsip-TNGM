const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.Controller');
const { verifyToken, authorizeRoles } = require('../middlewares/Auth.Middleware');

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


module.exports = router;
