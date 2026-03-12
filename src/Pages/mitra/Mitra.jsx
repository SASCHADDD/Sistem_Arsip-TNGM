import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { UploadCloud, Camera, Image, FileText, Handshake, User, Building, Mail, FileCheck, List, MapPin, Send, RotateCcw, Type, LogOut, CheckCircle } from "lucide-react";
import { submitMitraReport } from "../../api/laporan";
import Swal from 'sweetalert2';


const Mitra = () => {
    const navigate = useNavigate();
    const mitraUser = JSON.parse(localStorage.getItem('eksternal_user') || 'null');
    const mitraToken = localStorage.getItem('eksternal_token');

    const [formData, setFormData] = useState({
        namaPic: mitraUser?.nama || '',
        namaMitra: mitraUser?.instansi || '',
        nomorPks: '',
        email: mitraUser?.email || '',
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auth Guard: wajib login sebelum akses form
    useEffect(() => {
        if (!mitraToken || !mitraUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Diperlukan',
                text: 'Anda harus login terlebih dahulu untuk mengirim laporan Mitra.',
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Ke Halaman Login'
            }).then(() => navigate('/mitra/login'));
        } else if (mitraUser.role !== 'mitra') {
            navigate('/eksternal/login');
        }
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file || !formData.hardfile) {
            Swal.fire({
                icon: 'warning',
                title: 'Opps...',
                text: 'Harap lampirkan dokumen laporan dan foto dokumentasi kegiatan.'
            });
            return;
        }

        setIsSubmitting(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                submitData.append(key, formData[key]);
            }
        });

        try {
            const result = await submitMitraReport(submitData);
            await Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: result.message || 'Laporan Mitra Anda telah berhasil dikirim.',
                confirmButtonColor: '#1B5E20'
            });
            navigate('/mitra/dashboard');
        } catch (error) {
            console.error('Error submitting form:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: typeof error === 'string' ? error : 'Gagal mengirim laporan. Pastikan koneksi internet Anda stabil.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">

                {/* Info Bar User Mitra */}
                {mitraUser && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-purple-900 text-sm">Login sebagai: {mitraUser.nama}</p>
                                <p className="text-purple-700 text-xs">{mitraUser.instansi} · {mitraUser.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to="/mitra/dashboard"
                                className="flex items-center gap-1.5 px-4 py-2 border border-purple-600 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                Riwayat Laporan
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('eksternal_token');
                                    localStorage.removeItem('eksternal_user');
                                    navigate('/mitra/login');
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={14} />
                                Keluar
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <Handshake size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Form Laporan Mitra</h1>
                        </div>
                        <p className="text-gray-500">Form khusus untuk mitra kerja TNGM dalam menyampaikan laporan kegiatan atau kerjasama.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Section 1: Data Mitra */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-green-600 pl-3">Data Mitra</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User size={16} className="text-green-700" />
                                        Nama PIC (Person in Charge) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="namaPic"
                                        value={formData.namaPic}
                                        onChange={handleChange}
                                        placeholder="Nama lengkap penanggung jawab"
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Building size={16} className="text-green-700" />
                                        Nama Mitra / Instansi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="namaMitra"
                                        value={formData.namaMitra}
                                        onChange={handleChange}
                                        placeholder="Nama lembaga mitra"
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <FileCheck size={16} className="text-green-700" />
                                        Nomor PKS / MOU (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        name="nomorPks"
                                        value={formData.nomorPks}
                                        onChange={handleChange}
                                        placeholder="Nomor Perjanjian Kerjasama"
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail size={16} className="text-green-700" />
                                        Email / Kontak PIC <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email atau nomor telepon aktif"
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
                                    Judul Kegiatan / Laporan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={formData.judul}
                                    onChange={handleChange}
                                    placeholder="Judul kegiatan yang dilaporkan"
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
                                        <option value="Laporan Bulanan" className="text-gray-900 bg-white">Laporan Bulanan</option>
                                        <option value="Laporan Triwulan" className="text-gray-900 bg-white">Laporan Triwulan</option>
                                        <option value="Laporan Tahunan" className="text-gray-900 bg-white">Laporan Tahunan</option>
                                        <option value="Laporan Insidental" className="text-gray-900 bg-white">Laporan Insidental / Kejadian</option>
                                        <option value="Evaluasi Kerjasama" className="text-gray-900 bg-white">Evaluasi Kerjasama</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin size={16} className="text-green-700" />
                                        Wilayah Kegiatan <span className="text-red-500">*</span>
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
                                        <option value="Lintas Wilayah" className="text-gray-900 bg-white">Lintas Wilayah</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Upload Sections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Upload File Area (PDF/DOCX) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-green-700" />
                                    Upload Dokumen Laporan <span className="text-red-500">*</span>
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
                                                <p className="font-medium text-gray-700">Klik untuk upload laporan</p>
                                                <p className="text-xs text-gray-500 mt-1">atau drag & drop dokumen di sini</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                                PDF, DOC, DOCX (Max 2MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Upload Hardfile (Photo) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Camera size={16} className="text-green-700" />
                                    Dokumentasi Kegiatan (Opsional)
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
                                                Format: JPG, PNG, JPEG (Max 2MB)
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
                                Ringkasan Kegiatan / Keterangan
                            </label>
                            <textarea
                                name="keterangan"
                                value={formData.keterangan}
                                onChange={handleChange}
                                placeholder="Ringkasan singkat mengenai kegiatan yang dilaporkan..."
                                className="textarea textarea-bordered w-full h-32 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 resize-none text-gray-900 placeholder-gray-400"
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className="btn btn-ghost text-gray-500 hover:text-gray-700 hover:bg-gray-100 gap-2 font-normal"
                            >
                                <RotateCcw size={18} />
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn bg-[#1B5E20] hover:bg-[#154a19] text-white border-none gap-2 px-8 shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Kirim Laporan Mitra
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Mitra;
