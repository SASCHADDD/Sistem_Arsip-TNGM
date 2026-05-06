const DetailService = require('../../services/laporan/DetailService');

const getdetaillaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.query; // 'internal' | 'eksternal' | 'mitra'
        const user = req.user;

        const detail = await DetailService.getDetail(id, source, user);
        res.json(detail);
    } catch (error) {
        console.error('Get Detail Laporan Error:', error);
        if (error.message === 'NOT_FOUND' || error.message === 'NOT_FOUND_OR_FORBIDDEN') {
            return res.status(404).json({ message: 'Laporan tidak ditemukan atau Anda tidak memiliki akses' });
        }
        res.status(500).json({ message: 'Gagal mengambil detail laporan' });
    }
};

module.exports = { getdetaillaporan };
