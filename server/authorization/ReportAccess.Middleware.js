const { Op } = require('sequelize');
const { LaporanInternal, LaporanEksternal } = require('../models');

const ensureInternalReportOwner = async (req, res, next) => {
    try {
        const report = await LaporanInternal.findOne({
            where: { id: req.params.id, created_by: req.user.id },
            attributes: ['id', 'status']
        });
        if (!report) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        if (!['Pending', 'Rejected'].includes(report.status)) {
            return res.status(403).json({ message: 'Laporan yang sudah diproses tidak dapat diedit.' });
        }
        next();
    } catch (error) {
        console.error('Check internal report access error:', error);
        res.status(500).json({ message: 'Gagal memeriksa akses laporan.' });
    }
};

const ensureExternalReportOwner = async (req, res, next) => {
    try {
        const jenisPengirim = req.user.role === 'mitra'
            ? 'mitra'
            : { [Op.in]: ['eksternal', 'pengaju simaksi'] };
        const report = await LaporanEksternal.findOne({
            where: {
                id: req.params.id,
                jenis_pengirim: jenisPengirim,
                email_pengirim: req.user.email
            },
            attributes: ['id', 'status']
        });
        if (!report) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        if (report.status === 'approved' || report.status === 'Approved') {
            return res.status(403).json({ message: 'Laporan yang sudah disetujui tidak dapat diedit.' });
        }
        next();
    } catch (error) {
        console.error('Check external report access error:', error);
        res.status(500).json({ message: 'Gagal memeriksa akses laporan.' });
    }
};

const ensureAdminReportScope = async (req, res, next) => {
    try {
        const Model = req.params.source === 'internal' ? LaporanInternal
            : req.params.source === 'eksternal' ? LaporanEksternal
                : null;
        if (!Model) return res.status(400).json({ message: 'Sumber asal laporan tidak valid.' });

        const where = { id: req.params.id };
        if (req.user.role !== 'admin_balai') where.wilayah_id = req.user.wilayah_id;
        const report = await Model.findOne({ where, attributes: ['id'] });
        if (!report) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
        next();
    } catch (error) {
        console.error('Check admin report scope error:', error);
        res.status(500).json({ message: 'Gagal memeriksa akses laporan.' });
    }
};

module.exports = { ensureInternalReportOwner, ensureExternalReportOwner, ensureAdminReportScope };
