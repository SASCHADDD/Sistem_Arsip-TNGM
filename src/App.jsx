import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Landing from './Pages/Landing.jsx'

import Login from './Pages/Login.jsx'
import DashboardAdmin from "./Pages/admin/DashboardAdmin.jsx";
import VerifikasiLaporan from './Pages/admin/VerifikasiLaporan.jsx';
import DashboardUser from './Pages/user/Dashboard.jsx';
import UploadLaporan from './Pages/user/UploadLaporan.jsx';
import RiwayatLaporan from "./Pages/user/RiwayatLaporan.jsx";
import DetailLaporan from "./Pages/user/DetailLaporan.jsx";
import Eksternal from "./Pages/eksternal/Eksternal.jsx";
import Mitra from "./Pages/mitra/Mitra.jsx";
import DataLaporan from "./Pages/admin/DataLaporan.jsx";
import DetailLaporanAdmin from "./Pages/admin/DetailLaporanAdmin.jsx";
import ManajemenStaff from "./Pages/admin/ManajemenStaff.jsx";
import DetailStaffAdmin from "./Pages/admin/DetailStaffAdmin.jsx";
import InputArsipLama from "./Pages/admin/InputArsipLama.jsx";
import DetailAktivitas from "./Pages/DetailAktivitas.jsx";

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/Login" replace />;
};

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path='/eksternal/Eksternal' element={<Eksternal />} />
          <Route path='/mitra/Mitra' element={<Mitra />} />

          {/* private route*/}
          <Route element={<PrivateRoute />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path='/user/dashboard' element={<DashboardUser />} />
            <Route path="/user/riwayat-laporan" element={<RiwayatLaporan />} />
            <Route path="/user/upload-laporan" element={<UploadLaporan />} />
            <Route path="/user/laporan/edit/:id" element={<UploadLaporan />} />
            <Route path="/user/detail-laporan/:id" element={<DetailLaporan />} />
            <Route path='/admin/verifikasi-laporan' element={<VerifikasiLaporan />} />
            <Route path='/admin/detail-laporan/:id' element={<DetailLaporanAdmin />} />
            <Route path='/admin/DataLaporan' element={<DataLaporan />} />
            <Route path='/admin/manajemen-staff' element={<ManajemenStaff />} />
            <Route path='/admin/akun-staff/:id' element={<DetailStaffAdmin />} />
            <Route path='/admin/input-arsip' element={<InputArsipLama />} />
            <Route path='/detail-aktivitas' element={<DetailAktivitas />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
