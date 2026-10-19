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
        const isEksternalRequest = config.url?.includes('/eksternal') || 
                                   config.url?.includes('/submit-eksternal') || 
                                   config.url?.includes('/submit-mitra') || 
                                   config.url?.includes('/riwayat-eksternal') || 
                                   config.url?.includes('/riwayat-mitra');
        const isEksternalPage = typeof window !== 'undefined' && 
                               (window.location.pathname.startsWith('/eksternal') || window.location.pathname.startsWith('/mitra'));

        let token;
        if (isEksternalRequest || isEksternalPage) {
            token = localStorage.getItem('eksternal_token') || localStorage.getItem('token');
        } else {
            token = localStorage.getItem('token') || localStorage.getItem('eksternal_token');
        }

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
        const config = error.config || {};
        const isLoginRequest = config.url?.includes('/auth/login') || config.url?.includes('/eksternal/login');
        const isEksternalContext = typeof window !== 'undefined' && 
                                  (window.location.pathname.startsWith('/eksternal') || window.location.pathname.startsWith('/mitra'));

        if (!isLoginRequest && (error.response?.status === 401 || error.response?.status === 403)) {
            if (isEksternalContext) {
                localStorage.removeItem('eksternal_token');
                localStorage.removeItem('eksternal_user');
            } else {
                if (localStorage.getItem('token')) {
                    localStorage.removeItem('token');
                    window.location.href = '/Login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
