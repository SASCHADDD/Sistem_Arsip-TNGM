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

module.exports = router;
