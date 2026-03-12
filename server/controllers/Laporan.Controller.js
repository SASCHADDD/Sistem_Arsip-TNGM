const db = require('../config/database');

/**
 * ==========================================
 * CONTROLLER: MANAJEMEN DATA LAPORAN (Laporan.Controller.js)
 * ==========================================
 * File pengontrol paling penting. Berurusan dengan penerimaan laporan baru (submit), 
 * pembukaan detail laporan, penghapusan, modifikasi, hingga sistem verifikasi admin 
 * (menyetujui / menolak laporan).
 */

/**
 * [USER] Fungsi untuk menyerahkan laporan internal baru
 * Dipakai oleh para staf ketika mengisi form pelaporan kegiatan sehari-hari.
 */
const submitLaporan = async (req, res) => {
    try {
        const { judul_laporan, kategori_id, tanggal_berakhir, keterangan } = req.body;
        const user = req.user; // Dari verifyToken middleware

        // Validasi input dasar
        if (!judul_laporan || !kategori_id || !tanggal_berakhir) {
            return res.status(400).json({ message: 'Mohon lengkapi semua data wajib' });
        }

        // Cek apakah user memiliki data wilayah dan resor (Staff/Admin Wilayah)
        if (!user.wilayah_id || !user.resor_id) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses wilayah/resor yang valid untuk membuat laporan ini.' });
        }

        // Cek file
        if (!req.files || !req.files['file_dokumen'] || !req.files['file_lampiran']) {
            return res.status(400).json({ message: 'File dokumen dan foto hardfile wajib diupload' });
        }

        const fileDokumen = req.files['file_dokumen'][0].filename;
        const fileLampiran = req.files['file_lampiran'][0].filename;

        // Query Insert ke laporan_internal
        const query = `
            INSERT INTO laporan_internal 
            (judul, jenis_laporan, tanggal_berakhir, file_laporan, foto_hardfile, 
            keterangan, wilayah_id, resor_id, created_by, created_at)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            judul_laporan,
            kategori_id, // Menggunakan ID kategori sebagai jenis_laporan (A/B)
            tanggal_berakhir,
            fileDokumen,
            fileLampiran,
            keterangan || null,
            user.wilayah_id, // Ambil dari token user
            user.resor_id,   // Ambil dari token user
            user.id
        ];

        const [result] = await db.execute(query, values);

        await logActivity(
            user.id,
            result.insertId,
            'SUBMIT',
            `Anda mengirimkan laporan baru: "${judul_laporan}"`
        );

        res.status(201).json({ message: 'Laporan internal berhasil disubmit' });

    } catch (error) {
        console.error('Submit Laporan Error:', error);
        res.status(500).json({ message: error.message || 'Terjadi kesalahan saat menyimpan laporan' });
    }
};

/**
 * [USER & ADMIN] Fungsi untuk membaca detail lengkap satu laporan spesifik
 * Menggabungkan tabel laporan dengan tabel master wilayah dan pengguna untuk menyajikan biodata pelapor.
 */
const getdetaillaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const query = `
            SELECT 
                l.id, l.judul, l.jenis_laporan, l.tanggal_berakhir, l.created_at, l.keterangan,
                l.file_laporan, l.foto_hardfile, l.file_output, l.status, l.penilaian, l.catatan,
                l.resor_id as report_resor_id,
                w.nama_wilayah, r.nama_resor,
                u.nama as nama_pelapor, u.resor_id as current_resor_id
            FROM laporan_internal l
            LEFT JOIN wilayah w ON l.wilayah_id = w.id
            LEFT JOIN resor r ON l.resor_id = r.id
            LEFT JOIN pengguna u ON l.created_by = u.id
            WHERE l.id = ? 
            AND (l.created_by = ? OR ? LIKE '%admin%')
        `;

        const [rows] = await db.execute(query, [id, user.id, user.role]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan atau Anda tidak memiliki akses' });
        }

        const row = rows[0];

        // Format response
        const reportDetail = {
            id: row.id,
            judul: row.judul,
            jenis: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
            jenis_value: row.jenis_laporan,
            tanggal_berakhir: row.tanggal_berakhir,
            tanggal_buat: row.created_at,
            wilayah: row.nama_wilayah,
            resor: row.nama_resor,
            is_mutasi: row.report_resor_id && row.current_resor_id ? row.report_resor_id !== row.current_resor_id : false,
            keterangan: row.keterangan,
            status: row.status,
            penilaian: row.penilaian,
            file_dokumen: row.file_laporan,
            foto_lampiran: row.foto_hardfile,
            file_output: row.file_output,
            pelapor: row.nama_pelapor,
            adminMessage: row.catatan || null
        };

        res.json(reportDetail);
    } catch (error) {
        console.error('Get Detail Laporan Error:', error);
        res.status(500).json({ message: 'Gagal mengambil detail laporan' });
    }
};

/**
 * [UMUM] Fungsi untuk memuat pilihan isian formulir
 * Digunakan frontend untuk menampilkan daftar pop-up dropdown kategori, wilayah, dan resor.
 */
const getFormOptions = async (req, res) => {
    try {
        // Karena di tabel laporan_internal jenis_laporan adalah ENUM('A', 'B'),
        // kita kirim opsi statis untuk kategori (jika tabel kategori tidak lagi dipakai).
        const kategori = [
            { id: 'A', nama_kategori: 'Laporan A' },
            { id: 'B', nama_kategori: 'Laporan B' }
        ];

        // Fetch wilayah dinamis dari database
        const [wilayahRows] = await db.query('SELECT id, nama_wilayah as nama FROM wilayah ORDER BY nama_wilayah ASC');

        // Fetch resor dinamis dari database
        const [resorRows] = await db.query('SELECT id, nama_resor as nama, wilayah_id FROM resor ORDER BY nama_resor ASC');

        res.json({
            kategori,
            wilayah: wilayahRows,
            resor: resorRows
        });
    } catch (error) {
        console.error('Get Form Options Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data form' });
    }
};

/**
 * [USER] Fungsi untuk melihat rekam jejak (riwayat) seluruh laporan milik staf itu sendiri
 * Database akan difilter berdasarkan atribut `created_by` (ID Pelapornya).
 */
const getRiwayatLaporan = async (req, res) => {
    try {
        const user = req.user;

        const query = `
            SELECT 
                l.id, l.judul, l.jenis_laporan, l.tanggal_berakhir, l.created_at, l.status, l.penilaian,
                w.nama_wilayah, r.nama_resor
            FROM laporan_internal l
            LEFT JOIN wilayah w ON l.wilayah_id = w.id
            LEFT JOIN resor r ON l.resor_id = r.id
            WHERE l.created_by = ?
            ORDER BY l.created_at DESC
        `;

        const [rows] = await db.execute(query, [user.id]);

        // Format data untuk frontend
        const reports = rows.map(row => ({
            id: row.id,
            title: row.judul,
            date: new Date(row.created_at).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            }),
            status: row.status,
            penilaian: row.penilaian,
            wilayah: row.nama_resor || row.nama_wilayah, // Prioritaskan Resor
            type: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B'
        }));

        res.json(reports);
    } catch (error) {
        console.error('Get Riwayat Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat laporan', error: error.message });
    }
};

const fs = require('fs');
const path = require('path');

/**
 * [USER] Fungsi untuk MENGHAPUS / MEMBATALKAN Laporan Internal
 * Catatan Keamanan: Hanya laporan yang masih berstatus 'Pending' (belum disentuh admin) yang boleh ditarik/dihapus pelapor.
 */
const deleteLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Cek kepemilikan dan status
        const [rows] = await db.execute(
            'SELECT * FROM laporan_internal WHERE id = ? AND created_by = ?',
            [id, user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        const laporan = rows[0];

        // Validasi status: Hanya laporan 'Pending' yang boleh dihapus
        if (laporan.status !== 'Pending') {
            return res.status(403).json({ message: 'Laporan yang sudah diproses tidak dapat dihapus' });
        }

        // Hapus file fisik
        if (laporan.file_laporan) {
            const filePath = path.join(__dirname, '../../uploads/laporan', laporan.file_laporan);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (laporan.foto_hardfile) {
            const filePath = path.join(__dirname, '../../uploads/laporan', laporan.foto_hardfile);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Hapus record DB
        await db.execute('DELETE FROM laporan_internal WHERE id = ?', [id]);

        res.json({ message: 'Laporan berhasil dihapus' });
    } catch (error) {
        console.error('Delete Laporan Error:', error);
        res.status(500).json({ message: 'Gagal menghapus laporan' });
    }
};

/**
 * [USER] Fungsi untuk MEREVISI (Update) / MEMPERBAIKI data laporan yang dikirim
 * Berfungsi misalnya ketika laporan ditolak (Rejected) dan disuruh perbaiki oleh admin, 
 * maka tombol "Edit Laporan" oleh user akan memanggil proses sistem fungsi ini.
 */
const updateLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { judul_laporan, kategori_id, tanggal_berakhir, keterangan } = req.body;

        // Cek existing
        const [rows] = await db.execute(
            'SELECT * FROM laporan_internal WHERE id = ? AND created_by = ?',
            [id, user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Laporan tidak ditemukan' });
        }

        const oldLaporan = rows[0];

        // Validasi status: Laporan 'Pending' atau 'Rejected' boleh diedit
        if (!['Pending', 'Rejected'].includes(oldLaporan.status)) {
            return res.status(403).json({ message: 'Laporan yang sudah disetujui tidak dapat diedit' });
        }

        // Setup update query
        // Reset status to 'Pending' automatically upon update
        let query = `
            UPDATE laporan_internal 
            SET judul = ?, jenis_laporan = ?, tanggal_berakhir = ?, keterangan = ?, wilayah_id = ?, resor_id = ?, status = 'Pending', created_at = NOW()
        `;
        let values = [
            judul_laporan,
            kategori_id,
            tanggal_berakhir,
            keterangan,
            user.wilayah_id,
            user.resor_id
        ];

        // Handle File Uploads (Optional Update)
        if (req.files) {
            if (req.files['file_dokumen']) {
                // Hapus lama
                const oldPath = path.join(__dirname, '../../uploads/laporan', oldLaporan.file_laporan);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

                // Tambah baru
                query += `, file_laporan = ?`;
                values.push(req.files['file_dokumen'][0].filename);
            }
            if (req.files['file_lampiran']) {
                // Hapus lama
                const oldPath = path.join(__dirname, '../../uploads/laporan', oldLaporan.foto_hardfile);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

                // Tambah baru
                query += `, foto_hardfile = ?`;
                values.push(req.files['file_lampiran'][0].filename);
            }
        }

        query += ` WHERE id = ?`;
        values.push(id);

        await db.execute(query, values);

        await logActivity(
            user.id,
            id,
            'UPDATE',
            `Anda memperbarui laporan: "${judul_laporan}"`
        );

        res.json({ message: 'Laporan berhasil diperbarui' });

    } catch (error) {
        console.error('Update Laporan Error:', error);
        res.status(500).json({ message: 'Gagal memperbarui laporan' });
    }
};

/**
 * [USER] Fungsi untuk menyajikan statistik panel beranda (Dasbor) staf
 * Merangkum berapa jumlah laporan masuk, ditolak, disetujui, dan nilai rata-rata prestasi.
 */
const getUserDashboardStats = async (req, res) => {
    try {
        const user = req.user;

        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
                AVG(CASE 
                    WHEN status = 'Approved' AND penilaian = 'Baik' THEN 3
                    WHEN status = 'Approved' AND penilaian = 'Cukup' THEN 2
                    WHEN status = 'Approved' AND penilaian = 'Kurang' THEN 1
                    ELSE NULL 
                END) as rata_rata_nilai
            FROM laporan_internal 
            WHERE created_by = ?
        `;

        const [rows] = await db.execute(query, [user.id]);
        const stats = rows[0];

        res.json({
            total: parseInt(stats.total) || 0,
            pending: parseInt(stats.pending) || 0,
            approved: parseInt(stats.approved) || 0,
            rejected: parseInt(stats.rejected) || 0,
            rata_rata_nilai: stats.rata_rata_nilai ? parseFloat(Number(stats.rata_rata_nilai).toFixed(1)) : 0
        });

    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data statistik dashboard' });
    }
};

/**
 * [SISTEM] Fungsi bantuan (Helper) untuk MENULIS BUKU HARIAN KEGIATAN SISTEM (Log)
 * Apa saja yang terjadi layaknya "Staf A mengirim", "Admin B menyetujui" selalu dicatat 
 * riwayatnya menggunakan fungsi ini ke tabel `activity_log`.
 */
const logActivity = async (userId, laporanId, action, description) => {
    try {
        await db.execute(
            `INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [userId, laporanId, action, description]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};


// Import pdfService at the top level
const { generateTandaTerimaPDF } = require('../services/pdfService');
const { hitungPenilaian } = require('../utils/penilaian');

// verifiasi laporan
// verifiasi laporan
/**
 * [ADMIN] Fungsi Inti untuk MEMVERIFIKASI (Menyetujui / Menolak) Laporan
 * Dipanggil ketika admin menekan tombol centang (Approve) atau silang (Reject).
 * Jika disetujui, fungsi ini otomatis menghitung Nilai Kelulusan dan menerbitkan PDF Tanda Terima.
 */
const verifyLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, catatan, source_table = 'internal' } = req.body; // status: 'Approved' | 'Rejected'
        const user = req.user; // Admin

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }

        let laporan = null;

        if (source_table === 'internal') {
            // Cek laporan internal
            const [rows] = await db.execute(`
                SELECT l.*, u.nama as nama_pelapor 
                FROM laporan_internal l
                JOIN pengguna u ON l.created_by = u.id
                WHERE l.id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Laporan Internal tidak ditemukan' });
            }
            laporan = rows[0];

            let filenameObj = null;
            if (status === 'Approved') {
                try {
                    // Hitung penilaian dari controller terpisah
                    let penilaianValue = hitungPenilaian(laporan);

                    // menggenerate PDF tanda terima
                    const pdfData = {
                        nama_pengirim: laporan.nama_pelapor,
                        tanggal_terima: new Date().toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        }),
                        judul_laporan: laporan.judul,
                        jenis_laporan: laporan.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
                        penerima: user.nama
                    };

                    const filename = await generateTandaTerimaPDF(pdfData);
                    filenameObj = filename;

                    // Update dengan file_output dan penilaian
                    await db.execute(
                        'UPDATE laporan_internal SET status = ?, file_output = ?, penilaian = ? WHERE id = ?',
                        [status, filename, penilaianValue, id]
                    );
                } catch (pdfError) {
                    console.error('PDF Generation Failed:', pdfError);
                    return res.status(500).json({
                        message: 'Gagal membuat tanda terima PDF. Status tidak berubah.',
                        errorDetail: pdfError.message || pdfError.toString()
                    });
                }
            } else {
                // Jika Rejected
                await db.execute(
                    'UPDATE laporan_internal SET status = ?, catatan = ? WHERE id = ?',
                    [status, catatan || '', id]
                );
            }

            // Log Activity (Actor: Admin)
            const desc = status === 'Approved'
                ? `Laporan Internal "${laporan.judul}" telah disetujui oleh admin. Tanda terima diterbitkan.`
                : `Laporan Internal "${laporan.judul}" ditolak. Alasan: ${catatan || '-'}`;

            const action = status === 'Approved' ? 'APPROVE' : 'REJECT';
            await logActivity(user.id, id, action, desc);

            res.json({
                message: `Laporan internal berhasil diubah status menjadi ${status}`,
                file_output: filenameObj
            });

        } else if (source_table === 'eksternal') {
            // Cek laporan eksternal
            const [rows] = await db.execute(`
                SELECT * FROM laporan_eksternal WHERE id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Laporan Eksternal tidak ditemukan' });
            }
            laporan = rows[0];

            // Update status (TIDAK generate PDF untuk laporan eksternal dari admin)
            await db.execute(
                'UPDATE laporan_eksternal SET status = ?, catatan = ? WHERE id = ?',
                [status, catatan || '', id]
            );

            // Log Activity (Actor: Admin)
            const desc = status === 'Approved'
                ? `Laporan Eksternal/Mitra "${laporan.judul_laporan}" telah disetujui oleh admin.`
                : `Laporan Eksternal/Mitra "${laporan.judul_laporan}" ditolak. Alasan: ${catatan || '-'}`;

            const action = status === 'Approved' ? 'APPROVE' : 'REJECT';
            // Note: logging ini menggunakan laporan_id. 
            // Namun struktur activity_log tampaknya ditujukan utk laporan_internal.
            // Solusi sementara: log tanpa laporan_id untuk laporan eksternal (dianggap umum/null) atau menambahkan kolom.
            // Kita log tanpa laporan_id agar tak terjadi foreign key error.
            try {
                await db.execute(
                    'INSERT INTO activity_log (user_id, action, description) VALUES (?, ?, ?)',
                    [user.id, action, desc]
                );
            } catch (logErr) {
                console.error('Failed to log eksternal verification activity:', logErr);
            }

            res.json({
                message: `Laporan eksternal berhasil diubah status menjadi ${status}`
            });

        } else {
            return res.status(400).json({ message: 'Source table tidak valid' });
        }

    } catch (error) {
        console.error('Verify Laporan Error:', error);
        res.status(500).json({ message: 'Gagal memverifikasi laporan' });
    }
};

// menmapilkan aktivitas dari user (dashboard user)
/**
 * [USER] Fungsi untuk menampilkan Aktivitas Log (Riwayat Pemberitahuan) di Dasbor Staf
 * Menampilkan pesan seperti "Laporan X disetujui admin" atau "Anda dimutasi".
 */
const getUserActivityLog = async (req, res) => {
    try {
        const user = req.user;

        const query = `
            SELECT 
                a.id, a.action, a.description, a.created_at,
                u.nama as actor_name, u.role as actor_role
            FROM activity_log a
            LEFT JOIN laporan_internal l ON a.laporan_id = l.id
            JOIN pengguna u ON a.user_id = u.id
            WHERE l.created_by = ? OR (a.laporan_id IS NULL AND a.user_id = ?)
            ORDER BY a.created_at DESC
            LIMIT 10
        `;

        const [rows] = await db.execute(query, [user.id, user.id]);

        const activities = rows.map(row => ({
            id: row.id,
            action: row.action,
            description: row.description,
            date: row.created_at,
            actor: row.actor_name,
            is_admin: row.actor_role.includes('admin')
        }));

        res.json(activities);

    } catch (error) {
        console.error('Get Activity Error:', error);
        res.status(500).json({ message: 'Gagal mengambil aktivitas terbaru' });
    }
};

/**
 * [ADMIN] Fungsi untuk Menampilkan Semua Daftar Laporan yang berstatus "Pending" (Menunggu Verifikasi)
 * Ini disajikan pada halaman notifikasi "Lonceng" masuk admin.
 */
const getAllPendingReports = async (req, res) => {
    try {
        const user = req.user;
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
                l.id, l.judul, 
                CASE WHEN l.jenis_laporan = 'A' THEN 'Laporan A' ELSE 'Laporan B' END as jenis, 
                l.created_at as tanggal, l.status, l.penilaian,
                CASE WHEN l.resor_id IS NULL AND l.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(r.nama_resor, w.nama_wilayah) END as wilayah,
                u.nama as pelapor,
                'Internal' as tipe_laporan,
                'internal' as source_table
            FROM laporan_internal l
            LEFT JOIN wilayah w ON l.wilayah_id = w.id
            LEFT JOIN resor r ON l.resor_id = r.id
            LEFT JOIN pengguna u ON l.created_by = u.id
            ${whereInternal}

            UNION ALL

            SELECT 
                e.id, e.judul_laporan as judul, 
                k.nama_kategori as jenis, 
                e.created_at as tanggal, e.status, NULL as penilaian,
                CASE WHEN e.resor_id IS NULL AND e.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(re.nama_resor, we.nama_wilayah) END as wilayah,
                e.nama_pengirim as pelapor,
                CASE WHEN e.jenis_pengirim = 'mitra' THEN 'Mitra' ELSE 'Eksternal' END as tipe_laporan,
                'eksternal' as source_table
            FROM laporan_eksternal e
            LEFT JOIN wilayah we ON e.wilayah_id = we.id
            LEFT JOIN resor re ON e.resor_id = re.id
            LEFT JOIN kategori k ON e.kategori_id = k.id
            ${whereEksternal}

            ORDER BY tanggal DESC
        `;

        const [reports] = await db.execute(query, queryParams);
        res.json(reports);
    } catch (error) {
        console.error('Get Pending Reports Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data laporan pending' });
    }
};

// Statistik dengan masing masing status laporan masuk didashboard admin
/**
 * [ADMIN] Fungsi Statistik Utama Dasbor Administrator
 * Merangkum semua pergerakan pelaporan: berapa yang pending, ditolak, dan disetujui per bulannya.
 * Juga menyajikan tabel perbandingan rangking nilai antar resor.
 */
const getAdminDashboardStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        let whereClause = '';
        let resorWhereClause = '';
        let queryParams = [];

        if (month && year) {
            whereClause = "WHERE status IN ('Pending', 'Approved', 'Rejected') AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
            resorWhereClause = "AND MONTH(l.created_at) = ? AND YEAR(l.created_at) = ?";
            queryParams.push(month, year);
        } else if (year) {
            whereClause = "WHERE status IN ('Pending', 'Approved', 'Rejected') AND YEAR(created_at) = ?";
            resorWhereClause = "AND YEAR(l.created_at) = ?";
            queryParams.push(year);
        } else if (month) {
            whereClause = "WHERE status IN ('Pending', 'Approved', 'Rejected') AND MONTH(created_at) = ?";
            resorWhereClause = "AND MONTH(l.created_at) = ?";
            queryParams.push(month);
        } else {
            whereClause = "WHERE status IN ('Pending', 'Approved', 'Rejected')";
            resorWhereClause = "";
        }

        const user = req.user;
        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            whereClause += " AND wilayah_id = ?";
            resorWhereClause += " AND l.wilayah_id = ?";
            queryParams.push(user.wilayah_id);

            // Because resor stats require parameters twice if there's month/year
            // But db.execute doesn't easily duplicate params cleanly without mapping.
            // A safer approach for resorStatsQuery is to pass parameters again.
        }

        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM laporan_internal 
            ${whereClause}
        `;

        const [rows] = await db.execute(query, queryParams);
        const stats = rows[0];

        // Duplicate params for second query
        let resorQueryParams = [];
        if (month && year) resorQueryParams.push(month, year);
        else if (year) resorQueryParams.push(year);
        else if (month) resorQueryParams.push(month);

        let resorFilterQuery = "";
        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            resorQueryParams.push(user.wilayah_id); // Untuk l.wilayah_id di ON clause
            resorFilterQuery = "WHERE r.wilayah_id = ?";
            resorQueryParams.push(user.wilayah_id); // Untuk r.wilayah_id di WHERE clause
        }

        const resorStatsQuery = `
            SELECT 
                r.nama_resor as name, 
                AVG(CASE 
                    WHEN l.penilaian = 'Baik' THEN 3
                    WHEN l.penilaian = 'Cukup' THEN 2
                    WHEN l.penilaian = 'Kurang' THEN 1
                    ELSE NULL 
                END) as average_score
            FROM resor r
            LEFT JOIN laporan_internal l ON r.id = l.resor_id ${resorWhereClause} AND l.status = 'Approved'
            ${resorFilterQuery}
            GROUP BY r.id, r.nama_resor
            ORDER BY average_score DESC, r.nama_resor ASC
        `;
        const [resorRows] = await db.execute(resorStatsQuery, resorQueryParams);

        // Berikan warna berbeda-beda tiap resor agar mudah dibedakan di chart
        const predefinedColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#84cc16'];
        const resorStats = resorRows.map((row, index) => ({
            name: row.name,
            value: row.average_score ? parseFloat(Number(row.average_score).toFixed(1)) : 0,
            color: predefinedColors[index % predefinedColors.length]
        }));

        res.json({
            total: parseInt(stats.total) || 0,
            pending: parseInt(stats.pending) || 0,
            approved: parseInt(stats.approved) || 0,
            rejected: parseInt(stats.rejected) || 0,
            resor_stats: resorStats
        });

    } catch (error) {
        console.error('Get Admin Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data statistik dashboard admin' });
    }
};

//Menampilkan aktivitas admin (dashboard admin)
/**
 * [ADMIN] Fungsi untuk merekam jejak langkah Admin
 * Menampilkan histori "Siapa menyetujui/menolak apa" di Dasbor Administrasinya.
 */
const getAdminActivityLog = async (req, res) => {
    try {
        const user = req.user;
        let whereClause = "";
        let queryParams = [];

        // Jika admin_wilayah atau kepala_wilayah, filter log hanya untuk wilayahnya 
        // ATAU aktivitas yang dilakukan oleh dirinya sendiri (user_id = user.id)
        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            whereClause = "WHERE (l.wilayah_id = ? OR p.wilayah_id = ? OR a.user_id = ?)";
            queryParams.push(user.wilayah_id, user.wilayah_id, user.id);
        }

        const query = `
            SELECT 
                a.id, a.action, a.description, a.created_at,
                u.nama as actor_name, u.role as actor_role,
                l.judul as report_title,
                p.nama as pelapor_name
            FROM activity_log a
            JOIN pengguna u ON a.user_id = u.id
            LEFT JOIN laporan_internal l ON a.laporan_id = l.id
            LEFT JOIN pengguna p ON l.created_by = p.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT 50
        `;

        const [rows] = await db.execute(query, queryParams.length > 0 ? queryParams : undefined);

        const activities = rows.map(row => ({
            id: row.id,
            action: row.action,
            description: row.description,
            date: row.created_at,
            actor: row.actor_name,
            role: row.actor_role,
            report_title: row.report_title || '-',
            pelapor: row.pelapor_name || '-'
        }));

        res.json(activities);

    } catch (error) {
        console.error('Get Admin Activity Error:', error);
        res.status(500).json({ message: 'Gagal mengambil aktivitas admin' });
    }
};

// menampilkasn semua laporan (Admin - Verifikasi Laporan)
/**
 * [ADMIN] Fungsi Tabel Riwayat (Daftar Laporan Terverifikasi & Ditolak)
 * Khusus untuk Admin dalam mengelola lembar "Verifikasi Laporan", 
 * memunculkan semua sejarah laporan tanpa pandang status.
 */
const getAllReports = async (req, res) => {
    try {
        const query = `
            SELECT 
                l.id, l.judul, l.jenis_laporan, l.created_at, l.status, l.file_laporan, l.file_output, l.penilaian,
                l.resor_id as report_resor_id,
                w.nama_wilayah, r.nama_resor,
                u.nama as nama_pelapor, u.resor_id as current_resor_id
            FROM laporan_internal l
            LEFT JOIN wilayah w ON l.wilayah_id = w.id
            LEFT JOIN resor r ON l.resor_id = r.id
            LEFT JOIN pengguna u ON l.created_by = u.id
            ORDER BY l.created_at DESC
        `;

        const [rows] = await db.execute(query);

        const reports = rows.map(row => ({
            id: row.id,
            judul: row.judul,
            jenis: row.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
            tanggal: row.created_at,
            wilayah: row.nama_wilayah,
            resor: row.nama_resor,
            is_mutasi: row.report_resor_id && row.current_resor_id ? row.report_resor_id !== row.current_resor_id : false,
            status: row.status,
            penilaian: row.penilaian,
            pelapor: row.nama_pelapor,
            file_laporan: row.file_laporan,
            file_output: row.file_output
        }));

        res.json(reports);
    } catch (error) {
        console.error('Get All Reports Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data laporan' });
    }
};

// Fungsi ini bertugas untuk mengambil semua laporan (baik internal maupun eksternal) 
// yang statusnya sudah 'Approved' (disetujui) untuk ditampilkan di halaman "Data Laporan"
const getAllApprovedReports = async (req, res) => {
    try {
        // Ambil data user yang sedang login dari token (req.user)
        const user = req.user;

        // Default: Kita hanya mau ngambil laporan yang statusnya 'Approved' saja
        let whereInternal = "WHERE l.status = 'Approved'";
        let whereEksternal = "WHERE e.status = 'Approved'";
        let queryParams = []; // Array kosong untuk menampung variabel parameter database (mencegah SQL Injection)

        // Ini logika khusus BILA YANG LOGIN ADALAH ADMIN WILAYAH ATAU KEPALA WILAYAH
        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            // 1. TAMBAHAN UNTUK LAPORAN INTERNAL:
            // Admin Wilayah hanya bisa melihat laporan Internal dari wilayahnya sendiri (l.wilayah_id = user.wilayah_id)
            // LALU kodenya juga mengecualikan (membuang) laporan yang resor_id-nya Kosong (IS NOT NULL).
            // Kenapa? Karena Laporan dari "Balai TNGM" (pusat) resor_id-nya biasanya kosong/null, jadi ini memastikan
            // Admin Wilayah tidak bisa melihat data pusat (Balai TNGM) karena dia hanya menaungi resor-resor.
            whereInternal += " AND l.wilayah_id = ? AND l.resor_id IS NOT NULL"; 
            
            // 2. TAMBAHAN UNTUK LAPORAN EKSTERNAL / MITRA:
            // Admin Wilayah seharusnya sama sekali tidak boleh melihat laporan Eksternal / Mitra.
            // Ditambahkan kondisi "AND 1=0" artinya membuat statement ini menjadi false permanen 
            // sehingga query untuk laporan Eksternal akan selalu mereturn 0 data (kosong).
            whereEksternal += " AND 1=0"; 
            
            // Masukkan ID wilayah admin ke dalam parameter untuk menggantikan tanda tanya (?) di `whereInternal`
            queryParams.push(user.wilayah_id);
        }

        // Ini adalah syntax dasar MySQL Query. Kita menggunakan `UNION ALL`
        // UNION ALL berfungsi untuk MENGGABUNGKAN hasil pencarian dari tabel laporan_internal DENGAN laporan_eksternal 
        // sehingga frontend hanya perlu menerima satu array panjang yang sudah kecampur.
        const query = `
            -- ==========================================
            -- BAGIAN 1: Mengambil Data dari Laporan INTERNAL
            -- ==========================================
            SELECT 
                l.id, l.judul, 
                CASE WHEN l.jenis_laporan = 'A' THEN 'Laporan A' ELSE 'Laporan B' END as jenis, 
                l.created_at as tanggal, l.status, l.file_laporan, l.file_output, l.penilaian,
                l.resor_id as report_resor_id,
                COALESCE(r.nama_resor, 'Balai TNGM') as wilayah,
                u.nama as pelapor, u.resor_id as current_resor_id,
                'Internal' as tipe_laporan,
                'internal' as source_table
            FROM laporan_internal l
            LEFT JOIN wilayah w ON l.wilayah_id = w.id
            LEFT JOIN resor r ON l.resor_id = r.id
            LEFT JOIN pengguna u ON l.created_by = u.id
            ${whereInternal} -- Sisipkan kondisi "WHERE" untuk laporan internal yg udah dibuat di atas

            -- UNION ALL berguna untuk menempelkan hasil di bawah ini persis ke bawah hasil di atas
            UNION ALL

            -- ==========================================
            -- BAGIAN 2: Mengambil Data dari Laporan EKSTERNAL
            -- ==========================================
            SELECT 
                e.id, e.judul_laporan as judul, 
                k.nama_kategori as jenis, 
                e.created_at as tanggal, e.status, e.file_dokumen as file_laporan, e.file_lampiran as file_output, NULL as penilaian,
                e.resor_id as report_resor_id,
                CASE WHEN e.resor_id IS NULL AND e.wilayah_id = 1 THEN 'Balai TNGM' ELSE COALESCE(re.nama_resor, we.nama_wilayah) END as wilayah,
                e.nama_pengirim as pelapor, NULL as current_resor_id,
                CASE WHEN e.jenis_pengirim = 'mitra' THEN 'Mitra' ELSE 'Eksternal' END as tipe_laporan,
                'eksternal' as source_table
            FROM laporan_eksternal e
            LEFT JOIN wilayah we ON e.wilayah_id = we.id
            LEFT JOIN resor re ON e.resor_id = re.id
            LEFT JOIN kategori k ON e.kategori_id = k.id
            ${whereEksternal} -- Sisipkan kondisi "WHERE" untuk laporan eksternal yg udah dibuat di atas (sehingga kalau admin wilayah = kosong)

            -- Terakhir: Urutkan SAAAMUAAA data nya (baik yg internal maupun yg eksternal) berdasarkan tanggal terbaru
            ORDER BY tanggal DESC
        `;

        // Dieksekusi / dijalankan ke database MySQL
        const [reports] = await db.execute(query, queryParams);
        
        // Hasil json dilempar ke pengguna/frontend
        res.json(reports);
    } catch (error) {
        console.error('Get Approved Reports Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data laporan yang disetujui' });
    }
};

// MENAMBAH LAPORAN EKSTERNAL
/**
 * [PUBLIC/EKSTERNAL] Fungsi Spesial Pengajuan Laporan Eksternal (Tamu / Universitas)
 * Menangani formulir publik yang diisi oleh Mahasiswa / Peneliti / Publik 
 * tanpa harus punya akun login.
 */
const submitLaporanEksternal = async (req, res) => {
    try {
        const { nama, instansi, email, judul, jenis, wilayah, tanggalBerakhir, keterangan } = req.body;

        // Cek file
        const fileDokumen = req.files && req.files['file'] ? req.files['file'][0].filename : null;
        const fileLampiran = req.files && req.files['hardfile'] ? req.files['hardfile'][0].filename : null;

        if (!judul || !fileDokumen || !nama || !instansi || !email) {
            return res.status(400).json({ message: 'Harap isi data wajib dan lampirkan dokumen.' });
        }

        // Cari ID Kategori
        let kategoriId = null;
        const [kategoriRows] = await db.execute('SELECT id FROM kategori WHERE nama_kategori = ? OR id = ? LIMIT 1', [jenis, jenis]);
        if (kategoriRows.length > 0) kategoriId = kategoriRows[0].id;
        // Default ke ID 1 jika tidak ketemu
        if (!kategoriId) kategoriId = 1;

        // Cari ID Wilayah & Resor
        let wilayahId = 1; // Default
        let resorId = null;

        if (wilayah && wilayah !== 'Balai TNGM' && wilayah !== 'Kantor Balai') {
            const [resorRows] = await db.execute('SELECT id, wilayah_id FROM resor WHERE nama_resor LIKE ? OR id = ? LIMIT 1', [`%${wilayah}%`, wilayah]);
            if (resorRows.length > 0) {
                resorId = resorRows[0].id;
                wilayahId = resorRows[0].wilayah_id;
            }
        }

        const query = `
            INSERT INTO laporan_eksternal 
            (jenis_pengirim, nama_pengirim, instansi_pengirim, email_pengirim, judul_laporan, kategori_id, wilayah_id, resor_id, tanggal_berakhir, keterangan, file_dokumen, file_lampiran, status, created_at)
            VALUES ('pengaju simaksi', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const queryParams = [
            nama,
            instansi,
            email,
            judul,
            kategoriId,
            wilayahId,
            resorId,
            tanggalBerakhir || null,
            keterangan || null,
            fileDokumen,
            fileLampiran
        ];

        const [result] = await db.execute(query, queryParams);

        // Catat di Activity Log (System)
        const logQuery = `
             INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) 
             VALUES (1, NULL, 'SUBMIT', ?, NOW())
        `;
        await db.execute(logQuery, [
            `Sistem: Laporan eksternal baru berjudul "${judul}" diajukan oleh ${nama} (${instansi}).`
        ]);

        res.status(201).json({
            message: 'Laporan eksternal berhasil diajukan',
            id: result.insertId
        });

    } catch (error) {
        console.error('Submit Eksternal Error:', error);
        res.status(500).json({ message: 'Gagal mengajukan laporan eksternal, terjadi kesalahan di server.' });
    }
};

// MENAMBAH LAPORAN MITRA
/**
 * [PUBLIC/MITRA] Fungsi Spesial Pengajuan Laporan Mitra Kerjasama
 * Menangani formulir publik khusus untuk perusahaan mitra yang memiliki Nomor PKS resmi.
 */
const submitLaporanMitra = async (req, res) => {
    try {
        const { namaPic, namaMitra, nomorPks, email, judul, jenis, wilayah, tanggalBerakhir, keterangan } = req.body;

        // Cek file
        const fileDokumen = req.files && req.files['file'] ? req.files['file'][0].filename : null;
        const fileLampiran = req.files && req.files['hardfile'] ? req.files['hardfile'][0].filename : null;

        if (!judul || !fileDokumen || !namaPic || !namaMitra || !email) {
            return res.status(400).json({ message: 'Harap isi data wajib dan lampirkan dokumen.' });
        }

        // Cari ID Kategori
        let kategoriId = null;
        const [kategoriRows] = await db.execute('SELECT id FROM kategori WHERE nama_kategori = ? OR id = ? LIMIT 1', [jenis, jenis]);
        if (kategoriRows.length > 0) kategoriId = kategoriRows[0].id;
        if (!kategoriId) kategoriId = 1;

        // Cari ID Wilayah & Resor
        let wilayahId = 1; // Default
        let resorId = null;

        if (wilayah && wilayah !== 'Balai TNGM' && wilayah !== 'Lintas Wilayah' && wilayah !== 'Kantor Balai') {
            const [resorRows] = await db.execute('SELECT id, wilayah_id FROM resor WHERE nama_resor LIKE ? OR id = ? LIMIT 1', [`%${wilayah}%`, wilayah]);
            if (resorRows.length > 0) {
                resorId = resorRows[0].id;
                wilayahId = resorRows[0].wilayah_id;
            } else {
                // Alternatif, coba cari di tabel wilayah
                const [wilRows] = await db.execute('SELECT id FROM wilayah WHERE nama_wilayah LIKE ? LIMIT 1', [`%${wilayah}%`]);
                if (wilRows.length > 0) {
                    wilayahId = wilRows[0].id;
                }
            }
        }

        const query = `
            INSERT INTO laporan_eksternal 
            (jenis_pengirim, nama_pengirim, instansi_pengirim, nomor_pks, email_pengirim, judul_laporan, kategori_id, wilayah_id, resor_id, tanggal_berakhir, keterangan, file_dokumen, file_lampiran, status, created_at)
            VALUES ('mitra', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const queryParams = [
            namaPic,
            namaMitra,
            nomorPks || null,
            email,
            judul,
            kategoriId,
            wilayahId,
            resorId,
            tanggalBerakhir || null,
            keterangan || null,
            fileDokumen,
            fileLampiran
        ];

        const [result] = await db.execute(query, queryParams);

        // Catat di Activity Log (System)
        const logQuery = `
             INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) 
             VALUES (1, NULL, 'SUBMIT', ?, NOW())
        `;
        await db.execute(logQuery, [
            `Sistem: Laporan mitra baru berjudul "${judul}" diajukan oleh ${namaPic} (${namaMitra}).`
        ]);

        res.status(201).json({
            message: 'Laporan mitra berhasil diajukan',
            id: result.insertId
        });

    } catch (error) {
        console.error('Submit Mitra Error:', error);
        res.status(500).json({ message: 'Gagal mengajukan laporan mitra, terjadi kesalahan di server.' });
    }
};

// INPUT ARSIP LAMA (BACKLOG) OLEH ADMIN
/**
 * [ADMIN] Fungsi Impor / Pemasukan Manual Arsip Laporan Fisik Lama (Backlog)
 * Digunakan jika TNGM memiliki berkas lemari zaman dulu (sebelum ada aplikasi) 
 * yang ingin digabungkan ke database digital. Statusnya langsung 'Approved'.
 */
const inputArsipLama = async (req, res) => {
    try {
        const { judul_laporan, kategori_id, keterangan, wilayah_id, resor_id, tanggal_asli } = req.body;
        const user = req.user;

        // Validasi input dasar
        if (!judul_laporan || !kategori_id || !tanggal_asli) {
            return res.status(400).json({ message: 'Mohon lengkapi data judul, jenis laporan, dan tanggal berakhir kegiatan.' });
        }

        // Cek file (opsional)
        const fileDokumen = req.files && req.files['file_dokumen'] ? req.files['file_dokumen'][0].filename : null;
        const fileLampiran = req.files && req.files['file_lampiran'] ? req.files['file_lampiran'][0].filename : null;

        const query = `
            INSERT INTO laporan_internal 
            (judul, jenis_laporan, tanggal_berakhir, file_laporan, foto_hardfile, 
            keterangan, wilayah_id, resor_id, created_by, status, created_at)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)
        `;

        const values = [
            judul_laporan,
            kategori_id,
            tanggal_asli, // tanggal_berakhir diisi dengan tanggal_asli
            fileDokumen,
            fileLampiran,
            keterangan || null,
            wilayah_id,
            resor_id || null,
            user.id,
            tanggal_asli // menggunakan tanggal masalalu sebagai waktu kreasi
        ];

        const [result] = await db.execute(query, values);

        await logActivity(
            user.id,
            result.insertId,
            'SUBMIT',
            `Sistem: Admin memasukkan data arsip lama: "${judul_laporan}"`
        );

        res.status(201).json({ message: 'Arsip lama berhasil disimpan' });

    } catch (error) {
        console.error('Input Arsip Lama Error:', error);
        res.status(500).json({ message: error.message || 'Terjadi kesalahan saat menyimpan arsip' });
    }
};

// UPLOAD A SUSULAN PDF UNTUK ARSIP TANPA FILE
/**
 * [ADMIN] Fungsi Penambahan Susulan Berkas PDF
 * Terkadang laporan jadul (Arsip Lama) belum punya file PDF saat pertama kali diinput.
 * Fungsi ini membuka jalur untuk sekadar nge-upload PDF-nya saja di lain hari.
 */
const uploadSusulan = async (req, res) => {
    try {
        const { source, id } = req.params;

        if (!req.files || (!req.files['file_dokumen'] && !req.files['file'])) {
            return res.status(400).json({ message: 'Harap unggah file PDF dokumen.' });
        }

        const fileName = req.files['file_dokumen'] ? req.files['file_dokumen'][0].filename : req.files['file'][0].filename;

        let query = '';
        if (source === 'internal') {
            query = `UPDATE laporan_internal SET file_laporan = ? WHERE id = ?`;
        } else if (source === 'eksternal') {
            query = `UPDATE laporan_eksternal SET file_dokumen = ? WHERE id = ?`;
        } else {
            return res.status(400).json({ message: 'Sumber asal laporan tidak valid.' });
        }

        const [result] = await db.execute(query, [fileName, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data laporan tidak ditemukan.' });
        }

        res.json({ message: 'File dokumen berhasil disusulkan.', fileName });

    } catch (error) {
        console.error('Upload Susulan Error:', error);
        res.status(500).json({ message: 'Gagal menyusulkan file dokumen' });
    }
};

module.exports = {
    submitLaporan,
    getdetaillaporan,
    getFormOptions,
    getRiwayatLaporan,
    deleteLaporan,
    updateLaporan,
    getUserActivityLog,
    verifyLaporan,
    getUserDashboardStats,
    getAllPendingReports,
    getAdminDashboardStats,
    getAdminActivityLog,
    getAllApprovedReports,
    submitLaporanEksternal,
    submitLaporanMitra,
    inputArsipLama,
    uploadSusulan
};