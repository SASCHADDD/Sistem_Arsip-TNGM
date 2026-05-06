const ManageService = require('../../services/laporan/ManageService');

const deleteLaporan = async (req, res) => {
    try {
        const result = await ManageService.hapusLaporan(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Delete Laporan Error:', error);
        res.status(error.message.includes('tidak ditemukan') ? 404 : error.message.includes('sudah diproses') ? 403 : 500).json({ message: error.message || 'Gagal menghapus laporan' });
    }
};

const updateLaporan = async (req, res) => {
    try {
        const result = await ManageService.ubahLaporan(req.params.id, req.body, req.files, req.user);
        res.json(result);
    } catch (error) {
        console.error('Update Laporan Error:', error);
        res.status(error.message.includes('tidak ditemukan') ? 404 : error.message.includes('disetujui') ? 403 : 500).json({ message: error.message || 'Gagal memperbarui laporan' });
    }
};

const inputArsipLama = async (req, res) => {
    try {
        const result = await ManageService.tanganiArsipLama(req.body, req.files, req.user);
        res.status(201).json(result);
    } catch (error) {
        console.error('Input Arsip Lama Error:', error);
        res.status(error.message.includes('lengkapi') ? 400 : 500).json({ message: error.message || 'Terjadi kesalahan saat menyimpan arsip' });
    }
};

const uploadSusulan = async (req, res) => {
    try {
        const result = await ManageService.unggahPDFSusulan(req.params.id, req.params.source, req.files);
        res.json(result);
    } catch (error) {
        console.error('Upload Susulan Error:', error);
        res.status(error.message.includes('tidak valid') || error.message.includes('unggah') ? 400 : error.message.includes('ditemukan') ? 404 : 500).json({ message: error.message || 'Gagal menyusulkan file dokumen' });
    }
};

module.exports = { deleteLaporan, updateLaporan, inputArsipLama, uploadSusulan };
