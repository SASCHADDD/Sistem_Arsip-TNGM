import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const StatsCards = ({
    total = 0,
    pending = 0,
    approved = 0,
    rejected = 0
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Laporan */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-700">
                    <FileText size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium">Total Laporan</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{total}</h3>
            </div>

            {/* Menunggu Verifikasi */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-yellow-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-yellow-600">
                    <Clock size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium">Menunggu Verifikasi</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{pending}</h3>
                <button className="flex items-center gap-1 text-xs text-green-700 font-bold mt-3 hover:underline">
                    Lihat laporan <ArrowRight size={12} />
                </button>
            </div>

            {/* Disetujui */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium">Disetujui</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{approved}</h3>
            </div>

            {/* Ditolak */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-red-500">
                    <XCircle size={24} />
                </div>
                <p className="text-gray-500 text-sm font-medium">Ditolak</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{rejected}</h3>
            </div>
        </div>
    );
};

export default StatsCards;
