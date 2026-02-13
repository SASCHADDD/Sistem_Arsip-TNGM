import api from './axios';

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
        // Expected response structure from backend:
        // {
        //     message: 'Login berhasil',
        //     token: '...',
        //     user: { id, nama, email, role, ... }
        // }
    } catch (error) {
        throw error.response?.data?.message || 'Terjadi kesalahan saat login';
    }
};

export const logout = async () => {
    try {
        // Optional: Call backend logout if needed (for cookie-based auth mainly)
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
