import { useState, useRef, useEffect } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../api/auth';
import Swal from 'sweetalert2';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Toggle View States
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const dialogRef = useRef(null);

    // Sync `isOpen` prop with native dialog open state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) {
            if (isOpen) {
                dialog.showModal();
            } else {
                dialog.close();
            }
        }
    }, [isOpen]);

    const handleClose = () => {
        // Reset state on close
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setError('');
        onClose(); // Trigger parent's close handler
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Semua form wajib diisi');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok dengan password baru');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            await changePassword(oldPassword, newPassword);

            handleClose();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Password Anda berhasil diubah.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Terjadi kesalahan saat mengubah password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog
            id="change_password_modal"
            className="modal"
            ref={dialogRef}
            onCancel={handleClose} // Triggers when user presses ESC
        >
            <div className="modal-box p-0 bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <KeyRound className="text-green-700" size={20} />
                        Ganti Password
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-600 hover:text-gray-900 outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-white text-gray-900">
                    {error && (
                        <div className="mb-6 text-sm font-medium text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200 flex items-start gap-2">
                            <Lock className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">Password Lama</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400 text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all placeholder:text-gray-500 pr-12"
                                    placeholder="Masukkan password lama"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400 text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all placeholder:text-gray-500 pr-12"
                                    placeholder="Minimal 6 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1.5">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-400 text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all placeholder:text-gray-500 pr-12"
                                    placeholder="Ketik ulang password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 font-medium">
                                Pastikan Anda mengingat password baru untuk sesi login berikutnya.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-400 text-gray-800 font-bold hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-green-700 text-white font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-green-700/20"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm text-white"></span>
                                        Memproses...
                                    </>
                                ) : (
                                    'Ubah Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Backdrop handling to close modal on outside click natively */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
};

export default ChangePasswordModal;
