const db = require('../../config/database');
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

    const query = `
        INSERT INTO laporan_internal 
        (judul, jenis_laporan, tanggal_berakhir, file_laporan, foto_hardfile, 
        keterangan, wilayah_id, resor_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [judul_laporan, kategori_id, tanggal_berakhir, fileDokumen, fileLampiran, keterangan || null, user.wilayah_id, user.resor_id, user.id];
    const [result] = await db.execute(query, values);

    await logActivity(user.id, result.insertId, 'SUBMIT', `Anda mengirimkan laporan baru: "${judul_laporan}"`);
    return { message: 'Laporan internal berhasil disubmit', id: result.insertId };
};

const processLaporanEksternal = async (data, files) => {
    const { nama, instansi, email, judul, jenis, wilayah, tanggalBerakhir, keterangan } = data;
    const fileDokumen = files && files['file'] ? files['file'][0].filename : null;
    const fileLampiran = files && files['hardfile'] ? files['hardfile'][0].filename : null;

    if (!judul || !fileDokumen || !nama || !instansi || !email) {
        throw new Error('Harap isi data wajib dan lampirkan dokumen.');
    }

    let kategoriId = null;
    const [kategoriRows] = await db.execute('SELECT id FROM kategori WHERE nama_kategori = ? OR id = ? LIMIT 1', [jenis, jenis]);
    if (kategoriRows.length > 0) kategoriId = kategoriRows[0].id;
    if (!kategoriId) kategoriId = 1;

    let wilayahId = 1; let resorId = null;
    if (wilayah && wilayah !== 'Balai TNGM' && wilayah !== 'Kantor Balai') {
        const [resorRows] = await db.execute('SELECT id, wilayah_id FROM resor WHERE nama_resor LIKE ? OR id = ? LIMIT 1', [`%${wilayah}%`, wilayah]);
        if (resorRows.length > 0) { resorId = resorRows[0].id; wilayahId = resorRows[0].wilayah_id; }
    }

    const query = `INSERT INTO laporan_eksternal (jenis_pengirim, nama_pengirim, instansi_pengirim, email_pengirim, judul_laporan, kategori_id, wilayah_id, resor_id, tanggal_berakhir, keterangan, file_dokumen, file_lampiran, status, created_at) VALUES ('pengaju simaksi', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
    const queryParams = [nama, instansi, email, judul, kategoriId, wilayahId, resorId, tanggalBerakhir || null, keterangan || null, fileDokumen, fileLampiran];
    const [result] = await db.execute(query, queryParams);

    await db.execute(`INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) VALUES (1, NULL, 'SUBMIT', ?, NOW())`, [`Sistem: Laporan eksternal baru berjudul "${judul}" diajukan oleh ${nama} (${instansi}).`]);
    
    return { message: 'Laporan eksternal berhasil diajukan', id: result.insertId };
};

const processLaporanMitra = async (data, files) => {
    const { namaPic, namaMitra, nomorPks, email, judul, jenis, wilayah, tanggalBerakhir, keterangan } = data;
    const fileDokumen = files && files['file'] ? files['file'][0].filename : null;
    const fileLampiran = files && files['hardfile'] ? files['hardfile'][0].filename : null;

    if (!judul || !fileDokumen || !namaPic || !namaMitra || !email) {
        throw new Error('Harap isi data wajib dan lampirkan dokumen.');
    }

    let kategoriId = null;
    const [kategoriRows] = await db.execute('SELECT id FROM kategori WHERE nama_kategori = ? OR id = ? LIMIT 1', [jenis, jenis]);
    if (kategoriRows.length > 0) kategoriId = kategoriRows[0].id;
    if (!kategoriId) kategoriId = 1;

    let wilayahId = 1; let resorId = null;
    if (wilayah && wilayah !== 'Balai TNGM' && wilayah !== 'Lintas Wilayah' && wilayah !== 'Kantor Balai') {
        const [resorRows] = await db.execute('SELECT id, wilayah_id FROM resor WHERE nama_resor LIKE ? OR id = ? LIMIT 1', [`%${wilayah}%`, wilayah]);
        if (resorRows.length > 0) { resorId = resorRows[0].id; wilayahId = resorRows[0].wilayah_id; }
        else {
            const [wilRows] = await db.execute('SELECT id FROM wilayah WHERE nama_wilayah LIKE ? LIMIT 1', [`%${wilayah}%`]);
            if (wilRows.length > 0) { wilayahId = wilRows[0].id; }
        }
    }

    const query = `INSERT INTO laporan_eksternal (jenis_pengirim, nama_pengirim, instansi_pengirim, nomor_pks, email_pengirim, judul_laporan, kategori_id, wilayah_id, resor_id, tanggal_berakhir, keterangan, file_dokumen, file_lampiran, status, created_at) VALUES ('mitra', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
    const queryParams = [namaPic, namaMitra, nomorPks || null, email, judul, kategoriId, wilayahId, resorId, tanggalBerakhir || null, keterangan || null, fileDokumen, fileLampiran];
    const [result] = await db.execute(query, queryParams);

    await db.execute(`INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) VALUES (1, NULL, 'SUBMIT', ?, NOW())`, [`Sistem: Laporan mitra baru berjudul "${judul}" diajukan oleh ${namaPic} (${namaMitra}).`]);
    
    return { message: 'Laporan mitra berhasil diajukan', id: result.insertId };
};

module.exports = { processLaporanInternal, processLaporanEksternal, processLaporanMitra };
