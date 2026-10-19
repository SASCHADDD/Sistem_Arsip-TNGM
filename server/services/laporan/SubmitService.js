const { Op } = require('sequelize');
const { LaporanInternal, LaporanEksternal, Kategori, Resor, Wilayah, ActivityLog } = require('../../models');
const { logActivity } = require('../activity/activityLogger');

const processLaporanInternal = async (data, files, user) => {
    const { judul_laporan, kategori_id, tanggal_berakhir, keterangan } = data;

    if (!judul_laporan || !kategori_id || !tanggal_berakhir) {
        throw new Error('Mohon lengkapi semua data wajib');
    }

    if (!user.wilayah_id || !user.resor_id) {
        throw new Error('Anda tidak memiliki akses wilayah/resor yang valid untuk membuat laporan ini.');
    }

    if (!files || !files['file_dokumen'] || !files['file_lampiran']) {
        throw new Error('File dokumen dan foto hardfile wajib diupload');
    }

    const fileDokumen = files['file_dokumen'][0].filename;
    const fileLampiran = files['file_lampiran'][0].filename;

    const laporan = await LaporanInternal.create({
        judul: judul_laporan,
        jenis_laporan: kategori_id,
        tanggal_berakhir: tanggal_berakhir,
        file_laporan: fileDokumen,
        foto_hardfile: fileLampiran,
        keterangan: keterangan || null,
        wilayah_id: user.wilayah_id,
        resor_id: user.resor_id,
        created_by: user.id,
        created_at: new Date()
    });

    await logActivity(user.id, laporan.id, 'SUBMIT', `Anda mengirimkan laporan baru: "${judul_laporan}"`);
    return { message: 'Laporan internal berhasil disubmit', id: laporan.id };
};

const getResorWilayah = async (wilayahName) => {
    let wilayahId = 1; let resorId = null;
    if (wilayahName && wilayahName !== 'Balai TNGM' && wilayahName !== 'Kantor Balai' && wilayahName !== 'Lintas Wilayah') {
        const resor = await Resor.findOne({
            where: {
                [Op.or]: [
                    { nama_resor: { [Op.like]: `%${wilayahName}%` } },
                    { id: wilayahName }
                ]
            }
        });
        if (resor) {
            resorId = resor.id;
            wilayahId = resor.wilayah_id;
        } else {
            const wil = await Wilayah.findOne({
                where: { nama_wilayah: { [Op.like]: `%${wilayahName}%` } }
            });
            if (wil) wilayahId = wil.id;
        }
    }
    return { wilayahId, resorId };
};

const getKategoriId = async (jenisName) => {
    let kategoriId = 1;
    const kat = await Kategori.findOne({
        where: {
            [Op.or]: [
                { nama_kategori: jenisName },
                { id: jenisName }
            ]
        }
    });
    if (kat) kategoriId = kat.id;
    return kategoriId;
};

const processLaporanEksternal = async (data, files, user) => {
    if (user.role !== 'eksternal') throw new Error('Akses ditolak untuk akun ini.');
    const { judul, jenis, wilayah, tanggalBerakhir, keterangan } = data;
    const nama = user.nama;
    const instansi = user.instansi;
    const email = user.email;
    const fileDokumen = files && files['file'] ? files['file'][0].filename : null;
    const fileLampiran = files && files['hardfile'] ? files['hardfile'][0].filename : null;

    if (!judul || !fileDokumen || !nama || !instansi || !email) {
        throw new Error('Harap isi data wajib dan lampirkan dokumen.');
    }

    const kategoriId = await getKategoriId(jenis);
    const { wilayahId, resorId } = await getResorWilayah(wilayah);

    const laporan = await LaporanEksternal.create({
        jenis_pengirim: 'eksternal',
        nama_pengirim: nama,
        instansi_pengirim: instansi,
        email_pengirim: email,
        judul_laporan: judul,
        kategori_id: kategoriId,
        wilayah_id: wilayahId,
        resor_id: resorId,
        tanggal_berakhir: tanggalBerakhir || null,
        keterangan: keterangan || null,
        file_dokumen: fileDokumen,
        file_lampiran: fileLampiran,
        status: 'pending',
        created_at: new Date()
    });

    try {
        const actorId = user?.id || 1;
        await ActivityLog.create({
            user_id: actorId,
            laporan_id: null,
            action: 'SUBMIT',
            description: `Sistem: Laporan eksternal baru berjudul "${judul}" diajukan oleh ${nama} (${instansi}).`
        });
    } catch (logErr) {
        console.warn('Peringatan: Gagal mencatat activity log eksternal:', logErr.message);
    }
    
    return { message: 'Laporan eksternal berhasil diajukan', id: laporan.id };
};

const processLaporanMitra = async (data, files, user) => {
    if (user.role !== 'mitra') throw new Error('Akses ditolak untuk akun ini.');
    const { nomorPks, judul, jenis, wilayah, tanggalBerakhir, keterangan } = data;
    const namaPic = user.nama;
    const namaMitra = user.instansi;
    const email = user.email;
    const fileDokumen = files && files['file'] ? files['file'][0].filename : null;
    const fileLampiran = files && files['hardfile'] ? files['hardfile'][0].filename : null;

    if (!judul || !fileDokumen || !namaPic || !namaMitra || !email) {
        throw new Error('Harap isi data wajib dan lampirkan dokumen.');
    }

    const kategoriId = await getKategoriId(jenis);
    const { wilayahId, resorId } = await getResorWilayah(wilayah);

    const laporan = await LaporanEksternal.create({
        jenis_pengirim: 'mitra',
        nama_pengirim: namaPic,
        instansi_pengirim: namaMitra,
        nomor_pks: nomorPks || null,
        email_pengirim: email,
        judul_laporan: judul,
        kategori_id: kategoriId,
        wilayah_id: wilayahId,
        resor_id: resorId,
        tanggal_berakhir: tanggalBerakhir || null,
        keterangan: keterangan || null,
        file_dokumen: fileDokumen,
        file_lampiran: fileLampiran,
        status: 'pending',
        created_at: new Date()
    });

    try {
        const actorId = user?.id || 1;
        await ActivityLog.create({
            user_id: actorId,
            laporan_id: null,
            action: 'SUBMIT',
            description: `Sistem: Laporan mitra baru berjudul "${judul}" diajukan oleh ${namaPic} (${namaMitra}).`
        });
    } catch (logErr) {
        console.warn('Peringatan: Gagal mencatat activity log mitra:', logErr.message);
    }
    
    return { message: 'Laporan mitra berhasil diajukan', id: laporan.id };
};

module.exports = { processLaporanInternal, processLaporanEksternal, processLaporanMitra };
