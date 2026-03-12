const db = require('../config/database'); // Mengimpor koneksi database (MySQL)
const bcrypt = require('bcrypt'); // Mengimpor bcrypt untuk fungsi hashing (sandi) password jika admin mengganti password akun staf

/**
 * ==========================================
 * CONTROLLER: MANAJEMEN AKUN PENGGUNA (User.Controller.js)
 * ==========================================
 * File pengontrol ini mengurusi berbagai tindakan DARI SISI ADMIN terhadap akun-akun staf di bawahnya.
 * Seperti: menampilkan semua staf, melihat performa staf (detail), mengubah tempat penugasan (mutasi), 
 * hingga menghapus akun staf tersebut.
 */

// 1. FUNGSI MENAMPILKAN DAFTAR SELURUH STAF
const getAllStaff = async (req, res) => {
    try {
        // Ambil data admin yang sedang me-request tabel ini
        const user = req.user;
        
        // Aturan awal: Hanya ambil pengguna yang jabatannya 'staff' atau 'admin_wilayah' (Level di bawah Kepala Balai)
        let whereClause = "WHERE p.role IN ('staff', 'admin_wilayah')";
        let queryParams = [];

        // JIKA ADMIN WILAYAH: Dia hanya boleh melihat daftar staf yang bertugas di wilayah kekuasaannya saja.
        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            whereClause += " AND p.wilayah_id = ?";
            queryParams.push(user.wilayah_id);
        }

        // Kueri SQL: Menggabungkan (JOIN) info pengguna dengan nama panjang wilayah & resor-nya
        const query = `
            SELECT 
                p.id, p.nama, p.email, p.role, p.foto,
                w.nama_wilayah, r.nama_resor
            FROM pengguna p
            LEFT JOIN wilayah w ON p.wilayah_id = w.id
            LEFT JOIN resor r ON p.resor_id = r.id
            ${whereClause} -- Menyisipkan syarat filter
            ORDER BY p.nama ASC -- Mengurutkan nama staf berdasar Abjad A-Z
        `;

        // Jalankan kueri. Jika queryParams ada isinya (ada filter wilayah), masukkan param. Kalau tidak (misal Admin Balai), kosongi (undefined).
        const [users] = await db.execute(query, queryParams.length ? queryParams : undefined);
        
        // Kembalikan daftar staf ke Frontend dalam wujud JSON
        res.json(users);
    } catch (error) {
        console.error('Get All Staff Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data staff' });
    }
};

// 2. FUNGSI MELIHAT PROFIL & STATISTIK KINERJA STAF SPESIFIK (Detail Profil)
const getStaffDetail = async (req, res) => {
    try {
        // Mengambil ID staf yang diklik (dari URL parameter)
        const { id } = req.params;

        // A. AMBIL DATA IDENTITAS (PROFIL)
        const profileQuery = `
            SELECT 
                p.id, p.nama, p.email, p.role, p.foto,
                w.nama_wilayah, r.nama_resor, p.wilayah_id, p.resor_id
            FROM pengguna p
            LEFT JOIN wilayah w ON p.wilayah_id = w.id
            LEFT JOIN resor r ON p.resor_id = r.id
            WHERE p.id = ? AND p.role IN ('staff', 'admin_wilayah')
        `;
        const [profileRows] = await db.execute(profileQuery, [id]);

        if (profileRows.length === 0) {
            return res.status(404).json({ message: 'Data staff tidak ditemukan' });
        }

        const profile = profileRows[0]; // Karena ID itu unik, kita cuma butuh data objek pada posisi pertama (index 0)

        // B. TUGAS MATEMATIKA: AMBIL DAN HITUNG JUMLAH LAPORANNYA
        // Kueri ini menghitung sekaligus berbagai macam status laporan milik sang staf.
        // CASE WHEN digunakan ibarat IF-ELSE di dalam kotak SQL.
        const statsQuery = `
            SELECT 
                COUNT(*) as total, -- Menghitung total seluruh laporannya (Disetujui/Ditolak/Pending)
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, -- Total yang belum dibaca admin
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved, -- Total yang sukses disetujui (Ceklis biru)
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected, -- Total yang ditolak silang
                SUM(
                    CASE 
                        -- Mengakumulasikan nilai bobot angka. Baik nilainya 3 poin, cukup 2, kurang 1.
                        WHEN penilaian = 'Baik' THEN 3
                        WHEN penilaian = 'Cukup' THEN 2
                        WHEN penilaian = 'Kurang' THEN 1
                        ELSE 0 
                    END
                ) as total_nilai,
                SUM(CASE WHEN penilaian IS NOT NULL THEN 1 ELSE 0 END) as laporan_dinilai -- Berapa banyak laporannya yang sebetulnya 'dinilai'?
            FROM laporan_internal 
            WHERE created_by = ? -- Filter khusus laporan yang dia buat sendiri
        `;
        const [statsRows] = await db.execute(statsQuery, [id]);
        const stats = statsRows[0];

        // C. HITUNG NILAI RATA-RATA PRESTASI KERJANYA
        const totalNilai = parseInt(stats.total_nilai) || 0;
        const TotalLaporanDinilai = parseInt(stats.laporan_dinilai) || 0;
        
        // Rata-rata Nilai = Total Bobot Nilai / Total Berapa Banyak Laporan yang Sudah dinilai
        // toFixed(1) membatasi angka desimal cuma boleh max 1 angka di belakang koma (misal: 2.5)
        const rataRataNilai = TotalLaporanDinilai > 0 ? (totalNilai / TotalLaporanDinilai).toFixed(1) : 0;

        // D. KEMBALIKAN DATA KOMPLIT KE LAYAR
        res.json({
            profile: { // Bagian Profil BioData Pribadi
                ...profile, // Sebar isi objek profil tadi ke sini
                wilayah: profile.nama_resor || profile.nama_wilayah || 'Belum Ditetapkan' // Tentukan label lokasi dia bertugas (Jika nggak punya resor, lihat wilayahnya)
            },
            stats: { // Bagian Kotak-Kotak Statistik
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                approved: parseInt(stats.approved) || 0,
                rejected: parseInt(stats.rejected) || 0,
                rata_rata_nilai: parseFloat(rataRataNilai)
            }
        });

    } catch (error) {
        console.error('Get Staff Detail Error:', error);
        res.status(500).json({ message: 'Gagal mengambil detail staff' });
    }
};

// 3. FUNGSI EDIT / MUTASI STAF (Oleh Admin)
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params; // ID akun staf yg mau diedit
        const { nama, email, password, wilayah_id, resor_id } = req.body; // Isian data baru yg ditiupkan form admin

        // A. CEK DUPLIKASI EMAIL
        // Memastikan admin tidak mengganti email staf ini ke email yang ternyata milik pengguna lain (ID != id staf ini)
        const [existingUserCheck] = await db.execute(
            'SELECT id FROM pengguna WHERE email = ? AND id != ?',
            [email, id]
        );

        if (existingUserCheck.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar oleh pengguna lain' });
        }

        // B. CEK APAKAH ADA PROSES "PINDAH TUGAS (MUTASI)"
        // Ambil data dia yang lama dulu sebelum diapa-apain. 
        const [oldUserRows] = await db.execute(
            'SELECT wilayah_id, resor_id FROM pengguna WHERE id = ? AND role = \'staff\'',
            [id]
        );

        if (oldUserRows.length === 0) {
            return res.status(404).json({ message: 'Staff tidak ditemukan' });
        }

        const oldUser = oldUserRows[0];
        let isMutated = false;

        // Logika Mutasi: Jika Wilayah Lama-nya ternyata "TIDAK SAMA" dengan Wilayah_Baru hasil isian form,
        // ATAU resor lama-nya "TIDAK SAMA" dengan Resor_Baru isian admin... maka anak ini berarti kena Mutasi.
        if ((wilayah_id && parseInt(wilayah_id) !== oldUser.wilayah_id) ||
            (resor_id && parseInt(resor_id) !== oldUser.resor_id)) {
            isMutated = true; // Set indikator mutasi jadi "YA"
        }

        // C. MULAI PROSES MODIFIKASI (UPDATE) KE DATABASE UTAMA
        // Menyiapkan kalimat kueri SQL dan array urutan nilainya
        let updateQuery = 'UPDATE pengguna SET nama = ?, email = ?, wilayah_id = ?, resor_id = ?';
        let queryParams = [
            nama,
            email,
            wilayah_id ? parseInt(wilayah_id) : null,
            resor_id ? parseInt(resor_id) : null
        ];

        // Jika admin juga sekalian mengganti Password (mengatur ulang password staf yg lupa sandi):
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10); // Enkripsi dulu password barunya
            updateQuery += ', password = ?'; // Tambahkan kalimat "Update kolom password=" di kueri
            queryParams.push(hashedPassword); // Sisipkan hasil enkripsi mentahnya ke dalam barisan array
        }

        // Lengkapi kalimat kondisi "dimana pengguna yang diupdate itu adalah staf dengan ID ini"
        updateQuery += " WHERE id = ? AND role = 'staff'";
        queryParams.push(id);

        // Eksekusi Pembaruan Penimpaan! (JEDEERRR)
        const [result] = await db.execute(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff tidak ditemukan atau tidak ada perubahan' });
        }

        // D. CETAK SURAT MUTASI (LOG AKTIVITAS)
        // Jika tadinya kena indikator mutasi = YA. Buatkan notifikasi log di Dasbor Staf ybs supaya dia dikasih tau kalo dia dipindah tugas!
        if (isMutated) {
            // Kita cari tau dulu apa sih "nama panjang" resor barunya si staf ini, buat ditulis di dalem notif?
            let namaResorBaru = 'Resor Baru';
            if (resor_id) {
                const [resorData] = await db.execute('SELECT nama_resor FROM resor WHERE id = ?', [resor_id]);
                if (resorData.length > 0) namaResorBaru = resorData[0].nama_resor;
            }

            // Memasukkan pengumuman mutasi ke tabel "Activity Log" (Jejak Aktivitas) milik Si Staf (berdasarkan ID dia)
            const logQuery = `
                 INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) 
                 VALUES (?, NULL, 'UPDATE', ?, NOW())
             `;
            await db.execute(logQuery, [
                id,
                `Sistem Admin: Anda telah dimutasi penempatannya menjadi di ${namaResorBaru}.` // Inilah pesan notifnya
            ]);
        }

        // Selesai! Kasih tau frontend kalau udah kelar
        res.json({ message: 'Data staff berhasil diperbarui' });

    } catch (error) {
        console.error('Update Staff Error:', error);
        res.status(500).json({ message: 'Gagal memperbarui data staff' });
    }
};

// 4. FUNGSI PEMECATAN / MENGHAPUS AKUN STAF
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params; // ID akun sasaran

        // Langsung Hapus (DELETE) barisan data staf dari tabel pengguna yang memiliki pencocokan ID tersebut.
        // Halaman ini tidak akan mengizinkan penghapusan untuk Admin Balai (karena dibatasi hanyak untuk role staf dan admin wilayah)
        //
        // CATATAN PENTING ARSITEKTUR: Mengapa kok laporan staf yang lama ga ikut terhapus di layar "Data Laporan" kalau akun stafnya musnah?
        // Karena di desain pengaturan Database MySQL nya, Laporannya memiliki aturan "ON DELETE SET NULL". 
        // Artinya, Kalau manusia pembuatnya dihapus, Laporannya tetap utuh tak bernyawa sebagai barang bukti, cuman di kolom pengirim-nya akan jadi "Anonim / Dikosongkan".
        const [result] = await db.execute("DELETE FROM pengguna WHERE id = ? AND role IN ('staff', 'admin_wilayah')", [id]);

        // Kalau gak ada 1 data pun yang kerespons SQL, brarti akunnya gak ketemu.
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff/Admin tidak ditemukan' });
        }

        res.json({ message: 'Akun berhasil dihapus' });

    } catch (error) {
        console.error('Delete Staff Error:', error);
        res.status(500).json({ message: 'Gagal menghapus akun. Kemungkinan karena pengguna ini sudah memiliki data laporan terkait.' });
    }
};

// Mengekspor fungsi-fungsi MANAJEMEN STAF di atas agar bisa dipakai rute User.Routes.js
module.exports = {
    getAllStaff,
    getStaffDetail,
    updateStaff,
    deleteStaff
};
