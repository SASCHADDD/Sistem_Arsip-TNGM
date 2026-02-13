
import SidebarAdmin from '../../components/SidebarAdmin';
import StatsCards from '../../components/StatsCards';
import { HelpCircle } from 'lucide-react';

const DashboardAdmin = () => {
    // Initial Data for Charts (Placeholder)
    const pieData = [
        { name: 'Zona Inti', value: 0, color: '#1B5E20' },        // Dark Green
        { name: 'Zona Rimba', value: 0, color: '#4CAF50' },       // Medium Green
        { name: 'Zona Pemanfaatan', value: 0, color: '#81C784' }, // Light Green
    ];

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard Admin</h2>
                    <p className="text-white/70 text-sm">Monitoring dan verifikasi laporan sistem arsip TNGM</p>
                </div>

                {/* Stats Cards Widget */}
                {/* Menggunakan komponen terpisah untuk widget perhitungan */}
                <StatsCards total={0} pending={0} approved={0} rejected={0} />

                {/* Chart Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-8">Distribusi Laporan Per Wilayah</h3>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* CSS Pie Chart - Default / Empty State */}
                        <div className="relative w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center">
                            <p className="text-xs text-gray-400">Belum ada data</p>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-4">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                    <span className="text-gray-400 text-sm">({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend Bottom centered as per mockup */}
                    <div className="flex justify-center gap-6 mt-12 text-sm text-gray-500">
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
                        <button className="text-gray-400 hover:text-gray-600">
                            <HelpCircle size={24} className="bg-gray-800 text-white rounded-full p-1 w-8 h-8" />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm italic">Belum ada aktivitas terbaru.</p>
                </div>
            </div>
        </SidebarAdmin>
    );
}

export default DashboardAdmin;