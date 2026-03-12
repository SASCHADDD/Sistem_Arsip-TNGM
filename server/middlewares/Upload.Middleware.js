const multer = require('multer'); // Mengimpor Multer, sebuah alat khusus Node.js untuk menangani pengunggahan (upload) file dari formulir web (multipart/form-data)
const path = require('path'); // Mengimpor modul path (bawaan Node.js) untuk memudahkan penulisan alamat lokasi folder (direktori) di server
const fs = require('fs'); // Mengimpor modul file system (bawaan Node.js) untuk membaca, menulis, dan membuat folder di server

/**
 * ==========================================
 * FUNGSI UTAMA: PENGATURAN UNGGAH FILE (configureUpload)
 * ==========================================
 * Fungsi ini bertugas menyiapkan sebuah "Alat Penerima Paket" (middleware multer) 
 * yang tahu harus menyimpan file kiriman pengguna ke folder mana, 
 * memberi nama file apa, dan menolak jenis file yang berbahaya/tidak diizinkan.
 * 
 * @param {string} subfolder - Nama spesifik folder tujuan di dalam folder "uploads" (misalnya subfolder 'profil' atau 'laporan')
 * @returns {Object} - Mengembalikan objek jembatan Multer yang siap digunakan di rute API (Routes)
 */
const configureUpload = (subfolder) => {
    // 1. PERSIAPAN FOLDER PENYIMPANAN
    // Menghitung rute lokasi pasti folder penyimpanan (Di dalam folder 'uploads/nama_subfoldernya')
    const uploadDir = path.join(__dirname, '../../uploads', subfolder);
    
    // Mengecek fisik komputernya: "Apakah foldernya sudah ada?"
    if (!fs.existsSync(uploadDir)) {
        // Jika belum ada, sistem akan membuatkan foldernya secara otomatis.
        // { recursive: true } memastikan jika folder induk ('uploads') juga belum ada, sekalian dibuatkan anak dan induknya.
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. MENGATUR PROSES PENYIMPANAN (Storage)
    // Menyiapkan konfigurasi ke mana file fisik (hard disk) akan diselamatkan.
    const storage = multer.diskStorage({
        // A. Fungsi Penentuan Tujuan Lokasi
        destination: function (req, file, cb) {
            // cb (callback) adalah cara Multer mengatakan "Oke Lanjut, taruh file ini di folder uploadDir". Null artinya tidak ada error.
            cb(null, uploadDir);
        },
        // B. Fungsi Penentuan NAMA FILE baru
        filename: function (req, file, cb) {
            // Mengganti nama asli file agar tidak kembar secara tak sengaja ditimpa orang lain.
            // Karakter stempel waktu Date.now() (Waktu milidetik sekarang) digabungkan dengan nama asli file bawaan pengguna.
            // Contohnya file asli: "foto.jpg" akan berubah menjadi -> "170012345678-foto.jpg"
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
        }
    });

    // 3. FUNGSI PENYARINGAN / FILTER FILE
    // Ini adalah petugas X-Ray, yang mengecek apakah paket kiriman aman untuk masuk.
    const fileFilter = (req, file, cb) => {
        // Daftar ekstensi / akhiran file yang BOLEH atau DIRESTUI untuk diunggah aplikasi ini.
        // /i di akhir artinya tidak peduli huruf besar / kecil (JPG besar maupun jpg kecil boleh).
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|heic|heif/i; 
        
        // Membaca jenis akhiran dari nama file aslinya (ambil titik ke belakang, contoh ".pdf" atau ".jpg") lalu ubah jadi huruf kecil semua.
        const ext = path.extname(file.originalname).toLowerCase();

        // Uji coba kecocokan: Apakah ekstensi file ini ada di dalam daftar restu allowance?
        if (allowedTypes.test(ext)) {
            // Jika SESUAI (Lolos), perintahkan multer melanjutkan proses upload dengan cb(null, true)
            cb(null, true);
        } else {
            // Jika TIDAK SESUAI (misal nge-upload virus .exe), hentikan paksa dan lemparkan pesan ERROR. File dibatalkan.
            cb(new Error('Format file tidak didukung (hanya jpg, png, heic, pdf, doc)'));
        }
    };

    // 4. MEMASAK / MENGEMBALIKAN RESEP MULTER YANG UDAH JADI
    // Mengembalikan objek middleware multer yang sudah komplit komponen Konfigurasi Folder (storage), Pembatasan Ukuran (limits), dan X-Ray Filter (fileFilter).
    return multer({
        storage: storage, // Pakai konfigurasi disk storage yang dibuat tadi
        limits: { fileSize: 2 * 1024 * 1024 }, // MEMBATASI UKURAN FILE BERAT MAKSIMAL 2 MB (2 * 1024KB * 1024Byte) agar server tidak cepat penuh.
        fileFilter: fileFilter // Pakai saringan filter X-Ray yang kita definisikan.
    });
};

// Mengekspor fungsi perakit mesin upload ini 
// agar bisa dipakai bebas dari file controller atau route lainnya.
module.exports = configureUpload;
