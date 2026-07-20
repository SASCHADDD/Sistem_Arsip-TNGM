const { LaporanInternal, LaporanEksternal } = require('../../models');
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../activity/activityLogger');

const hapusLaporan = async (id, userId) => {
    const laporan = await LaporanInternal.findOne({ where: { id, created_by: userId } });
    if (!laporan) throw new Error('Laporan tidak ditemukan');

    if (laporan.status !== 'Pending') throw new Error('Laporan yang sudah diproses tidak dapat dihapus');

    if (laporan.file_laporan) {
        const filePath = path.join(__dirname, '../../../uploads/laporan', laporan.file_laporan);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (laporan.foto_hardfile) {
        const filePath = path.join(__dirname, '../../../uploads/laporan', laporan.foto_hardfile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await laporan.destroy();
    return { message: 'Laporan berhasil dihapus' };
};

const ubahLaporan = async (id, data, files, user) => {
    const { judul_laporan, kategori_id, tanggal_berakhir, keterangan } = data;

    const laporan = await LaporanInternal.findOne({ where: { id, created_by: user.id } });
    if (!laporan) throw new Error('Laporan tidak ditemukan');

    if (!['Pending', 'Rejected'].includes(laporan.status)) {
        throw new Error('Laporan yang sudah disetujui tidak dapat diedit');
    }

    let updateData = {
        judul: judul_laporan,
        jenis_laporan: kategori_id,
        tanggal_berakhir: tanggal_berakhir,
        keterangan: keterangan,
        wilayah_id: user.wilayah_id,
        resor_id: user.resor_id,
        status: 'Pending',
        created_at: new Date()
    };

    if (files) {
        if (files['file_dokumen']) {
            const oldPath = path.join(__dirname, '../../../uploads/laporan', laporan.file_laporan);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            updateData.file_laporan = files['file_dokumen'][0].filename;
        }
        if (files['file_lampiran']) {
            const oldPath = path.join(__dirname, '../../../uploads/laporan', laporan.foto_hardfile);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            updateData.foto_hardfile = files['file_lampiran'][0].filename;
        }
    }

    await laporan.update(updateData);
    await logActivity(user.id, id, 'UPDATE', `Anda memperbarui laporan: "${judul_laporan}"`);

    return { message: 'Laporan berhasil diperbarui' };
};

const tanganiArsipLama = async (data, files, user) => {
    const { judul_laporan, kategori_id, keterangan, wilayah_id, resor_id, tanggal_asli } = data;

    if (!judul_laporan || !kategori_id || !tanggal_asli) {
        throw new Error('Mohon lengkapi data judul, jenis laporan, dan tanggal berakhir kegiatan.');
    }

    const fileDokumen = files && files['file_dokumen'] ? files['file_dokumen'][0].filename : null;
    const fileLampiran = files && files['file_lampiran'] ? files['file_lampiran'][0].filename : null;

    const laporan = await LaporanInternal.create({
        judul: judul_laporan,
        jenis_laporan: kategori_id,
        tanggal_berakhir: tanggal_asli,
        file_laporan: fileDokumen,
        foto_hardfile: fileLampiran,
        keterangan: keterangan || null,
        wilayah_id: wilayah_id,
        resor_id: resor_id || null,
        created_by: user.id,
        status: 'Approved',
        created_at: tanggal_asli
    });

    await logActivity(user.id, laporan.id, 'SUBMIT', `Sistem: Admin memasukkan data arsip lama: "${judul_laporan}"`);
    return { message: 'Arsip lama berhasil disimpan' };
};

const unggahPDFSusulan = async (id, source, files) => {
    if (!files || (!files['file_dokumen'] && !files['file'])) {
        throw new Error('Harap unggah file PDF dokumen.');
    }

    const fileName = files['file_dokumen'] ? files['file_dokumen'][0].filename : files['file'][0].filename;

    let affected = 0;
    if (source === 'internal') {
        const [num] = await LaporanInternal.update({ file_laporan: fileName }, { where: { id } });
        affected = num;
    } else if (source === 'eksternal') {
        const [num] = await LaporanEksternal.update({ file_dokumen: fileName }, { where: { id } });
        affected = num;
    } else {
        throw new Error('Sumber asal laporan tidak valid.');
    }

    if (affected === 0) throw new Error('Data laporan tidak ditemukan.');

    return { message: 'File dokumen berhasil disusulkan.', fileName };
};

module.exports = { hapusLaporan, ubahLaporan, tanganiArsipLama, unggahPDFSusulan };
