const { Op } = require('sequelize');
const { LaporanInternal, LaporanEksternal, Resor, sequelize } = require('../../models');

const getUserStats = async (userId) => {
    const rows = await LaporanInternal.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Pending' THEN 1 ELSE 0 END")), 'pending'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Approved' THEN 1 ELSE 0 END")), 'approved'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END")), 'rejected'],
            [sequelize.fn('AVG', sequelize.literal("CASE WHEN status = 'Approved' AND penilaian = 'Baik' THEN 3 WHEN status = 'Approved' AND penilaian = 'Cukup' THEN 2 WHEN status = 'Approved' AND penilaian = 'Kurang' THEN 1 ELSE NULL END")), 'rata_rata_nilai']
        ],
        where: { created_by: userId },
        raw: true
    });

    const stats = rows[0] || {};
    return {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0,
        rata_rata_nilai: stats.rata_rata_nilai ? parseFloat(Number(stats.rata_rata_nilai).toFixed(1)) : 0
    };
};

const getAdminStats = async (month, year, user) => {
    let intWhere = { status: ['Pending', 'Approved', 'Rejected'] };
    let eksWhere = { status: ['pending', 'approved', 'rejected'] };

    if (month && year) {
        intWhere[Op.and] = [
            sequelize.where(sequelize.fn('MONTH', sequelize.col('created_at')), month),
            sequelize.where(sequelize.fn('YEAR', sequelize.col('created_at')), year)
        ];
        eksWhere[Op.and] = [
            sequelize.where(sequelize.fn('MONTH', sequelize.col('created_at')), month),
            sequelize.where(sequelize.fn('YEAR', sequelize.col('created_at')), year)
        ];
    } else if (year) {
        intWhere[Op.and] = [sequelize.where(sequelize.fn('YEAR', sequelize.col('created_at')), year)];
        eksWhere[Op.and] = [sequelize.where(sequelize.fn('YEAR', sequelize.col('created_at')), year)];
    } else if (month) {
        intWhere[Op.and] = [sequelize.where(sequelize.fn('MONTH', sequelize.col('created_at')), month)];
        eksWhere[Op.and] = [sequelize.where(sequelize.fn('MONTH', sequelize.col('created_at')), month)];
    }

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        intWhere.wilayah_id = user.wilayah_id;
        eksWhere.id = -1; // 1=0 essentially
    }

    const intStats = await LaporanInternal.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Pending' THEN 1 ELSE 0 END")), 'pending'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Approved' THEN 1 ELSE 0 END")), 'approved'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END")), 'rejected']
        ],
        where: intWhere,
        raw: true
    });

    const eksStats = await LaporanEksternal.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), 'pending'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approved'],
            [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")), 'rejected']
        ],
        where: eksWhere,
        raw: true
    });

    const iStats = intStats[0] || {};
    const eStats = eksStats[0] || {};
    
    const total = (parseInt(iStats.total) || 0) + (parseInt(eStats.total) || 0);
    const pending = (parseInt(iStats.pending) || 0) + (parseInt(eStats.pending) || 0);
    const approved = (parseInt(iStats.approved) || 0) + (parseInt(eStats.approved) || 0);
    const rejected = (parseInt(iStats.rejected) || 0) + (parseInt(eStats.rejected) || 0);

    let resorWhere = { status: 'Approved' };
    let resorFilter = {};

    if (month && year) {
        resorWhere[Op.and] = [
            sequelize.where(sequelize.fn('MONTH', sequelize.col('laporan_rels.created_at')), month),
            sequelize.where(sequelize.fn('YEAR', sequelize.col('laporan_rels.created_at')), year)
        ];
    } else if (year) {
        resorWhere[Op.and] = [sequelize.where(sequelize.fn('YEAR', sequelize.col('laporan_rels.created_at')), year)];
    } else if (month) {
        resorWhere[Op.and] = [sequelize.where(sequelize.fn('MONTH', sequelize.col('laporan_rels.created_at')), month)];
    }

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        resorWhere.wilayah_id = user.wilayah_id;
        resorFilter.wilayah_id = user.wilayah_id;
    }

    const resorRows = await Resor.findAll({
        attributes: [
            ['nama_resor', 'name'],
            [sequelize.fn('AVG', sequelize.literal("CASE WHEN `laporan_rels`.`penilaian` = 'Baik' THEN 3 WHEN `laporan_rels`.`penilaian` = 'Cukup' THEN 2 WHEN `laporan_rels`.`penilaian` = 'Kurang' THEN 1 ELSE NULL END")), 'average_score']
        ],
        include: [{
            model: LaporanInternal,
            as: 'laporan_rels',
            attributes: [],
            where: resorWhere,
            required: false // LEFT JOIN
        }],
        where: resorFilter,
        group: ['Resor.id', 'Resor.nama_resor'],
        order: [
            [sequelize.literal('average_score'), 'DESC'],
            ['nama_resor', 'ASC']
        ],
        raw: true
    });

    const predefinedColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#84cc16'];
    const resorStats = resorRows.map((row, index) => ({
        name: row.name,
        value: row.average_score ? parseFloat(Number(row.average_score).toFixed(1)) : 0,
        color: predefinedColors[index % predefinedColors.length]
    }));

    return {
        total: total,
        pending: pending,
        approved: approved,
        rejected: rejected,
        resor_stats: resorStats
    };
};

module.exports = { getUserStats, getAdminStats };
