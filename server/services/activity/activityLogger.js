const db = require('../../config/database');

/**
 * [SISTEM] Fungsi bantuan (Helper) untuk MENULIS BUKU HARIAN KEGIATAN SISTEM (Log)
 */
const logActivity = async (userId, laporanId, action, description) => {
    try {
        await db.execute(
            `INSERT INTO activity_log (user_id, laporan_id, action, description, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [userId, laporanId, action, description]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };
