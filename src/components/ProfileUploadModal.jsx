import { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { updateProfilePhoto } from '../api/auth'; // Import API service

const ProfileUploadModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.foto || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                setError('Mohon upload file gambar');
                return;
            }
            // Validasi ukuran file (misal max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Ukuran file maksimal 2MB');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Pilih foto terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (!currentUser?.id) {
                throw new Error('User ID tidak ditemukan');
            }

            const formData = new FormData();
            formData.append('foto', selectedFile);

            const response = await updateProfilePhoto(currentUser.id, formData); // Panggil API

            // Backend mengembalikan { message, file: 'filename.jpg' }
            // Kita perlu menyusun URL lengkap.
            const photoUrl = `http://localhost:3000/uploads/profile/${response.file}`;

            // Update local storage dengan data user terbaru
            const successData = { ...JSON.parse(localStorage.getItem('user')), foto: photoUrl };
            localStorage.setItem('user', JSON.stringify(successData));

            onUpdateSuccess(successData); // Callback ke parent untuk update UI realtime
            onClose();
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Gagal upload foto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Ganti Foto Profil</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    {/* Preview Area */}
                    <div className="relative group mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-100 shadow-inner bg-gray-100 flex items-center justify-center">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera className="w-12 h-12 text-gray-300" />
                            )}
                        </div>

                        {/* Overlay helper for file input */}
                        <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-md border-2 border-white">
                            <Upload size={16} />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 text-center">
                        Format: JPG, PNG, GIF. Maksimal 2MB.
                    </p>

                    {error && (
                        <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg w-full text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !selectedFile}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-green-700/20"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUploadModal;
