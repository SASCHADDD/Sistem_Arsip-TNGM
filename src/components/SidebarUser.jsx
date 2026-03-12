import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, History, Menu, LogOut, User } from 'lucide-react';
import logo from '../assets/logo-tngm.png';
import { logout } from '../api/auth';
import ProfileUploadModal from './ProfileUploadModal';
import ChangePasswordModal from './ChangePasswordModal';
import { KeyRound } from 'lucide-react';

const SidebarUser = ({ children }) => {
    const navigate = useNavigate();
    // Inisialisasi state user dari localStorage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Update user state jika ada perubahan di localStorage (opsional, tapi bagus untuk sinkronisasi)
    // useEffect(() => { ... }, []); 

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
        // localStorage sudah diupdate di modal, kita hanya perlu update state lokal untuk re-render
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            navigate('/Login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Tetap redirect ke login meskipun gagal logout di backend (untuk membersihkan state lokal)
            navigate('/Login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="drawer lg:drawer-open font-sans bg-transparent">
                {/* ... rest of the JSX ... */}
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

                <div className="drawer-content flex flex-col min-h-screen bg-slate-50">
                    {/* Mobile Navbar */}
                    <nav className="navbar w-full bg-white/10 border-b border-white/10 shadow-sm sticky top-0 z-10 lg:hidden backdrop-blur-md">
                        <div className="flex-none">
                            <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                <Menu className="inline-block size-6 text-green-900" />
                            </label>
                        </div>
                        <div className="flex-1 px-4 text-xl font-bold text-green-900 font-graduate">TNGM User</div>
                    </nav>

                    {/* Main Content Rendered Here */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {children}
                    </div>
                </div>

                <div className="drawer-side z-20">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col w-72 transition-all duration-300 bg-[#0F3D17] text-white border-r border-[#1B5E20]/30">

                        {/*Kotak putih di logo */}
                        <div className="px-6 pt-8 pb-6 flex items-center justify-center">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                                <img src={logo} alt="TNGM" className="h-20 w-auto object-contain" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 mx-6 mb-6"></div>

                        {/* User Profile Section */}
                        <div className="px-6 mb-8">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full text-left group transition-all duration-300 focus:outline-none"
                            >
                                <div className="bg-white/20 p-4 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm transform transition-all group-hover:scale-[1.02] group-hover:bg-white/30 duration-300 relative">

                                    {/* Edit indicator (tooltip style) */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/80 p-1 rounded-full text-green-900 border border-green-100 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="relative">
                                            {user?.foto ? (
                                                <img
                                                    src={user.foto}
                                                    alt="Profile"
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-white/50 shadow-sm"
                                                />
                                            ) : (
                                                <div className="p-3.5 bg-white/10 rounded-full border-2 border-[#D4BB76]/30">
                                                    <User className="w-6 h-6 text-[#D4BB76]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-bold text-white leading-tight truncate mb-1"
                                                title={user?.nama || 'Pegawai TNGM'}>
                                                {user?.nama || 'Pegawai TNGM'}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4BB76]/20 text-[#D4BB76] uppercase tracking-wider border border-[#D4BB76]/30">
                                                {user?.role === 'staff' ? 'Staff' : 'Staff'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4BB76]"></div>
                                            <p className="text-xs font-semibold text-[#D4BB76] truncate">
                                                {user?.wilayah || 'Kantor Balai TNGM'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4BB76]/60"></div>
                                            <p className="text-xs font-medium text-[#D4BB76]/80 truncate" >
                                                {user?.resor || 'Pusat (Non-Resor)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Menu Items */}
                        <ul className="menu w-full px-4 text-base-content">
                            <MenuItem
                                path="/user/dashboard"
                                icon={LayoutDashboard}
                                label="Dashboard"
                            />
                            <MenuItem
                                path="/user/upload-laporan"
                                icon={Upload}
                                label="Upload Laporan"
                            />
                            <MenuItem
                                path="/user/riwayat-laporan"
                                icon={History}
                                label="Riwayat Laporan"
                            />
                        </ul>

                        {/* Bottom Info / Actions */}
                        <div className="mt-auto p-4 border-t border-white/10 bg-black/10 flex flex-col gap-2">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <KeyRound size={20} />
                                <span className="text-sm font-medium">Ganti Password</span>
                            </button>
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

            {/* Profile Upload Modal */}
            <ProfileUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentUser={user}
                onUpdateSuccess={handleProfileUpdate}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
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
                <span className="text-sm">{label}</span>
            </button>
        </li>
    );
};


export default SidebarUser;
