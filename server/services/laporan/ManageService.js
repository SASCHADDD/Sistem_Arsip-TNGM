const db = require('../../config/database');
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../activity/activityLogger');

const hapusLaporan = async (id, userId) => {
    const [rows] = await db.execute('SELECT * FROM laporan_internal WHERE id = ? AND created_by = ?', [id, userId]);
    if (rows.length === 0) throw new Error('Laporan tidak ditemukan');

    const laporan = rows[0];
    if (laporan.status !== 'Pending') throw new Error('Laporan yang sudah diproses tidak dapat dihapus');

    if (laporan.file_laporan) {
        const filePath = path.join(__dirname, '../../../uploads/laporan', laporan.file_laporan);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (laporan.foto_hardfile) {
        const filePath = path.join(__dirname, '../../../uploads/laporan', laporan.foto_hardfile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.execute('DELETE FROM laporan_internal WHERE id = ?', [id]);
    return { message: 'Laporan berhasil dihapus' };
};

const ubahLaporan = async (id, data, files, user) => {
    const { judul_laporan, kategori_id, tanggal_berakhir, keterangan } = data;

    const [rows] = await db.execute('SELECT * FROM laporan_internal WHERE id = ? AND created_by = ?', [id, user.id]);
    if (rows.length === 0) throw new Error('Laporan tidak ditemukan');

    const oldLaporan = rows[0];

    if (!['Pending', 'Rejected'].includes(oldLaporan.status)) {
        throw new Error('Laporan yang sudah disetujui tidak dapat diedit');
    }

    let query = `UPDATE laporan_internal SET judul = ?, jenis_laporan = ?, tanggal_berakhir = ?, keterangan = ?, wilayah_id = ?, resor_id = ?, status = 'Pending', created_at = NOW()`;
    let values = [judul_laporan, kategori_id, tanggal_berakhir, keterangan, user.wilayah_id, user.resor_id];

    if (files) {
        if (files['file_dokumen']) {
            const oldPath = path.join(__dirname, '../../../uploads/laporan', oldLaporan.file_laporan);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            query += `, file_laporan = ?`;
            values.push(files['file_dokumen'][0].filename);
        }
        if (files['file_lampiran']) {
            const oldPath = path.join(__dirname, '../../../uploads/laporan', oldLaporan.foto_hardfile);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            query += `, foto_hardfile = ?`;
            values.push(files['file_lampiran'][0].filename);
        }
    }

    query += ` WHERE id = ?`;
    values.push(id);

    await db.execute(query, values);
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

    const query = `
        INSERT INTO laporan_internal 
        (judul, jenis_laporan, tanggal_berakhir, file_laporan, foto_hardfile, 
        keterangan, wilayah_id, resor_id, created_by, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)
    `;

    const values = [judul_laporan, kategori_id, tanggal_asli, fileDokumen, fileLampiran, keterangan || null, wilayah_id, resor_id || null, user.id, tanggal_asli];
    const [result] = await db.execute(query, values);

    await logActivity(user.id, result.insertId, 'SUBMIT', `Sistem: Admin memasukkan data arsip lama: "${judul_laporan}"`);
    return { message: 'Arsip lama berhasil disimpan' };
};

const unggahPDFSusulan = async (id, source, files) => {
    if (!files || (!files['file_dokumen'] && !files['file'])) {
        throw new Error('Harap unggah file PDF dokumen.');
    }

    const fileName = files['file_dokumen'] ? files['file_dokumen'][0].filename : files['file'][0].filename;

    let query = '';
    if (source === 'internal') query = `UPDATE laporan_internal SET file_laporan = ? WHERE id = ?`;
    else if (source === 'eksternal') query = `UPDATE laporan_eksternal SET file_dokumen = ? WHERE id = ?`;
    else throw new Error('Sumber asal laporan tidak valid.');

    const [result] = await db.execute(query, [fileName, id]);
    if (result.affectedRows === 0) throw new Error('Data laporan tidak ditemukan.');

    return { message: 'File dokumen berhasil disusulkan.', fileName };
};

module.exports = { hapusLaporan, ubahLaporan, tanganiArsipLama, unggahPDFSusulan };
