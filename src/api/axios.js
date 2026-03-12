import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        // Cek token internal dulu, jika tidak ada cek eksternal/mitra
        const token = localStorage.getItem('token') || localStorage.getItem('eksternal_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jangan redirect ke / jika error berasal dari endpoint login
        const config = error.config || {};
        const isLoginRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/login-eksternal');

        if (!isLoginRequest && (error.response?.status === 401 || error.response?.status === 403)) {
            // Hanya hapus token internal jika status unauthorized
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            // Untuk eksternal/mitra, biarkan page yang menangani auto-redirect via Auth Guard
        }
        return Promise.reject(error);
    }
);

export default api;
