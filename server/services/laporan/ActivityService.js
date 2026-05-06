const db = require('../../config/database');

const getUserLogs = async (userId) => {
    const query = `
        SELECT 
            a.id, a.action, a.description, a.created_at,
            u.nama as actor_name, u.role as actor_role
        FROM activity_log a
        LEFT JOIN laporan_internal l ON a.laporan_id = l.id
        JOIN pengguna u ON a.user_id = u.id
        WHERE l.created_by = ? OR (a.laporan_id IS NULL AND a.user_id = ?)
        ORDER BY a.created_at DESC
        LIMIT 10
    `;

    const [rows] = await db.execute(query, [userId, userId]);

    return rows.map(row => ({
        id: row.id, action: row.action, description: row.description,
        date: row.created_at, actor: row.actor_name, is_admin: row.actor_role.includes('admin')
    }));
};

const getAdminLogs = async (user) => {
    let whereClause = "";
    let queryParams = [];

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        whereClause = "WHERE (l.wilayah_id = ? OR p.wilayah_id = ? OR a.user_id = ?)";
        queryParams.push(user.wilayah_id, user.wilayah_id, user.id);
    }

    const query = `
        SELECT 
            a.id, a.action, a.description, a.created_at,
            u.nama as actor_name, u.role as actor_role,
            l.judul as report_title,
            p.nama as pelapor_name
        FROM activity_log a
        JOIN pengguna u ON a.user_id = u.id
        LEFT JOIN laporan_internal l ON a.laporan_id = l.id
        LEFT JOIN pengguna p ON l.created_by = p.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT 50
    `;

    const [rows] = await db.execute(query, queryParams.length > 0 ? queryParams : undefined);

    return rows.map(row => ({
        id: row.id, action: row.action, description: row.description,
        date: row.created_at, actor: row.actor_name, role: row.actor_role,
        report_title: row.report_title || '-', pelapor: row.pelapor_name || '-'
    }));
};

module.exports = { getUserLogs, getAdminLogs };
