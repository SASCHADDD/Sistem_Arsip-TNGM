const SubmitService = require('../../services/laporan/SubmitService');

const submitLaporan = async (req, res) => {
    try {
        const result = await SubmitService.processLaporanInternal(req.body, req.files, req.user);
        res.status(201).json(result);
    } catch (error) {
        console.error('Submit Laporan Error:', error);
        if (error.message.includes('akses')) return res.status(403).json({ message: error.message });
        if (error.message.includes('wajib')) return res.status(400).json({ message: error.message });
        res.status(500).json({ message: error.message || 'Terjadi kesalahan saat menyimpan laporan' });
    }
};

const submitLaporanEksternal = async (req, res) => {
    try {
        const result = await SubmitService.processLaporanEksternal(req.body, req.files);
        res.status(201).json(result);
    } catch (error) {
        console.error('Submit Eksternal Error:', error);
        res.status(error.message.includes('wajib') ? 400 : 500).json({ message: error.message || 'Gagal mengajukan laporan eksternal, terjadi kesalahan di server.' });
    }
};

const submitLaporanMitra = async (req, res) => {
    try {
        const result = await SubmitService.processLaporanMitra(req.body, req.files);
        res.status(201).json(result);
    } catch (error) {
        console.error('Submit Mitra Error:', error);
        res.status(error.message.includes('wajib') ? 400 : 500).json({ message: error.message || 'Gagal mengajukan laporan mitra, terjadi kesalahan di server.' });
    }
};

module.exports = { submitLaporan, submitLaporanEksternal, submitLaporanMitra };
