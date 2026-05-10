const db = require('../../config/database');

const getInternal = async (userId) => {
    const query = `
        SELECT 
            l.id, l.judul, l.jenis_laporan, l.tanggal_berakhir, l.created_at, l.status, l.penilaian, l.file_output, l.file_laporan,
            w.nama_wilayah, r.nama_resor
        FROM laporan_internal l
        LEFT JOIN wilayah w ON l.wilayah_id = w.id
        LEFT JOIN resor r ON l.resor_id = r.id
        WHERE l.created_by = ?
        ORDER BY l.created_at DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    return rows.map(row => ({
        id: row.id,
        title: row.judul,
        date: new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        status: row.status,
        penilaian: row.penilaian,
        file_output: row.file_output,
        file_laporan: row.file_laporan,
        wilayah: row.nama_resor || row.nama_wilayah,
        type: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B'
    }));
};

const getEksternal = async (email) => {
    const [rows] = await db.execute(
        `SELECT 
            e.id, e.judul_laporan as judul, e.jenis_pengirim, e.instansi_pengirim,
            e.created_at as tanggal, e.status, e.catatan,
            e.file_dokumen, e.file_lampiran, e.file_output,
            k.nama_kategori as jenis
         FROM laporan_eksternal e
         LEFT JOIN kategori k ON e.kategori_id = k.id
         WHERE e.email_pengirim = ? AND e.jenis_pengirim = 'eksternal'
         ORDER BY e.created_at DESC`,
        [email]
    );

    return rows.map(row => {
        let certFile = null;
        if (row.status === 'approved') {
            if (row.file_output) certFile = row.file_output;
            else if (row.file_lampiran && row.file_lampiran.startsWith('ESertifikat_')) certFile = row.file_lampiran;
        }

        return {
            id: row.id, judul: row.judul, jenis: row.jenis,
            tipe: 'Eksternal',
            tanggal: row.tanggal,
            status: row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : 'Pending',
            catatan: row.catatan || null, file_sertifikat: certFile, file_dokumen: row.file_dokumen,
        };
    });
};

const getMitra = async (email) => {
    const [rows] = await db.execute(
        `SELECT 
            e.id, e.judul_laporan as judul, e.jenis_pengirim, e.instansi_pengirim,
            e.created_at as tanggal, e.status, e.catatan,
            e.file_dokumen, e.file_lampiran, e.file_output,
            k.nama_kategori as jenis
         FROM laporan_eksternal e
         LEFT JOIN kategori k ON e.kategori_id = k.id
         WHERE e.email_pengirim = ? AND e.jenis_pengirim = 'mitra'
         ORDER BY e.created_at DESC`,
        [email]
    );

    return rows.map(row => {
        let certFile = null;
        if (row.status === 'approved') {
            if (row.file_output) certFile = row.file_output;
            else if (row.file_lampiran && row.file_lampiran.startsWith('ESertifikat_')) certFile = row.file_lampiran;
        }

        return {
            id: row.id, judul: row.judul, jenis: row.jenis,
            tipe: 'Mitra',
            tanggal: row.tanggal,
            status: row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : 'Pending',
            catatan: row.catatan || null, file_sertifikat: certFile, file_dokumen: row.file_dokumen,
        };
    });
};

module.exports = { getInternal, getEksternal, getMitra };
