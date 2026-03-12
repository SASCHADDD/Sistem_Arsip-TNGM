import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import { Edit } from "lucide-react";
import { getRiwayatLaporan } from "../../api/laporan";

const RiwayatLaporan = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-slate-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Riwayat Laporan</h2>
                    <p className="text-slate-600">Lihat riwayat laporan yang telah Anda ajukan.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Laporan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wilayah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penilaian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : (!reports || reports.length === 0) ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400 italic">
                                        Belum ada laporan yang diajukan.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 overflow-hidden text-ellipsis max-w-xs">{report.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.wilayah}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                {report.penilaian === 'Baik' && <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">Baik</span>}
                                                {report.penilaian === 'Cukup' && <span className="text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-medium">Cukup</span>}
                                                {report.penilaian === 'Kurang' && <span className="text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full font-medium">Kurang</span>}
                                                {!report.penilaian && <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/user/detail-laporan/${report.id}`)}
                                                className="hover:text-blue-800 transition-colors font-medium cursor-pointer"
                                            >
                                                Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SidebarUser >
    );
};

export default RiwayatLaporan;