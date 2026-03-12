# Sistem Arsip TNGM (Taman Nasional Gunung Merapi)

Dokumen ini menjelaskan alur kerja (Data Flow) aplikasi secara keseluruhan, dari tampilan antarmuka (Frontend - React.js) hingga pemrosesan data di peladen (Backend - Node.js/Express) dan penyimpanannya ke dalam Database (MySQL).

## 🚀 Arsitektur Utama

Aplikasi ini dibangun menggunakan arsitektur **Client-Server**.
1. **Frontend (Client)**: Dibangun dengan React.js (`/src`). Bertugas menampilkan halaman web, menerima interaksi (klik, ketik) dari pengguna, dan mengirimkan / meminta data ke server melalui protokol HTTP (menggunakan `axios`).
2. **Backend (Server)**: Dibangun dengan Node.js & Express.js (`/server`). Berperan sebagai otak aplikasi yang menerima permintaan dari Frontend, mengecek keamanan, mengeksekusi logika bisnis, dan membaca/menulis ke database.
3. **Database**: Menggunakan MySQL. Menyimpan semua data permanen (seperti profil pengguna, riwayat laporan, nama wilayah, dsb).

---

## 🌊 Penjelasan Alur (Flow) Aplikasi: Dari Klik hingga Database

Mari kita ambil contoh skenario: **Pengguna (Staf) mengirimkan sebuah "Laporan Baru"**.
Berikut adalah urutan perjalanan datanya lapis demi lapis:

### 1️⃣ FRONTEND (React.js)
Lokasi contoh: `src/Pages/user/UploadLaporan.jsx` 

- **Interaksi:** Pengguna mengisi formulir laporan (Judul, Tanggal, File Lampiran) lalu menekan tombol **"Kirim"**.
- **Aksi Frontend:** React meracik data tersebut ke dalam bentuk `FormData` (karena mengandung file dokumen berserta teks) lalu memanggil / menembakkan fungsi dari `axios` (misalnya memanggil `axios.post('http://localhost:3000/api/laporan', data)`).
- **Pengiriman Tiket:** Bersamaan dengan data laporan, Frontend juga secara otomatis menyisipkan **Token Keamanan (JWT)** di dalam *Header HTTP Authorization* sebagai bukti sah bahwa staf tersebut sudah berstatus *Login*.

### 2️⃣ ROUTES (Pintu Masuk Server)
Lokasi: `server/routes/Laporan.Routes.js`

- Request pengiriman dari Frontend akan mendarat pertama kali di jalur *router* backend, tepatnya pada alamat `POST /api/laporan`.
- Di *router* ini, lalu lintas tidak dibiarkan begitu saja langsung diproses. Ia diarahkan melewati satpam jaga (Middleware) terlebih dahulu.
- Bentuk barisan rutenya seperti ini: `router.post('/', verifyToken, authorizeRoles('staff', 'admin_wilayah'), configureUpload('laporan').fields([...]), LaporanController.submitLaporan);`

### 3️⃣ MIDDLEWARE (Pos Pemeriksaan Keamanan & Berkas)
Lokasi: `server/middlewares/`

Sebelum data dapat diolah dan ditulis, *request* tersebut diproses oleh beberapa Middleware secara berurutan:
- **`Auth.Middleware.js` (`verifyToken`)**: Satpam pertama. Mengecek apakah Token JWT yang dibawa Frontend itu valid atau sudah kadaluarsa. Jika valid, satpam mencatat siapa nama/ID *user* tersebut ke dalam memori (`req.user = decoded;`).
- **`Auth.Middleware.js` (`authorizeRoles`)**: Satpam kedua. Memastikan apakah ID *user* tersebut jabatannya mendapat izin (misal: harus 'staff' untuk lapor).
- **`Upload.Middleware.js` (`configureUpload`)**: Petugas X-Ray. Menangkap file `FormData`, mengecek jenis ekstensinya (aman/tidak), lalu **menyimpan wujud asli file tersebut** langsung ke folder penyimpanan lokal `server/uploads/laporan/`.

### 4️⃣ CONTROLLER (Otak Pemroses Data)
Lokasi: `server/controllers/Laporan.Controller.js` (Fungsi `submitLaporan`)

- Jika semua Middleware di atas berhasil meloloskan permintaan, maka sampailah data ke tujuan utamanya: *Controller*.
- Controller akan mengambil cuplikan data dari `req.body` (Kumpulan teks) dan `req.files` (Nama File yang sukses di-filter X-Ray sebelumnya), lalu `req.user` (ID Pengirim).
- **Logika Bisnis:** Controller memvalidasi ulang (mengecek jika ada data yang kurang lengkap) sebelum mengotorisasi ke langkah selanjutnya.
- **Interaksi DB:** Sekiranya aman, Controller menulis kalimat perintah bahasa penulisan SQL (contoh: `INSERT INTO laporan_internal...`) dan menjabarkan nilai variabelnya.

### 5️⃣ DATABASE (Penyimpanan)
Lokasi: Konfigurasi di `server/config/database.js`, Fisik terisolasi di MySQL server (misal: app XAMPP).

- Kode SQL rakitan Controller akan dilemparkan untuk dieksekusi (via fungsi `db.execute()`) ke dalam tabel MySQL.
- MySQL menyimpan data teks, relasi, nama url file, dan keterangan laporan tersebut ke dalam larik baris sel (Kecuali gambar aslinya, karena ia ada di folder `/uploads`).

### 6️⃣ KEMBALI MENGHADAP KE PENGGUNA (Respon Akhir)
- Begitu pangkalan data berhasil membukukan datanya (atau jika terjadi Error), **Controller** akan melempar status balik perihal keberhasilannya kepada **Frontend**. (Dalam hitungan persekian milidetik, misal Controller berkata: `res.status(201).json({ message: 'Laporan berhasil disubmit' })`).
- **Frontend** segera menerima jawaban JSON bergaransi sukses tersebut di blok Promise `.then()`.
- *Browser* (React) kemudian memunculkan notifikasi antarmuka visual hijau ("Berhasil Diunggah!") ke depan mata pengguna dan dengan proaktif mengalihkan pandangan layar (Redirect) menuju halaman daftar riwayat laporan. 

*(Proses Selesai)*

---

## 📂 Struktur Ekosistem Backend (Sekilas)
- **`/config/database.js`**: Penghubung (Konektor) utama jaringan peladen Node.js dengan sistem MySQL.
- **`/controllers/`**: Seluruh urat nadi dan otak logika utama sistem diletakkan di dalam folder ini (memanipulasi DB & menyortir perintah).
- **`/middlewares/`**: Menghadang orang/file jahat; mengecek Token Login dan membatasi Limit File Gambar.
- **`/routes/`**: *Traffic Controller*. Yang mengatur alamat *link url* API mana yang harus ditugaskan ke fungsi Controller yang mana.
- **`/services/`**: Bantuan layanan spesifik di luar kebiasaan CRUD (seperti mempekerjakan *Puppeteer* pembuat PDF otomatis).
- **`/uploads/`**: Rak lemari arsip digital berskala HDD di peladen tempat wujud gambar `jpg` & `pdf` dikarantina.

Dokumentasi ini ditulis sebagai panduan peta pelacakan pemeliharaan kode (Maintenance Guide) dalam mengembangkan Sistem Arsip TNGM di masa depan.
