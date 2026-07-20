const { Wilayah, Resor } = require('../../models');

const getOptions = async () => {
    const kategori = [
        { id: 'A', nama_kategori: 'Laporan A' },
        { id: 'B', nama_kategori: 'Laporan B' }
    ];

    const wilayahRows = await Wilayah.findAll({
        attributes: ['id', ['nama_wilayah', 'nama']],
        order: [['nama_wilayah', 'ASC']],
        raw: true
    });
    
    const resorRows = await Resor.findAll({
        attributes: ['id', ['nama_resor', 'nama'], 'wilayah_id'],
        order: [['nama_resor', 'ASC']],
        raw: true
    });

    return { kategori, wilayah: wilayahRows, resor: resorRows };
};

module.exports = { getOptions };
