const AuthService = require('../../services/auth/AuthService');

const register = async (req, res) => {
    try {
        const data = await AuthService.authRegister(req.body);
        res.status(201).json({ message: 'Registrasi staff berhasil', data });
    } catch (error) {
        if (error.message === 'Email sudah terdaftar') return res.status(400).json({ message: error.message });
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

const createAdmin = async (req, res) => {
    try {
        const id = await AuthService.authCreateAdmin(req.body);
        res.status(201).json({ message: 'Admin berhasil dibuat', id });
    } catch (error) {
        if (error.message === 'Role tidak valid') return res.status(400).json({ message: error.message });
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

const updateUser = async (req, res) => {
    try {
        await AuthService.authUpdateUser(req.params.id, req.body);
        res.json({ message: 'Data user dan penempatan berhasil diupdate' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const uploadPhoto = async (req, res) => {
    try {
        const filename = await AuthService.authUploadPhoto(req.params.id, req.file);
        res.json({ message: 'Foto berhasil diupload', file: filename });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(error.message === 'File tidak ditemukan' ? 400 : 500).json({ message: error.message || 'Terjadi kesalahan pada server saat upload' });
    }
};

const login = async (req, res) => {
    try {
        const result = await AuthService.authLogin(req.body);
        res.status(200).json({ message: 'Login berhasil', ...result });
    } catch (error) {
        const msg = error.message;
        if (msg.includes('salah')) return res.status(401).json({ message: msg });
        if (msg.includes('ditolak') || msg.includes('dinonaktifkan')) return res.status(403).json({ message: msg });
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

const changePassword = async (req, res) => {
    try {
        await AuthService.authChangePassword(req.user.id, req.body);
        res.json({ message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Change Password Error:', error);
        if (error.message.includes('wajib') || error.message.includes('sesuai')) return res.status(400).json({ message: error.message });
        if (error.message === 'User tidak ditemukan') return res.status(404).json({ message: error.message });
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const logout = async (req, res) => {
    res.status(200).json({ message: 'Logout berhasil' });
};

const registerEksternal = async (req, res) => {
    try {
        const data = await AuthService.authRegisterEksternal(req.body);
        res.status(201).json({ message: `Akun ${req.body.role} berhasil didaftarkan`, data });
    } catch (error) {
        console.error('Register Eksternal Error:', error);
        if (error.message.includes('wajib') || error.message.includes('Role') || error.message.includes('terdaftar')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const loginEksternal = async (req, res) => {
    try {
        const result = await AuthService.authLoginEksternal(req.body);
        res.status(200).json({ message: 'Login berhasil', ...result });
    } catch (error) {
        console.error('Login Eksternal Error:', error);
        if (error.message.includes('wajib')) return res.status(400).json({ message: error.message });
        if (error.message.includes('salah')) return res.status(401).json({ message: error.message });
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = { register, createAdmin, updateUser, uploadPhoto, login, changePassword, logout, loginEksternal, registerEksternal };