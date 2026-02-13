import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import { Edit } from "lucide-react";

const RiwayatLaporan = () => {
    const navigate = useNavigate();
    // Dummy Data for Reports
    const [reports] = useState([
        {
            id: 1,
            title: "Laporan Kebakaran Hutan di Lereng Selatan",
            date: "10 Oktober 2023",
            status: "Pending",
            wilayah: "Sleman",
            type: "Kejadian",
            description: "Terjadi kebakaran kecil di area lereng selatan akibat sisa api unggun yang ditinggalkan pendaki."
        },
        {
            id: 2,
            title: "Monitoring Satwa Liar Elang Jawa",
            date: "05 Oktober 2023",
            status: "Approved",
            wilayah: "Magelang",
            type: "Pengawasan",
            description: "Terpantau sepasang Elang Jawa di area pos pengamatan 3."
        },
        {
            id: 3,
            title: "Kerusakan Pagar Pembatas Jalur Pendakian",
            date: "01 Oktober 2023",
            status: "Rejected",
            wilayah: "Klaten",
            type: "Kejadian",
            description: "Pagar pembatas di jalur pendakian via Deles Indah mengalami kerusakan parah."
        }
    ]);

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-white-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Riwayat Laporan</h2>
                    <p className="text-white-800/80">Lihat riwayat laporan yang telah Anda ajukan.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Laporan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400 italic">
                                        Belum ada laporan yang diajukan.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer flex items-center gap-3">
                                            <button
                                                onClick={() => navigate(`/user/detail-laporan/${report.id}`)}
                                                className="hover:text-blue-800 transition-colors font-medium cursor-pointer"
                                            >
                                                Lihat Detail
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    alert("Fitur edit akan segera hadir");
                                                }}
                                                disabled={report.status === 'Approved'}
                                                className={`flex items-center gap-1 transition-colors
                                                    ${report.status === 'Approved'
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-orange-600 hover:text-orange-800 cursor-pointer'}
                                                `}
                                                title={report.status === 'Approved' ? "Laporan yang disetujui tidak dapat diedit" : "Edit Laporan"}
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SidebarUser>
    );
};

export default RiwayatLaporan;