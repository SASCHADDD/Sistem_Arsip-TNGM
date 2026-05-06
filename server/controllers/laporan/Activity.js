const ActivityService = require('../../services/laporan/ActivityService');

const getUserActivityLog = async (req, res) => {
    try {
        const activities = await ActivityService.getUserLogs(req.user.id);
        res.json(activities);
    } catch (error) {
        console.error('Get Activity Error:', error);
        res.status(500).json({ message: 'Gagal mengambil aktivitas terbaru' });
    }
};

const getAdminActivityLog = async (req, res) => {
    try {
        const activities = await ActivityService.getAdminLogs(req.user);
        res.json(activities);
    } catch (error) {
        console.error('Get Admin Activity Error:', error);
        res.status(500).json({ message: 'Gagal mengambil aktivitas admin' });
    }
};

module.exports = { getUserActivityLog, getAdminActivityLog };
