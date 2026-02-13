import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { UploadCloud, Camera, Image, FileText, User, Building, Mail, MapPin, List, Calendar, Send, RotateCcw, Type } from "lucide-react";

const Eksternal = () => {
    const [formData, setFormData] = useState({
        nama: '',
        instansi: '',
        email: '',
        judul: '',
        jenis: '',
        wilayah: '',
        tanggalBerakhir: '',
        file: null,
        hardfile: null,
        keterangan: ''
    });

    const [dragActive, setDragActive] = useState(false);
    const [dragActiveHardfile, setDragActiveHardfile] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleHardfileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, hardfile: e.target.files[0] }));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
        }
    };

    const handleHardfileDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActiveHardfile(true);
        } else if (e.type === "dragleave") {
            setDragActiveHardfile(false);
        }
    };

    const handleHardfileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveHardfile(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData(prev => ({ ...prev, hardfile: e.dataTransfer.files[0] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Eksternal:", formData);
        alert("Laporan berhasil dikirim! Terima kasih atas partisipasi Anda.");
        handleReset();
    };

    const handleReset = () => {
        setFormData({
            nama: '',
            instansi: '',
            email: '',
            judul: '',
            jenis: '',
            wilayah: '',
            tanggalBerakhir: '',
            file: null,
            hardfile: null,
            keterangan: ''
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <h1 className="text-2xl font-bold text-gray-900">Form Laporan Eksternal</h1>
                        <p className="text-gray-500 mt-2">Silakan lengkapi form di bawah ini untuk mengajukan laporan atau permohonan kerjasama dari pihak eksternal.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Section 1: Data Diri / Instansi */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-green-600 pl-3">Data Pelapor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User size={16} className="text-green-700" />
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama lengkap Anda"
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Building size={16} className="text-green-700" />
                                        Asal Instansi / Organisasi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="instansi"
                                        value={formData.instansi}
                                        onChange={handleChange}
                                        placeholder="Contoh: Universitas Gadjah Mada, LSM Alam, dll."
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail size={16} className="text-green-700" />
                                        Email / Kontak <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email atau nomor telepon yang dapat dihubungi"
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Detail Laporan */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-green-600 pl-3">Detail Laporan</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-green-700" />
                                    Judul Laporan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={formData.judul}
                                    onChange={handleChange}
                                    placeholder="Contoh: Permohonan Izin Penelitian Flora..."
                                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <List size={16} className="text-green-700" />
                                        Jenis Laporan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="jenis"
                                        value={formData.jenis}
                                        onChange={handleChange}
                                        className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-900 bg-white">Pilih Jenis Laporan</option>
                                        <option value="Penelitian" className="text-gray-900 bg-white">Penelitian</option>
                                        <option value="Kerjasama" className="text-gray-900 bg-white">Kerjasama</option>
                                        <option value="Pengaduan" className="text-gray-900 bg-white">Pengaduan Masyarakat</option>
                                        <option value="Lainnya" className="text-gray-900 bg-white">Lainnya</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin size={16} className="text-green-700" />
                                        Wilayah Terkait <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="wilayah"
                                        value={formData.wilayah}
                                        onChange={handleChange}
                                        className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                        required
                                    >
                                        <option value="" disabled className="text-gray-900 bg-white">Pilih Wilayah</option>
                                        <option value="Sleman" className="text-gray-900 bg-white">Sleman</option>
                                        <option value="Magelang" className="text-gray-900 bg-white">Magelang</option>
                                        <option value="Klaten" className="text-gray-900 bg-white">Klaten</option>
                                        <option value="Boyolali" className="text-gray-900 bg-white">Boyolali</option>
                                        <option value="Kantor Balai" className="text-gray-900 bg-white">Kantor Balai (Yogyakarta)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} className="text-green-700" />
                                    Perkiraan Tanggal Berakhir (Opsional)
                                </label>
                                <input
                                    type="date"
                                    name="tanggalBerakhir"
                                    value={formData.tanggalBerakhir}
                                    onChange={handleChange}
                                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </section>

                        {/* Upload Sections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Upload File Area (PDF/DOCX) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-green-700" />
                                    Upload Dokumen (PDF/DOCX) <span className="text-red-500">*</span>
                                </label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out h-full flex flex-col justify-center
                                        ${dragActive
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}
                                    `}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />

                                    {formData.file ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{formData.file.name}</p>
                                                <p className="text-xs text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                                className="text-xs text-red-500 hover:text-red-700 underline mt-2"
                                            >
                                                Hapus file
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                                                ${dragActive ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-400"}
                                            `}>
                                                <UploadCloud size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">Klik untuk upload file</p>
                                                <p className="text-xs text-gray-500 mt-1">atau drag & drop dokumen di sini</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                                PDF, DOC, DOCX (Max 10MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Upload Hardfile (Photo) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Camera size={16} className="text-green-700" />
                                    Upload Foto Identitas / Surat <span className="text-red-500">*</span>
                                </label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out h-full flex flex-col justify-center
                                        ${dragActiveHardfile
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}
                                    `}
                                    onDragEnter={handleHardfileDrag}
                                    onDragLeave={handleHardfileDrag}
                                    onDragOver={handleHardfileDrag}
                                    onDrop={handleHardfileDrop}
                                >
                                    <input
                                        type="file"
                                        id="hardfile-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleHardfileChange}
                                    />

                                    {formData.hardfile ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <Image size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{formData.hardfile.name}</p>
                                                <p className="text-xs text-gray-500">{(formData.hardfile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, hardfile: null }))}
                                                className="text-xs text-red-500 hover:text-red-700 underline mt-2"
                                            >
                                                Hapus foto
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="hardfile-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                                                ${dragActiveHardfile ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-400"}
                                            `}>
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">Klik untuk upload foto</p>
                                                <p className="text-xs text-gray-500 mt-1">atau drag & drop foto di sini</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                                Format: JPG, PNG, JPEG (Max 5MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 pt-6">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Type size={16} className="text-green-700" />
                                Keterangan / Pesan Tambahan
                            </label>
                            <textarea
                                name="keterangan"
                                value={formData.keterangan}
                                onChange={handleChange}
                                placeholder="Tambahkan detail lain atau pesan yang ingin disampaikan..."
                                className="textarea textarea-bordered w-full h-32 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 resize-none text-gray-900 placeholder-gray-400"
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-ghost text-gray-500 hover:text-gray-700 hover:bg-gray-100 gap-2 font-normal"
                            >
                                <RotateCcw size={18} />
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                className="btn bg-[#1B5E20] hover:bg-[#154a19] text-white border-none gap-2 px-8 shadow-sm hover:shadow transition-all"
                            >
                                <Send size={18} />
                                Kirim Laporan
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Eksternal;
