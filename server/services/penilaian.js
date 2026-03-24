/**
@param {Object} laporan //- The report object from the database containing tanggal_berakhir and jenis_laporan.
@returns {String}// grading value: 'Baik', 'Cukup', or 'Kurang'
 */
const hitungPenilaian = (laporan) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tanggalBerakhir = new Date(laporan.tanggal_berakhir);
    tanggalBerakhir.setHours(0, 0, 0, 0);

    const deadline = new Date(tanggalBerakhir);
    if (laporan.jenis_laporan === 'A') {
        deadline.setDate(deadline.getDate() + 5);
    } else if (laporan.jenis_laporan === 'B') {
        deadline.setDate(deadline.getDate() + 30);
    }

    let penilaianValue = null;
    if (today > deadline) {
        penilaianValue = 'Kurang';
    } else if (today.getTime() === deadline.getTime()) {
        penilaianValue = 'Cukup';
    } else {
        penilaianValue = 'Baik';
    }

    return penilaianValue;
};

module.exports = {hitungPenilaian};
