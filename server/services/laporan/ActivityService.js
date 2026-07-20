const { ActivityLog, Pengguna, LaporanInternal } = require('../../models');
const { Op } = require('sequelize');

const getUserLogs = async (userId) => {
    const logs = await ActivityLog.findAll({
        include: [
            {
                model: Pengguna,
                as: 'user_rel',
                attributes: ['nama', 'role']
            },
            {
                model: LaporanInternal,
                as: 'laporan_rel',
                attributes: ['created_by']
            }
        ],
        where: {
            [Op.or]: [
                { '$laporan_rel.created_by$': userId },
                {
                    laporan_id: null,
                    user_id: userId
                }
            ]
        },
        order: [['created_at', 'DESC']],
        limit: 10
    });

    return logs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description,
        date: log.created_at,
        actor: log.user_rel ? log.user_rel.nama : '-',
        is_admin: log.user_rel ? log.user_rel.role.includes('admin') : false
    }));
};

const getAdminLogs = async (user) => {
    let whereClause = {};

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        whereClause = {
            [Op.or]: [
                { '$laporan_rel.wilayah_id$': user.wilayah_id },
                { '$user_rel.wilayah_id$': user.wilayah_id },
                { user_id: user.id }
            ]
        };
    }

    const logs = await ActivityLog.findAll({
        include: [
            {
                model: Pengguna,
                as: 'user_rel',
                attributes: ['nama', 'role', 'wilayah_id']
            },
            {
                model: LaporanInternal,
                as: 'laporan_rel',
                attributes: ['judul', 'wilayah_id', 'created_by'],
                include: [{
                    model: Pengguna,
                    as: 'pembuat',
                    attributes: ['nama']
                }]
            }
        ],
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: 50
    });

    return logs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description,
        date: log.created_at,
        actor: log.user_rel ? log.user_rel.nama : '-',
        role: log.user_rel ? log.user_rel.role : '-',
        report_title: log.laporan_rel ? log.laporan_rel.judul : '-',
        pelapor: log.laporan_rel && log.laporan_rel.pembuat ? log.laporan_rel.pembuat.nama : '-'
    }));
};

module.exports = { getUserLogs, getAdminLogs };
