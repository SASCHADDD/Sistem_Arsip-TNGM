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
    const isExternalSession = typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/eksternal') || window.location.pathname.startsWith('/mitra'));
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout backend error:', error);
    } finally {
        if (isExternalSession) {
            localStorage.removeItem('eksternal_token');
            localStorage.removeItem('eksternal_user');
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
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
        if (response.data.token) {
            const tokenKey = localStorage.getItem('eksternal_token') ? 'eksternal_token' : 'token';
            localStorage.setItem(tokenKey, response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengubah password';
    }
};
