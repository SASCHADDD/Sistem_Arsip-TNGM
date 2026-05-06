const DashboardService = require('../../services/laporan/DashboardService');

const getUserDashboardStats = async (req, res) => {
    try {
        const stats = await DashboardService.getUserStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data statistik dashboard' });
    }
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        const stats = await DashboardService.getAdminStats(month, year, req.user);
        res.json(stats);
    } catch (error) {
        console.error('Get Admin Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data statistik dashboard admin' });
    }
};

module.exports = { getUserDashboardStats, getAdminDashboardStats };
