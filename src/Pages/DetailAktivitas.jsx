import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, Info, CheckCircle, XCircle, Upload, Edit, HelpCircle, Activity } from "lucide-react";
import SidebarAdmin from "../components/SidebarAdmin";
import SidebarUser from "../components/SidebarUser";
import { jwtDecode } from "jwt-decode";
import { getAdminActivityLog, getUserActivityLog } from "../api/laporan";

const DetailAktivitas = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get user role safely
    const token = localStorage.getItem("token");
    let userRole = "user";
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.role;
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                let data = [];
                if (userRole === "admin_balai" || userRole === "admin" || userRole === "admin_wilayah" || userRole === "kepala_wilayah") {
                    data = await getAdminActivityLog();
                } else {
                    data = await getUserActivityLog();
                }
                setActivities(data);
            } catch (error) {
                console.error("Gagal memuat aktivitas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [userRole]);

    const getActivityIcon = (action) => {
        switch (action) {
            case 'SUBMIT': return <Upload size={18} className="text-blue-600" />;
            case 'UPDATE': return <Edit size={18} className="text-yellow-600" />;
            case 'APPROVE': return <CheckCircle size={18} className="text-green-600" />;
            case 'REJECT': return <XCircle size={18} className="text-red-600" />;
            default: return <Info size={18} className="text-gray-600" />;
        }
    };

    const getActivityColorClass = (action) => {
        switch (action) {
            case 'SUBMIT': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'UPDATE': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'APPROVE': return 'bg-green-50 border-green-200 text-green-700';
            case 'REJECT': return 'bg-red-50 border-red-200 text-red-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const groupActivitiesByDate = (logs) => {
        const grouped = {};
        logs.forEach(activity => {
            const dateObj = new Date(activity.date);
            const dateString = dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!grouped[dateString]) {
                grouped[dateString] = [];
            }
            grouped[dateString].push(activity);
        });
        return grouped;
    };

    const formatTimeOnly = (dateString) => {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const groupedActivities = groupActivitiesByDate(activities);

    const content = (
        <div className="max-w-4xl mx-auto w-full pb-10 mt-6 pl-4 md:pl-0 pr-4 md:pr-0">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                        <Activity className="text-green-600" /> Semua Aktivitas Sistem
                    </h1>
                    <p className="text-slate-600 mt-1">Riwayat lengkap seluruh aktivitas yang tercatat dalam sistem.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
            ) : activities.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <p className="text-gray-500 italic">Belum ada catatan aktivitas.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedActivities).map(([date, logs]) => (
                        <div key={date} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-green-50/50 border-b border-gray-200 px-6 py-3">
                                <h3 className="font-bold text-green-800">{date}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {logs.map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors flex gap-4 items-start">
                                        <div className={`p-2 rounded-full shadow-sm border ${getActivityColorClass(activity.action).split(' ')[0]} ${getActivityColorClass(activity.action).split(' ')[1]}`}>
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm text-gray-800 font-semibold cursor-default">
                                                    {activity.action === "UPDATE" && !activity.report_title ? "Sistem / Admin" : activity.actor} <span className="font-normal text-gray-500">({activity.is_admin ? 'Admin' : 'Staff'})</span>
                                                </p>
                                                <div className="flex items-center gap-1.5 text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    <Clock size={12} />
                                                    {formatTimeOnly(activity.date)}
                                                </div>
                                            </div>

                                            {activity.report_title && (
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Modul: {activity.report_title}
                                                </p>
                                            )}

                                            <p className="text-gray-600 text-sm leading-relaxed mt-1">
                                                {activity.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (userRole === "admin_balai" || userRole === "admin" || userRole === "admin_wilayah" || userRole === "kepala_wilayah") {
        return <SidebarAdmin>{content}</SidebarAdmin>;
    } else {
        return <SidebarUser>{content}</SidebarUser>;
    }
};

export default DetailAktivitas;
