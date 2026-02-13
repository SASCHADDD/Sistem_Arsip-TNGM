import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, FileText, Users, Menu, LogOut } from 'lucide-react';
import logo from '../assets/logo-tngm.png';

const SidebarAdmin = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/Login');
        }, 500);
    };

    return (
        <div className="drawer lg:drawer-open font-sans bg-transparent">
            {/* ... rest of the JSX ... */}
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col min-h-screen">
                {/* Mobile Navbar */}
                <nav className="navbar w-full bg-white/10 border-b border-white/10 shadow-sm sticky top-0 z-10 lg:hidden backdrop-blur-md">
                    <div className="flex-none">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            <Menu className="inline-block size-6 text-green-900" />
                        </label>
                    </div>
                    <div className="flex-1 px-4 text-xl font-bold text-green-900 font-graduate">TNGM Admin</div>
                </nav>

                {/* Main Content Rendered Here */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </div>

            <div className="drawer-side z-20">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div
                    className="flex min-h-full flex-col text-green-900 w-72 transition-all duration-300"
                    style={{
                        background: 'linear-gradient(178deg, rgba(212, 187, 118, 1) 0%, rgba(242, 220, 172, 1) 100%)'
                    }}
                >

                    {/* Brand Section */}
                    <div className="px-6 pt-8 pb-6 flex items-center justify-center">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                            <img src={logo} alt="TNGM" className="h-12 w-auto object-contain" />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-green-900/20 mx-6 mb-6"></div>

                    {/* User Profile Section */}
                    <div className="px-6 mb-8">
                        <p className="font-semibold text-green-900 line-clamp-1" title={JSON.parse(localStorage.getItem('user'))?.nama || 'Admin Balai'}>
                            {JSON.parse(localStorage.getItem('user'))?.nama || 'Admin Balai'}
                        </p>
                        <p className="text-xs text-green-800">Administrator</p>
                    </div>

                    {/* Menu Items */}
                    <ul className="menu w-full px-4 text-base-content">
                        <MenuItem
                            path="/admin/dashboard"
                            icon={LayoutDashboard}
                            label="Dashboard"
                        />
                        <MenuItem
                            path="/admin/verifikasi-laporan"
                            icon={FileCheck}
                            label="Verifikasi Laporan"
                        />
                        <MenuItem
                            path="/admin/manajemen-akun"
                            icon={Users}
                            label="Manajemen Akun"
                        />
                        <MenuItem
                            path="/admin/DataLaporan"
                            icon={FileText}
                            label="Data Laporan"
                        />
                    </ul>

                    {/* Bottom Logout */}
                    <div className="mt-auto p-4 border-t border-green-900/20">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-700 hover:text-red-900 hover:bg-red-100/50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1
                    ${active
                        ? 'bg-[#1B5E20] text-white font-medium shadow-sm'
                        : 'text-green-900 hover:bg-[#1B5E20]/10 hover:text-green-950'
                    }`}
            >
                <IconComp size={20} />
                <span className="text-sm">{label}</span>
            </button>
        </li>
    );
};

export default SidebarAdmin;
