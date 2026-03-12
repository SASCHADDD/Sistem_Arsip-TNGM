import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import { ArrowLeft, Calendar, MapPin, FileText, CheckCircle, XCircle, AlertCircle, ExternalLink, Image as ImageIcon, MessageSquare, Loader2, Building, Mail } from "lucide-react";
import { getDetailLaporan, verifyLaporan } from "../../api/laporan";
import Swal from 'sweetalert2';

const DetailLaporanAdmin = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const source = searchParams.get('source') || 'internal'; // 'internal' | 'eksternal' | 'mitra'

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const data = await getDetailLaporan(id, source);
            setReport({
                id: data.id,
                title: data.judul,
                date: new Date(data.tanggal_buat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                status: data.status,
                wilayah: data.wilayah || '-',
                resor: data.resor || '-',
                instansi: data.instansi || null,
                email: data.email || null,
                tipe: data.tipe || null,
                type: data.jenis,
                endDate: data.tanggal_berakhir ? new Date(data.tanggal_berakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
                description: data.keterangan || '-',
                file: data.file_dokumen,
                hardfile: data.foto_lampiran,
                outputFile: data.file_output,
                is_mutasi: data.is_mutasi,
                pelapor: data.pelapor,
                adminMessage: data.adminMessage
            });
        } catch (err) {
            console.error(err);
            setError('Gagal memuat detail laporan. ' + (err.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const handleApprove = async () => {
        const result = await Swal.fire({
            title: 'Setujui Laporan?',
            text: `Anda akan menyetujui laporan ini.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Setujui!'
        });

        if (result.isConfirmed) {
            try {
                await verifyLaporan(id, 'Approved', null, source);
                await Swal.fire('Berhasil!', 'Laporan telah disetujui.', 'success');
                fetchDetail();
            } catch (error) {
                Swal.fire('Gagal', error, 'error');
            }
        }
    };

    const handleReject = async () => {
        const { value: catatan } = await Swal.fire({
            title: 'Tolak Laporan?',
            input: 'textarea',
            inputLabel: `Alasan penolakan`,
            inputPlaceholder: 'Tulis alasan penolakan...',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Tolak Laporan',
            inputValidator: (value) => {
                if (!value) {
                    return 'Anda harus menuliskan alasan penolakan!';
                }
            }
        });

        if (catatan) {
            try {
                await verifyLaporan(id, 'Rejected', catatan, source);
                await Swal.fire('Ditolak!', 'Laporan telah ditolak.', 'success');
                fetchDetail();
            } catch (error) {
                Swal.fire('Gagal', error, 'error');
            }
        }
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
            case 'Pending': return <AlertCircle size={16} className="mr-1.5" />;
            case 'Rejected': return <XCircle size={16} className="mr-1.5" />;
            default: return <AlertCircle size={16} className="mr-1.5" />;
        }
    };

    const handleDownload = (filename, folder = 'laporan') => {
        if (!filename) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL
                ? import.meta.env.VITE_API_URL.replace('/api', '')
                : 'http://localhost:3000';

            const fileUrl = `${baseUrl}/uploads/${folder}/${filename}`;
            window.open(fileUrl, '_blank');
        } catch (error) {
            console.error('Preview error:', error);
            alert('Gagal membuka file.');
        }
    };

    if (loading) {
        return (
            <SidebarAdmin>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="animate-spin text-green-600" size={32} />
                </div>
            </SidebarAdmin>
        );
    }

    if (error || !report) {
        return (
            <SidebarAdmin>
                <div className="flex h-[80vh] items-center justify-center text-center">
                    <div>
                        <p className="text-red-500 mb-4">{error || 'Data tidak ditemukan'}</p>
                        <button onClick={() => navigate('/admin/verifikasi-laporan')} className="btn btn-outline">
                            Kembali
                        </button>
                    </div>
                </div>
            </SidebarAdmin>
        );
    }

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 text-slate-900">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/verifikasi-laporan')}
                        className="btn btn-circle btn-ghost btn-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Detail Verifikasi</h2>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {source !== 'internal' && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
                                            ${source === 'mitra' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                                            {source === 'mitra' ? 'Mitra' : 'Eksternal'}
                                        </span>
                                    )}
                                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                        {report.title}
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    Diajukan oleh: <span className="font-semibold">{report.pelapor || '-'}</span>
                                    {report.is_mutasi && (
                                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                                            Telah Dimutasi
                                        </span>
                                    )}
                                </p>
                                {/* Info tambahan untuk laporan eksternal/mitra */}
                                {source !== 'internal' && (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {report.instansi && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Building size={13} /> {report.instansi}
                                            </span>
                                        )}
                                        {report.email && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail size={13} /> {report.email}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center border ${getStatusColor(report.status)}`}>
                                    {getStatusIcon(report.status)}
                                    {report.status}
                                </span>

                                {report.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={handleApprove}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Setujui
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
                                        >
                                            <XCircle size={16} /> Tolak
                                        </button>
                                    </>
                                )}
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
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors truncate">
                                                {report.file}
                                            </p>
                                            <p className="text-xs text-gray-500">Document (PDF/DOCX)</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={20} className="text-gray-400 group-hover:text-green-700" />
                                </div>

                                {/* Hardfile Image */}
                                <div
                                    onClick={() => handleDownload(report.hardfile)}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-gray-800 group-hover:text-green-800 transition-colors truncate">
                                                {report.hardfile}
                                            </p>
                                            <p className="text-xs text-gray-500">Bukti Foto (Image)</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={20} className="text-gray-400 group-hover:text-green-700" />
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
                                    <CheckCircle size={20} className="text-green-600" />
                                    Dokumen Keluaran
                                </h3>

                                {report.outputFile ? (
                                    <div
                                        onClick={() => handleDownload(report.outputFile, 'laporan/output')}
                                        className="flex items-center justify-between p-4 border border-green-100 bg-green-50/50 rounded-lg hover:border-green-400 hover:bg-green-100 transition-all group cursor-pointer max-w-xl"
                                        title="Buka Dokumen Keluaran"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-green-200 text-green-700 flex items-center justify-center flex-shrink-0">
                                                <FileText size={24} />
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
                                        Dokumen keluaran belum diunggah.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarAdmin>
    );
};

export default DetailLaporanAdmin;
