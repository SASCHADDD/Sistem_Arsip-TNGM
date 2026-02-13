import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from './Pages/Landing.jsx'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import Login from './Pages/Login.jsx'
import DashboardAdmin from './Pages/admin/Dashboard.jsx';
import VerifikasiLaporan from './Pages/admin/VerifikasiLaporan.jsx';
import DashboardUser from './Pages/user/Dashboard.jsx';
import UploadLaporan from './Pages/user/UploadLaporan.jsx';
import RiwayatLaporan from "./Pages/user/RiwayatLaporan.jsx";
import DetailLaporan from "./Pages/user/DetailLaporan.jsx";
import Eksternal from "./Pages/eksternal/Eksternal.jsx";
import Mitra from "./Pages/mitra/Mitra.jsx";
import DataLaporan from "./Pages/admin/DataLaporan.jsx";

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path='/user/dashboard' element={<DashboardUser />} />
          <Route path='/user/upload-laporan' element={<UploadLaporan />} />
          <Route path='/user/riwayat-laporan' element={<RiwayatLaporan />} />
          <Route path='/user/detail-laporan/:id' element={<DetailLaporan />} />
          <Route path='/eksternal/Eksternal' element={<Eksternal />} />
          <Route path='/mitra/Mitra' element={<Mitra />} />
          <Route path='/admin/verifikasi-laporan' element={<VerifikasiLaporan />} />
          <Route path='/admin/DataLaporan' element={<DataLaporan />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
