import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import { Search, FileText, MapPin, Calendar, Eye, Loader2, AlertCircle } from "lucide-react";
import { getRiwayatLaporan } from "../../api/laporan";

const RiwayatLaporan = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBulan, setFilterBulan] = useState('');
    const [filterTahun, setFilterTahun] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getRiwayatLaporan();
                if (Array.isArray(data)) {
                    setReports(data);
                } else {
                    console.error("Data riwayat bukan array:", data);
                    setReports([]);
                }
            } catch (err) {
                setError('Gagal memuat riwayat laporan');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Year options: from 2010 to current year
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
        const matchSearch = String(report.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchDate = true;
        if (filterBulan || filterTahun) {
            // Backend date format is typically DD MMMM YYYY or YYYY-MM-DD
            // But from Riwayat UI, it looks like it might be mapped already.
            // Let's look at the date string. If it's "13 Maret 2026", we need to parse it or check if backend raw data has it.
            // Usually, getRiwayatLaporan returns formatted date. 
            // In the screenshots, it's "13 Maret 2026".
            
            // To be safe and efficient, we can check for year/month substring if it's formatted.
            // Or better, if the report object carries raw date.
            
            if (filterTahun && !report.date.includes(filterTahun)) {
                matchDate = false;
            }
            
            if (filterBulan) {
                const monthLabel = months.find(m => m.value === filterBulan)?.label;
                if (monthLabel && !report.date.toLowerCase().includes(monthLabel.toLowerCase())) {
                    matchDate = false;
                }
            }
        }

        return matchSearch && matchDate;
    });

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-slate-900 bg-gray-50 min-h-full">
                <div>
                    <h2 className="text-2xl font-bold text-[#1B5E20] flex items-center gap-2">
                        <FileText className="text-green-600" />
                        Riwayat Laporan
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Daftar semua laporan yang pernah Anda ajukan ke sistem.</p>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search Bar */}
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari judul laporan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Month Filter */}
                        <select
                            value={filterBulan}
                            onChange={(e) => setFilterBulan(e.target.value)}
                            className="flex-1 md:w-40 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-700"
                        >
                            <option value="">Semua Bulan</option>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        {/* Year Filter */}
                        <select
                            value={filterTahun}
                            onChange={(e) => setFilterTahun(e.target.value)}
                            className="w-24 md:w-28 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-700"
                        >
                            <option value="">Tahun</option>
                            {years.map(y => (
                                <option key={y} value={y.toString()}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4 font-semibold">Laporan</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Penilaian</th>
                                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-green-600" size={32} />
                                                <span className="text-sm font-medium">Memuat riwayat Anda...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-red-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={32} />
                                                <span className="font-medium">{error}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                                            {searchTerm ? 'Laporan tidak ditemukan.' : 'Belum ada laporan yang diajukan.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 truncate max-w-xs md:max-w-md lg:max-w-lg mb-1" title={report.title}>
                                                            {report.title}
                                                        </p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-[11px] text-gray-500 font-medium">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {report.date}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={12} />
                                                                {report.wilayah}
                                                            </div>
                                                            {report.is_mutasi && (
                                                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-orange-200">
                                                                    Telah Dimutasi
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider
                                                    ${report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    {report.penilaian === 'Baik' && <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-bold">Baik</span>}
                                                    {report.penilaian === 'Cukup' && <span className="text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-bold">Cukup</span>}
                                                    {report.penilaian === 'Kurang' && <span className="text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full font-bold">Kurang</span>}
                                                    {!report.penilaian && <span className="text-xs text-gray-400 font-medium">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => navigate(`/user/detail-laporan/${report.id}`)}
                                                    className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SidebarUser >
    );
};

export default RiwayatLaporan;