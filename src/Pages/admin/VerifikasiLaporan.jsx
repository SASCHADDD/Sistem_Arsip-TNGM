import SidebarAdmin from '../../components/SidebarAdmin';
import { Search, Filter, Download, MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';

const VerifikasiLaporan = () => {
    // Dummy Data for Verification Table
    const verificationData = [
        { id: 1, date: '2023-10-25', title: 'Laporan Kegiatan Patroli Rutin', type: 'Kegiatan', region: 'Sleman', status: 'Menunggu' },
        { id: 2, date: '2023-10-24', title: 'Permohonan Izin Penelitian Flora', type: 'Penelitian', region: 'Magelang', status: 'Disetujui' },
        { id: 3, date: '2023-10-23', title: 'Laporan Kerusakan Fasilitas Pos 2', type: 'Kejadian', region: 'Klaten', status: 'Ditolak' },
        { id: 4, date: '2023-10-22', title: 'Pengajuan Kerjasama Penanaman Pohon', type: 'Kerjasama', region: 'Boyolali', status: 'Menunggu' },
        { id: 5, date: '2023-10-21', title: 'Laporan Bulanan Mitra', type: 'Laporan Bulanan', region: 'Lintas Wilayah', status: 'Disetujui' },
    ];

    const stats = {
        total: 5,
        approved: 2,
        pending: 2,
        rejected: 1
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Disetujui':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Disetujui</span>;
            case 'Menunggu':
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><MoreVertical size={12} /> Menunggu</span>;
            case 'Ditolak':
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
                    <h2 className="text-2xl font-bold text-white-900">Verifikasi Laporan</h2>
                    <p className="text-white-500 text-sm">Kelola dan verifikasi laporan masuk dari pengguna, eksternal, dan mitra.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-sm font-medium">Total Masuk</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-sm font-medium">Menunggu Verifikasi</p>
                        <h3 className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-sm font-medium">Telah Disetujui</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</h3>
                    </div>
                </div>

                {/* Controls Section (Search, Filters, Export) */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari Judul atau Pengaju"
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 text-sm"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all whitespace-nowrap">
                            <Filter size={16} />
                            Status
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all whitespace-nowrap">
                            <Filter size={16} />
                            Wilayah
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-all whitespace-nowrap">
                            <Download size={16} />
                            Export Data
                        </button>
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
                                    <th className="p-4 font-semibold">Jenis</th>
                                    <th className="p-4 font-semibold">Wilayah</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {verificationData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                        <td className="p-4 whitespace-nowrap text-gray-500">{item.date}</td>
                                        <td className="p-4 font-medium text-gray-900">{item.title}</td>
                                        <td className="p-4">{item.type}</td>
                                        <td className="p-4">{item.region}</td>
                                        <td className="p-4">{getStatusBadge(item.status)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Lihat Detail">
                                                    <Eye size={16} />
                                                </button>
                                                {/* Additional actions like Verify/Reject could go here */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                        <span>Menampilkan 1-5 dari 5 data</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarAdmin>
    );
}

export default VerifikasiLaporan;
