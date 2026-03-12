import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { Search, Filter, Download, MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getAllPendingReports, verifyLaporan } from '../../api/laporan';
import Swal from 'sweetalert2';

const VerifikasiLaporan = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipe, setFilterTipe] = useState('');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getAllPendingReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat data laporan', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleApprove = async (id, title, source_table) => {
        const result = await Swal.fire({
            title: 'Setujui Laporan?',
            text: `Anda akan menyetujui laporan "${title}"`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Setujui!'
        });

        if (result.isConfirmed) {
            try {
                // If it's an external report, pass the source to the API
                await verifyLaporan(id, 'Approved', '', source_table);
                Swal.fire('Berhasil!', 'Laporan telah disetujui.', 'success');
                fetchReports(); // Refresh data
            } catch (error) {
                Swal.fire('Gagal', error, 'error');
            }
        }
    };

    const handleReject = async (id, title, source_table) => {
        const { value: catatan } = await Swal.fire({
            title: 'Tolak Laporan?',
            input: 'textarea',
            inputLabel: `Alasan penolakan untuk "${title}"`,
            inputPlaceholder: 'Tulis alasan penolakan...',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Tolak Laporan',
            inputValidator: (value) => {
                if (!value) {
                    return 'Anda harus menuliskan alasan penolakan!';
                }
            }
        });

        if (catatan) {
            try {
                await verifyLaporan(id, 'Rejected', catatan, source_table);
                Swal.fire('Ditolak!', 'Laporan telah ditolak.', 'success');
                fetchReports(); // Refresh data
            } catch (error) {
                Swal.fire('Gagal', error, 'error');
            }
        }
    };

    const filteredReports = reports.filter(item => {
        const matchSearch = String(item.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.pelapor || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchTipe = filterTipe ? item.tipe_laporan === filterTipe : true;
        return matchSearch && matchTipe;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Disetujui</span>;
            case 'Pending':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><MoreVertical size={12} /> Menunggu</span>;
            case 'Rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 w-fit"><XCircle size={12} /> Ditolak</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Verifikasi Laporan</h2>
                    <p className="text-slate-500 text-sm">Kelola dan verifikasi laporan masuk dari pengguna.</p>
                </div>

                {/* Summary Cards (Real Count) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-sm font-medium">Total Pending</p>
                        <h3 className="text-3xl font-bold text-blue-600 mt-2">{reports.length}</h3>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari Judul atau Pengaju"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm"
                            />
                        </div>

                        {/* Filter Tipe Laporan */}
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm appearance-none"
                                value={filterTipe}
                                onChange={(e) => setFilterTipe(e.target.value)}
                            >
                                <option value="">Semua Tipe Laporan</option>
                                <option value="Internal">Internal</option>
                                <option value="Eksternal">Eksternal</option>
                                <option value="Mitra">Mitra</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="p-4 font-semibold">Tgl Masuk</th>
                                    <th className="p-4 font-semibold">Judul Laporan</th>
                                    <th className="p-4 font-semibold">Pelapor</th>
                                    <th className="p-4 font-semibold">Jenis Laporan</th>
                                    <th className="p-4 font-semibold">Tipe</th>
                                    <th className="p-4 font-semibold">Resor</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">Memuat data...</td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">Tidak ada laporan pending.</td>
                                    </tr>
                                ) : (
                                    filteredReports.map((item) => (
                                        <tr key={`${item.source_table}-${item.id}`} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                            <td className="p-4 whitespace-nowrap text-gray-500">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">{item.judul}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span>{item.pelapor || '-'}</span>
                                                    {item.is_mutasi && (
                                                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 flex items-center w-fit px-1.5 py-0.5 rounded mt-1 border border-orange-200">
                                                            Telah Dimutasi
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">{item.jenis}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide
                                                    ${item.tipe_laporan === 'Internal' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                        item.tipe_laporan === 'Mitra' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                                            'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                                                    {item.tipe_laporan}
                                                </span>
                                            </td>
                                            <td className="p-4">{item.wilayah}</td>
                                            <td className="p-4">{getStatusBadge(item.status)}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/detail-laporan/${item.id}?source=${item.source_table}`)}
                                                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(item.id, item.judul, item.source_table)}
                                                        className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Setujui"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id, item.judul, item.source_table)}
                                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Tolak"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarAdmin>
    );
};

export default VerifikasiLaporan;
