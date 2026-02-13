import { useState } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';

const DataLaporan = () => {
    const verificationData = [
        { id: 1, date: '2023-10-25', title: 'Laporan Kegiatan Patroli Rutin', type: 'Kegiatan', region: 'Sleman', status: 'Menunggu' },
        { id: 2, date: '2023-10-24', title: 'Permohonan Izin Penelitian Flora', type: 'Penelitian', region: 'Magelang', status: 'Disetujui' },
        { id: 3, date: '2023-10-23', title: 'Laporan Kerusakan Fasilitas Pos 2', type: 'Kejadian', region: 'Klaten', status: 'Ditolak' },
        { id: 4, date: '2023-10-22', title: 'Pengajuan Kerjasama Penanaman Pohon', type: 'Kerjasama', region: 'Boyolali', status: 'Menunggu' },
        { id: 5, date: '2023-10-21', title: 'Laporan Bulanan Mitra', type: 'Laporan Bulanan', region: 'Lintas Wilayah', status: 'Disetujui' },
    ];

return (
        <SidebarAdmin>
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white-900">Data Laporan</h2>
                    <p className="text-white-500 text-sm">Kelola dan tinjau semua laporan yang telah masuk ke sistem.</p>
                </div>

                {/* Content can be added here */}

            </div>
        </SidebarAdmin>
    );
};
export default DataLaporan; 