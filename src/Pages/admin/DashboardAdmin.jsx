import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import SidebarAdmin from "../../components/SidebarAdmin";
import StatsCards from "../../components/StatsCards";
import { HelpCircle, Upload, Edit, CheckCircle, XCircle, Clock, LayoutDashboard, FileText, User } from "lucide-react";
import { getAdminDashboardStats, getAdminActivityLog } from "../../api/laporan";
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
    const navigate = useNavigate();

    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        resor_stats: []
    });
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await getAdminDashboardStats(selectedMonth, selectedYear);
                setStats(statsData);

                const activityData = await getAdminActivityLog();
                setActivities(activityData);
            } catch (error) {
                console.error("Gagal memuat data dashboard admin:", error);
            }
        };

        fetchData();
        // Optional: Poll every 30 seconds for 'realtime' feel
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedMonth, selectedYear]);

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

    const renderCustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 shadow-md p-3 rounded-xl flex flex-col gap-1">
                    <p className="font-bold text-gray-800">{payload[0].name}</p>
                    <p className="text-green-700 text-sm font-medium">Nilai Rata-rata: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 text-slate-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Dashboard Administrator</h2>
                    <p className="text-slate-600">Ringkasan statistik dan aktivitas terbaru sistem.</p>
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
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Rata-Rata Nilai Pegawai per Resor</h3>
                                <p className="text-gray-500 text-sm">Melihat rata-rata penilaian laporan seluruh staf berdasarkan penempatan resor.</p>
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="select select-bordered select-sm w-full md:w-auto bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4BB76]/50 focus:border-[#D4BB76]"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">Semua Bulan</option>
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>

                                <select
                                    className="select select-bordered select-sm w-full md:w-auto bg-gray-50 border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D4BB76]/50 focus:border-[#D4BB76]"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">Semua Tahun</option>

                                    {/* Daftar tahun dinamis, ditarik mundur dari tahun sistem ini digunakan (2010) */}
                                    {Array.from(
                                        { length: new Date().getFullYear() - 2010 + 1 },
                                        (_, i) => new Date().getFullYear() - i
                                    ).map(year => (
                                        <option key={year} value={year.toString()}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[300px]">
                            {stats.resor_stats && stats.resor_stats.length > 0 ? (
                                <>
                                    {/* Responsive Recharts - BarChart */}
                                    <div className="w-full h-72 md:h-80 mt-4 pr-6">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                            <BarChart 
                                                data={stats.resor_stats.filter(r => r.value > 0)} 
                                                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6B7280', fontSize: 10 }}
                                                    dy={10}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor="end"
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                                    domain={[0, 3]}
                                                />
                                                <Tooltip content={renderCustomTooltip} cursor={{ fill: '#F3F4F6' }} />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                                    {stats.resor_stats.filter(r => r.value > 0).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Custom Legend Layout - Horizontal */}
                                    <div className="w-full flex flex-wrap justify-center gap-4 border-t border-gray-100 pt-6">
                                        {stats.resor_stats.map((item, index) => (
                                            <div key={index} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-gray-600 text-xs font-medium text-center">{item.name}</span>
                                                </div>
                                                <span className="text-[#0F3D17] font-bold bg-[#D4BB76]/20 border border-[#D4BB76]/30 px-3 py-1 rounded-full text-sm">
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Warning Section for Below-Average Resorts */}
                                    {(() => {
                                        // Only count resorts that have data (value > 0)
                                        const resorsWithData = stats.resor_stats.filter(r => r.value > 0);
                                        const totalAverages = resorsWithData.reduce((acc, curr) => acc + curr.value, 0);
                                        const globalAverage = resorsWithData.length > 0 ? totalAverages / resorsWithData.length : 0;
                                        
                                        // Underperforming are those with data BUT below average, 
                                        // OR those with 0 data (meaning they haven't submitted anything/not assessed)
                                        const underperforming = stats.resor_stats.filter(r => r.value < globalAverage || r.value === 0);

                                        if (underperforming.length > 0 && globalAverage > 0) {
                                            return (
                                                <div className="w-full mt-2 bg-orange-50/80 border border-orange-200 rounded-lg p-4 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-orange-800 font-bold">
                                                        <HelpCircle size={18} />
                                                        <span>Peringatan: Kinerja di Bawah Rata-Rata</span>
                                                    </div>
                                                    <p className="text-sm text-orange-700 mb-1">
                                                        Rata-rata dari resor yang telah dinilai adalah <strong>{globalAverage.toFixed(1)}</strong>. Berikut adalah resor dengan nilai di bawah rata-rata atau belum memiliki penilaian:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {underperforming.map((resor, idx) => (
                                                            <span key={idx} className="bg-white border border-orange-200 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded">
                                                                {resor.name} ({resor.value})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FileText size={48} className="text-gray-200 mb-4" />
                                    <p>Belum ada data laporan dari resor manapun.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 h-fit">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h3>
                            <button
                                onClick={() => navigate('/admin/detail-aktivitas')}
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
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm text-gray-800 font-medium leading-snug">
                                                        {activity.actor} <span className="font-normal text-gray-500">({activity.role})</span>
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                        {formatTimeAgo(activity.date)}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-600 mt-1 font-medium">
                                                    {activity.report_title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {activity.description}
                                                </p>
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
        </SidebarAdmin>
    );
};

export default DashboardAdmin;
