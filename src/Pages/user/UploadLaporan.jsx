import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarUser from "../../components/SidebarUser";
import { UploadCloud, FileText, MapPin, List, Type, Send, RotateCcw, Calendar, Camera, Image, ArrowLeft } from 'lucide-react';
import { submitLaporan, getFormOptions, getDetailLaporan, updateLaporan } from '../../api/laporan';
import Swal from 'sweetalert2';

const UploadLaporan = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        judul: '',
        jenis: '', // kategori_id
        tanggalBerakhir: '',
        file: null,
        hardfile: null,
        keterangan: ''
    });

    const [existingFiles, setExistingFiles] = useState({
        file: null,
        hardfile: null
    });

    const [options, setOptions] = useState({
        kategori: []
    });

    // State for loading
    const [loading, setLoading] = useState(false);

    // Drag and drop states
    const [dragActive, setDragActive] = useState(false);
    const [dragActiveHardfile, setDragActiveHardfile] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await getFormOptions();
                setOptions(data);
            } catch (err) {
                console.error('Gagal memuat opsi form:', err);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchDetail = async () => {
                try {
                    setLoading(true);
                    const data = await getDetailLaporan(id);
                    setFormData({
                        judul: data.judul,
                        jenis: data.jenis_value, // Pastikan backend kirim ini
                        tanggalBerakhir: data.tanggal_berakhir ? (() => {
                            const date = new Date(data.tanggal_berakhir);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        })() : '',
                        file: null, // Reset file input
                        hardfile: null, // Reset hardfile input
                        keterangan: data.keterangan || ''
                    });
                    setExistingFiles({
                        file: data.file_dokumen,
                        hardfile: data.foto_lampiran
                    });
                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Memuat Data',
                        text: 'Gagal memuat data laporan untuk diedit.',
                    }).then(() => {
                        navigate('/user/riwayat-laporan');
                    });
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                Swal.fire({
                    icon: 'error',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran file dokumen melebihi 2MB.',
                });
                setFormData(prev => ({ ...prev, file: null }));
                document.getElementById('file-upload').value = '';
                return;
            }
            setFormData(prev => ({ ...prev, file }));
        }
    };

    const handleHardfileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                Swal.fire({
                    icon: 'error',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran foto hardfile melebihi 2MB.',
                });
                setFormData(prev => ({ ...prev, hardfile: null }));
                document.getElementById('hardfile-upload').value = '';
                return;
            }
            setFormData(prev => ({ ...prev, hardfile: file }));
        }
    };

    // Drag and drop handlers for file
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
            const file = e.dataTransfer.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                Swal.fire({
                    icon: 'error',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran file dokumen melebihi 2MB.',
                });
                setFormData(prev => ({ ...prev, file: null }));
                return;
            }
            setFormData(prev => ({ ...prev, file }));
        }
    };

    // Drag and drop handlers for hardfile
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
            const file = e.dataTransfer.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                Swal.fire({
                    icon: 'error',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran foto hardfile melebihi 2MB.',
                });
                setFormData(prev => ({ ...prev, hardfile: null }));
                return;
            }
            setFormData(prev => ({ ...prev, hardfile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: New files needed only if not editing or explicitly changing
        if (!isEditMode && (!formData.file || !formData.hardfile)) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Mohon lengkapi semua file yang diperlukan (Dokumen & Foto Hardfile).',
            });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('judul_laporan', formData.judul);
            data.append('kategori_id', formData.jenis);
            data.append('tanggal_berakhir', formData.tanggalBerakhir);
            data.append('keterangan', formData.keterangan);

            if (formData.file) data.append('file_dokumen', formData.file);
            if (formData.hardfile) data.append('file_lampiran', formData.hardfile);

            if (isEditMode) {
                await updateLaporan(id, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Laporan berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate(`/user/detail-laporan/${id}`);
            } else {
                await submitLaporan(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Laporan berhasil disubmit! Menunggu verifikasi admin.',
                    timer: 2000,
                    showConfirmButton: false
                });
                handleReset();
                // Optional: Navigate to riwayat or stay
                // navigate('/user/riwayat-laporan');
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan laporan.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (isEditMode) {
            // Reset to initial edit state logic if needed, or just reload page
            window.location.reload();
            return;
        }
        setFormData({
            judul: '',
            jenis: '',
            tanggalBerakhir: '',
            file: null,
            hardfile: null,
            keterangan: ''
        });
        // Clear file inputs
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        const hardfileInput = document.getElementById('hardfile-upload');
        if (hardfileInput) hardfileInput.value = '';
    };

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-slate-900">
                <div className="flex items-center gap-4">
                    {isEditMode && (
                        <button
                            onClick={() => navigate(`/user/detail-laporan/${id}`)}
                            className="btn btn-circle btn-ghost btn-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{isEditMode ? 'Edit Laporan' : 'Upload Laporan'}</h2>
                        <p className="text-slate-600">
                            {isEditMode ? 'Perbarui data laporan Anda.' : 'Ajukan laporan baru untuk diverifikasi oleh admin.'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Judul Laporan */}
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
                                placeholder="Masukkan judul laporan yang jelas"
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                required
                            />
                        </div>

                        {/* Grid Container for Jenis & Tanggal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Jenis Laporan */}
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
                                    <option value="" disabled className="text-gray-900 bg-white">Pilih jenis laporan</option>
                                    {options.kategori.map(opt => (
                                        <option key={opt.id} value={opt.id} className="text-gray-900 bg-white">
                                            {opt.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tanggal Berakhir */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} className="text-green-700" />
                                    Tanggal Berakhir Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="tanggalBerakhir"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formData.tanggalBerakhir}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    onChange={handleChange}
                                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Upload Sections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Upload File Area (PDF/DOCX) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-green-700" />
                                    Upload File (PDF/DOCX) {isEditMode ? '(Opsional)' : <span className="text-red-500">*</span>}
                                </label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out h-full flex flex-col justify-center
                                        ${dragActive
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                                        }
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
                                                <p className="font-medium text-gray-700">{isEditMode && existingFiles.file ? 'Ganti file dokumen' : 'Klik untuk upload file'}</p>
                                                {isEditMode && existingFiles.file && (
                                                    <p className="text-xs text-green-600 mb-1">File saat ini: {existingFiles.file}</p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                                Format: PDF, DOCX (Max 2MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Upload Hardfile (Photo) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Camera size={16} className="text-green-700" />
                                    Upload Foto Hardfile {isEditMode ? '(Opsional)' : <span className="text-red-500">*</span>}
                                </label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out h-full flex flex-col justify-center
                                        ${dragActiveHardfile
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                                        }
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
                                                <p className="font-medium text-gray-700">{isEditMode && existingFiles.hardfile ? 'Ganti foto hardfile' : 'Klik untuk upload foto'}</p>
                                                {isEditMode && existingFiles.hardfile && (
                                                    <p className="text-xs text-green-600 mb-1">File saat ini: {existingFiles.hardfile}</p>
                                                )}
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

                        {/* Keterangan */}
                        <div className="space-y-2 pt-6">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Type size={16} className="text-green-700" />
                                Keterangan Tambahan
                            </label>
                            <textarea
                                name="keterangan"
                                value={formData.keterangan}
                                onChange={handleChange}
                                placeholder="Tambahkan catatan atau keterangan tambahan (opsional)"
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
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-[#1B5E20] hover:bg-[#154a19] text-white border-none gap-2 px-8 shadow-sm hover:shadow transition-all disabled:bg-gray-400"
                            >
                                <Send size={18} />
                                {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Submit Laporan')}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </SidebarUser>
    );
};

export default UploadLaporan;
