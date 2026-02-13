import { useNavigate, useParams } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import { ArrowLeft, Calendar, MapPin, FileText, Clock, CheckCircle, XCircle, AlertCircle, Download, Image as ImageIcon, Edit, MessageSquare, FileCheck } from "lucide-react";

const DetailLaporan = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Dummy Data - In a real app, fetch based on ID
    const report = {
        id: id || "1",
        title: "Laporan Kebakaran Hutan di Lereng Selatan",
        date: "10 Oktober 2023",
        status: "Pending",
        wilayah: "Sleman",
        type: "Kejadian",
        endDate: "12 Oktober 2023",
        description: "Terjadi kebakaran kecil di area lereng selatan akibat sisa api unggun yang ditinggalkan pendaki. Api berhasil dipadamkan warga sekitar, namun diperlukan pemantauan lebih lanjut untuk memastikan tidak ada titik api yang tersisa.",
        file: "laporan_kebakaran.pdf",
        hardfile: "bukti_foto.jpg",
        adminMessage: "Laporan Anda telah diterima dan sedang dalam antrian verifikasi oleh petugas lapangan kami. Mohon pantau status secara berkala."
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} className="mr-1.5" />;
            case 'Pending': return <Clock size={16} className="mr-1.5" />;
            case 'Rejected': return <XCircle size={16} className="mr-1.5" />;
            default: return <AlertCircle size={16} className="mr-1.5" />;
        }
    };

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-white-900">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Riwayat Laporan</h2>
                    <p className="text-white-800/80">Detail data laporan yang telah Anda ajukan.</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                {report.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center border ${getStatusColor(report.status)}`}>
                                    {getStatusIcon(report.status)}
                                    {report.status}
                                </span>
                                <button
                                    onClick={() => alert("Fitur edit akan segera hadir")}
                                    disabled={report.status === 'Approved'}
                                    className={`p-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium text-sm
                                        ${report.status === 'Approved'
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm cursor-pointer'}
                                    `}
                                    title={report.status === 'Approved' ? "Laporan yang disetujui tidak dapat diedit" : "Edit Laporan"}
                                >
                                    <Edit size={16} />
                                    <span className="hidden sm:inline">Edit</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>Diajukan: {report.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FileText size={16} />
                                <span>ID: #{report.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Wilayah</p>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <MapPin size={18} className="text-green-600" />
                                    {report.wilayah}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Jenis Laporan</p>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <FileText size={18} className="text-green-600" />
                                    {report.type}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Tanggal Berakhir</p>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <Calendar size={18} className="text-green-600" />
                                    {report.endDate}
                                </div>
                            </div>
                        </div>



                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <FileText size={20} className="text-gray-400" />
                                Keterangan Lengkap
                            </h3>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-line">
                                {report.description}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Download size={20} className="text-gray-400" />
                                Lampiran
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Document File */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors">{report.file}</p>
                                            <p className="text-xs text-gray-500">Document (PDF/DOCX)</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-green-700 transition-colors">
                                        <Download size={20} />
                                    </button>
                                </div>

                                {/* Hardfile Image */}
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors">{report.hardfile}</p>
                                            <p className="text-xs text-gray-500">Bukti Foto (Image)</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-green-700 transition-colors">
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin Message */}
                        {report.adminMessage && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-blue-700" />
                                    Pesan dari Admin Balai
                                </h3>
                                <p className="text-blue-800 leading-relaxed">
                                    {report.adminMessage}
                                </p>
                            </div>
                        )}

                        {/* Output Documents */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileCheck size={20} className="text-gray-400" />
                                Dokumen Keluaran
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`flex items-center justify-between p-4 border rounded-lg transition-all group
                                    ${report.status === 'Approved'
                                        ? 'border-green-200 bg-green-50 hover:shadow-sm'
                                        : 'border-gray-200 bg-gray-50 opacity-75'
                                    }
                                `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                            ${report.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}
                                        `}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className={`font-medium transition-colors
                                                ${report.status === 'Approved' ? 'text-gray-800 group-hover:text-green-800' : 'text-gray-500'}
                                            `}>Surat_Pengantar_No_123.pdf</p>
                                            <p className="text-xs text-gray-500">Surat Pengantar Resmi</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => alert("Mendownload Surat Pengantar...")}
                                        disabled={report.status !== 'Approved'}
                                        className={`p-2 rounded-full shadow-sm transition-all
                                            ${report.status === 'Approved'
                                                ? 'text-green-600 hover:text-green-800 bg-white hover:shadow'
                                                : 'text-gray-400 bg-gray-100 cursor-not-allowed shadow-none'
                                            }
                                        `}
                                        title={report.status === 'Approved' ? "Download Surat Pengantar" : "Dokumen belum tersedia (Menunggu Persetujuan)"}
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarUser>
    );
};

export default DetailLaporan;
