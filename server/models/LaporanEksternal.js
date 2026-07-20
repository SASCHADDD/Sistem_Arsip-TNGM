const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanEksternal = sequelize.define('LaporanEksternal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  jenis_pengirim: {
    type: DataTypes.ENUM('mitra', 'eksternal', 'pengaju simaksi'),
    allowNull: false,
  },
  nama_pengirim: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  instansi_pengirim: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email_pengirim: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  nomor_pks: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  judul_laporan: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  kategori_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  wilayah_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tanggal_berakhir: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_dokumen: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_lampiran: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_output: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  diverifikasi_oleh: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  diverifikasi_pada: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'laporan_eksternal',
  timestamps: false,
});

module.exports = LaporanEksternal;
