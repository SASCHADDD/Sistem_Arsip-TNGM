const FormService = require('../../services/laporan/FormService');

const getFormOptions = async (req, res) => {
    try {
        const options = await FormService.getOptions();
        res.json(options);
    } catch (error) {
        console.error('Get Form Options Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data form' });
    }
};

module.exports = { getFormOptions };
