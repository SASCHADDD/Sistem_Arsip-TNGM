/**
 * ==========================================
 * CONTROLLER: PENILAIAN LAPORAN (Penilaian.Controller.js)
 * ==========================================
 * File ini berisi fungsi bantuan (helper) khusus untuk menghitung secara otomatis
 * nilai atau predikat laporan staf ('Baik', 'Cukup', atau 'Kurang') 
 * berdasarkan patokan kalender tenggat waktu laporan tersebut.
 */

/**
 * Fungsi hitungPenilaian
 * Mengkalkulasi nilai (grading) berdasarkan seberapa cepat laporan ini diserahkan setelah kegiatannya berakhir.
 * Karena fungsinya terpisah dari fungsi lain, perhitungan penilain ini mudah diubah atau diperluas di kemudian hari.
 * 
 * @param {Object} laporan - Objek data laporan dari database yang memuat `tanggal_berakhir` (kapan kegiatan selesai) dan `jenis_laporan` ('A' atau 'B').
 * @returns {String} nilai kelulusan: 'Baik', 'Cukup', atau 'Kurang'
 */
const hitungPenilaian = (laporan) => {
    // 1. MENDAPATKAN WAKTU HARI INI
    // Membuat objek penanggalan JavaScript yang mewakili hari di mana sistem dipanggil
    const today = new Date();
    // Mengatur agar waktunya ter-reset tepat ke pukul 00:00:00 (Hanya fokus pada tanggal harinya saja, tidak peduli jam berapa disubmit)
    today.setHours(0, 0, 0, 0);

    // 2. MENDAPATKAN WAKTU KEGIATAN BERAKHIR
    // Mengubah data string tanggal_berakhir dari database menjadi objek penanggalan yang valid.
    const tanggalBerakhir = new Date(laporan.tanggal_berakhir);
    tanggalBerakhir.setHours(0, 0, 0, 0); // Sama, waktu di-reset ke pukul 00:00:00

    // 3. MENENTUKAN TENGGAT WAKTU (DEADLINE) PENILAIAN
    // Mempersiapkan variabel "deadline" yang awalnya bernilai "hari berakhirnya kegiatan"
    const deadline = new Date(tanggalBerakhir);
    
    // Peraturan Penilaian TNGM:
    if (laporan.jenis_laporan === 'A') {
        // Jika ini Laporan tipe A: Tenggat masuk untuk mendapatkan nilai baik adalah 5 HARI setelah kegiatan berakhir.
        deadline.setDate(deadline.getDate() + 5);
    } else if (laporan.jenis_laporan === 'B') {
        // Jika ini Laporan tipe B: Tenggat masuk untuk mendapatkan nilai baik adalah 30 HARI setelah kegiatan berakhir.
        deadline.setDate(deadline.getDate() + 30);
    }

    // 4. PROSES PENILAIAN (PEMBERIAN NILAI)
    let penilaianValue = null;
    
    // Membandingkan Hari Ini dengan Hari Deadline Terakhir
    if (today > deadline) {
        // Jika hari ini sudah LEWAT dari hari deadline. Maka telat.
        penilaianValue = 'Kurang';
    } else if (today.getTime() === deadline.getTime()) {
        // Jika hari ini TEPAT BERADA di hari terakhir deadline tersebut. Diberi peringatan/nilai tengah.
        penilaianValue = 'Cukup';
    } else {
        // Jika hari ini SEBELUM hari deadline tiba (dikirim dengan cepat waktu/segera). Diberi nilai terbaik.
        penilaianValue = 'Baik';
    }

    // 5. MENGEMBALIKAN NILAI
    // Nilai string (Baik/Cukup/Kurang) ini dikembalikan untuk selanjutnya dimasukkan ke database oleh controller terkait (Laporan.Controller)
    return penilaianValue;
};

// Mengekspor fungsi hitungPenilaian ini supaya bisa dipanggil (di-import) dari file Laporan.Controller.js saat admin menekan tombol "Setujui"
module.exports = {hitungPenilaian};
