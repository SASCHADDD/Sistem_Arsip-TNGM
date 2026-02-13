const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { nama, email, password, wilayah_id, resor_id } = req.body;

        const [existingUser] = await db.execute(
            'SELECT id FROM pengguna WHERE email = ?', 
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO pengguna 
            (nama, email, password, role, wilayah_id, resor_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nama, email, hashedPassword, 'staff', wilayah_id || null, resor_id || null]
        );

        res.status(201).json({
            message: 'Registrasi staff berhasil',
            data: {
                id: result.insertId,
                nama,
                email,
                role: 'staff'
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { nama, email, password, role, wilayah_id } = req.body;

        if (!['admin_balai', 'admin_wilayah'].includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO pengguna 
            (nama, email, password, role, wilayah_id) 
            VALUES (?, ?, ?, ?, ?)`,
            [nama, email, hashedPassword, role, wilayah_id || null]
        );

        res.status(201).json({
            message: 'Admin berhasil dibuat',
            id: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { wilayah_id, resor_id } = req.body;

        await db.execute(
            `UPDATE pengguna 
             SET wilayah_id = ?, resor_id = ?
             WHERE id = ?`,
            [wilayah_id, resor_id, id]
        );

        res.json({ message: 'User berhasil diupdate' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.execute(
            `SELECT p.*, w.nama_wilayah, r.nama_resor
             FROM pengguna p
             LEFT JOIN wilayah w ON p.wilayah_id = w.id
             LEFT JOIN resor r ON p.resor_id = r.id
             WHERE p.email = ?`,
            [email]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                wilayah_id: user.wilayah_id,
                resor_id: user.resor_id
            },
            process.env.JWT_SECRET || 'secret_key_rahasia',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                wilayah: user.nama_wilayah,
                resor: user.nama_resor
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

const logout = (req, res) => {
    // Untuk JWT, logout biasanya ditangani di client side dengan menghapus token
    res.status(200).json({ message: 'Logout berhasil' });
};

module.exports = {
    register,
    createAdmin,
    updateUser,
    login,
    logout
};
