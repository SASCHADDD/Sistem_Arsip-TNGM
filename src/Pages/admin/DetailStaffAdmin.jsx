import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import { ArrowLeft, User, MapPin, Calendar, FileText, CheckCircle, Clock, XCircle, Loader2, Award, AlertTriangle } from "lucide-react";
import { getStaffDetail } from "../../api/user";

const DetailStaffAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staffData, setStaffData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStaffDetail = async () => {
            try {
                setLoading(true);
                const data = await getStaffDetail(id);
                setStaffData(data);
            } catch (err) {
                console.error(err);
                setError("Gagal memuat detail akun staf");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffDetail();
    }, [id]);

    if (loading) {
        return (
            <SidebarAdmin>
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="flex flex-col items-center gap-4 text-green-600">
                        <Loader2 className="animate-spin" size={40} />
                        <p className="font-medium">Memuat detail profil...</p>
                    </div>
                </div>
            </SidebarAdmin>
        );
    }

    if (error || !staffData) {
        return (
            <SidebarAdmin>
                <div className="flex flex-col gap-4 text-slate-800">
                    <button onClick={() => navigate('/admin/manajemen-staff')} className="flex items-center gap-2 text-slate-500 hover:text-green-600 w-fit transition-colors mb-4">
                        <ArrowLeft size={20} /> Kembali
                    </button>
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                        <p className="font-medium text-lg">{error || "Data tidak ditemukan"}</p>
                    </div>
                </div>
            </SidebarAdmin>
        );
    }

    const { profile, stats } = staffData;

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 text-slate-800 xl:max-w-6xl mx-auto">
                {/* Header Navigation */}
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/manajemen-staff')} className="p-2 bg-white border border-gray-200 text-slate-500 hover:text-green-600 hover:border-green-200 rounded-xl transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                            Detail Staff
                        </h2>
                        <p className="text-white text-sm">
                            Tinjauan performa dan profil staf
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/5 rounded-t-3xl border-b border-green-500/10"></div>

                            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg mb-6 z-10 border border-gray-100">
                                <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold overflow-hidden text-5xl object-cover">
                                    {profile.foto ? (
                                        <img src={`http://localhost:3000/uploads/profile/${profile.foto}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile.nama.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                            <div className="z-10 w-full space-y-1 mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">{profile.nama}</h3>
                                <p className="text-slate-500 font-medium">{profile.email}</p>
                            </div>

                            <div className="w-full space-y-4 z-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-left">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Penempatan</p>
                                        <p className="font-semibold text-gray-800">{profile.wilayah}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-none p-8 rounded-3xl shadow-lg relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 text-white/5 rotate-12">
                                <FileText size={200} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-white/60 font-semibold uppercase tracking-wider text-sm mb-2">Total Laporan</h4>
                                <div className="flex items-end gap-3">
                                    <span className="text-6xl font-black text-white">{stats.total}</span>
                                    <span className="text-white/80 font-medium mb-2">Laporan Diajukan</span>
                                </div>
                            </div>
                        </div>

                        {/* Rata-Rata Nilai Card - Synced with Staff Dashboard */}
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-green-200 hover:shadow-md">
                            <div className="flex flex-col items-center justify-center shrink-0">
                                <span className="text-gray-500 font-medium mb-1 uppercase tracking-wider text-xs">Nilai Rata-rata</span>
                                <div className="text-5xl font-black text-green-600 tracking-tighter">
                                    {stats.rata_rata_nilai ? stats.rata_rata_nilai.toFixed(1) : '0.0'}
                                </div>
                                <span className="text-xs font-medium text-gray-400 mt-1">Skala 3.0</span>
                            </div>

                            <div className="flex-1 w-full">
                                {stats.rata_rata_nilai > 2 ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
                                        <div className="p-2 bg-green-100 rounded-full text-green-600 mt-1 shrink-0">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-green-800">Kerja Bagus!</h4>
                                            <p className="text-sm text-green-700 mt-1">Nilai laporan staf ini di atas rata-rata (Baik).</p>
                                        </div>
                                    </div>
                                ) : stats.rata_rata_nilai > 0 && stats.rata_rata_nilai <= 2 ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-4">
                                        <div className="p-2 bg-orange-100 rounded-full text-orange-600 mt-1 shrink-0">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-orange-800">Perlu Perhatian!</h4>
                                            <p className="text-sm text-orange-700 mt-1">Nilai staf ini berada di batas bawah. Disarankan untuk memberikan pembinaan.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center h-full">
                                        <p className="text-sm text-gray-500 font-medium w-full text-center">Belum ada laporan disetujui untuk dinilai.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Approved Card */}
                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4 group hover:border-green-200 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex justify-center items-center group-hover:scale-110 transition-transform">
                                    <CheckCircle size={24} className="stroke-[2.5px]" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Disetujui</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 leading-none">{stats.approved}</span>
                                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Card */}
                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4 group hover:border-yellow-200 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex justify-center items-center group-hover:scale-110 transition-transform">
                                    <Clock size={24} className="stroke-[2.5px]" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Pending/Proses</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 leading-none">{stats.pending}</span>
                                        <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">
                                            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rejected Card */}
                            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4 group hover:border-red-200 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex justify-center items-center group-hover:scale-110 transition-transform">
                                    <XCircle size={24} className="stroke-[2.5px]" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Ditolak</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900 leading-none">{stats.rejected}</span>
                                        <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                            {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </SidebarAdmin>
    );
};

export default DetailStaffAdmin;
