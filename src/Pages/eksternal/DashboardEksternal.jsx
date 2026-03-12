import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import { getRiwayatEksternal, getESertifikatUrl } from '../../api/eksternal';
import {
    LogOut, FileText, Clock, CheckCircle, XCircle,
    Download, Award, Send, RefreshCw, User, Building
} from 'lucide-react';
import Swal from 'sweetalert2';

const DashboardEksternal = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('eksternal_user') || '{}');
    const token = localStorage.getItem('eksternal_token');
    const isMitra = user.role === 'mitra';

    useEffect(() => {
        if (!token) {
            navigate(isMitra ? '/mitra/login' : '/eksternal/login');
            return;
        }
        fetchRiwayat();
    }, []);

    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const data = await getRiwayatEksternal(token);
            setReports(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Keluar?',
            text: 'Anda akan keluar dari sesi ini.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1B5E20',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }).then(result => {
            if (result.isConfirmed) {
                localStorage.removeItem('eksternal_token');
                localStorage.removeItem('eksternal_user');
                navigate('/');
            }
        });
    };

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'Pending').length,
        approved: reports.filter(r => r.status === 'Approved').length,
        rejected: reports.filter(r => r.status === 'Rejected').length,
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle size={12} /> Disetujui
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <XCircle size={12} /> Ditolak
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} /> Menunggu
                    </span>
                );
        }
    };

    const accentColor = isMitra ? 'purple' : 'green';
    const accentHex = isMitra ? '#7c3aed' : '#15803d';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Dashboard {isMitra ? 'Mitra' : 'Eksternal'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Pantau status laporan yang telah Anda kirim.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                style={{ background: accentHex }}>
                                {user.nama?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                                <p className="text-xs text-gray-500">{user.instansi || user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Keluar
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Laporan', value: stats.total, icon: FileText, color: 'blue' },
                        { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'yellow' },
                        { label: 'Disetujui', value: stats.approved, icon: CheckCircle, color: 'green' },
                        { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: 'red' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <s.icon size={16} className={`text-${s.color}-500`} />
                                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            </div>
                            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* E-Sertifikat Banner jika ada yang approved */}
                {stats.approved > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Award size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-amber-800">E-Sertifikat Tersedia!</p>
                            <p className="text-sm text-amber-700">
                                {stats.approved} laporan Anda telah disetujui. Unduh E-Sertifikat digital di tabel di bawah ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Report Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Riwayat Laporan</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchRiwayat}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                            >
                                <RefreshCw size={14} />
                                Refresh
                            </button>
                            <Link
                                to={isMitra ? '/mitra/Mitra' : '/eksternal/Eksternal'}
                                className="flex items-center gap-1.5 text-sm text-white px-4 py-1.5 rounded-lg transition-colors"
                                style={{ background: accentHex }}
                            >
                                <Send size={14} />
                                Kirim Laporan Baru
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-5 py-3 font-semibold">Judul Laporan</th>
                                    <th className="px-5 py-3 font-semibold">Jenis</th>
                                    <th className="px-5 py-3 font-semibold">Tanggal Kirim</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-center">E-Sertifikat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="loading loading-spinner loading-md text-gray-300" />
                                                <span className="text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText size={48} className="text-gray-200" />
                                                <p className="text-gray-400 font-medium">Belum ada laporan yang dikirim</p>
                                                <Link
                                                    to={isMitra ? '/mitra/Mitra' : '/eksternal/Eksternal'}
                                                    className="text-sm px-4 py-2 rounded-lg text-white transition-colors"
                                                    style={{ background: accentHex }}
                                                >
                                                    Kirim Laporan Pertama
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-800 line-clamp-2">{r.judul}</p>
                                                {r.catatan && r.status === 'Rejected' && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Catatan: {r.catatan}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-gray-500">{r.jenis || '-'}</td>
                                            <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(r.tanggal).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-5 py-4">
                                                {getStatusBadge(r.status)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {r.file_sertifikat ? (
                                                    <a
                                                        href={getESertifikatUrl(r.file_sertifikat)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                                                    >
                                                        <Download size={13} />
                                                        Unduh
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DashboardEksternal;
