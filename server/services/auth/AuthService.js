const db = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authRegister = async (data) => {
    const { nama, email, password, wilayah_id, resor_id } = data;

    const [existingUser] = await db.execute('SELECT id FROM pengguna WHERE email = ?', [email]);
    if (existingUser.length > 0) throw new Error('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
        `INSERT INTO pengguna (nama, email, password, role, wilayah_id, resor_id, is_active) VALUES (?, ?, ?, 'staff', ?, ?, 1)`,
        [nama, email, hashedPassword, wilayah_id || null, resor_id || null]
    );

    return { id: result.insertId, nama, email, role: 'staff' };
};

const authCreateAdmin = async (data) => {
    const { nama, email, password, role, wilayah_id } = data;

    if (!['admin_balai', 'admin_wilayah', 'kepala_wilayah'].includes(role)) {
        throw new Error('Role tidak valid');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
        `INSERT INTO pengguna (nama, email, password, role, wilayah_id) VALUES (?, ?, ?, ?, ?)`,
        [nama, email, hashedPassword, role, wilayah_id || null]
    );

    return result.insertId;
};

const authUpdateUser = async (id, data) => {
    const { nama, email, wilayah_id, resor_id } = data;
    let query = `
        UPDATE pengguna 
        SET nama = COALESCE(?, nama), email = COALESCE(?, email),
            wilayah_id = COALESCE(?, wilayah_id), resor_id = COALESCE(?, resor_id)
        WHERE id = ?
    `;
    let params = [nama || null, email || null, wilayah_id || null, resor_id || null, id];
    await db.execute(query, params);
};

const authUploadPhoto = async (id, file) => {
    if (!file) throw new Error('File tidak ditemukan');
    await db.execute(`UPDATE pengguna SET foto = ? WHERE id = ?`, [file.filename, id]);
    return file.filename;
};

const authLogin = async (data) => {
    const { email, password } = data;

    const [users] = await db.execute(
        `SELECT p.*, w.nama_wilayah, r.nama_resor
         FROM pengguna p
         LEFT JOIN wilayah w ON p.wilayah_id = w.id
         LEFT JOIN resor r ON p.resor_id = r.id
         WHERE p.email = ?`, [email]
    );

    const user = users[0];
    if (!user) throw new Error('Email atau password salah');
    if (user.is_active === 0) throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Email atau password salah');

    const allowedInternalRoles = ['admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff'];
    if (!allowedInternalRoles.includes(user.role)) {
        throw new Error('Akses ditolak. Silakan gunakan portal login Eksternal atau Mitra untuk akun Anda.');
    }

    const token = jwt.sign(
        { id: user.id, nama: user.nama, email: user.email, role: user.role, wilayah_id: user.wilayah_id, resor_id: user.resor_id },
        process.env.JWT_SECRET || 'secret_key_rahasia',
        { expiresIn: '10h' }
    );

    return {
        token,
        user: {
            id: user.id, nama: user.nama, email: user.email, role: user.role,
            wilayah_id: user.wilayah_id, resor_id: user.resor_id,
            wilayah: user.nama_wilayah, resor: user.nama_resor,
            foto: user.foto ? `http://localhost:3000/uploads/profile/${user.foto}` : null
        }
    };
};

const authChangePassword = async (userId, data) => {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) throw new Error('Password lama dan baru wajib diisi');

    const [users] = await db.execute('SELECT password FROM pengguna WHERE id = ?', [userId]);
    const user = users[0];
    if (!user) throw new Error('User tidak ditemukan');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Password lama tidak sesuai');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE pengguna SET password = ? WHERE id = ?', [hashedPassword, userId]);
};

const authRegisterEksternal = async (data) => {
    const { nama, email, password, instansi, role } = data;

    if (!nama || !email || !password || !instansi || !role) throw new Error('Semua field wajib diisi: nama, email, password, instansi, role');
    if (!['eksternal', 'mitra'].includes(role)) throw new Error('Role harus "eksternal" atau "mitra"');

    const [existing] = await db.execute('SELECT id FROM pengguna WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(`INSERT INTO pengguna (nama, email, password, role, instansi) VALUES (?, ?, ?, ?, ?)`, [nama, email, hashedPassword, role, instansi]);

    return { id: result.insertId, nama, email, role, instansi };
};

const authLoginEksternal = async (data) => {
    const { email, password } = data;
    if (!email || !password) throw new Error('Email dan password wajib diisi');

    const [users] = await db.execute(`SELECT * FROM pengguna WHERE email = ? AND role IN ('eksternal', 'mitra')`, [email]);
    const user = users[0];
    if (!user) throw new Error('Email atau password salah');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Email atau password salah');

    const token = jwt.sign(
        { id: user.id, email: user.email, nama: user.nama, instansi: user.instansi || '', role: user.role },
        process.env.JWT_SECRET || 'secret_key_rahasia',
        { expiresIn: '8h' }
    );

    return { token, user: { id: user.id, email: user.email, nama: user.nama, instansi: user.instansi || '', role: user.role } };
};

module.exports = { authRegister, authCreateAdmin, authUpdateUser, authUploadPhoto, authLogin, authChangePassword, authRegisterEksternal, authLoginEksternal };
