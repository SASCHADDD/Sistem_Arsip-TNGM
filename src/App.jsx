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
import LoginEksternal from "./Pages/eksternal/LoginEksternal.jsx";
import DashboardEksternal from "./Pages/eksternal/DashboardEksternal.jsx";
import Mitra from "./Pages/mitra/Mitra.jsx";
import LoginMitra from "./Pages/mitra/LoginMitra.jsx";
import DataLaporan from "./Pages/admin/DataLaporan.jsx";
import DetailLaporanAdmin from "./Pages/admin/DetailLaporanAdmin.jsx";
import ManajemenStaff from "./Pages/admin/ManajemenStaff.jsx";
import DetailStaffAdmin from "./Pages/admin/DetailStaffAdmin.jsx";
import InputArsipLama from "./Pages/admin/InputArsipLama.jsx";
import DetailAktivitas from "./Pages/DetailAktivitas.jsx";
import PreviewDokumen from "./Pages/PreviewDokumen.jsx";

const INTERNAL_ROLES = ['admin_balai', 'admin_wilayah', 'kepala_wilayah', 'staff'];
const ADMIN_ROLES = ['admin_balai', 'admin_wilayah', 'kepala_wilayah'];

const PrivateRoute = ({ allowedRoles = INTERNAL_ROLES }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/Login" replace />;

  let user;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return <Navigate to="/Login" replace />;
  }

  if (!user || !INTERNAL_ROLES.includes(user.role)) {
    return <Navigate to="/Login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'staff' ? '/user/dashboard' : '/admin/dashboard'} replace />;
  }

  return <Outlet />;
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
          <Route path='/eksternal/edit/:id' element={<Eksternal />} />
          <Route path='/eksternal/login' element={<LoginEksternal />} />
          <Route path='/eksternal/dashboard' element={<DashboardEksternal />} />
          <Route path='/mitra/Mitra' element={<Mitra />} />
          <Route path='/mitra/edit/:id' element={<Mitra />} />
          <Route path='/mitra/login' element={<LoginMitra />} />
          <Route path='/mitra/dashboard' element={<DashboardEksternal />} />

          {/* private route*/}
          <Route element={<PrivateRoute allowedRoles={INTERNAL_ROLES} />}>
            <Route path="/preview-dokumen" element={<PreviewDokumen />} />
            <Route element={<PrivateRoute allowedRoles={ADMIN_ROLES} />}>
              <Route path="/admin/dashboard" element={<DashboardAdmin />} />
              <Route path='/admin/verifikasi-laporan' element={<VerifikasiLaporan />} />
              <Route path='/admin/detail-laporan/:id' element={<DetailLaporanAdmin />} />
              <Route path='/admin/DataLaporan' element={<DataLaporan />} />
              <Route path='/admin/manajemen-staff' element={<ManajemenStaff />} />
              <Route path='/admin/akun-staff/:id' element={<DetailStaffAdmin />} />
              <Route path='/admin/input-arsip' element={<InputArsipLama />} />
              <Route path='/admin/detail-aktivitas' element={<DetailAktivitas />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['staff']} />}>
              <Route path='/user/dashboard' element={<DashboardUser />} />
              <Route path="/user/riwayat-laporan" element={<RiwayatLaporan />} />
              <Route path="/user/upload-laporan" element={<UploadLaporan />} />
              <Route path="/user/laporan/edit/:id" element={<UploadLaporan />} />
              <Route path="/user/detail-laporan/:id" element={<DetailLaporan />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
