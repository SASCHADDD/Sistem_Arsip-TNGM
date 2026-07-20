const { LaporanInternal, LaporanEksternal, Wilayah, Resor, Kategori } = require('../../models');

const getInternal = async (userId) => {
    const rows = await LaporanInternal.findAll({
        where: { created_by: userId },
        include: [
            { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
            { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] }
        ],
        order: [['created_at', 'DESC']]
    });

    return rows.map(row => ({
        id: row.id,
        title: row.judul,
        date: new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        status: row.status,
        penilaian: row.penilaian,
        file_output: row.file_output,
        file_laporan: row.file_laporan,
        wilayah: row.resor_rel ? row.resor_rel.nama_resor : (row.wilayah_rel ? row.wilayah_rel.nama_wilayah : null),
        type: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B'
    }));
};

const formatEksternalRow = (row, tipeLabel) => {
    let certFile = null;
    if (row.status === 'approved') {
        if (row.file_output) certFile = row.file_output;
        else if (row.file_lampiran && row.file_lampiran.startsWith('ESertifikat_')) certFile = row.file_lampiran;
    }

    return {
        id: row.id, 
        judul: row.judul_laporan, 
        jenis: row.kategori_rel ? row.kategori_rel.nama_kategori : '-',
        tipe: tipeLabel,
        tanggal: row.created_at,
        status: row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : 'Pending',
        catatan: row.catatan || null, 
        file_sertifikat: certFile, 
        file_dokumen: row.file_dokumen,
    };
};

const getEksternal = async (email) => {
    const rows = await LaporanEksternal.findAll({
        where: { email_pengirim: email, jenis_pengirim: 'eksternal' },
        include: [
            { model: Kategori, as: 'kategori_rel', attributes: ['nama_kategori'] }
        ],
        order: [['created_at', 'DESC']]
    });

    return rows.map(row => formatEksternalRow(row, 'Eksternal'));
};

const getMitra = async (email) => {
    const rows = await LaporanEksternal.findAll({
        where: { email_pengirim: email, jenis_pengirim: 'mitra' },
        include: [
            { model: Kategori, as: 'kategori_rel', attributes: ['nama_kategori'] }
        ],
        order: [['created_at', 'DESC']]
    });

    return rows.map(row => formatEksternalRow(row, 'Mitra'));
};

module.exports = { getInternal, getEksternal, getMitra };
