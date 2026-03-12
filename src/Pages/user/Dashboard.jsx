import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import StatsCards from "../../components/StatsCards";
import { HelpCircle, Upload, Edit, CheckCircle, XCircle, Clock, Award, AlertTriangle } from "lucide-react";
import { getUserDashboardStats, getUserActivityLog } from "../../api/laporan";

const DashboardUser = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await getUserDashboardStats();
                setStats(statsData);

                const activityData = await getUserActivityLog();
                setActivities(activityData);
            } catch (error) {
                console.error("Gagal memuat data dashboard:", error);
            }
        };

        fetchData();
    }, []);

    const getActivityIcon = (action) => {
        switch (action) {
            case 'SUBMIT': return <Upload size={18} className="text-blue-600" />;
            case 'UPDATE': return <Edit size={18} className="text-yellow-600" />;
            case 'APPROVE': return <CheckCircle size={18} className="text-green-600" />;
            case 'REJECT': return <XCircle size={18} className="text-red-600" />;
            default: return <Clock size={18} className="text-gray-600" />;
        }
    };

    const getActivityColor = (action) => {
        switch (action) {
            case 'SUBMIT': return 'bg-blue-50 border-blue-100';
            case 'UPDATE': return 'bg-yellow-50 border-yellow-100';
            case 'APPROVE': return 'bg-green-50 border-green-100';
            case 'REJECT': return 'bg-red-50 border-red-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    };

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-slate-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Dashboard User</h2>
                    <p className="text-slate-600">Selamat datang di dashboard user. Ringkasan aktivitas Anda.</p>
                </div>

                {/* Stats Cards Widget - Menggunakan komponen terpisah */}
                <StatsCards
                    total={stats.total}
                    pending={stats.pending}
                    approved={stats.approved}
                    rejected={stats.rejected}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Kinerja Pelaporan Anda</h3>

                        <div className="flex flex-col items-center justify-center gap-6 py-6">
                            {/* Score Display */}
                            <div className="flex flex-col items-center justify-center w-full max-w-xs">
                                <span className="text-gray-500 font-medium mb-2">Nilai Rata-rata Saat Ini</span>
                                <div className="text-6xl font-extrabold text-[#D4BB76] tracking-tighter">
                                    {stats.rata_rata_nilai ? stats.rata_rata_nilai.toFixed(1) : '0.0'}
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full mt-4 overflow-hidden border border-gray-200 shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.rata_rata_nilai > 2 ? 'bg-[#D4BB76]' : stats.rata_rata_nilai > 0 ? 'bg-orange-400' : 'bg-gray-300'}`}
                                        style={{ width: `${Math.min((stats.rata_rata_nilai / 3) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between w-full mt-1 px-1">
                                    <span className="text-xs font-medium text-gray-400">0.0</span>
                                    <span className="text-xs font-medium text-gray-400">Skala Maksimal 3.0</span>
                                </div>
                            </div>

                            {/* Feedback Box */}
                            <div className="w-full max-w-md mt-4">
                                {stats.rata_rata_nilai > 2 ? (
                                    <div className="bg-[#D4BB76]/10 border border-[#D4BB76]/30 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                                        <div className="p-2 bg-[#D4BB76]/20 rounded-full text-[#D4BB76] mt-1">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#b59e5d]">Kerja Bagus!</h4>
                                            <p className="text-sm text-[#8c7840] mt-1">Nilai laporan Anda di atas rata-rata (Baik). Pertahankan konsistensi, kecepatan, dan kualitas pelaporan Anda. Anda adalah inspirasi bagi rekan-rekan!</p>
                                        </div>
                                    </div>
                                ) : stats.rata_rata_nilai > 0 && stats.rata_rata_nilai <= 2 ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                                        <div className="p-2 bg-orange-100 rounded-full text-orange-600 mt-1">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-orange-800">Perlu Perhatian!</h4>
                                            <p className="text-sm text-orange-700 mt-1">Rata-rata Anda saat ini adalah {stats.rata_rata_nilai.toFixed(1)}. Angka ini berada pada batas bawah. Mohon lebih disiplin waktu atau tingkatkan kelengkapan pelaporan di masa mendatang.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                                        <p className="text-sm text-gray-500 font-medium">Belum ada laporan yang disetujui / dinilai.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 h-fit">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h3>
                            <button
                                onClick={() => navigate('/detail-aktivitas')}
                                className="text-sm text-[#D4BB76] font-medium hover:text-[#b59e5d] hover:underline cursor-pointer"
                            >
                                Lihat Semua
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className={`p-4 rounded-lg border ${getActivityColor(activity.action)} transition-all hover:shadow-sm`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm">
                                                {getActivityIcon(activity.action)}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 font-medium leading-snug">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {formatTimeAgo(activity.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm italic">Belum ada aktivitas terbaru.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarUser >
    );
};

export default DashboardUser;