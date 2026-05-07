const RiwayatService = require('../../services/laporan/RiwayatService');

const getRiwayatLaporan = async (req, res) => {
    try {
        const reports = await RiwayatService.getInternal(req.user.id);
        res.json(reports);
    } catch (error) {
        console.error('Get Riwayat Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat laporan', error: error.message });
    }
};

const getRiwayatEksternal = async (req, res) => {
    try {
        const reports = await RiwayatService.getEksternal(req.user.email);
        res.json(reports);
    } catch (error) {
        console.error('Get Riwayat Eksternal Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat laporan' });
    }
};

const getRiwayatMitra = async (req, res) => {
    try {
        const reports = await RiwayatService.getMitra(req.user.email);
        res.json(reports);
    } catch (error) {
        console.error('Get Riwayat Mitra Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat laporan mitra' });
    }
};

module.exports = { getRiwayatLaporan, getRiwayatEksternal, getRiwayatMitra };
