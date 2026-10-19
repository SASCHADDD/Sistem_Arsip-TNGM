const path = require('path');
const { LaporanInternal, LaporanEksternal } = require('../models');

const getInternalScope = (user) => {
    if (user.role === 'admin_balai') return {};
    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        if (!user.wilayah_id) return null;
        return { wilayah_id: user.wilayah_id };
    }
    if (user.role === 'staff') return { created_by: user.id };
    return null;
};

const getExternalScope = (user) => {
    if (user.role === 'admin_balai') return {};
    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        if (!user.wilayah_id) return null;
        return { wilayah_id: user.wilayah_id };
    }
    if (user.role === 'mitra') {
        return { jenis_pengirim: 'mitra', email_pengirim: user.email };
    }
    if (user.role === 'eksternal') {
        return { jenis_pengirim: ['eksternal', 'pengaju simaksi'], email_pengirim: user.email };
    }
    return null;
};

const FILE_FIELDS = {
    laporan: { internal: 'file_laporan', external: 'file_dokumen', folder: 'laporan' },
    buktihardfile: { internal: 'foto_hardfile', external: 'file_lampiran', folder: 'buktihardfile' },
    output: { internal: 'file_output', external: 'file_output', folder: 'output' }
};

const getProtectedFile = async (req, res) => {
    const { folder, filename } = req.params;
    const fileType = Object.hasOwn(FILE_FIELDS, folder) ? FILE_FIELDS[folder] : null;
    if (!fileType || !filename || filename === '.' || path.basename(filename) !== filename) {
        return res.status(404).json({ message: 'File tidak ditemukan.' });
    }

    try {
        const internalScope = getInternalScope(req.user);
        const externalScope = getExternalScope(req.user);
        let authorized = false;

        if (internalScope) {
            authorized = Boolean(await LaporanInternal.findOne({
                where: { [fileType.internal]: filename, ...internalScope },
                attributes: ['id']
            }));
        }

        if (!authorized && externalScope) {
            authorized = Boolean(await LaporanEksternal.findOne({
                where: { [fileType.external]: filename, ...externalScope },
                attributes: ['id']
            }));
        }

        if (!authorized) return res.status(404).json({ message: 'File tidak ditemukan.' });

        const filePath = path.join(__dirname, '../../uploads', fileType.folder, filename);
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
        return res.sendFile(filePath, (error) => {
            if (error && !res.headersSent) {
                res.status(error.statusCode === 404 ? 404 : 500).json({
                    message: error.statusCode === 404 ? 'File tidak ditemukan.' : 'Gagal membaca file.'
                });
            }
        });
    } catch (error) {
        console.error('Get protected file error:', error);
        return res.status(500).json({ message: 'Gagal mengambil file.' });
    }
};

module.exports = { getProtectedFile };
