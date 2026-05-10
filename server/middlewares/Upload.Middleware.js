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
/**
 * ==========================================
 * FUNGSI UTAMA: PENGATURAN UNGGAH FILE (configureUpload)
 * ==========================================
 */
const configureUpload = () => {
    // 1. DAFTAR FOLDER PENYIMPANAN
    const folders = {
        documents: path.join(__dirname, '../../uploads/laporan'),
        images: path.join(__dirname, '../../uploads/buktihardfile'),
        output: path.join(__dirname, '../../uploads/output')
    };
    
    // Pastikan semua folder ada
    Object.values(folders).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // 2. MENGATUR PROSES PENYIMPANAN (Storage)
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Tentukan folder berdasarkan fieldname input
            if (file.fieldname === 'file_dokumen' || file.fieldname === 'file') {
                cb(null, folders.documents);
            } else if (file.fieldname === 'file_lampiran' || file.fieldname === 'hardfile') {
                cb(null, folders.images);
            } else {
                cb(null, folders.documents); // default
            }
        },
        filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|heic|heif/i; 
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung (hanya jpg, png, heic, pdf, doc)'));
        }
    };

    return multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Naikkan ke 10MB jika perlu
        fileFilter: fileFilter
    });
};

const uploader = configureUpload();

const handleUpload = (req, res, next) => {
    const upload = uploader.fields([
        { name: 'file_dokumen', maxCount: 1 },
        { name: 'file_lampiran', maxCount: 1 }
    ]);
    upload(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || 'Gagal mengupload file' });
        next();
    });
};

const handleUploadEksternal = (req, res, next) => {
    const upload = uploader.fields([
        { name: 'file', maxCount: 1 },
        { name: 'hardfile', maxCount: 1 }
    ]);
    upload(req, res, function (err) {
        if (err) return res.status(400).json({ message: err.message || 'Gagal mengupload file eksternal' });
        next();
    });
};

module.exports = { 
    configureUpload, 
    handleUpload, 
    handleUploadEksternal 
};
