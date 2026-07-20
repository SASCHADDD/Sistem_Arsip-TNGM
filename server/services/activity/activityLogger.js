const { ActivityLog } = require('../../models');

/**
 * [SISTEM] Fungsi bantuan (Helper) untuk MENULIS BUKU HARIAN KEGIATAN SISTEM (Log)
 */
const logActivity = async (userId, laporanId, action, description) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            laporan_id: laporanId || null,
            action: action,
            description: description
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };

