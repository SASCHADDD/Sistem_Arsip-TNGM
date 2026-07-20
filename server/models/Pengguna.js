const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pengguna = sequelize.define('Pengguna', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  instansi: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff', 'eksternal', 'mitra'),
    allowNull: false,
  },
  wilayah_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  resor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  }
}, {
  tableName: 'pengguna',
  timestamps: false,
});

module.exports = Pengguna;
