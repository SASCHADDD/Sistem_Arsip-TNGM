const jwt = require('jsonwebtoken'); // Mengimpor pustaka JSON Web Token (JWT) untuk membuat dan memverifikasi token keamanan login

// ==========================================
// 1. MIDDLEWARE: VERIFIKASI TOKEN (verifyToken)
// ==========================================
// Fungsi ini bertugas sebagai "Satpam Pintu Depan" untuk setiap rute API yang bersifat rahasia/private.
// Tujuannya adalah memastikan bahwa orang yang mengakses rute tersebut benar-benar sudah login dan punya "Karcis Masuk" (Token).
const verifyToken = (req, res, next) => {
    // 1. Ambil "Karcis Masuk" (Header Authorization) dari permintaan (request) user
    const authHeader = req.headers.authorization;

    // 2. Jika user sama sekali tidak membawa karcis (belum login)
    if (!authHeader) {
        // Tolak akses dengan status 401 (Unauthorized / Tidak Sah)
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    // 3. Biasanya format karcis itu bertuliskan "Bearer xxxxxxx-token-rahasia-xxxxxx".
    // Kita pisahkan kalimatnya dengan spasi (split) dan ambil bagian token aslinya saja (indeks ke-[1]).
    const token = authHeader.split(' ')[1];

    try {
        // 4. Proses Pengecekan Keaslian Karcis (Token)
        // JWT akan mengecek apakah token ini valid, belum kadaluarsa, dan dibuat oleh server kita (cocok dengan secret key).
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret_key_rahasia' // Kunci rahasia untuk membuka isi token. Sebaiknya ditaruh di .env
        );

        // 5. Jika token ASLI dan SAH, kita ambil data identitas user dari dalam token tersebut (seperti id, role, dll)
        // Data ini kita titipkan ke dalam variabel `req.user` agar bisa dipakai oleh fungsi-fungsi berikutnya (Controller).
        req.user = decoded;
        
        // 6. Silakan masuk! (Lanjut ke proses selanjutnya / Controller utama)
        next();
    } catch (error) {
        // 7. Jika token PALSU, sudah KADALUARSA (Expired), atau RUSAK
        // Tolak akses dengan status 403 (Forbidden / Dilarang Masuk)
        return res.status(403).json({ message: 'Token tidak valid' });
    }
};

// ==========================================
// 2. MIDDLEWARE: OTORISASI PERAN (authorizeRoles)
// ==========================================
// Fungsi ini bertugas sebagai "Satpam Ruangan Khusus".
// Setelah masuk pintu depan (verifyToken), satpam ini mengecek apakah JABATAN (ROLE) user tersebut
// punya izin untuk masuk ke ruangan tertentu (misal: ruang khusus admin).
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Mengecek apakah "role / jabatan" user (yang tadi dititipkan di req.user oleh verifyToken) 
        // TERDAFTAR dalam daftar jabatan yang diizinkan (allowedRoles).
        
        if (!allowedRoles.includes(req.user.role)) {
            // Jika jabatannya tidak ada di daftar (misal cuma 'staff' tapi mau masuk ruang 'admin_wilayah')
            // Tolak akses dengan status 403 (Forbidden / Akses Ditolak)
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        
        // Jika jabatannya SESUAI, Silakan masuk! Lanjut ke Controller.
        next();
    };
};

// Mengekspor kedua fungsi Satpam ini agar bisa dipakai (di-import) oleh file Routes (pengatur rute API)
module.exports = { verifyToken, authorizeRoles };
