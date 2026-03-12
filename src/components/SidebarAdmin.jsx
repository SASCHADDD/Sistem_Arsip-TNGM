import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, FileText, Users, UserCheck, Menu, LogOut, Library } from 'lucide-react';
import logo from '../assets/logo-tngm.png';

const SidebarAdmin = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            navigate('/Login');
        }
    };

    return (
        <div className="drawer lg:drawer-open font-sans bg-transparent">
            {/* ... rest of the JSX ... */}
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col min-h-screen bg-gray-50">
                {/* Mobile Navbar */}
                <nav className="navbar w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 lg:hidden backdrop-blur-md">
                    <div className="flex-none">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            <Menu className="inline-block size-6 text-[#1B5E20]" />
                        </label>
                    </div>
                    <div className="flex-1 px-4 text-xl font-bold text-[#1B5E20] font-graduate">TNGM Admin</div>
                </nav>

                {/* Main Content Rendered Here */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </div>

            <div className="drawer-side z-20 shadow-xl">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div
                    className="flex min-h-full flex-col w-72 transition-all duration-300 bg-[#0F3D17] text-white border-r border-[#1B5E20]/30"
                >

                    {/* Brand Section */}
                    <div className="px-6 pt-8 pb-6 flex items-center justify-center">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md shadow-sm border border-white/20">
                            <img src={logo} alt="TNGM" className="h-12 w-auto object-contain drop-shadow-md" />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/10 mx-6 mb-6"></div>

                    {/* User Profile Section */}
                    <div className="px-6 mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <UserCheck className="text-[#D4BB76]" size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-white line-clamp-1" title={JSON.parse(localStorage.getItem('user'))?.nama || 'Admin'}>
                                {JSON.parse(localStorage.getItem('user'))?.nama || 'Admin'}
                            </p>
                            <p className="text-xs text-[#D4BB76] font-medium tracking-wide">
                                {JSON.parse(localStorage.getItem('user'))?.role === 'kepala_wilayah' ? 'Kepala Wilayah' : JSON.parse(localStorage.getItem('user'))?.role === 'admin_wilayah' ? 'Admin Wilayah' : 'Administrator'}
                            </p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <ul className="menu w-full px-4 text-base-content flex-1">
                        <MenuItem
                            path="/admin/dashboard"
                            icon={LayoutDashboard}
                            label="Dashboard"
                        />
                        {JSON.parse(localStorage.getItem('user'))?.role !== 'admin_wilayah' && (
                            <MenuItem
                                path="/admin/verifikasi-laporan"
                                icon={FileCheck}
                                label="Verifikasi Laporan"
                            />
                        )}
                        {(JSON.parse(localStorage.getItem('user'))?.role === 'admin_balai' || JSON.parse(localStorage.getItem('user'))?.role === 'admin_wilayah') && (
                            <MenuItem
                                path="/admin/manajemen-staff"
                                icon={Users}
                                label="Manajemen Staff"
                            />
                        )}
                        <MenuItem
                            path="/admin/DataLaporan"
                            icon={FileText}
                            label="Data Laporan"
                        />
                        {JSON.parse(localStorage.getItem('user'))?.role !== 'admin_wilayah' && (
                            <MenuItem
                                path="/admin/input-arsip"
                                icon={Library}
                                label="Input Arsip Lama"
                            />
                        )}
                    </ul>

                    {/* Bottom Logout */}
                    <div className="mt-auto p-4 border-t border-white/10 bg-black/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/80 rounded-lg transition-colors group"
                        >
                            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">{loading ? "Keluar..." : "Keluar"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ path, icon: IconComp, label }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const active = location.pathname === path;

    return (
        <li>
            <button
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 mb-1.5
                    ${active
                        ? 'bg-[#D4BB76]/20 text-[#D4BB76] font-semibold border border-[#D4BB76]/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
            >
                <IconComp size={20} className={active ? 'text-[#D4BB76]' : 'text-gray-400'} />
                <span className="text-sm tracking-wide">{label}</span>
            </button>
        </li>
    );
};

export default SidebarAdmin;
