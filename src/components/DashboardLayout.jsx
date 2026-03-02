import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Overview from './Overview'
import Articles from './Articles'
import { RiAlertLine } from 'react-icons/ri'

// Placeholder for pages not yet built
function ComingSoon({ title }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-10 py-20">
            <RiAlertLine size={50}/>
            <h2 className="text-white text-2xl font-semibold">{title}</h2>
            <p className="text-[#6B6B70] text-sm max-w-xs">
                Halaman ini sedang dalam pengembangan.
            </p>
        </div>
    )
}

export default function DashboardLayout({ user, onLogout }) {
    return (
        <div className="flex h-screen bg-[#0A0A0B] overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} onLogout={onLogout} />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="penduduk" element={<ComingSoon title="Data Penduduk" />} />
                    <Route path="stunting" element={<ComingSoon title="Data Stunting" />} />
                    <Route path="keuangan/apbdes" element={<ComingSoon title="APBDes" />} />
                    <Route path="keuangan/belanja" element={<ComingSoon title="Belanja" />} />
                    <Route path="listing" element={<ComingSoon title="Listing Fasilitas" />} />
                    <Route path="berita" element={<Articles />} />
                    <Route path="galeri" element={<ComingSoon title="Galeri Foto" />} />
                    <Route path="pengaduan" element={<ComingSoon title="Pengaduan Masyarakat" />} />
                    {/* Catch-all inside dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    )
}
