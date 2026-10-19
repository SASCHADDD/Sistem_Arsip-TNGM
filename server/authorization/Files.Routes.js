const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/Auth.Middleware');
const { getProtectedFile } = require('./Files.Controller');

router.get('/:folder/:filename', verifyToken, getProtectedFile);

module.exports = router;
