const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');
const { Pengguna } = require('../models');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token tidak ditemukan' });

    const [scheme, token, ...extra] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token || extra.length > 0) {
        return res.status(401).json({ message: 'Format token tidak valid' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }

    try {
        const user = await Pengguna.findByPk(decoded.id, {
            attributes: ['id', 'nama', 'email', 'role', 'wilayah_id', 'resor_id', 'is_active', 'token_version']
        });
        if (!user || Number(user.is_active) !== 1) {
            return res.status(401).json({ message: 'Akun tidak ditemukan atau telah dinonaktifkan' });
        }
        if (!Number.isInteger(decoded.token_version) || decoded.token_version !== Number(user.token_version)) {
            return res.status(401).json({ message: 'Sesi telah dicabut. Silakan login kembali.' });
        }

        req.user = {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            wilayah_id: user.wilayah_id,
            resor_id: user.resor_id
        };
        return next();
    } catch (error) {
        console.error('Token user lookup error:', error);
        return res.status(500).json({ message: 'Gagal memverifikasi akun pengguna' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        next();
    };
};

const requireWilayah = (req, res, next) => {
    if (['admin_wilayah', 'kepala_wilayah'].includes(req.user.role) && !req.user.wilayah_id) {
        return res.status(403).json({ message: 'Akun admin belum memiliki wilayah yang ditetapkan.' });
    }
    next();
};

module.exports = { verifyToken, authorizeRoles, requireWilayah };
