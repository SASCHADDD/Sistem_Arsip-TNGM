const VerifikasiService = require('../../services/laporan/VerifikasiService');

const verifyLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, catatan, source_table = 'internal' } = req.body;
        const user = req.user;

        if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Status tidak valid' });

        const result = await VerifikasiService.verifyLaporanLogic(id, status, catatan, source_table, user);
        res.json(result);
    } catch (error) {
        console.error('Verify Laporan Error:', error);
        res.status(error.message.includes('tidak ditemukan') || error.message.includes('tidak valid') ? 404 : 500).json({ message: error.message || 'Gagal memverifikasi laporan' });
    }
};

const getAllPendingReports = async (req, res) => {
    try {
        const reports = await VerifikasiService.getPendingReportsLogic(req.user);
        res.json(reports);
    } catch (error) {
        console.error('Get Pending Reports Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data laporan pending' });
    }
};

const getAllApprovedReports = async (req, res) => {
    try {
        const reports = await VerifikasiService.getApprovedReportsLogic(req.user);
        res.json(reports);
    } catch (error) {
        console.error('Get Approved Reports Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data laporan yang disetujui' });
    }
};

module.exports = { verifyLaporan, getAllPendingReports, getAllApprovedReports };
