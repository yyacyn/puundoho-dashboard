import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Overview from './Overview'
import BendaharaOverview from './BendaharaOverview'
import Articles from './Articles'
import Listing from './Listing'
import Gallery from './Gallery'
import PendudukList from './PendudukList'
import PendudukEditor from './PendudukEditor'
import Stunting from './Stunting'
import DusunList from './DusunList'
import IdmSdgs from './IdmSdgs'
import Bansos from './Bansos'
import ApbDes from './ApbDes'
import ProdukDesa from './Belanja'
import Pengaduan from './Pengaduan'
import Pengajuan from './Pengajuan'
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

export default function DashboardLayout({ user, role, onLogout }) {
    return (
        <div className="flex h-screen bg-[#0A0A0B] overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} role={role} onLogout={onLogout} />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    <Route index element={role === 'bendahara' ? <BendaharaOverview /> : <Overview />} />
                    <Route path="penduduk" element={<PendudukList />} />
                    <Route path="penduduk/:id" element={<PendudukEditor />} />
                    <Route path="stunting" element={<Stunting />} />
                    <Route path="bansos" element={<Bansos />} />
                    <Route path="dusun" element={<DusunList />} />
                    <Route path="idm-sdgs" element={<IdmSdgs />} />
                    <Route path="keuangan/apbdes" element={<ApbDes />} />
                    <Route path="keuangan/belanja" element={<ProdukDesa />} />
                    <Route path="listing" element={<Listing />} />
                    <Route path="berita" element={<Articles />} />
                    <Route path="galeri" element={<Gallery />} />
                    <Route path="pengaduan" element={<Pengaduan />} />
                    <Route path="pengajuan" element={<Pengajuan />} />
                    {/* Catch-all inside dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    )
}
