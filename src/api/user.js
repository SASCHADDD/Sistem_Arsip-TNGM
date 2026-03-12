import api from './axios';

// Get list of all staff
export const getAllStaff = async () => {
    try {
        const response = await api.get('/users/staff');
        return response.data;
    } catch (error) {
        console.error('Error fetching staff list:', error);
        throw error;
    }
};

// Get details of a specific staff including their report stats
export const getStaffDetail = async (id) => {
    try {
        const response = await api.get(`/users/staff/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching detail for staff ${id}:`, error);
        throw error;
    }
};
// Update staff account data
export const updateStaff = async (id, data) => {
    try {
        const response = await api.put(`/users/staff/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating staff ${id}:`, error);
        throw error.response?.data?.message || 'Gagal memperbarui staf';
    }
};

// Delete a staff account
export const deleteStaff = async (id) => {
    try {
        const response = await api.delete(`/users/staff/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting staff ${id}:`, error);
        throw error.response?.data?.message || 'Gagal menghapus staf';
    }
};

// Get assessment rekap for all staff
export const getStaffAssessmentRekap = async () => {
    try {
        const response = await api.get('/users/staff-rekap');
        return response.data;
    } catch (error) {
        console.error('Error fetching staff rekap:', error);
        throw error;
    }
};
