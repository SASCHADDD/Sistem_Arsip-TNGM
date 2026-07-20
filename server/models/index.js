const sequelize = require('../config/database');
const Kategori = require('./Kategori');
const Wilayah = require('./Wilayah');
const Resor = require('./Resor');
const Pengguna = require('./Pengguna');
const LaporanInternal = require('./LaporanInternal');
const LaporanEksternal = require('./LaporanEksternal');
const ActivityLog = require('./ActivityLog');

// Asosiasi Pengguna
Pengguna.belongsTo(Wilayah, { foreignKey: 'wilayah_id', as: 'wilayah_rel' });
Pengguna.belongsTo(Resor, { foreignKey: 'resor_id', as: 'resor_rel' });
Pengguna.hasMany(LaporanInternal, { foreignKey: 'created_by', as: 'laporan_rels' });

// Asosiasi Resor
Resor.belongsTo(Wilayah, { foreignKey: 'wilayah_id', as: 'wilayah_rel' });
Resor.hasMany(LaporanInternal, { foreignKey: 'resor_id', as: 'laporan_rels' });

// Asosiasi Laporan Internal
LaporanInternal.belongsTo(Wilayah, { foreignKey: 'wilayah_id', as: 'wilayah_rel' });
LaporanInternal.belongsTo(Resor, { foreignKey: 'resor_id', as: 'resor_rel' });
LaporanInternal.belongsTo(Pengguna, { foreignKey: 'created_by', as: 'pembuat' });

// Asosiasi Laporan Eksternal
LaporanEksternal.belongsTo(Kategori, { foreignKey: 'kategori_id', as: 'kategori_rel' });
LaporanEksternal.belongsTo(Wilayah, { foreignKey: 'wilayah_id', as: 'wilayah_rel' });
LaporanEksternal.belongsTo(Resor, { foreignKey: 'resor_id', as: 'resor_rel' });
LaporanEksternal.belongsTo(Pengguna, { foreignKey: 'diverifikasi_oleh', as: 'verifikator' });

// Asosiasi Activity Log
ActivityLog.belongsTo(Pengguna, { foreignKey: 'user_id', as: 'user_rel' });
ActivityLog.belongsTo(LaporanInternal, { foreignKey: 'laporan_id', as: 'laporan_rel' });

module.exports = {
  sequelize,
  Kategori,
  Wilayah,
  Resor,
  Pengguna,
  LaporanInternal,
  LaporanEksternal,
  ActivityLog,
};
