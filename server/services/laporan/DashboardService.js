const db = require('../../config/database');

const getUserStats = async (userId) => {
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
            AVG(CASE 
                WHEN status = 'Approved' AND penilaian = 'Baik' THEN 3
                WHEN status = 'Approved' AND penilaian = 'Cukup' THEN 2
                WHEN status = 'Approved' AND penilaian = 'Kurang' THEN 1
                ELSE NULL 
            END) as rata_rata_nilai
        FROM laporan_internal 
        WHERE created_by = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    const stats = rows[0];

    return {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0,
        rata_rata_nilai: stats.rata_rata_nilai ? parseFloat(Number(stats.rata_rata_nilai).toFixed(1)) : 0
    };
};

const getAdminStats = async (month, year, user) => {
    let internalWhere = "WHERE status IN ('Pending', 'Approved', 'Rejected')";
    let internalParams = [];
    let eksternalWhere = "WHERE status IN ('Pending', 'Approved', 'Rejected')";
    let eksternalParams = [];

    if (month && year) {
        internalWhere += " AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
        eksternalWhere += " AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
        internalParams.push(month, year); eksternalParams.push(month, year);
    } else if (year) {
        internalWhere += " AND YEAR(created_at) = ?"; eksternalWhere += " AND YEAR(created_at) = ?";
        internalParams.push(year); eksternalParams.push(year);
    } else if (month) {
        internalWhere += " AND MONTH(created_at) = ?"; eksternalWhere += " AND MONTH(created_at) = ?";
        internalParams.push(month); eksternalParams.push(month);
    }

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        internalWhere += " AND wilayah_id = ?";
        internalParams.push(user.wilayah_id);
        eksternalWhere += " AND 1=0";
    }

    const query = `
        SELECT SUM(total) as total, SUM(pending) as pending, SUM(approved) as approved, SUM(rejected) as rejected
        FROM (
            SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM laporan_internal ${internalWhere}
            UNION ALL
            SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
            FROM laporan_eksternal ${eksternalWhere}
        ) combined
    `;

    const combinedParams = [...internalParams, ...eksternalParams];
    const [rows] = await db.execute(query, combinedParams);
    const stats = rows[0];

    let resorQueryParams = [];
    let resorWhereClause = '';
    let resorFilterQuery = '';
    if (month && year) { resorWhereClause = "AND MONTH(l.created_at) = ? AND YEAR(l.created_at) = ?"; resorQueryParams.push(month, year); }
    else if (year) { resorWhereClause = "AND YEAR(l.created_at) = ?"; resorQueryParams.push(year); }
    else if (month) { resorWhereClause = "AND MONTH(l.created_at) = ?"; resorQueryParams.push(month); }

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        resorWhereClause += " AND l.wilayah_id = ?";
        resorFilterQuery = "WHERE r.wilayah_id = ?";
        resorQueryParams.push(user.wilayah_id);
        resorQueryParams.push(user.wilayah_id);
    }

    const resorStatsQuery = `
        SELECT r.nama_resor as name, AVG(CASE WHEN l.penilaian = 'Baik' THEN 3 WHEN l.penilaian = 'Cukup' THEN 2 WHEN l.penilaian = 'Kurang' THEN 1 ELSE NULL END) as average_score
        FROM resor r
        LEFT JOIN laporan_internal l ON r.id = l.resor_id ${resorWhereClause} AND l.status = 'Approved'
        ${resorFilterQuery}
        GROUP BY r.id, r.nama_resor
        ORDER BY average_score DESC, r.nama_resor ASC
    `;
    const [resorRows] = await db.execute(resorStatsQuery, resorQueryParams);

    const predefinedColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#84cc16'];
    const resorStats = resorRows.map((row, index) => ({
        name: row.name,
        value: row.average_score ? parseFloat(Number(row.average_score).toFixed(1)) : 0,
        color: predefinedColors[index % predefinedColors.length]
    }));

    return {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0,
        resor_stats: resorStats
    };
};

module.exports = { getUserStats, getAdminStats };
