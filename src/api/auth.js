import api from './axios';

// ini adalah fungsi ketika backend mengalami error
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;

        // Expected response structure from backend:

    } catch (error) {
        throw error.response?.data?.message || 'Terjadi kesalahan saat login';
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout backend error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const updateProfilePhoto = async (userId, formData) => {
    try {
        const response = await api.put(`/auth/upload-photo/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengupload foto profil';
    }
};

export const changePassword = async (oldPassword, newPassword) => {
    try {
        const response = await api.put('/auth/change-password', {
            oldPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengubah password';
    }
};
