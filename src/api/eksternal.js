import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Login untuk pengguna Eksternal & Mitra
 * Menggunakan akun dummy sementara (belum integrasi sistem luar)
 */
export const loginEksternal = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/eksternal/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Terjadi kesalahan saat login';
    }
};

/**
 * Ambil riwayat laporan pengguna eksternal/mitra
 */
export const getRiwayatEksternal = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/eksternal/riwayat`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengambil riwayat laporan';
    }
};

/**
 * Submit laporan Eksternal (wajib login, token dikirim di header)
 */
export const submitLaporanEksternalPublic = async (formData) => {
    const token = localStorage.getItem('eksternal_token');
    try {
        const response = await axios.post(`${BASE_URL}/laporan/submit-eksternal`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengirim laporan eksternal';
    }
};

/**
 * Submit laporan Mitra (wajib login, token dikirim di header)
 */
export const submitLaporanMitraPublic = async (formData) => {
    const token = localStorage.getItem('eksternal_token');
    try {
        const response = await axios.post(`${BASE_URL}/laporan/submit-mitra`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Gagal mengirim laporan mitra';
    }
};


/**
 * Buat URL download E-Sertifikat PDF
 */
export const getESertifikatUrl = (filename) =>
    `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/uploads/laporan/output/${filename}`;
