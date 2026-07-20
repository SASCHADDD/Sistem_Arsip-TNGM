const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { Pengguna, Wilayah, Resor, LaporanInternal, ActivityLog, sequelize } = require('../../models');

const getAllStaff = async (req, res) => {
    try {
        const user = req.user;
        let whereClause = {
            role: ['staff', 'admin_wilayah']
        };

        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            whereClause.wilayah_id = user.wilayah_id;
        }

        const users = await Pengguna.findAll({
            where: whereClause,
            attributes: ['id', 'nama', 'email', 'role', 'foto', 'is_active'],
            include: [
                { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
                { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] }
            ],
            order: [['nama', 'ASC']]
        });

        const formattedUsers = users.map(u => ({
            id: u.id,
            nama: u.nama,
            email: u.email,
            role: u.role,
            foto: u.foto,
            is_active: u.is_active,
            nama_wilayah: u.wilayah_rel ? u.wilayah_rel.nama_wilayah : null,
            nama_resor: u.resor_rel ? u.resor_rel.nama_resor : null
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Get All Staff Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data staff' });
    }
};

const getStaffDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === 'staff' && parseInt(req.user.id) !== parseInt(id)) {
            return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk melihat data staf lain.' });
        }

        const profile = await Pengguna.findOne({
            where: { id, role: ['staff', 'admin_wilayah'] },
            attributes: ['id', 'nama', 'email', 'role', 'foto', 'is_active', 'wilayah_id', 'resor_id'],
            include: [
                { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
                { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] }
            ]
        });

        if (!profile) {
            return res.status(404).json({ message: 'Data staff tidak ditemukan' });
        }

        const statsRows = await LaporanInternal.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Pending' THEN 1 ELSE 0 END")), 'pending'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Approved' THEN 1 ELSE 0 END")), 'approved'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END")), 'rejected'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN penilaian = 'Baik' THEN 3 WHEN penilaian = 'Cukup' THEN 2 WHEN penilaian = 'Kurang' THEN 1 ELSE 0 END")), 'total_nilai'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN penilaian IS NOT NULL THEN 1 ELSE 0 END")), 'laporan_dinilai']
            ],
            where: { created_by: id },
            raw: true
        });

        const stats = statsRows[0];
        const totalNilai = parseInt(stats.total_nilai) || 0;
        const TotalLaporanDinilai = parseInt(stats.laporan_dinilai) || 0;
        const rataRataNilai = TotalLaporanDinilai > 0 ? (totalNilai / TotalLaporanDinilai).toFixed(1) : 0;

        const reports = await LaporanInternal.findAll({
            where: { created_by: id },
            attributes: ['id', 'judul', 'created_at', 'status', 'penilaian', 'catatan'],
            order: [['created_at', 'DESC']]
        });

        res.json({
            profile: {
                id: profile.id,
                nama: profile.nama,
                email: profile.email,
                role: profile.role,
                foto: profile.foto,
                is_active: profile.is_active,
                wilayah_id: profile.wilayah_id,
                resor_id: profile.resor_id,
                nama_wilayah: profile.wilayah_rel ? profile.wilayah_rel.nama_wilayah : null,
                nama_resor: profile.resor_rel ? profile.resor_rel.nama_resor : null,
                wilayah: (profile.resor_rel ? profile.resor_rel.nama_resor : null) || (profile.wilayah_rel ? profile.wilayah_rel.nama_wilayah : null) || 'Belum Ditetapkan'
            },
            stats: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                approved: parseInt(stats.approved) || 0,
                rejected: parseInt(stats.rejected) || 0,
                rata_rata_nilai: parseFloat(rataRataNilai)
            },
            reports: reports
        });

    } catch (error) {
        console.error('Get Staff Detail Error:', error);
        res.status(500).json({ message: 'Gagal mengambil detail staff' });
    }
};

const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, password, wilayah_id, resor_id, is_active } = req.body;

        const existingUserCheck = await Pengguna.findOne({
            where: { email, id: { [Op.ne]: id } }
        });

        if (existingUserCheck) {
            return res.status(400).json({ message: 'Email sudah terdaftar oleh pengguna lain' });
        }

        const oldUser = await Pengguna.findOne({
            where: { id, role: 'staff' },
            attributes: ['wilayah_id', 'resor_id']
        });

        if (!oldUser) {
            return res.status(404).json({ message: 'Staff tidak ditemukan' });
        }

        let isMutated = false;
        if ((wilayah_id && parseInt(wilayah_id) !== oldUser.wilayah_id) ||
            (resor_id && parseInt(resor_id) !== oldUser.resor_id)) {
            isMutated = true;
        }

        let updateData = {
            nama, email,
            wilayah_id: wilayah_id ? parseInt(wilayah_id) : null,
            resor_id: resor_id ? parseInt(resor_id) : null,
            is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const [affectedRows] = await Pengguna.update(updateData, {
            where: { id, role: 'staff' }
        });

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Staff tidak ditemukan atau tidak ada perubahan' });
        }

        if (isMutated) {
            let namaResorBaru = 'Resor Baru';
            if (resor_id) {
                const resorData = await Resor.findByPk(resor_id);
                if (resorData) namaResorBaru = resorData.nama_resor;
            }

            await ActivityLog.create({
                user_id: id,
                laporan_id: null,
                action: 'UPDATE',
                description: `Sistem Admin: Anda telah dimutasi penempatannya menjadi di ${namaResorBaru}.`
            });
        }

        res.json({ message: 'Data staff berhasil diperbarui' });
    } catch (error) {
        console.error('Update Staff Error:', error);
        res.status(500).json({ message: 'Gagal memperbarui data staff' });
    }
};

const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Pengguna.destroy({
            where: { id, role: ['staff', 'admin_wilayah'] }
        });

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Staff/Admin tidak ditemukan' });
        }

        res.json({ message: 'Akun berhasil dihapus' });
    } catch (error) {
        console.error('Delete Staff Error:', error);
        res.status(500).json({ message: 'Gagal menghapus akun. Kemungkinan karena pengguna ini sudah memiliki data laporan terkait.' });
    }
};

const getStaffAssessmentRekap = async (req, res) => {
    try {
        const user = req.user;
        let whereClause = { role: ['staff', 'admin_wilayah'] };

        if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
            whereClause.wilayah_id = user.wilayah_id;
        }

        const rows = await Pengguna.findAll({
            where: whereClause,
            attributes: [
                'id', 'nama', 'email', 'role', 'is_active',
                [sequelize.fn('COUNT', sequelize.col('laporan_rels.id')), 'total_laporan'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`status` = 'Approved' THEN 1 ELSE 0 END")), 'approved_count'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`status` = 'Rejected' THEN 1 ELSE 0 END")), 'rejected_count'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`status` = 'Pending' THEN 1 ELSE 0 END")), 'pending_count'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`penilaian` = 'Baik' THEN 1 ELSE 0 END")), 'baik_count'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`penilaian` = 'Cukup' THEN 1 ELSE 0 END")), 'cukup_count'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN `laporan_rels`.`penilaian` = 'Kurang' THEN 1 ELSE 0 END")), 'kurang_count'],
                [sequelize.fn('AVG', sequelize.literal("CASE WHEN `laporan_rels`.`penilaian` = 'Baik' THEN 3 WHEN `laporan_rels`.`penilaian` = 'Cukup' THEN 2 WHEN `laporan_rels`.`penilaian` = 'Kurang' THEN 1 ELSE NULL END")), 'rata_rata_bobot']
            ],
            include: [
                { model: Wilayah, as: 'wilayah_rel', attributes: ['nama_wilayah'] },
                { model: Resor, as: 'resor_rel', attributes: ['nama_resor'] },
                { model: LaporanInternal, as: 'laporan_rels', attributes: [] }
            ],
            group: ['Pengguna.id', 'wilayah_rel.id', 'resor_rel.id'],
            order: [['nama', 'ASC']],
            raw: true
        });

        const rekap = rows.map(row => ({
            id: row.id,
            nama: row.nama,
            email: row.email,
            role: row.role === 'admin_wilayah' ? 'Admin Wilayah' : 'Staff',
            is_active: row.is_active === 1,
            wilayah: row['wilayah_rel.nama_wilayah'] || '-',
            resor: row['resor_rel.nama_resor'] || '-',
            total_laporan: parseInt(row.total_laporan) || 0,
            approved: parseInt(row.approved_count) || 0,
            rejected: parseInt(row.rejected_count) || 0,
            pending: parseInt(row.pending_count) || 0,
            baik: parseInt(row.baik_count) || 0,
            cukup: parseInt(row.cukup_count) || 0,
            kurang: parseInt(row.kurang_count) || 0,
            skor_rata_rata: row.rata_rata_bobot ? parseFloat(parseFloat(row.rata_rata_bobot).toFixed(2)) : 0
        }));

        res.json(rekap);
    } catch (error) {
        console.error('Get Staff Rekap Error:', error);
        res.status(500).json({ message: 'Gagal mengambil rekap penilaian staff' });
    }
};

module.exports = {
    getAllStaff,
    getStaffDetail,
    updateStaff,
    deleteStaff,
    getStaffAssessmentRekap
};
