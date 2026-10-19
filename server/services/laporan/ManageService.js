const { LaporanInternal, LaporanEksternal, Wilayah, Resor, ActivityLog } = require('../../models');
const { Op } = require('sequelize');
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

const ubahLaporanEksternal = async (id, data, files, user) => {
    const laporan = await LaporanEksternal.findOne({ where: { id } });
    if (!laporan) throw new Error('Laporan tidak ditemukan');

    if (laporan.status === 'Approved' || laporan.status === 'approved') {
        throw new Error('Laporan yang sudah disetujui tidak dapat diedit');
    }

    const { namaPic, namaMitra, nomorPks, judul, wilayah, tanggalBerakhir, keterangan, nama, instansi } = data;

    let updateData = {
        judul_laporan: judul || laporan.judul_laporan,
        nama_pengirim: namaPic || nama || laporan.nama_pengirim,
        instansi_pengirim: namaMitra || instansi || laporan.instansi_pengirim,
        nomor_pks: nomorPks !== undefined ? nomorPks : laporan.nomor_pks,
        tanggal_berakhir: tanggalBerakhir || laporan.tanggal_berakhir,
        keterangan: keterangan !== undefined ? keterangan : laporan.keterangan,
        status: 'pending',
        catatan: null
    };

    if (wilayah) {
        let wilayahId = 1; let resorId = null;
        if (wilayah !== 'Balai TNGM' && wilayah !== 'Kantor Balai' && wilayah !== 'Lintas Wilayah') {
            const resor = await Resor.findOne({
                where: {
                    [Op.or]: [
                        { nama_resor: { [Op.like]: `%${wilayah}%` } },
                        { id: wilayah }
                    ]
                }
            });
            if (resor) {
                resorId = resor.id;
                wilayahId = resor.wilayah_id;
            } else {
                const wil = await Wilayah.findOne({
                    where: { nama_wilayah: { [Op.like]: `%${wilayah}%` } }
                });
                if (wil) wilayahId = wil.id;
            }
        }
        updateData.wilayah_id = wilayahId;
        updateData.resor_id = resorId;
    }

    if (files) {
        if (files['file']) {
            if (laporan.file_dokumen) {
                const oldPath = path.join(__dirname, '../../../uploads/laporan', laporan.file_dokumen);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.file_dokumen = files['file'][0].filename;
        }
        if (files['hardfile']) {
            if (laporan.file_lampiran) {
                const oldPath = path.join(__dirname, '../../../uploads/buktihardfile', laporan.file_lampiran);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.file_lampiran = files['hardfile'][0].filename;
        }
    }

    await laporan.update(updateData);

    try {
        const actorId = user?.id || 1;
        await ActivityLog.create({
            user_id: actorId,
            laporan_id: null,
            action: 'UPDATE',
            description: `Sistem: Laporan revisi dikirim kembali untuk "${updateData.judul_laporan}" oleh ${updateData.nama_pengirim} (${updateData.instansi_pengirim}).`
        });
    } catch (logErr) {
        console.warn('Peringatan log:', logErr.message);
    }

    return { message: 'Laporan revisi berhasil dikirim ulang dan sedang menunggu verifikasi', id: laporan.id };
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

module.exports = { hapusLaporan, ubahLaporan, ubahLaporanEksternal, tanganiArsipLama, unggahPDFSusulan };
