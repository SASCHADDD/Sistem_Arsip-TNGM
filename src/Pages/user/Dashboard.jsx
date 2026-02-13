import SidebarUser from "../../components/SidebarUser";
import StatsCards from "../../components/StatsCards";
import { HelpCircle } from "lucide-react";

// Dummy data for the pie chart
const pieData = [
    { name: 'A', value: 40, color: '#1B5E20' },
    { name: 'B', value: 30, color: '#388E3C' },
    { name: 'C', value: 20, color: '#66BB6A' },
    { name: 'D', value: 10, color: '#A5D6A7' },
];

const DashboardUser = () => {
    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-white-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Dashboard User</h2>
                    <p className="text-white-800/80">Selamat datang di dashboard user. Ringkasan aktivitas Anda.</p>
                </div>

                {/* Stats Cards Widget - Menggunakan komponen terpisah */}
                <StatsCards total={0} pending={0} approved={0} rejected={0} />

                {/* Chart Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-8">Nilai Laporan Menyeluruh</h3>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* CSS Pie Chart - Default / Empty State */}
                        <div className="relative w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                            <p className="text-xs text-gray-400">Belum ada data</p>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-4">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                    <span className="text-gray-400 text-sm">({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend Bottom centered as per mockup */}
                    <div className="flex justify-center gap-6 mt-12 text-sm text-gray-500 flex-wrap">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                <span className="font-medium text-gray-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h3>
                        <button className="text-gray-400 hover:text-green-600 transition-colors">
                            <HelpCircle size={24} className="text-gray-400 hover:text-green-600" />
                        </button>
                    </div>
                    <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">Belum ada aktivitas terbaru.</p>
                    </div>
                </div>
            </div>
        </SidebarUser>
    );
}

export default DashboardUser;