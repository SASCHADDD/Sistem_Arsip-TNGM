import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { Search, Filter, Download, FileText, MapPin, Calendar, ChevronRight, Eye, Loader2, UploadCloud, FileDown } from 'lucide-react';
import { getAllApprovedReports, getFormOptions } from '../../api/laporan';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DataLaporan = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterResor, setFilterResor] = useState('');
    const [filterBulan, setFilterBulan] = useState('');
    const [filterTahun, setFilterTahun] = useState('');
    const [filterTipe, setFilterTipe] = useState('');
    const [optionsResor, setOptionsResor] = useState([]);

    const fetchData = async () => {
        try {
            const [dataReports, options] = await Promise.all([
                getAllApprovedReports(),
                getFormOptions()
            ]);
            setReports(dataReports);
            if (options && options.resor) {
                const user = JSON.parse(localStorage.getItem('user'));

                if (user && (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') && user.wilayah_id) {
                    const filteredResor = options.resor.filter(r => Number(r.wilayah_id) === Number(user.wilayah_id));
                    setOptionsResor(filteredResor);
                } else {
                    setOptionsResor(options.resor);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Daftar tahun dinamis (dari tahun berjalan mundur s/d 2010)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);
    const months = [
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    const filteredReports = reports.filter(report => {
        const matchSearch = String(report.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(report.pelapor || '').toLowerCase().includes(searchTerm.toLowerCase());
        const reportResor = report.resor || report.wilayah;
        const matchResor = filterResor ? reportResor === filterResor : true;
        const matchTipe = filterTipe ? report.tipe_laporan === filterTipe : true;

        let matchDate = true;
        if (filterBulan || filterTahun) {
            const reportDate = new Date(report.tanggal);
            const reportMonth = String(reportDate.getMonth() + 1).padStart(2, '0');
            const reportYear = String(reportDate.getFullYear());

            if (filterBulan && filterTahun) {
                matchDate = reportMonth === filterBulan && reportYear === filterTahun;
            } else if (filterBulan) {
                matchDate = reportMonth === filterBulan;
            } else if (filterTahun) {
                matchDate = reportYear === filterTahun;
            }
        }

        return matchSearch && matchResor && matchTipe && matchDate;
    });

    const handleDownload = async (filename, folder = 'laporan') => {
        if (!filename) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL
                ? import.meta.env.VITE_API_URL.replace('/api', '')
                : 'http://localhost:3000';
            const fileUrl = `${baseUrl}/uploads/${folder}/${filename}`;
            window.open(fileUrl, '_blank');
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const handleExportExcel = () => {
        if (filteredReports.length === 0) {
            Swal.fire('Info', 'Tidak ada data untuk diekspor', 'info');
            return;
        }

        // Transform data untuk excel agar lebih rapi
        const dataToExport = filteredReports.map(item => ({
            'ID': item.id,
            'Judul Laporan': item.judul,
            'Jenis': item.jenis,
            'Pelapor/Instansi': item.pelapor,
            'Tipe': item.tipe_laporan,
            'Resor/Wilayah': item.resor || item.wilayah,
            'Tanggal Terima': new Date(item.tanggal).toLocaleDateString('id-ID'),
            'Status': 'Disetujui',
            'Penilaian': item.penilaian || '-',
            'ID Database': `${item.source_table}-${item.id}`
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Laporan");

        // Download file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `Rekap_Laporan_TNGM_${new Date().getTime()}.xlsx`);
        
        Swal.fire('Berhasil', 'Data berhasil diekspor ke Excel', 'success');
    };

    const handleUploadSusulan = async (id, source) => {
        const { value: file } = await Swal.fire({
            title: 'Upload Dokumen Laporan',
            input: 'file',
            inputAttributes: {
                'accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'aria-label': 'Upload dokumen laporan PDF/Word Anda'
            },
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: (file) => {
                if (!file) {
                    Swal.showValidationMessage('Anda harus memilih file terlebih dahulu');
                    return false;
                }
                return file;
            }
        });

        if (file) {
            try {
                const token = localStorage.getItem('token');
                const formData = new FormData();
                // API kita mengharapkan file_dokumen atau file
                formData.append('file_dokumen', file);

                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const res = await fetch(`${baseUrl}/laporan/admin/upload-susulan/${source}/${id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || 'Gagal mengupload dokumen susulan');
                }

                Swal.fire('Berhasil!', 'Dokumen laporan telah disusulkan.', 'success');
                fetchData(); // Refresh tabel

            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 bg-gray-50 min-h-full">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold text-[#1B5E20] flex items-center gap-2">
                        <FileText className="text-green-600" />
                        Data Laporan
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Arsip semua laporan yang telah disetujui.</p>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Search & Filter Container */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari judul laporan atau pelapor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* Filter Bulan */}
                            <div className="relative w-full md:w-40">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm appearance-none"
                                    value={filterBulan}
                                    onChange={(e) => setFilterBulan(e.target.value)}
                                >
                                    <option value="">Semua Bulan</option>
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            {/* Filter Tahun */}
                            <div className="relative w-full md:w-32">
                                <select
                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm appearance-none"
                                    value={filterTahun}
                                    onChange={(e) => setFilterTahun(e.target.value)}
                                >
                                    <option value="">Tahun</option>
                                    {years.map((year) => (
                                        <option key={year} value={year.toString()}>{year}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            {/* Filter Resor */}
                            <div className="relative w-full md:w-48">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm appearance-none"
                                    value={filterResor}
                                    onChange={(e) => setFilterResor(e.target.value)}
                                >
                                    <option value="">Semua Resor</option>
                                    {optionsResor.map((resor) => (
                                        <option key={resor.id} value={resor.nama}>
                                            {resor.nama}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            {/* Filter Tipe Laporan */}
                            <div className="relative w-full md:w-40">
                                <select
                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm appearance-none"
                                    value={filterTipe}
                                    onChange={(e) => setFilterTipe(e.target.value)}
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="Internal">Internal</option>
                                    <option value="Eksternal">Eksternal</option>
                                    <option value="Mitra">Mitra</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            {/* Tombol Ekspor Excel */}
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 group shrink-0"
                            >
                                <FileDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                                Ekspor Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="p-4 font-semibold">Judul Laporan</th>
                                    <th className="p-4 font-semibold">Pelapor</th>
                                    <th className="p-4 font-semibold">Tipe</th>
                                    <th className="p-4 font-semibold">Resor</th>
                                    <th className="p-4 font-semibold">Tanggal Terima</th>
                                    <th className="p-4 font-semibold">Penilaian</th>
                                    <th className="p-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="animate-spin text-green-600" size={24} />
                                                Loading data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReports.length > 0 ? (
                                    filteredReports.map((item) => (
                                        <tr key={`${item.source_table}-${item.id}`} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 line-clamp-1">{item.judul}</p>
                                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{item.jenis}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-600 font-medium">{item.pelapor}</span>
                                                    {item.is_mutasi && (
                                                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 flex items-center w-fit px-1.5 py-0.5 rounded mt-1 border border-orange-200">
                                                            Telah Dimutasi
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide
                                                    ${item.tipe_laporan === 'Internal' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                        item.tipe_laporan === 'Mitra' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                                            'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                                                    {item.tipe_laporan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    {item.resor || item.wilayah}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    {item.penilaian === 'Baik' && <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">Baik</span>}
                                                    {item.penilaian === 'Cukup' && <span className="text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-medium">Cukup</span>}
                                                    {item.penilaian === 'Kurang' && <span className="text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full font-medium">Kurang</span>}
                                                    {!item.penilaian && <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">-</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/detail-laporan/${item.id}?source=${item.source_table}`)}
                                                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    {item.source_table === 'internal' ? (
                                                        item.file_output && (
                                                            <button
                                                                onClick={() => handleDownload(item.file_output, 'laporan/output')}
                                                                className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                                title="Download Output (Sertifikat)"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        )
                                                    ) : (
                                                        item.file_laporan && (
                                                            <button
                                                                onClick={() => handleDownload(item.file_laporan)}
                                                                className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                                                title="Download File Laporan"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-gray-500">
                                            Belum ada laporan yang disetujui.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarAdmin>
    );
};
export default DataLaporan; 