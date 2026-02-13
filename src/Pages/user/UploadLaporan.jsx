import { useState } from 'react';
import SidebarUser from "../../components/SidebarUser";
import { UploadCloud, FileText, MapPin, List, Type, Send, RotateCcw, Calendar, Camera, Image } from 'lucide-react';

const UploadLaporan = () => {
    const [formData, setFormData] = useState({
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

    const handleHardfileDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActiveHardfile(true);
        } else if (e.type === "dragleave") {
            setDragActiveHardfile(false);
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
        console.log('Form Data:', formData);
        alert('Laporan berhasil disubmit! (Simulasi)');
        // Reset form for demo
        handleReset();
    };

    const handleReset = () => {
        setFormData({
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
        <SidebarUser>
            <div className="flex flex-col gap-8 text-white-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Upload Laporan</h2>
                    <p className="text-white-800/80">Ajukan laporan baru untuk diverifikasi oleh admin.</p>
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

                        {/* Grid Container for Selects */}
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
                                    <option value="Kejadian" className="text-gray-900 bg-white">Laporan Kejadian</option>
                                    <option value="Kegiatan" className="text-gray-900 bg-white">Laporan Kegiatan</option>
                                    <option value="Pengawasan" className="text-gray-900 bg-white">Laporan Pengawasan</option>
                                    <option value="Lainnya" className="text-gray-900 bg-white">Lainnya</option>
                                </select>
                            </div>

                            {/* Wilayah */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin size={16} className="text-green-700" />
                                    Wilayah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="wilayah"
                                    value={formData.wilayah}
                                    onChange={handleChange}
                                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                    required
                                >
                                    <option value="" disabled className="text-gray-900 bg-white">Pilih wilayah</option>
                                    <option value="Sleman" className="text-gray-900 bg-white">Sleman</option>
                                    <option value="Bantul" className="text-gray-900 bg-white">Bantul</option>
                                    <option value="Kulon Progo" className="text-gray-900 bg-white">Kulon Progo</option>
                                    <option value="Gunung Kidul" className="text-gray-900 bg-white">Gunung Kidul</option>
                                    <option value="Kota Yogyakarta" className="text-gray-900 bg-white">Kota Yogyakarta</option>
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
                                    value={formData.tanggalBerakhir}
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
                                    Upload File (PDF/DOCX) <span className="text-red-500">*</span>
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
                                                <p className="font-medium text-gray-700">Klik untuk upload file</p>
                                                <p className="text-xs text-gray-500 mt-1">atau drag & drop file di sini</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                                Format: PDF, DOCX (Max 10MB)
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Upload Hardfile (Photo) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Camera size={16} className="text-green-700" />
                                    Upload Foto Hardfile <span className="text-red-500">*</span>
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
                                className="btn bg-[#1B5E20] hover:bg-[#154a19] text-white border-none gap-2 px-8 shadow-sm hover:shadow transition-all"
                            >
                                <Send size={18} />
                                Submit Laporan
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </SidebarUser>
    );
};

export default UploadLaporan;
