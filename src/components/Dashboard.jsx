import { useState } from 'react'
import {
    RiDownloadLine,
    RiAddLine,
    RiSearchLine,
    RiStockLine,
    RiArrowDownLine,
    RiFilter3Line,
    RiCalendarLine,
    RiRefreshLine,
    RiShareLine,
    RiInformationLine,
    RiCloseLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiImageLine,
} from 'react-icons/ri'
import Sidebar from './Sidebar'

const metricCards = [
    {
        label: 'Total Penduduk',
        value: '2,847',
        change: '+3.2%',
        up: true,
        live: true,
    },
    {
        label: 'Kasus Stunting',
        value: '38',
        change: '-5.1%',
        up: false,
        live: false,
    },
    {
        label: 'Berita Tayang',
        value: '124',
        change: '+8.5%',
        up: true,
        live: false,
    },
    {
        label: 'Pengaduan Aktif',
        value: '9',
        change: '-2.0%',
        up: false,
        live: true,
    },
]

const barData = [
    { label: 'Sen', height: 60 },
    { label: 'Sel', height: 90 },
    { label: 'Rab', height: 70 },
    { label: 'Kam', height: 130 },
    { label: 'Jum', height: 100 },
    { label: 'Sab', height: 55 },
    { label: 'Min', height: 40 },
]

const transactions = [
    {
        initials: 'BN',
        name: 'Budi Nugroho',
        desc: 'Pendaftaran penduduk baru',
        badge: 'Selesai',
        badgeColor: 'bg-green-500/10 text-green-400',
        amount: '+1 Penduduk',
        amountColor: 'text-green-400',
    },
    {
        initials: 'SR',
        name: 'Siti Rahayu',
        desc: 'Laporan kasus stunting RT 03',
        badge: 'Proses',
        badgeColor: 'bg-orange-500/10 text-orange-400',
        amount: '1 Kasus',
        amountColor: 'text-[#ADADB0]',
    },
    {
        initials: 'AW',
        name: 'Ahmad Wahyudi',
        desc: 'Pengaduan jalan rusak RW 02',
        badge: 'Baru',
        badgeColor: 'bg-blue-500/10 text-blue-400',
        amount: '1 Pengaduan',
        amountColor: 'text-[#ADADB0]',
    },
    {
        initials: 'DK',
        name: 'Dinas Keuangan',
        desc: 'Input realisasi APBDes Q1 2026',
        badge: 'Selesai',
        badgeColor: 'bg-green-500/10 text-green-400',
        amount: 'Rp 48,5 Jt',
        amountColor: 'text-green-400',
    },
]

const tableRows = [
    { initials: 'RT01', name: 'RT 01 / RW 01', count: '142 KK', stunting: '2', status: 'Aktif', statusColor: 'bg-green-500/10 text-green-400', time: '2 jam lalu' },
    { initials: 'RT02', name: 'RT 02 / RW 01', count: '138 KK', stunting: '5', status: 'Aktif', statusColor: 'bg-green-500/10 text-green-400', time: '5 jam lalu' },
    { initials: 'RT03', name: 'RT 03 / RW 02', count: '119 KK', stunting: '8', status: 'Perlu Update', statusColor: 'bg-orange-500/10 text-orange-400', time: '1 hari lalu' },
    { initials: 'RT04', name: 'RT 04 / RW 02', count: '155 KK', stunting: '1', status: 'Aktif', statusColor: 'bg-green-500/10 text-green-400', time: '3 hari lalu' },
    { initials: 'RT05', name: 'RT 05 / RW 03', count: '98 KK', stunting: '3', status: 'Aktif', statusColor: 'bg-green-500/10 text-green-400', time: 'Baru saja' },
]

const galleryItems = [
    {
        iconColor: 'text-[#4A4A4E]',
        gradientFrom: '#1A1A1D',
        gradientTo: '#2A2A2E',
        title: 'Gotong Royong Desa',
        desc: 'Kegiatan bersih desa setiap bulan bersama warga',
        accentColor: null,
    },
    {
        iconColor: 'text-[#298064]',
        gradientFrom: '#1F1F23',
        gradientTo: '#29806433',
        title: 'Festival Budaya 2025',
        desc: 'Perayaan hari jadi desa dengan pertunjukan seni',
        accentColor: '#298064',
    },
    {
        iconColor: 'text-green-400',
        gradientFrom: '#22C55E18',
        gradientTo: '#1F1F23',
        title: 'Panen Raya Bersama',
        desc: 'Dokumentasi panen raya warga kelompok tani',
        accentColor: '#22C55E',
    },
]

export default function Dashboard({ user, onLogout }) {
    const [bannerVisible, setBannerVisible] = useState(true)
    const [searchValue, setSearchValue] = useState('')

    return (
        <div className="flex h-screen bg-[#0A0A0B] overflow-hidden">
            {/* ── SIDEBAR ── */}
            <Sidebar user={user} onLogout={onLogout} />

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-7 px-10 py-8">

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-medium">Overview</span>
                    </div>

                    {/* Page Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <h1
                                className="text-white leading-tight"
                                style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, letterSpacing: -1 }}
                            >
                                Overview
                            </h1>
                            <p className="text-[#6B6B70] text-sm">
                                Pantau data penduduk, stunting, keuangan, dan pengaduan Desa Puundoho
                            </p>
                        </div>
                        {/* <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2A2A2E] text-white text-[13px] font-medium hover:bg-[#1A1A1D] transition-colors">
                                <RiDownloadLine size={16} className="text-[#8B8B90]" />
                                Ekspor
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] text-white text-[13px] font-medium hover:bg-[#1f6b50] transition-colors">
                                <RiAddLine size={16} />
                                Tambah Laporan
                            </button>
                        </div> */}
                    </div>

                    {/* Search Bar */}
                    {/* <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                            <RiSearchLine size={16} className="text-[#6B6B70] shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari penduduk, berita, pengaduan, keuangan..."
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                className="flex-1 bg-transparent text-[#4A4A4E] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                            />
                        </div>
                    </div> */}

                    {/* Metric Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {metricCards.map((card) => (
                            <div
                                key={card.label}
                                className="flex flex-col gap-4 p-5 rounded-xl bg-[#141417] border border-[#1F1F23]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[#6B6B70] text-xs font-medium tracking-wide uppercase">
                                        {card.label}
                                    </span>
                                    {card.live && (
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full bg-green-400"
                                                style={{ boxShadow: '0 0 8px #22C55E88' }}
                                            />
                                            <span className="text-green-400 text-[10px] font-medium">Live</span>
                                        </div>
                                    )}
                                </div>
                                <span
                                    className="text-white"
                                    style={{ fontFamily: 'DM Mono, monospace', fontSize: 32, fontWeight: 500, letterSpacing: -1 }}
                                >
                                    {card.value}
                                </span>
                                <div className="flex items-center gap-1">
                                    {card.up
                                        ? <RiStockLine size={14} className="text-green-400" />
                                        : <RiArrowDownLine size={14} className="text-red-400" />
                                    }
                                    <span className={`text-xs font-medium ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                                        {card.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3">
                        {[
                            { icon: RiFilter3Line, label: 'Filter' },
                            { icon: RiCalendarLine, label: 'Rentang Tanggal' },
                            { icon: RiRefreshLine, label: 'Refresh' },
                            { icon: RiShareLine, label: 'Bagikan' },
                        ].map(({ icon: Icon, label }) => (
                            <button
                                key={label}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] text-[#ADADB0] text-xs font-medium hover:bg-[#2A2A2E] transition-colors"
                            >
                                <Icon size={14} className="text-[#6B6B70]" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Bar Chart */}
                    <div className="flex flex-col gap-5 p-6 rounded-xl bg-[#141417] border border-[#1F1F23]">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">Aktivitas Mingguan</span>
                            <span className="text-[#6B6B70] text-xs">7 hari terakhir</span>
                        </div>
                        <div className="flex items-end gap-3 h-[180px]">
                            {barData.map((bar) => (
                                <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                                    <div
                                        className="w-full rounded-t-[4px]"
                                        style={{
                                            height: bar.height,
                                            background: 'linear-gradient(180deg, #298064 0%, #3aad85 100%)',
                                        }}
                                    />
                                    <span className="text-[#6B6B70] text-[11px]">{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">Aktivitas Terbaru</span>
                            <button className="text-[#298064] text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity">
                                Lihat semua <RiArrowRightLine size={12} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {transactions.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between p-4 rounded-[10px] bg-[#141417] border border-[#1F1F23]"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-lg bg-[#1F1F23] flex items-center justify-center shrink-0">
                                            <span className="text-[#8B8B90] text-xs font-semibold">{item.initials}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white text-sm font-medium">{item.name}</span>
                                            <span className="text-[#6B6B70] text-xs">{item.desc}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.badgeColor}`}>
                                            {item.badge}
                                        </span>
                                        <span
                                            className={`text-sm font-medium text-right ${item.amountColor}`}
                                            style={{ fontFamily: 'DM Mono, monospace', minWidth: 100 }}
                                        >
                                            {item.amount}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                            {[1, 2, 3].map((page) => (
                                <button
                                    key={page}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${page === 1
                                        ? 'bg-[#298064] text-white'
                                        : 'bg-[#1A1A1D] text-[#6B6B70] hover:bg-[#2A2A2E]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="w-8 h-8 rounded-md bg-[#1A1A1D] flex items-center justify-center hover:bg-[#2A2A2E] transition-colors">
                                <RiArrowRightLine size={16} className="text-[#6B6B70]" />
                            </button>
                        </div>
                    </div>

                    {/* Info Banner */}
                    {bannerVisible && (
                        <div className="flex items-center justify-between px-4 py-3.5 rounded-[10px] bg-[#1A1A1D] border border-[#2A2A2E]">
                            <div className="flex items-center gap-3">
                                <RiInformationLine size={16} className="text-[#298064] shrink-0" />
                                <span className="text-[#ADADB0] text-[13px]">
                                    Pembaruan data kependudukan dijadwalkan pada 20 Februari 2026. Pastikan data RT/RW sudah diperbarui.
                                </span>
                            </div>
                            <button onClick={() => setBannerVisible(false)}>
                                <RiCloseLine size={16} className="text-[#6B6B70] hover:text-white transition-colors" />
                            </button>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">Data RT/RW</span>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1A1A1D] text-[#ADADB0] text-xs font-medium hover:bg-[#2A2A2E] transition-colors">
                                <RiDownloadLine size={14} className="text-[#6B6B70]" />
                                Ekspor
                            </button>
                        </div>

                        <div className="rounded-xl overflow-hidden border border-[#1F1F23] bg-[#111113]">
                            {/* Table Head */}
                            <div className="grid grid-cols-5 px-5 py-3.5 border-b border-[#1F1F23] bg-[#141417]">
                                {['Wilayah', 'Jumlah KK', 'Stunting', 'Status', 'Terakhir Update'].map((h) => (
                                    <span key={h} className="text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">
                                        {h}
                                    </span>
                                ))}
                            </div>
                            {/* Rows */}
                            {tableRows.map((row, i) => (
                                <div
                                    key={row.name}
                                    className={`grid grid-cols-5 items-center px-5 py-3.5 ${i < tableRows.length - 1 ? 'border-b border-[#1F1F23]' : ''
                                        } bg-[#141417] hover:bg-[#1A1A1D] transition-colors`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#2A2A2E] flex items-center justify-center shrink-0">
                                            <span className="text-[#8B8B90] text-[10px] font-semibold">{row.initials}</span>
                                        </div>
                                        <span className="text-white text-[13px] font-medium">{row.name}</span>
                                    </div>
                                    <span className="text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>
                                        {row.count}
                                    </span>
                                    <span className={`text-xs font-medium ${parseInt(row.stunting) >= 5 ? 'text-red-400' : 'text-[#ADADB0]'}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                                        {row.stunting} kasus
                                    </span>
                                    <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-medium ${row.statusColor}`}>
                                        {row.status}
                                    </span>
                                    <span className="text-[#6B6B70] text-xs">{row.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="flex flex-col gap-4 pb-8">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">Galeri Kegiatan</span>
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-lg bg-[#1A1A1D] flex items-center justify-center hover:bg-[#2A2A2E] transition-colors">
                                    <RiArrowLeftLine size={16} className="text-[#6B6B70]" />
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-[#298064] flex items-center justify-center hover:bg-[#1f6b50] transition-colors">
                                    <RiArrowRightLine size={16} className="text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {galleryItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl overflow-hidden border border-[#1F1F23] bg-[#111113] flex flex-col"
                                >
                                    <div
                                        className="h-[140px] flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${item.gradientFrom} 0%, ${item.gradientTo} 100%)`,
                                        }}
                                    >
                                        <RiImageLine size={32} className={item.iconColor} />
                                    </div>
                                    <div className="flex flex-col gap-2 p-4">
                                        <span className="text-white text-[13px] font-semibold">{item.title}</span>
                                        <span className="text-[#6B6B70] text-xs leading-relaxed">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

