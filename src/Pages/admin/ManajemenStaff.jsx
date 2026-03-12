import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import { Plus, Users, Search, ChevronRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { getAllStaff, updateStaff, deleteStaff } from "../../api/user";
import axios from "../../api/axios";

const ManajemenStaff = () => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterResor, setFilterResor] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Form state for new/edit staff
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
        wilayah_id: "",
        resor_id: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // For dropdown options (assuming you need them if you have wilayah/resor)
    const [wilayahOptions, setWilayahOptions] = useState([]);
    const [resorOptions, setResorOptions] = useState([]);

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllStaff();
            setStaffList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const response = await axios.get('/laporan/form-options'); // Reusing this endpoint to get Wilayah
            setWilayahOptions(response.data.wilayah || []);
            setResorOptions(response.data.resor || []);
        } catch (error) {
            console.error('Failed to fetch wilayah options', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegisterStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");

        try {
            await axios.post('/auth/register', formData);
            setIsRegisterModalOpen(false);
            setFormData({
                nama: "",
                email: "",
                password: "",
                wilayah_id: "",
                resor_id: ""
            });
            fetchData(); // Refresh table
        } catch (error) {
            setFormError(error.response?.data?.message || "Terjadi kesalahan saat pendaftaran");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");

        try {
            await updateStaff(selectedStaff.id, formData);
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            setFormError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStaff = async () => {
        setIsSubmitting(true);
        setFormError("");
        try {
            await deleteStaff(selectedStaff.id);
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            setFormError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (staff) => {
        setSelectedStaff(staff);
        setFormData({
            nama: staff.nama,
            email: staff.email,
            password: "", // Kosongkan password saat edit kecuali user ingin ganti
            wilayah_id: staff.wilayah_id || "",
            resor_id: staff.resor_id || ""
        });
        setFormError("");
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (staff) => {
        setSelectedStaff(staff);
        setFormError("");
        setIsDeleteModalOpen(true);
    };

    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesResor = filterResor === "" ||
            (filterResor === "none" ? !staff.nama_resor : staff.nama_resor === filterResor);

        return matchesSearch && matchesResor;
    });

    return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8 text-slate-800">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-white text-2xl font-bold mb-2 flex items-center gap-2">
                            <Users className="text-white" />
                            Manajemen Staff
                        </h2>
                        <p className="text-white">
                            Kelola akun staf, tambah pendaftar baru, dan tinjau profil performa pelaporan staf.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        <Plus size={20} />
                        Tambah Staf
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="p-5 border-b border-gray-100 flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Filter Resor */}
                            <select
                                className="select select-bordered bg-white border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-slate-700 min-w-[200px]"
                                value={filterResor}
                                onChange={(e) => setFilterResor(e.target.value)}
                            >
                                <option value="">Semua Resor</option>
                                <hr />
                                {resorOptions.map(r => (
                                    <option key={r.id} value={r.nama}>{r.nama}</option>
                                ))}
                                <option value="none">Belum Ditentukan (Kantor & Lainnya)</option>
                            </select>

                            {/* Search */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="p-4 font-semibold">Profil</th>
                                    <th className="p-4 font-semibold">Wilayah/Resor</th>
                                    <th className="p-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="animate-spin text-green-600" size={24} />
                                                Memuat data staf...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-gray-500 italic">
                                            Tidak ada data staf ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-green-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden">
                                                        {staff.foto ? (
                                                            <img src={`http://localhost:3000/uploads/profile/${staff.foto}`} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            staff.nama.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{staff.nama}</p>
                                                        <p className="text-xs text-gray-500 mb-1">{staff.email}</p>
                                                        {staff.role === 'admin_wilayah' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                                                                Admin Wilayah
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                                                Staff
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {staff.nama_resor || staff.nama_wilayah || '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/akun-staff/${staff.id}`)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors text-xs"
                                                        title="Detail Staff"
                                                    >
                                                        Detail
                                                        <ChevronRight size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(staff)}
                                                        className="p-1.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                                        title="Edit Staff"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(staff)}
                                                        className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Hapus Staff"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal Tambah Staff */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-slate-800">Tambah Akun Staf</h3>
                            <button
                                onClick={() => setIsRegisterModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRegisterStaff} className="p-6 flex flex-col gap-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama"
                                    required
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength="6"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah (Opsional)</label>
                                    <select
                                        name="wilayah_id"
                                        value={formData.wilayah_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                    >
                                        <option value="">Pilih Wilayah</option>
                                        {wilayahOptions.map(w => (
                                            <option key={w.id} value={w.id}>{w.nama}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resor (Opsional)</label>
                                    <select
                                        name="resor_id"
                                        value={formData.resor_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                    >
                                        <option value="">Pilih Resor</option>
                                        {resorOptions
                                            .filter(r => formData.wilayah_id ? r.wilayah_id === parseInt(formData.wilayah_id) : true)
                                            .map(r => (
                                                <option key={r.id} value={r.id}>{r.nama}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={16} className="animate-spin" /> Mendaftar...</>
                                    ) : (
                                        'Daftar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Staff */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-slate-800">Edit Akun Staf</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditStaff} className="p-6 flex flex-col gap-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama"
                                    required
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password (Opsional)</label>
                                <input
                                    type="password"
                                    name="password"
                                    minLength="6"
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium placeholder:font-normal placeholder:text-xs text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah (Opsional)</label>
                                    <select
                                        name="wilayah_id"
                                        value={formData.wilayah_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium text-sm"
                                    >
                                        <option value="">Pilih Wilayah</option>
                                        {wilayahOptions.map(w => (
                                            <option key={w.id} value={w.id}>{w.nama}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resor (Opsional)</label>
                                    <select
                                        name="resor_id"
                                        value={formData.resor_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-slate-900 font-medium text-sm"
                                    >
                                        <option value="">Pilih Resor</option>
                                        {resorOptions
                                            .filter(r => formData.wilayah_id ? r.wilayah_id === parseInt(formData.wilayah_id) : true)
                                            .map(r => (
                                                <option key={r.id} value={r.id}>{r.nama}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                                    ) : (
                                        typeof formData.password !== "undefined" ? 'Simpan Perubahan' : 'Update'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Staff */}
            {isDeleteModalOpen && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center flex flex-col items-center p-8">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">Hapus Akun Staf?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Anda yakin ingin menghapus akun staf atas nama <strong>{selectedStaff.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        {formError && (
                            <div className="w-full p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 mb-6 text-left">
                                {formError}
                            </div>
                        )}

                        <div className="flex justify-center gap-3 w-full">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteStaff}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Menghapus...</>
                                ) : (
                                    'Ya, Hapus'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarAdmin>
    );
};

export default ManajemenStaff;
