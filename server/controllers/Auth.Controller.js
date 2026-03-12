const db = require('../config/database'); // Mengimpor koneksi database (MySQL)
const bcrypt = require('bcrypt'); // Mengimpor bcrypt, library / alat sandi untuk merahasiakan (hashing) password pengguna di sistem (agar tidak berwujud teks asli di database)
const jwt = require('jsonwebtoken'); // Mengimpor JWT untuk membuat tiket/token sebagai "kartu akses" setelah login berhasil

/**
 * ==========================================
 * CONTROLLER: OTENTIKASI (Auth.Controller.js)
 * ==========================================
 * File pengontrol (Controller) ini bertanggung jawab penuh mengurusi segala hal
 * yang berhubungan dengan Keamanan Akses Pengguna. Mulai dari Mendaftar,
 * Login, Logout, Mengganti Password, dan Mengupdate data sensitif lainnya.
 */

// 1. FUNGSI REGISTRASI STAF BIASA (Pendaftaran)
const register = async (req, res) => {
    try {
        // Menangkap data (nama, email, password, letak wilayah, letak resor) yang dikirimkan melalui isian formulir
        const { nama, email, password, wilayah_id, resor_id } = req.body;

        // Mengecek apakah email yang diinputkan pengguna tersebut sudah pernah didaftarkan oleh pengguna lain
        const [existingUser] = await db.execute(
            'SELECT id FROM pengguna WHERE email = ?',
            [email] // Tanda tanya digantikan dengan data murni, untuk mencegah suntikan kode bahaya (SQL Injection)
        );

        if (existingUser.length > 0) {
            // Jika hasilnya ada, maka tolak pendaftaran
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        // Jika email masih kosong, lanjut sandikan (enkripsi) password aslinya sebelum dimasukkan ke database
        // Angka 10 adalah besaran putaran pengacakan gembok (salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Memasukkan data pendaftar baru tersebut ke dalam tabel "pengguna"
        const [result] = await db.execute(
            `INSERT INTO pengguna 
            (nama, email, password, role, wilayah_id, resor_id, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
            // Oleh sistem, jabatan langsung digembok baku secara otomatis ke 'staff'. NULL jika tidak memilih resor/wilayah
            [nama, email, hashedPassword, 'staff', wilayah_id || null, resor_id || null]
        );

        // Jika sukses tersimpan, beri sinyal keberhasilan ke halaman Frontend
        res.status(201).json({
            message: 'Registrasi staff berhasil',
            data: {
                id: result.insertId, // Mengirim kembali urutan ID milik pengguna baru tsb
                nama,
                email,
                role: 'staff'
            }
        });

    } catch (error) {
        // Menangkap kemunculan malfungsi teknis dan mengirimkannya ke log
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 2. FUNGSI REGISTRASI AKUN ADMIN (Hanya bisa dibuat melalui mekanisme khusus atau admin super)
const createAdmin = async (req, res) => {
    try {
        // Menerima data yang diminta, termasuk role (jabatan admin jenis apa)
        const { nama, email, password, role, wilayah_id } = req.body;

        // Validasi ketat: Sistem harus menolak permohonan admin apabila Role yang diajukan bukan salah satu dari 3 jabatan sakral di bawah ini.
        if (!['admin_balai', 'admin_wilayah', 'kepala_wilayah'].includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid' });
        }

        // Terapkan enkripsi gembok password yang sama
        const hashedPassword = await bcrypt.hash(password, 10);

        // Masukkan data admin ini ke dalam tabel
        // Perhatikan bahwa admin tidak memiliki kolom resor_id, karena mereka hanya ditempatkan berdasarkan skala "wilayah" secara luas.
        const [result] = await db.execute(
            `INSERT INTO pengguna 
            (nama, email, password, role, wilayah_id) 
            VALUES (?, ?, ?, ?, ?)`,
            [nama, email, hashedPassword, role, wilayah_id || null]
        );

        res.status(201).json({
            message: 'Admin berhasil dibuat',
            id: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 3. FUNGSI MENG-UPDATE INFORMASI PENEMPATAN USER
const updateUser = async (req, res) => {
    try {
        // Mengambil variabel ID user yang mau diubah (lewat Link URL parameter)
        const { id } = req.params;
        
        // Mengambil isi data yang baru (lewat data Body isian form)
        const { nama, email, wilayah_id, resor_id } = req.body;

        // Mengeksekusi penimpaan (Update) ke tabel pengguna
        // Fungsi COALESCE(?, yang_lama) artinya jika yang "?" diinput kosong, maka tetap diselamatkan nilai varible database yang "lama". 
        // Supaya nama tidak tiba-tiba kosong kalau kita cuman mau ubah alamat doang.
        let query = `
            UPDATE pengguna 
            SET 
                nama = COALESCE(?, nama), 
                email = COALESCE(?, email),
                wilayah_id = COALESCE(?, wilayah_id),
                resor_id = COALESCE(?, resor_id)
            WHERE id = ?
        `;

        let params = [
            nama || null,
            email || null,
            wilayah_id || null,
            resor_id || null,
            id
        ];

        await db.execute(query, params);

        res.json({ message: 'Data user dan penempatan berhasil diupdate' });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 4. FUNGSI UNGGAH FOTO PROFIL PENGGUNA
const uploadPhoto = async (req, res) => {
    try {
        // Mengambil ID akun user 
        const { id } = req.params;

        // req.file merupakan paket file foto yang berhasil "lolos" dari sensor middleware multer yang ada di "Upload.Middleware.js".
        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan' });
        }

        // Meng-update kolom 'foto' khusus si user ini menggunakan teks nama gambar (misal img-172102120012.jpg)
        await db.execute(
            `UPDATE pengguna SET foto = ? WHERE id = ?`,
            [req.file.filename, id]
        );

        res.json({
            message: 'Foto berhasil diupload',
            file: req.file.filename // Berikan nama file tersebut ke depan layar admin agar halamannya bisa memperbarui fotonya langsung pake variabel ini
        });

    } catch (error) {
        console.error('Upload Error:', error); // Log pesan error ke terminal backend untuk pelacakan masalah
        res.status(500).json({ message: error.message || 'Terjadi kesalahan pada server saat upload' });
    }
};

// 5. FUNGSI GABUNG (LOGIN) KE DALAM SISTEM
const login = async (req, res) => {
    try {
        // Menerima input kredensial masuk dari kotak email+password di layar frontend
        const { email, password } = req.body;

        // Mencari profil lengkap user tsb sekaligus mencocokkan asal nama wilayah/resor-nya langsung menyatu (INNER JOIN SQL).
        const [users] = await db.execute(
            `SELECT p.*, w.nama_wilayah, r.nama_resor
             FROM pengguna p
             LEFT JOIN wilayah w ON p.wilayah_id = w.id
             LEFT JOIN resor r ON p.resor_id = r.id
             WHERE p.email = ?`,
            [email] // Cek profil dengan email tersebut
        );

        // Jika array datanya kosong / Tidak ada satupun user di database dengan email itu.
        const user = users[0];
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // CEK STATUS AKTIF: Akun yang dinonaktifkan tidak boleh masuk
        if (user.is_active === 0) {
            return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' });
        }

        // Mengambil alat palu (bcrypt.compare) untuk membobol verifikasi dan membandingkan apakah
        // password tulisan polosan yang dimasukkan manusia (misal: "password123") itu sama artinya dengan 
        // password ruwet hasil enkripsi di database (misal: "$2a$10$Q7eY/8wL0kH...").
        const validPassword = await bcrypt.compare(password, user.password);

        // Jika salah sandi
        if (!validPassword) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // JALUR LOGIN INTERNAL: Hanya perbolehkan Staff atau Admin
        const allowedInternalRoles = ['admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff'];
        if (!allowedInternalRoles.includes(user.role)) {
            return res.status(403).json({ 
                message: 'Akses ditolak. Silakan gunakan portal login Eksternal atau Mitra untuk akun Anda.' 
            });
        }

        // JIKA LOGIN BERHASIL: Buatkan Tiket/Karcis JALAN (Sign Token JWT)!
        // Karcis JWT ini nantinya akan dibawa-bawa terus ke mana-mana oleh layar peramban (Browser) dalam bentuk variabel 'authorization' setiap kali meminta data.
        const token = jwt.sign(
            { // Di dalam tiket tersembunyi tersebut memuat identitas pengguna sebagai berikut:
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role, // << Data JABATAN diselipkan di sini, kelak dicheck di Auth.Middleware (authorizeRoles) !!
                wilayah_id: user.wilayah_id,
                resor_id: user.resor_id
            },
            // Di-Stempel Asli oleh stempel server 
            process.env.JWT_SECRET || 'secret_key_rahasia',
            { expiresIn: '10h' } // Berlaku (Hangus) Otomatis dalam Waktu 10 Jam
        );

        // Kembalikan 2 jawaban (Tiket Rahasia untuk dibekalkan browser di "saku celana - Localstorage" & Profil wujud nyata untuk ditampilin di layar)
        res.status(200).json({
            message: 'Login berhasil',
            token, // Token Sakti (JWT) ditransfer ke front end
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                wilayah_id: user.wilayah_id,
                resor_id: user.resor_id,
                wilayah: user.nama_wilayah,
                resor: user.nama_resor,
                // Merakit URL gambar jadi lengkap "http://domain.com/uploads/..." kalau foto ada
                foto: user.foto ? `http://localhost:3000/uploads/profile/${user.foto}` : null
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};

// 6. FUNGSI GANTI KATA SANDI SECARA AMAN DI AKUN
const changePassword = async (req, res) => {
    try {
        // Memakai ID akun dari tiket Karcis Asli yang masih tertahan di middleware VerifyToken.
        // req.user ini 100% dipastikan dari identitas yang sedang login (Mencegah Hack: mengganti password akun orang lain).
        const userId = req.user.id; 
        
        const { oldPassword, newPassword } = req.body;

        // Cek syarat jika password lama belum diisi di form
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
        }

        // Ambil info password lamanya si user ini dari database
        const [users] = await db.execute('SELECT password FROM pengguna WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // Verifikasi apakah yang dia ketik sebagai "Password Anda Saat ini" memang benar
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password lama tidak sesuai' });
        }

        // Jika lolos, Hash Gembok sandi yang baru, dan ganti / masukkan (Update) timpa ke Database menggusur yg lama.
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE pengguna SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password berhasil diubah' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// 7. FUNGSI KELUAR SISTEM DARI PERAMBAN LOKAL (LOGOUT)
const logout = async (req, res) => {
    // Karena sistem menggunakan JWT (dimana yang pegang tiket login hanya layar browser (FE)),
    // Maka backend tidak perlu mengingat apapun. Backend hanya menyetujui formalitas logout.
// Pekerjaan membersihkan tiket sungguhannya ada di layar React Frontend (localStorage.removeItem('token')).
    res.status(200).json({ message: 'Logout berhasil' });
};

// ==========================================
// AUTENTIKASI EKSTERNAL & MITRA (Akun Nyata dari Database)
// ==========================================

/**
 * [EKSTERNAL/MITRA] Registrasi akun baru via API
 * Digunakan sementara sebelum integrasi dengan sistem eksternal/mitra lain.
 * Endpoint: POST /api/eksternal/register
 * Body: { nama, email, password, instansi, role: 'eksternal'|'mitra' }
 */
const registerEksternal = async (req, res) => {
    try {
        const { nama, email, password, instansi, role } = req.body;

        if (!nama || !email || !password || !instansi || !role) {
            return res.status(400).json({ message: 'Semua field wajib diisi: nama, email, password, instansi, role' });
        }

        if (!['eksternal', 'mitra'].includes(role)) {
            return res.status(400).json({ message: 'Role harus "eksternal" atau "mitra"' });
        }

        // Cek apakah email sudah terdaftar
        const [existing] = await db.execute(
            'SELECT id FROM pengguna WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO pengguna (nama, email, password, role, instansi) VALUES (?, ?, ?, ?, ?)`,
            [nama, email, hashedPassword, role, instansi]
        );

        res.status(201).json({
            message: `Akun ${role} berhasil didaftarkan`,
            data: { id: result.insertId, nama, email, role, instansi }
        });
    } catch (error) {
        console.error('Register Eksternal Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

/**
 * [EKSTERNAL/MITRA] Login dengan akun nyata dari database
 * Endpoint: POST /api/eksternal/login
 */
const loginEksternal = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }

        // Cari user di tabel pengguna dengan role eksternal atau mitra
        const [users] = await db.execute(
            `SELECT * FROM pengguna WHERE email = ? AND role IN ('eksternal', 'mitra')`,
            [email]
        );

        const user = users[0];
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Verifikasi password dengan bcrypt
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Buat JWT token dengan data user asli
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nama: user.nama,
                instansi: user.instansi || '',
                role: user.role   // 'eksternal' | 'mitra'
            },
            process.env.JWT_SECRET || 'secret_key_rahasia',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                email: user.email,
                nama: user.nama,
                instansi: user.instansi || '',
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Eksternal Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Mengekspor kumpulan Fungsi Keamanan ini agar dimanfaatkan oleh jalurnya via router
module.exports = {
    register,
    createAdmin,
    updateUser,
    uploadPhoto,
    login,
    changePassword,
    logout,
    loginEksternal,
    registerEksternal
};