const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanInternal = sequelize.define('LaporanInternal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  judul: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  jenis_laporan: {
    type: DataTypes.ENUM('A', 'B'),
    allowNull: false,
  },
  tanggal_berakhir: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  foto_hardfile: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_output: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  wilayah_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  penilaian: {
    type: DataTypes.ENUM('Baik', 'Cukup', 'Kurang'),
    allowNull: true,
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'laporan_internal',
  timestamps: false,
});

module.exports = LaporanInternal;
