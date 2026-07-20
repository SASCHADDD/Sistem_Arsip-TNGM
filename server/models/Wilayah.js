const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wilayah = sequelize.define('Wilayah', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama_wilayah: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'wilayah',
  timestamps: false,
});

module.exports = Wilayah;
