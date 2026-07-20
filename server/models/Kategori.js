const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kategori = sequelize.define('Kategori', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nama_kategori: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'kategori',
  timestamps: false,
});

module.exports = Kategori;
