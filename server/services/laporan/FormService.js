const db = require('../../config/database');

const getOptions = async () => {
    const kategori = [
        { id: 'A', nama_kategori: 'Laporan A' },
        { id: 'B', nama_kategori: 'Laporan B' }
    ];

    const [wilayahRows] = await db.query('SELECT id, nama_wilayah as nama FROM wilayah ORDER BY nama_wilayah ASC');
    const [resorRows] = await db.query('SELECT id, nama_resor as nama, wilayah_id FROM resor ORDER BY nama_resor ASC');

    return { kategori, wilayah: wilayahRows, resor: resorRows };
};

module.exports = { getOptions };
