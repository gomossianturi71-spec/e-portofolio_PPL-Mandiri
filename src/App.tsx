import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Beranda from '@/pages/Beranda';
import ProdukPraktikMengajar from '@/pages/ProdukPraktikMengajar';
import SiklusDetail from '@/pages/SiklusDetail';
import AnalisisPraktikMengajar from '@/pages/AnalisisPraktikMengajar';
import AnalisisDetail from '@/pages/AnalisisDetail';
import AnalisisItem from '@/pages/AnalisisItem';
import DokumentasiPPL from '@/pages/DokumentasiPPL';
import Lampiran from '@/pages/Lampiran';
import Kelola from '@/pages/Kelola';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Beranda />} />
              <Route path="/produk" element={<ProdukPraktikMengajar />} />
              <Route path="/produk/siklus/:cycle" element={<SiklusDetail />} />
              <Route path="/analisis" element={<AnalisisPraktikMengajar />} />
              <Route path="/analisis/:type" element={<AnalisisDetail />} />
              <Route path="/analisis/:type/:id" element={<AnalisisItem />} />
              <Route path="/dokumentasi" element={<DokumentasiPPL />} />
              <Route path="/lampiran" element={<Lampiran />} />
              <Route path="/kelola" element={<Kelola />} />
              <Route path="*" element={<Beranda />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
