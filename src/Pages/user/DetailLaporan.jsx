import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import { ArrowLeft, Calendar, MapPin, FileText, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Image as ImageIcon, Edit, MessageSquare, FileCheck, Loader2, Trash2 } from "lucide-react";
import { getDetailLaporan, deleteLaporan } from "../../api/laporan";
import { getProtectedFileReference } from "../../api/files";
import Swal from 'sweetalert2';

const DetailLaporan = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Hapus Laporan?',
            text: "Laporan yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setIsDeleting(true);
            try {
                await deleteLaporan(id);
                await Swal.fire(
                    'Terhapus!',
                    'Laporan Anda telah berhasil dihapus.',
                    'success'
                );
                navigate('/user/riwayat-laporan');
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Gagal menghapus laporan: ' + err,
                });
                setIsDeleting(false);
            }
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getDetailLaporan(id);
                setReport({
                    id: data.id,
                    title: data.judul,
                    date: new Date(data.tanggal_buat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    status: data.status,
                    wilayah: data.wilayah || '-',
                    resor: data.resor || '-',
                    type: data.jenis,
                    endDate: new Date(data.tanggal_berakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    description: data.keterangan || '-',
                    file: data.file_dokumen,
                    hardfile: data.foto_lampiran,
                    outputFile: data.file_output,
                    adminMessage: data.adminMessage
                });
            } catch (err) {
                console.error(err);
                setError('Gagal memuat detail laporan. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

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

    const handleDownload = (filename, folder = 'laporan') => {
        if (!filename) return;

        try {
            const fileUrl = getProtectedFileReference(folder, filename);
            navigate(`/preview-dokumen?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(filename)}`);
        } catch (error) {
            console.error('Preview error:', error);
            alert('Gagal membuka file. Silakan coba lagi.');
        }
    };

    if (loading) {
        return (
            <SidebarUser>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin text-green-600" size={32} />
                        <p>Memuat detail laporan...</p>
                    </div>
                </div>
            </SidebarUser>
        );
    }

    if (error || !report) {
        return (
            <SidebarUser>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="bg-red-100 text-red-600 p-4 rounded-full inline-block">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Gagal Memuat Data</h2>
                        <p className="text-gray-500 max-w-md">{error || 'Data laporan tidak ditemukan'}</p>
                        <button
                            onClick={() => navigate('/user/riwayat-laporan')}
                            className="btn btn-outline gap-2 mt-4"
                        >
                            <ArrowLeft size={18} />
                            Kembali ke Riwayat
                        </button>
                    </div>
                </div>
            </SidebarUser>
        );
    }

    return (
        <SidebarUser>
            <div className="flex flex-col gap-8 text-slate-900">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/user/riwayat-laporan')}
                        className="btn btn-circle btn-ghost btn-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Detail Laporan</h2>
                    </div>
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
                                    onClick={() => navigate(`/user/laporan/edit/${report.id}`)}
                                    // Disable only if Approved (or other final statuses if added later)
                                    disabled={!['Pending', 'Rejected'].includes(report.status)}
                                    className={`p-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-2 font-medium text-sm
                                        ${!['Pending', 'Rejected'].includes(report.status)
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm cursor-pointer'}
                                    `}
                                    title={!['Pending', 'Rejected'].includes(report.status) ? "Laporan yang disetujui tidak dapat diedit" : "Edit Laporan"}
                                >
                                    <Edit size={16} />
                                    <span className="hidden sm:inline">Edit</span>
                                </button>

                                {report.status === 'Pending' && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="p-1.5 px-3 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-sm"
                                        title="Hapus Laporan"
                                    >
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        <span className="hidden sm:inline">Hapus</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>Diajukan: {report.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Wilayah / Resor</p>
                                <div className="flex flex-col text-gray-800 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-green-600" />
                                        {report.resor}
                                    </div>
                                    <span className="text-xs text-gray-400 ml-6">{report.wilayah}</span>
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
                                <ExternalLink size={20} className="text-gray-400" />
                                Lampiran
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Document File */}
                                <div
                                    onClick={() => handleDownload(report.file)}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group cursor-pointer"
                                    title="Buka Dokumen"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors truncate" title={report.file}>
                                                {report.file}
                                            </p>
                                            <p className="text-xs text-gray-500">Document (PDF/DOCX)</p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-green-700 transition-colors">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>

                                {/* Hardfile Image */}
                                <div
                                    onClick={() => handleDownload(report.hardfile, 'buktihardfile')}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group cursor-pointer"
                                    title="Buka Bukti Foto"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors truncate" title={report.hardfile}>
                                                {report.hardfile}
                                            </p>
                                            <p className="text-xs text-gray-500">Bukti Foto (Image)</p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-green-700 transition-colors">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Message - Only show if exists */}
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
                        {report.status === 'Approved' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileCheck size={20} className="text-green-600" />
                                    Dokumen Tanda Terima Resmi
                                </h3>

                                {report.outputFile ? (
                                    <div
                                        onClick={() => handleDownload(report.outputFile, 'output')}
                                        className="flex items-center justify-between p-4 border border-green-100 bg-green-50/50 rounded-lg hover:border-green-400 hover:bg-green-100 transition-all group cursor-pointer max-w-xl"
                                        title="Buka Dokumen Keluaran"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-green-200 text-green-700 flex items-center justify-center flex-shrink-0">
                                                <FileCheck size={24} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors truncate" title={report.outputFile}>
                                                    {report.outputFile}
                                                </p>
                                                <p className="text-xs text-gray-500">Output Resmi (PDF)</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-green-700 transition-colors">
                                            <ExternalLink size={20} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 italic">
                                        Dokumen keluaran belum diunggah oleh admin.
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </SidebarUser>
    );
};

export default DetailLaporan;
