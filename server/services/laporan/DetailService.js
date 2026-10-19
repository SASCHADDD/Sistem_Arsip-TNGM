const { Op } = require('sequelize');
const { LaporanInternal, LaporanEksternal, Kategori, Wilayah, Resor, Pengguna } = require('../../models');

const getDetail = async (id, source, user) => {
    if (source === 'eksternal' || source === 'mitra') {
        const row = await LaporanEksternal.findByPk(id, {
            include: [
                { model: Kategori, as: 'kategori_rel', attributes: ['nama_kategori'] },
                { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
                { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] }
            ]
        });

        if (!row) throw new Error('NOT_FOUND');

        const resorNama = row.resor_rel ? row.resor_rel.nama_resor : null;
        const wilayahNama = row.wilayah_rel ? row.wilayah_rel.nama_wilayah : 'Balai TNGM';

        return {
            id: row.id, judul: row.judul_laporan, jenis: row.kategori_rel ? row.kategori_rel.nama_kategori : '-', jenis_value: row.jenis_pengirim,
            tanggal_berakhir: row.tanggal_berakhir, tanggal_buat: row.created_at,
            wilayah: wilayahNama,
            resor: resorNama || wilayahNama,
            resor_nama: resorNama,
            keterangan: row.keterangan, status: row.status, penilaian: null,
            file_dokumen: row.file_dokumen, foto_lampiran: row.file_lampiran, file_output: row.file_output,
            pelapor: row.nama_pengirim, instansi: row.instansi_pengirim, email: row.email_pengirim,
            nomor_pks: row.nomor_pks || '',
            tipe: row.jenis_pengirim, adminMessage: row.catatan || null, is_mutasi: false
        };
    }

    let whereClause = { id };
    if (!user.role.includes('admin') && user.role !== 'kepala_wilayah') {
        whereClause.created_by = user.id;
    }

    const row = await LaporanInternal.findOne({
        where: whereClause,
        include: [
            { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
            { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] },
            { model: Pengguna, as: 'pembuat', attributes: ['nama', 'resor_id'] }
        ]
    });

    if (!row) throw new Error('NOT_FOUND_OR_FORBIDDEN');

    return {
        id: row.id, judul: row.judul, jenis: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
        jenis_value: row.jenis_laporan, tanggal_berakhir: row.tanggal_berakhir, tanggal_buat: row.created_at,
        wilayah: row.wilayah_rel ? row.wilayah_rel.nama_wilayah : null, resor: row.resor_rel ? row.resor_rel.nama_resor : null,
        is_mutasi: row.resor_id && row.pembuat && row.pembuat.resor_id ? row.resor_id !== row.pembuat.resor_id : false,
        keterangan: row.keterangan, status: row.status, penilaian: row.penilaian,
        file_dokumen: row.file_laporan, foto_lampiran: row.foto_hardfile, file_output: row.file_output,
        pelapor: row.pembuat ? row.pembuat.nama : null, adminMessage: row.catatan || null
    };
};

module.exports = { getDetail };
