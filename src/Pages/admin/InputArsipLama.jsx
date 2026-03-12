import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { Save, Calendar, MapPin, FileText, UploadCloud, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';
import { getFormOptions } from '../../api/laporan';

const InputArsipLama = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState({ kategori: [], wilayah: [], resor: [] });

    const [formData, setFormData] = useState({
        judul_laporan: '',
        kategori_id: '',
        tanggal_asli: '',
        wilayah_id: '',
        resor_id: '',
        keterangan: '',
        file_dokumen: null,
        file_lampiran: null
    });

    useEffect(() => {
        const fetchOptions = async () => {
            const data = await getFormOptions();
            if (data) setOptions(data);
        };
        fetchOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Jika wilayah berubah, reset pilihan resor
            if (name === 'wilayah_id') {
                newData.resor_id = '';
            }
            return newData;
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                submitData.append(key, formData[key]);
            }
        });

        try {
            const response = await api.post('/laporan/admin/input-arsip', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201 || response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data arsip lama berhasil disimpan.'
                }).then(() => {
                    navigate('/admin/DataLaporan');
                });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan arsip', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 text-slate-900">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Input Arsip Laporan Lama</h2>
                        <p className="text-white/80">
                            Masukkan data historis laporan. File PDF maupun lampiran lain bersifat opsional dan dapat disusulkan nanti.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Judul Laporan */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-green-700" />
                                    Judul Laporan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="judul_laporan"
                                    value={formData.judul_laporan}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan judul laporan historis yang jelas"
                                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                    required
                                />
                            </div>

                            {/* Kategori Laporan */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} className="text-green-700" />
                                    Kategori Laporan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="kategori_id"
                                    value={formData.kategori_id}
                                    onChange={handleInputChange}
                                    required
                                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                >
                                    <option value="" disabled className="text-gray-900 bg-white">Pilih Kategori</option>
                                    {options.kategori.map(k => (
                                        <option key={k.id} value={k.id} className="text-gray-900 bg-white">{k.nama_kategori}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tanggal Kejadian Asli */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} className="text-green-700" />
                                    Tanggal Berakhirnya Kegiatan  <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="tanggal_asli"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formData.tanggal_asli}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    onChange={handleInputChange}
                                    required
                                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            {/* Wilayah */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin size={16} className="text-green-700" />
                                    Seksi Wilayah (SPTN) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="wilayah_id"
                                    value={formData.wilayah_id}
                                    onChange={handleInputChange}
                                    required
                                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                >
                                    <option value="" disabled className="text-gray-900 bg-white">Pilih Wilayah</option>
                                    {options.wilayah.map(w => (
                                        <option key={w.id} value={String(w.id)} className="text-gray-900 bg-white">{w.nama}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Resor */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin size={16} className="text-green-700" />
                                    Resor
                                </label>
                                <select
                                    name="resor_id"
                                    value={formData.resor_id}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-900"
                                >
                                    <option value="" disabled className="text-gray-900 bg-white">Pilih Resor (Opsional)</option>
                                    {options.resor
                                        .filter(r => formData.wilayah_id ? r.wilayah_id.toString() === formData.wilayah_id.toString() : true)
                                        .map(r => (
                                            <option key={r.id} value={String(r.id)} className="text-gray-900 bg-white">{r.nama}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        {/* File Upload (Optional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            {/* Dokumen Utama */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-green-700" />
                                    Dokumen Utama (PDF) (Max 2MB)
                                </label>
                                <input
                                    type="file"
                                    name="file_dokumen"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="file-input file-input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-500"
                                />
                            </div>

                            {/* Foto Lampiran */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-green-700" />
                                    File Lampiran/Foto (PDF/ZIP/IMG) (Max 2MB)
                                </label>
                                <input
                                    type="file"
                                    name="file_lampiran"
                                    accept=".pdf,.zip,.rar,image/*"
                                    onChange={handleFileChange}
                                    className="file-input file-input-bordered w-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-gray-500"
                                />
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div className="space-y-2 pt-6">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText size={16} className="text-green-700" />
                                Keterangan Tambahan / Catatan Historis
                            </label>
                            <textarea
                                name="keterangan"
                                value={formData.keterangan}
                                onChange={handleInputChange}
                                placeholder="Tambahkan catatan jika diperlukan..."
                                className="textarea textarea-bordered w-full h-32 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 resize-none text-gray-900 placeholder-gray-400"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex items-center justify-end border-t border-gray-100 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn bg-[#1B5E20] hover:bg-[#154a19] text-white border-none gap-2 px-8 shadow-sm hover:shadow transition-all disabled:bg-gray-400"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isLoading ? 'Menyimpan...' : 'Simpan Data Arsip'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarAdmin>
    );
};

export default InputArsipLama;
