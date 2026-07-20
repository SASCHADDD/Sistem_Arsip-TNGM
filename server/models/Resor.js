const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resor = sequelize.define('Resor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  wilayah_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nama_resor: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  kabupaten: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'resor',
  timestamps: false,
});

module.exports = Resor;
