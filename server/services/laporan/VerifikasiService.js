const { LaporanInternal, LaporanEksternal, Wilayah, Resor, Pengguna, Kategori, ActivityLog } = require('../../models');
const { generateTandaTerimaPDF, generateESertifikatPDF } = require('../pdf/pdfService');
const { hitungPenilaian } = require('../penilaian/penilaianService');
const { logActivity } = require('../activity/activityLogger');

const verifyLaporanLogic = async (id, status, catatan, source_table, user) => {
    let fileOutput = null;
    const isRegionalAdmin = user.role === 'admin_wilayah' || user.role === 'kepala_wilayah';

    if (source_table === 'internal') {
        const laporan = await LaporanInternal.findByPk(id, {
            include: [{ model: Pengguna, as: 'pembuat', attributes: ['nama'] }]
        });
        if (!laporan) throw new Error('Laporan Internal tidak ditemukan');
        if (isRegionalAdmin && Number(laporan.wilayah_id) !== Number(user.wilayah_id)) {
            throw new Error('Akses ditolak: laporan berada di luar wilayah Anda.');
        }
        if (laporan.status !== 'Pending') throw new Error('Laporan sudah diproses.');
        
        let updateData = { status, catatan: catatan || '' };

        if (status === 'Approved') {
            let penilaianValue = hitungPenilaian(laporan);
            const pdfData = {
                nama_pengirim: laporan.pembuat ? laporan.pembuat.nama : '-',
                tanggal_terima: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                judul_laporan: laporan.judul,
                jenis_laporan: laporan.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
                penerima: user.nama
            };
            try {
                fileOutput = await generateTandaTerimaPDF(pdfData);
            } catch (pdfError) {
                console.error("PDF Generation failed, skipping file creation:", pdfError.message);
                fileOutput = null;
            }
            updateData.file_output = fileOutput;
            updateData.penilaian = penilaianValue;
        }

        await laporan.update(updateData);

        const desc = status === 'Approved' ? `Laporan Internal "${laporan.judul}" telah disetujui oleh admin. Tanda terima diterbitkan.` : `Laporan Internal "${laporan.judul}" ditolak. Alasan: ${catatan || '-'}`;
        await logActivity(user.id, id, status === 'Approved' ? 'APPROVE' : 'REJECT', desc);

    } else if (source_table === 'eksternal') {
        const laporan = await LaporanEksternal.findByPk(id);
        if (!laporan) throw new Error('Laporan Eksternal tidak ditemukan');
        if (isRegionalAdmin && Number(laporan.wilayah_id) !== Number(user.wilayah_id)) {
            throw new Error('Akses ditolak: laporan berada di luar wilayah Anda.');
        }
        if (laporan.status !== 'pending') throw new Error('Laporan sudah diproses.');
        
        let updateData = { status, catatan: catatan || '' };

        if (status === 'Approved') {
            const nomorSertifikat = `${new Date().getFullYear()}${String(id).padStart(5, '0')}`;
            const sertifikatData = {
                nama_penerima: laporan.nama_pengirim,
                nama_instansi: laporan.instansi_pengirim || laporan.nama_pengirim,
                judul_laporan: laporan.judul_laporan,
                jenis_laporan: laporan.jenis_pengirim === 'mitra' ? 'Laporan Mitra' : 'Laporan Eksternal',
                nama_admin: user.nama,
                nomor_sertifikat: nomorSertifikat,
                tanggal_terbit: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            };
            try {
                fileOutput = await generateESertifikatPDF(sertifikatData);
            } catch (pdfError) {
                console.error("E-Sertifikat Generation failed, skipping file creation:", pdfError.message);
                fileOutput = null;
            }
            updateData.file_output = fileOutput;
        }

        await laporan.update(updateData);

        const desc = status === 'Approved' ? `Laporan Eksternal/Mitra "${laporan.judul_laporan}" telah disetujui. E-Sertifikat diterbitkan.` : `Laporan Eksternal/Mitra "${laporan.judul_laporan}" ditolak. Alasan: ${catatan || '-'}`;
        try {
            await ActivityLog.create({
                user_id: user.id,
                action: status === 'Approved' ? 'APPROVE' : 'REJECT',
                description: desc
            });
        } catch (ignore) {}

    } else {
        throw new Error('Source table tidak valid');
    }

    return { message: `Laporan ${source_table} berhasil diubah status menjadi ${status}`, file_output: fileOutput };
};

const getPendingReportsLogic = async (user) => {
    let intWhere = { status: 'Pending' };
    let eksWhere = { status: 'pending' };

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        intWhere.wilayah_id = user.wilayah_id;
        eksWhere.wilayah_id = user.wilayah_id;
    }

    const intRows = await LaporanInternal.findAll({
        where: intWhere,
        include: [
            { model: Wilayah, as: 'wilayah_rel' },
            { model: Resor, as: 'resor_rel' },
            { model: Pengguna, as: 'pembuat' }
        ]
    });

    const eksRows = await LaporanEksternal.findAll({
        where: eksWhere,
        include: [
            { model: Wilayah, as: 'wilayah_rel' },
            { model: Resor, as: 'resor_rel' },
            { model: Kategori, as: 'kategori_rel' }
        ]
    });

    const formatInternal = intRows.map(l => ({
        id: l.id,
        judul: l.judul,
        jenis: l.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
        tanggal: l.created_at,
        status: l.status,
        penilaian: l.penilaian,
        wilayah: l.resor_rel ? l.resor_rel.nama_resor : (l.wilayah_rel ? l.wilayah_rel.nama_wilayah : (l.wilayah_id === 1 ? 'Balai TNGM' : null)),
        pelapor: l.pembuat ? l.pembuat.nama : null,
        tipe_laporan: 'Internal',
        source_table: 'internal'
    }));

    const formatEksternal = eksRows.map(e => ({
        id: e.id,
        judul: e.judul_laporan,
        jenis: e.kategori_rel ? e.kategori_rel.nama_kategori : null,
        tanggal: e.created_at,
        status: e.status,
        penilaian: null,
        wilayah: e.resor_rel ? e.resor_rel.nama_resor : (e.wilayah_rel ? e.wilayah_rel.nama_wilayah : (e.wilayah_id === 1 ? 'Balai TNGM' : null)),
        pelapor: e.nama_pengirim,
        tipe_laporan: e.jenis_pengirim === 'mitra' ? 'Mitra' : 'Eksternal',
        source_table: 'eksternal'
    }));

    const reports = [...formatInternal, ...formatEksternal].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    return reports;
};

const getApprovedReportsLogic = async (user) => {
    let intWhere = { status: 'Approved' };
    let eksWhere = { status: 'approved' };

    if (user.role === 'admin_wilayah' || user.role === 'kepala_wilayah') {
        intWhere.wilayah_id = user.wilayah_id;
        // Since original logic checked l.resor_id IS NOT NULL, we could apply it but to be safer we just use exact equivalent
        // Actually the original query did: AND l.resor_id IS NOT NULL
        // Because admin_wilayah shouldn't see 'Balai TNGM' level things? 
        const { Op } = require('sequelize');
        intWhere.resor_id = { [Op.not]: null };
        eksWhere.id = -1; // and 1=0
    }

    const intRows = await LaporanInternal.findAll({
        where: intWhere,
        include: [
            { model: Wilayah, as: 'wilayah_rel' },
            { model: Resor, as: 'resor_rel' },
            { model: Pengguna, as: 'pembuat' }
        ]
    });

    const eksRows = await LaporanEksternal.findAll({
        where: eksWhere,
        include: [
            { model: Wilayah, as: 'wilayah_rel' },
            { model: Resor, as: 'resor_rel' },
            { model: Kategori, as: 'kategori_rel' }
        ]
    });

    const formatInternal = intRows.map(l => ({
        id: l.id,
        judul: l.judul,
        jenis: l.jenis_laporan === 'A' ? 'Laporan A' : 'Laporan B',
        tanggal: l.created_at,
        status: l.status,
        file_laporan: l.file_laporan,
        file_output: l.file_output,
        penilaian: l.penilaian,
        report_resor_id: l.resor_id,
        wilayah: l.resor_rel ? l.resor_rel.nama_resor : 'Balai TNGM',
        pelapor: l.pembuat ? l.pembuat.nama : null,
        current_resor_id: l.pembuat ? l.pembuat.resor_id : null,
        tipe_laporan: 'Internal',
        source_table: 'internal'
    }));

    const formatEksternal = eksRows.map(e => ({
        id: e.id,
        judul: e.judul_laporan,
        jenis: e.kategori_rel ? e.kategori_rel.nama_kategori : null,
        tanggal: e.created_at,
        status: e.status,
        file_laporan: e.file_dokumen,
        file_output: e.file_output,
        penilaian: null,
        report_resor_id: e.resor_id,
        wilayah: e.resor_rel ? e.resor_rel.nama_resor : (e.wilayah_rel ? e.wilayah_rel.nama_wilayah : (e.wilayah_id === 1 ? 'Balai TNGM' : null)),
        pelapor: e.nama_pengirim,
        current_resor_id: null,
        tipe_laporan: e.jenis_pengirim === 'mitra' ? 'Mitra' : 'Eksternal',
        source_table: 'eksternal'
    }));

    const reports = [...formatInternal, ...formatEksternal].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    return reports.map(r => ({
        ...r,
        is_mutasi: r.report_resor_id && r.current_resor_id ? r.report_resor_id !== r.current_resor_id : false
    }));
};

module.exports = { verifyLaporanLogic, getPendingReportsLogic, getApprovedReportsLogic };
