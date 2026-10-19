const { Pengguna, Wilayah, Resor } = require('../../models');
const { literal } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/jwt');

const authRegister = async (data, actor) => {
    const { nama, email, password, wilayah_id, resor_id } = data;

    let assignedWilayahId = wilayah_id || null;
    let assignedResorId = resor_id || null;
    if (actor.role === 'admin_wilayah' || actor.role === 'kepala_wilayah') {
        if (Number(wilayah_id) !== Number(actor.wilayah_id)) {
            throw new Error('Akses ditolak: akun harus ditempatkan di wilayah Anda.');
        }
        assignedWilayahId = actor.wilayah_id;
        if (assignedResorId) {
            const resor = await Resor.findByPk(assignedResorId);
            if (!resor || Number(resor.wilayah_id) !== Number(actor.wilayah_id)) {
                throw new Error('Akses ditolak: resor tidak berada di wilayah Anda.');
            }
        }
    }

    const existingUser = await Pengguna.findOne({ where: { email } });
    if (existingUser) throw new Error('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Pengguna.create({
        nama,
        email,
        password: hashedPassword,
        role: 'staff',
        wilayah_id: assignedWilayahId,
        resor_id: assignedResorId,
        is_active: 1
    });

    return { id: user.id, nama, email, role: 'staff' };
};

const authCreateAdmin = async (data) => {
    const { nama, email, password, role, wilayah_id } = data;

    if (!['admin_balai', 'admin_wilayah', 'kepala_wilayah'].includes(role)) {
        throw new Error('Role tidak valid');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Pengguna.create({
        nama,
        email,
        password: hashedPassword,
        role,
        wilayah_id: wilayah_id || null
    });

    return user.id;
};

const authUpdateUser = async (id, data) => {
    const { nama, email, wilayah_id, resor_id } = data;
    
    let updateData = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;
    if (wilayah_id !== undefined) updateData.wilayah_id = wilayah_id || null;
    if (resor_id !== undefined) updateData.resor_id = resor_id || null;

    await Pengguna.update(updateData, { where: { id } });
};

const authUploadPhoto = async (id, file) => {
    if (!file) throw new Error('File tidak ditemukan');
    await Pengguna.update({ foto: file.filename }, { where: { id } });
    return file.filename;
};

const authLogin = async (data) => {
    const { email, password } = data;

    const user = await Pengguna.findOne({
        where: { email },
        include: [
            { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
            { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] }
        ]
    });

    if (!user) throw new Error('Email atau password salah');
    if (Number(user.is_active) !== 1) throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Email atau password salah');

    const allowedInternalRoles = ['admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff'];
    if (!allowedInternalRoles.includes(user.role)) {
        throw new Error('Akses ditolak. Silakan gunakan portal login Eksternal atau Mitra untuk akun Anda.');
    }

    const token = jwt.sign(
        { id: user.id, nama: user.nama, email: user.email, role: user.role, wilayah_id: user.wilayah_id, resor_id: user.resor_id, token_version: Number(user.token_version) },
        jwtSecret,
        { expiresIn: '10h' }
    );

    return {
        token,
        user: {
            id: user.id, nama: user.nama, email: user.email, role: user.role,
            wilayah_id: user.wilayah_id, resor_id: user.resor_id,
            wilayah: user.wilayah_rel ? user.wilayah_rel.nama_wilayah : null,
            resor: user.resor_rel ? user.resor_rel.nama_resor : null,
            foto: user.foto ? `http://localhost:3000/uploads/profile/${user.foto}` : null
        }
    };
};

const authChangePassword = async (userId, data) => {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) throw new Error('Password lama dan baru wajib diisi');

    const user = await Pengguna.findByPk(userId, {
        attributes: ['id', 'nama', 'email', 'password', 'role', 'wilayah_id', 'resor_id', 'instansi', 'token_version']
    });
    if (!user) throw new Error('User tidak ditemukan');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Password lama tidak sesuai');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
        password: hashedPassword,
        token_version: literal('token_version + 1')
    });
    await user.reload();

    const token = jwt.sign(
        {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            wilayah_id: user.wilayah_id,
            resor_id: user.resor_id,
            instansi: user.instansi || '',
            token_version: Number(user.token_version)
        },
        jwtSecret,
        { expiresIn: ['eksternal', 'mitra'].includes(user.role) ? '8h' : '10h' }
    );
    return { token };
};

const authRegisterEksternal = async (data) => {
    const { nama, email, password, instansi, role } = data;

    if (!nama || !email || !password || !instansi || !role) throw new Error('Semua field wajib diisi: nama, email, password, instansi, role');
    if (!['eksternal', 'mitra'].includes(role)) throw new Error('Role harus "eksternal" atau "mitra"');

    const existing = await Pengguna.findOne({ where: { email } });
    if (existing) throw new Error('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Pengguna.create({
        nama,
        email,
        password: hashedPassword,
        role,
        instansi
    });

    return { id: user.id, nama, email, role, instansi };
};

const authLoginEksternal = async (data) => {
    const { email, password } = data;
    if (!email || !password) throw new Error('Email dan password wajib diisi');

    const user = await Pengguna.findOne({
        where: { email, role: ['eksternal', 'mitra'] }
    });
    
    if (!user) throw new Error('Email atau password salah');
    if (Number(user.is_active) !== 1) throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Email atau password salah');

    const token = jwt.sign(
        { id: user.id, email: user.email, nama: user.nama, instansi: user.instansi || '', role: user.role, token_version: Number(user.token_version) },
        jwtSecret,
        { expiresIn: '8h' }
    );

    return { token, user: { id: user.id, email: user.email, nama: user.nama, instansi: user.instansi || '', role: user.role } };
};

module.exports = { authRegister, authCreateAdmin, authUpdateUser, authUploadPhoto, authLogin, authChangePassword, authRegisterEksternal, authLoginEksternal };
