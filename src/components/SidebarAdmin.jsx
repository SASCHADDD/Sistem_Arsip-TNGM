import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCheck, FileText, Users, UserCheck, Menu, LogOut, Library, Activity, Shield, Lock, Eye, EyeOff, Save, Loader2, User, Camera } from 'lucide-react';
import { changePassword } from '../api/auth';
import Swal from 'sweetalert2';
import logo from '../assets/logo-tngm.png';

const SidebarAdmin = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [loading, setLoading] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi ukuran (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('Error', 'Ukuran file maksimal adalah 2MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('foto', file);

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/auth/upload-photo/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // Update local storage user object
                const updatedUser = { ...user, foto: `http://localhost:3000/uploads/profile/${result.file}` };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser); // Update local state to trigger re-render
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Foto profil berhasil diperbarui!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(result.message || 'Gagal mengunggah foto');
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Gagal mengunggah foto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Konfirmasi password baru tidak cocok!' });
            return;
        }

        setIsSubmitting(true);
        try {
            await changePassword(passwordData.oldPassword, passwordData.newPassword);
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Password berhasil diubah!' });
            setIsProfileModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: error || 'Terjadi kesalahan saat mengubah password' });
        } finally {
            setIsSubmitting(false);
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

                    {/* User Profile Section - Clickable Card */}
                    <div className="px-4 mb-8">
                        <button 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group text-left"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-[#D4BB76]/20 flex items-center justify-center border border-[#D4BB76]/30 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                    {user.foto ? (
                                        <img src={user.foto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCheck className="text-[#D4BB76]" size={22} />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#D4BB76] rounded-full border-2 border-[#0F3D17] flex items-center justify-center">
                                    <Shield size={10} className="text-[#0F3D17]" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#D4BB76] transition-colors">
                                    {user.nama || 'Admin'}
                                </p>
                                <p className="text-[10px] text-[#D4BB76] font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100">
                                    {user.role === 'kepala_wilayah' ? 'Kepala Wilayah' : user.role === 'admin_wilayah' ? 'Admin Wilayah' : 'Administrator'}
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <ul className="menu w-full px-4 text-base-content flex-1">
                        <MenuItem
                            path="/admin/dashboard"
                            icon={LayoutDashboard}
                            label="Dashboard"
                        />
                        {user.role !== 'admin_wilayah' && (
                            <MenuItem
                                path="/admin/verifikasi-laporan"
                                icon={FileCheck}
                                label="Verifikasi Laporan"
                            />
                        )}
                        {(user.role === 'admin_balai' || user.role === 'admin_wilayah') && (
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
                        <MenuItem
                            path="/admin/detail-aktivitas"
                            icon={Activity}
                            label="Log Aktivitas"
                        />
                        {user.role !== 'admin_wilayah' && (
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

            {/* Profile & Password Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                    <Shield size={20} />
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">Pengaturan Akun</h3>
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Profile Info Summary */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="relative group/photo mb-4">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl shadow-md border-4 border-white overflow-hidden">
                                        {user.foto ? (
                                            <img src={user.foto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user.nama?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-green-700 transition-all transform hover:scale-110 active:scale-95"
                                        title="Ubah Foto"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-gray-900">{user.nama}</h4>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-200">
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                <h5 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Lock size={16} /> Ganti Password
                                </h5>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">PASSWORD LAMA</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.old ? "text" : "password"}
                                                required
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-600 transition-all outline-none text-sm font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                                            >
                                                {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">PASSWORD BARU</label>
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-600 transition-all outline-none text-sm font-medium"
                                                placeholder="Min. 6 Karakter"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">KONFIRMASI</label>
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-600 transition-all outline-none text-sm font-medium"
                                                placeholder="Ulangi Password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileModalOpen(false)}
                                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
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
