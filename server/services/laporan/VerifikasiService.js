const db = require('../../config/database');
const { generateTandaTerimaPDF, generateESertifikatPDF } = require('../pdf/pdfService');
const { hitungPenilaian } = require('../penilaian/penilaianService');
const { logActivity } = require('../activity/activityLogger');

const verifyLaporanLogic = async (id, status, catatan, source_table, user) => {
    let laporan = null;
    let fileOutput = null;

    if (source_table === 'internal') {
        const [rows] = await db.execute(`SELECT l.*, u.nama as nama_pelapor FROM laporan_internal l JOIN pengguna u ON l.created_by = u.id WHERE l.id = ?`, [id]);
        if (rows.length === 0) throw new Error('Laporan Internal tidak ditemukan');
        
        laporan = rows[0];

        if (status === 'Approved') {
            let penilaianValue = hitungPenilaian(laporan);
            const pdfData = {
                nama_pengirim: laporan.nama_pelapor,
                tanggal_terima: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                judul_laporan: laporan.judul,
                jenis_laporan: laporan.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
                penerima: user.nama
            };
            fileOutput = await generateTandaTerimaPDF(pdfData);
            await db.execute('UPDATE laporan_internal SET status = ?, file_output = ?, penilaian = ? WHERE id = ?', [status, fileOutput, penilaianValue, id]);
        } else {
            await db.execute('UPDATE laporan_internal SET status = ?, catatan = ? WHERE id = ?', [status, catatan || '', id]);
        }

        const desc = status === 'Approved' ? `Laporan Internal "${laporan.judul}" telah disetujui oleh admin. Tanda terima diterbitkan.` : `Laporan Internal "${laporan.judul}" ditolak. Alasan: ${catatan || '-'}`;
        await logActivity(user.id, id, status === 'Approved' ? 'APPROVE' : 'REJECT', desc);

    } else if (source_table === 'eksternal') {
        const [rows] = await db.execute(`SELECT * FROM laporan_eksternal WHERE id = ?`, [id]);
        if (rows.length === 0) throw new Error('Laporan Eksternal tidak ditemukan');
        
        laporan = rows[0];

        if (status === 'Approved') {
            const nomorSertifikat = `${new Date().getFullYear()}${String(id).padStart(5, '0')}`;
            const sertifikatData = {
                nama_penerima: laporan.nama_pengirim,
                nama_instansi: laporan.instansi_pengirim || laporan.nama_pengirim,
                judul_laporan: laporan.judul_laporan,
                jenis_laporan: laporan.jenis_pengirim === 'mitra' ? 'Laporan Mitra' : 'Laporan Eksternal',
                nama_admin: user.nama,
                nomor_sertifikat: nomorSertifikat,
                tanggal_terbit: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            };
            fileOutput = await generateESertifikatPDF(sertifikatData);
            await db.execute('UPDATE laporan_eksternal SET status = ?, catatan = ?, file_output = ? WHERE id = ?', [status, catatan || '', fileOutput, id]);
        } else {
            await db.execute('UPDATE laporan_eksternal SET status = ?, catatan = ? WHERE id = ?', [status, catatan || '', id]);
        }

        const desc = status === 'Approved' ? `Laporan Eksternal/Mitra "${laporan.judul_laporan}" telah disetujui. E-Sertifikat diterbitkan.` : `Laporan Eksternal/Mitra "${laporan.judul_laporan}" ditolak. Alasan: ${catatan || '-'}`;
        try {
            await db.execute('INSERT INTO activity_log (user_id, action, description) VALUES (?, ?, ?)', [user.id, status === 'Approved' ? 'APPROVE' : 'REJECT', desc]);
        } catch (ignore) {}

    } else {
        throw new Error('Source table tidak valid');
    }

    return { message: `Laporan ${source_table} berhasil diubah status menjadi ${status}`, file_output: fileOutput };
};

const getPendingReportsLogic = async (user) => {
    let whereInternal = "WHERE l.status = 'Pending'";
    let whereEksternal = "WHERE e.status = 'Pending'";
    let queryParams = [];

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        whereInternal += " AND l.wilayah_id = ?";
        whereEksternal += " AND e.wilayah_id = ?";
        queryParams.push(user.wilayah_id, user.wilayah_id);
    }

    const query = `
        SELECT 
            l.id, l.judul, CASE WHEN l.jenis_laporan = 'A' THEN 'Laporan A' ELSE 'Laporan B' END as jenis, 
            l.created_at as tanggal, l.status, l.penilaian, CASE WHEN l.resor_id IS NULL AND l.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(r.nama_resor, w.nama_wilayah) END as wilayah,
            u.nama as pelapor, 'Internal' as tipe_laporan, 'internal' as source_table
        FROM laporan_internal l
        LEFT JOIN wilayah w ON l.wilayah_id = w.id
        LEFT JOIN resor r ON l.resor_id = r.id
        LEFT JOIN pengguna u ON l.created_by = u.id
        ${whereInternal}
        UNION ALL
        SELECT 
            e.id, e.judul_laporan as judul, k.nama_kategori as jenis, 
            e.created_at as tanggal, e.status, NULL as penilaian, CASE WHEN e.resor_id IS NULL AND e.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(re.nama_resor, we.nama_wilayah) END as wilayah,
            e.nama_pengirim as pelapor, CASE WHEN e.jenis_pengirim = 'mitra' THEN 'Mitra' ELSE 'Eksternal' END as tipe_laporan, 'eksternal' as source_table
        FROM laporan_eksternal e
        LEFT JOIN wilayah we ON e.wilayah_id = we.id
        LEFT JOIN resor re ON e.resor_id = re.id
        LEFT JOIN kategori k ON e.kategori_id = k.id
        ${whereEksternal}
        ORDER BY tanggal DESC
    `;

    const [reports] = await db.execute(query, queryParams);
    return reports;
};

const getApprovedReportsLogic = async (user) => {
    let whereInternal = "WHERE l.status = 'Approved'";
    let whereEksternal = "WHERE e.status = 'Approved'";
    let queryParams = [];

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        whereInternal += " AND l.wilayah_id = ? AND l.resor_id IS NOT NULL";
        whereEksternal += " AND 1=0";
        queryParams.push(user.wilayah_id);
    }

    const query = `
        SELECT 
            l.id, l.judul, CASE WHEN l.jenis_laporan = 'A' THEN 'Laporan A' ELSE 'Laporan B' END as jenis, 
            l.created_at as tanggal, l.status, l.file_laporan, l.file_output, l.penilaian,
            l.resor_id as report_resor_id,
            COALESCE(r.nama_resor, 'Balai TNGM') as wilayah,
            u.nama as pelapor, u.resor_id as current_resor_id,
            'Internal' as tipe_laporan, 'internal' as source_table
        FROM laporan_internal l
        LEFT JOIN wilayah w ON l.wilayah_id = w.id
        LEFT JOIN resor r ON l.resor_id = r.id
        LEFT JOIN pengguna u ON l.created_by = u.id
        ${whereInternal}
        UNION ALL
        SELECT 
            e.id, e.judul_laporan as judul, k.nama_kategori as jenis, 
            e.created_at as tanggal, e.status, e.file_dokumen as file_laporan, e.file_output as file_output, NULL as penilaian,
            e.resor_id as report_resor_id,
            CASE WHEN e.resor_id IS NULL AND e.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(re.nama_resor, we.nama_wilayah) END as wilayah,
            e.nama_pengirim as pelapor, NULL as current_resor_id,
            CASE WHEN e.jenis_pengirim = 'mitra' THEN 'Mitra' ELSE 'Eksternal' END as tipe_laporan, 'eksternal' as source_table
        FROM laporan_eksternal e
        LEFT JOIN wilayah we ON e.wilayah_id = we.id
        LEFT JOIN resor re ON e.resor_id = re.id
        LEFT JOIN kategori k ON e.kategori_id = k.id
        ${whereEksternal}
        ORDER BY tanggal DESC
    `;

    const [rows] = await db.execute(query, queryParams);
    const reports = rows.map(row => ({
        ...row,
        is_mutasi: row.report_resor_id && row.current_resor_id ? row.report_resor_id !== row.current_resor_id : false
    }));

    return reports;
};

module.exports = { verifyLaporanLogic, getPendingReportsLogic, getApprovedReportsLogic };
