const puppeteer = require('puppeteer'); // Mengimpor Puppeteer, sebuah library untuk mengontrol browser Chrome/Chromium secara otomatis (headless)
const fs = require('fs'); // Mengimpor modul File System (fs) bawaan Node.js untuk membaca dan menulis file di penyimpanan server
const path = require('path'); // Mengimpor modul path bawaan Node.js untuk mengatur dan memudahkan manipulasi direktori/jalur file

/**
 * Fungsi Utama: Membuat file PDF "Tanda Terima"
 * Fungsi ini bertugas mengambil template HTML, mengisi data laporan ke dalamnya,
 * lalu mengubah HTML tersebut menjadi sebuah file PDF menggunakan mekanisme "print to PDF" dari Puppeteer.
 * 
 * @param {Object} data - Objek berisi informasi laporan yang diinput (nama_pengirim, tanggal_terima, judul_laporan, dll)
 * @returns {Promise<string>} - Mengembalikan janji (Promise) berupa nama string file PDF yang berhasil dibuat
 */
const generateTandaTerimaPDF = async (data) => {
    try {
        // 1. MEMPERSIAPKAN TEMPLATE HTML
        // Menentukan lokasi file template HTML Tanda Terima. 
        // __dirname adalah letak folder file ini (services), lalu kita "naik satu folder" (..) dan masuk ke folder 'suratpengantar'
        const templatePath = path.join(__dirname, '../suratpengantar/tanda_terima.html');
        
        // Membaca seluruh isi file HTML tersebut sebagai string teks mentah (raw string) menggunakan format encoding utf-8
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // 2. MENGISI DATA KE DALAM TEMPLATE
        // Di dalam template HTML, terdapat banyak teks dengan tanda "kumis" seperti {{nama_pengirim}}.
        // Kode replace() di bawah ini berfungsi untuk menukar placeholder tersebut dengan kata-kata aslinya.
        // Tanda //g di regex (/.../g) memastikan semua kata yang sama diganti secara global (bisa lebih dari satu tempat).
        // Jika datanya kosong (tidak dikirim atau null), maka kita akan menggantinya dengan karakter bawaan (misal: tanda strip '-')
        htmlContent = htmlContent.replace(/{{nama_pengirim}}/g, data.nama_pengirim || '-');
        htmlContent = htmlContent.replace(/{{tanggal_terima}}/g, data.tanggal_terima || '-');
        htmlContent = htmlContent.replace(/{{judul_laporan}}/g, data.judul_laporan || '-');
        htmlContent = htmlContent.replace(/{{jenis_laporan}}/g, data.jenis_laporan || '-');
        htmlContent = htmlContent.replace(/{{penerima}}/g, data.penerima || 'Admin TNGM');

        // 3. MENYALAKAN BROWSER PUPPETEER (Browser Tak Terlihat)
        // Karena kita tidak bisa begitu saja "membuat PDF dari ketiadaan", kita butuh browser asli (Chrome) untuk merender HTML-nya.
        // Puppeteer akan membuka Chrome di latar belakang server (tanpa UI).
        const browser = await puppeteer.launch({
            headless: 'new', // Menggunakan mode headless terbaru (tanpa memunculkan jendela aplikasi secara visual)
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumen keamanan agar pembukaan tab siluman ini diizinkan oleh sistem operasi Linux/server/VPS
        });
        
        // Memerintahkan chrome untuk membuka sebuah tab (halaman) kosong baru 
        const page = await browser.newPage();

        // 4. MEMASUKKAN KONTEN DAN MENUNGGUNYA SELESAI
        // Memasukkan teks HTML yang sudah kita modifikasi isinya tadi ke dalam tab browser kosong tersebut.
        // waitUntil: 'networkidle0' adalah perintah untuk "tunggu sampai halamannya benar-benar selesai loading" (tidak ada gambar/CSS/font yang tersendat).
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 5. MENYIAPKAN DIREKTORI (FOLDER) PENYIMPANAN
        // Menyiapkan rute folder tempat penyimpanan file PDF-nya nanti. (Di dalam folder uploads/laporan/output)
        const outputDir = path.join(__dirname, '../../uploads/laporan/output');
        
        // Mengecek apakah folder outputDir itu sudah pernah dibuat di dalam harddisk server. 
        // Jika belom ada foldernya sama sekali, buat foldernya sekarang (recursive: true akan membuatkan foldernya beserta induk-induk foldernya jika belum ada)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 6. MENENTUKAN NAMA FILE
        // Membuat nama file ini unik menggunakan stempel jumlah detik dari tahun 1970 (timestamp) agar nama PDF tidak tertukar / saling menimpa
        const timestamp = Date.now();
        
        // Membersihkan judul laporan dari karakter aneh (selain huruf dan angka alphabet) dan mengubah spasinya jadi underscore ( _ ) agar aman dilampirkan via URL
        const safeTitle = (data.judul_laporan || 'laporan').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Menggabungkan variabel di atas menjadi sebuah nama file string. Contoh: TandaTerima_laporan_bulanan_1700000000.pdf
        const filename = `TandaTerima_${safeTitle}_${timestamp}.pdf`;
        
        // Menggabungkan direktori penyimpanan folder dengan nama file agar tahu ditaruh di mana persisnya (path absolute akhir)
        const outputPath = path.join(outputDir, filename);

        // 7. MENCETAK LAMAN HTML TERSEBUT KE DALAM FORMAT PDF
        // Menyuruh browser untuk mendownload/mengekspor/nge-print (Ctrl+P) halaman tersebut menjadi bentuk .pdf fisik
        await page.pdf({
            path: outputPath, // Lokasi tempat menyimpan file PDF-nya
            format: 'A4', // Menentukan ukuran kertas (Bisa A3, Letter, dll. Di sini A4)
            landscape: false, // Posisi kertas vertikal (portrait). Jika true maka akan mendatar memanjang (landscape)
            printBackground: true, // Memastikan warna latar belakang dan css styling elemen dari HTML ikut tercetak tidak putih semua
            margin: { 
                // Mengatur jarak pinggir (margin) kertas saat di-print ke angka 0 penuh (mepet luar dalam).
                // Alasan mepet karena styling jarak putih dalam kertasnya sudah diatur sendiri oleh CSS file HTML-nya.
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        // 8. BERES-BERES SISA BROWSER
        // Terakhir, tab dan browser kita matikan. Wajib ditutup! Jika tidak, RAM server akan penuh ("memory leak") dipenuhi browser bayangan.
        await browser.close();

        // Mengembalikan HANYA JAWABAN nama file PDF-nya saja (`filename`) ke tempat fungsi controller yang membutuhkan ini
        // Nantinya nama file ini disimpan ke dalam tabel kolom database.
        return filename;

    } catch (error) {
        // Apabila ada satu baris kode tersandung sesuatu yang menyebabkan error (misal Puppeteer gagal jalan, atau izin folder bermasalah),
        // kode otomatis akan melompat ke blok catch ini (ditangkap).
        console.error('Error generating PDF:', error); // Tampilkan info error ke layar hitam terminal console Node.js
        throw error; // Lemparkan/teruskan error-nya ke luar fungsi ini agar fungsi yang memanggil (Controller-nya) tahu PDF ini gagal dibuat.
    }
};

// Mengekspor fungsi ini agar file lainnya bisa menggunakan / meng-import rutin `generateTandaTerimaPDF` ini dari file lain.
module.exports = {generateTandaTerimaPDF};