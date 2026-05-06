const db = require('../../config/database');

const getDetail = async (id, source, user) => {
    if (source === 'eksternal' || source === 'mitra') {
        const [rows] = await db.execute(
            `SELECT 
                e.id, e.judul_laporan as judul, e.jenis_pengirim,
                e.nama_pengirim, e.instansi_pengirim, e.email_pengirim,
                e.tanggal_berakhir, e.created_at, e.keterangan,
                e.file_dokumen, e.file_lampiran, e.file_output,
                e.status, e.catatan,
                k.nama_kategori as jenis_kategori,
                w.nama_wilayah
             FROM laporan_eksternal e
             LEFT JOIN kategori k ON e.kategori_id = k.id
             LEFT JOIN wilayah w ON e.wilayah_id = w.id
             WHERE e.id = ?`,
            [id]
        );

        if (rows.length === 0) throw new Error('NOT_FOUND');

        const row = rows[0];
        return {
            id: row.id, judul: row.judul, jenis: row.jenis_kategori || '-', jenis_value: row.jenis_pengirim,
            tanggal_berakhir: row.tanggal_berakhir, tanggal_buat: row.created_at,
            wilayah: row.nama_wilayah || 'Balai TNGM', resor: row.instansi_pengirim || '-',
            keterangan: row.keterangan, status: row.status, penilaian: null,
            file_dokumen: row.file_dokumen, foto_lampiran: row.file_lampiran, file_output: row.file_output,
            pelapor: row.nama_pengirim, instansi: row.instansi_pengirim, email: row.email_pengirim,
            tipe: row.jenis_pengirim, adminMessage: row.catatan || null, is_mutasi: false
        };
    }

    const query = `
        SELECT 
            l.id, l.judul, l.jenis_laporan, l.tanggal_berakhir, l.created_at, l.keterangan,
            l.file_laporan, l.foto_hardfile, l.file_output, l.status, l.penilaian, l.catatan,
            l.resor_id as report_resor_id, w.nama_wilayah, r.nama_resor,
            u.nama as nama_pelapor, u.resor_id as current_resor_id
        FROM laporan_internal l
        LEFT JOIN wilayah w ON l.wilayah_id = w.id
        LEFT JOIN resor r ON l.resor_id = r.id
        LEFT JOIN pengguna u ON l.created_by = u.id
        WHERE l.id = ? AND (l.created_by = ? OR ? LIKE '%admin%')
    `;

    const [rows] = await db.execute(query, [id, user.id, user.role]);

    if (rows.length === 0) throw new Error('NOT_FOUND_OR_FORBIDDEN');

    const row = rows[0];
    return {
        id: row.id, judul: row.judul, jenis: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
        jenis_value: row.jenis_laporan, tanggal_berakhir: row.tanggal_berakhir, tanggal_buat: row.created_at,
        wilayah: row.nama_wilayah, resor: row.nama_resor,
        is_mutasi: row.report_resor_id && row.current_resor_id ? row.report_resor_id !== row.current_resor_id : false,
        keterangan: row.keterangan, status: row.status, penilaian: row.penilaian,
        file_dokumen: row.file_laporan, foto_lampiran: row.foto_hardfile, file_output: row.file_output,
        pelapor: row.nama_pelapor, adminMessage: row.catatan || null
    };
};

module.exports = { getDetail };
