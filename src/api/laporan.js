import api from './axios';

export const submitLaporan = async (formData) => {
    try {
        const response = await api.post('/laporan/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengirim laporan';
    }
};

export const getFormOptions = async () => {
    try {
        const response = await api.get('/laporan/form-options');
        return response.data;
    } catch (error) {
        console.error('Error fetching options:', error);
        // Fallback empty data if fails, preventing crash
        return { kategori: [], wilayah: [] };
    }
};

export const getRiwayatLaporan = async () => {
    try {
        const response = await api.get('/laporan/riwayat');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengambil riwayat laporan';
    }
};

export const getDetailLaporan = async (id) => {
    try {
        const response = await api.get(`/laporan/detail/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengambil detail laporan';
    }
};

export const deleteLaporan = async (id) => {
    try {
        const response = await api.delete(`/laporan/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal menghapus laporan';
    }
};

export const updateLaporan = async (id, formData) => {
    try {
        const response = await api.put(`/laporan/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal memperbarui laporan';
    }
};

export const getUserDashboardStats = async () => {
    try {
        const response = await api.get('/laporan/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
};

export const getUserActivityLog = async () => {
    try {
        const response = await api.get('/laporan/activity');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        return [];
    }
};

export const getAllPendingReports = async () => {
    try {
        const response = await api.get('/laporan/pending');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengambil data verifikasi';
    }
};

export const verifyLaporan = async (id, status, catatan = '', source_table = 'internal') => {
    try {
        const response = await api.put(`/laporan/verify/${id}`, { status, catatan, source_table });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal memverifikasi laporan';
    }
};

export const getAdminDashboardStats = async (month, year) => {
    try {
        let url = '/laporan/admin/stats';
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (year) params.append('year', year);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0, resor_stats: [] };
    }
};

export const getAdminActivityLog = async () => {
    try {
        const response = await api.get('/laporan/admin/activity');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin activity log:', error);
        return [];
    }
};

export const getAllApprovedReports = async () => {
    try {
        const response = await api.get('/laporan/admin/approved');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengambil data laporan yang disetujui';
    }
};
export const submitEksternalReport = async (formData) => {
    try {
        const response = await api.post('/laporan/submit-eksternal', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Terjadi kesalahan saat mengajukan laporan eksternal';
    }
};
