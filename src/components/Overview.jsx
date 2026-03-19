import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    RiDownloadLine,
    RiStockLine,
    RiArrowDownLine,
    RiRefreshLine,
    RiArrowRightLine,
    RiImageLine,
} from 'react-icons/ri'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, GeoJSON, useMap, Tooltip as MapTooltip } from 'react-leaflet'
import L from 'leaflet'
import { apiFetch } from '../api'

// Subcomponents for Interactive Map
function MapBounds({ dusuns }) {
    const map = useMap();
    useEffect(() => {
        if (!dusuns || dusuns.length === 0) return;
        let bounds = L.latLngBounds()
        let hasValidBounds = false;
        
        dusuns.forEach(d => {
            if (d.geojson_data) {
                try {
                    const geo = JSON.parse(d.geojson_data)
                    const layer = L.geoJSON(geo)
                    bounds.extend(layer.getBounds())
                    hasValidBounds = true
                } catch(e) {}
            }
        })

        if (hasValidBounds) {
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
        }
    }, [dusuns, map]);
    return null;
}

function BaseVillageBoundary() {
    const [geoData, setGeoData] = useState(null)
    const map = useMap();

    useEffect(() => {
        fetch('/puundoho_boundary.geojson')
            .then(res => res.json())
            .then(data => {
                setGeoData(data)
                try {
                     const layer = L.geoJSON(data)
                     map.fitBounds(layer.getBounds())
                } catch(e) {}
            })
            .catch(err => console.error("Error loading base map", err))
    }, [map])

    if (!geoData) return null;

    return (
        <GeoJSON 
            data={geoData} 
            style={{
                color: '#EAB308',
                weight: 4,
                opacity: 0.8,
                fillOpacity: 0.05,
                dashArray: '5, 10'
            }}
            interactive={false}
        />
    )
}

// Dummy transactions because we don't have a transaction log table yet
const defaultTransactions = [
    { initials: 'AK', name: 'Admin Kependudukan', desc: 'Memperbarui data penduduk Dusun 1', badge: 'Selesai', badgeColor: 'bg-green-500/10 text-green-400', amount: '+2 Jiwa', amountColor: 'text-green-400' },
    { initials: 'AW', name: 'Ahmad Wahyudi', desc: 'Pengaduan infrastruktur Dusun 2', badge: 'Baru', badgeColor: 'bg-blue-500/10 text-blue-400', amount: '1 Pengaduan', amountColor: 'text-[#ADADB0]' },
]

export default function Overview() {
    const navigate = useNavigate()

    // STATE DECLARATIONS
    const [selectedDusun, setSelectedDusun] = useState('Semua')
    const [selectedWaktu, setSelectedWaktu] = useState('Tahun Ini')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [mapLayer, setMapLayer] = useState('umum') // 'umum', 'agama', 'umur', 'gender'
    const [sidePanelMode, setSidePanelMode] = useState('agama') // 'agama', 'umur', 'gender'
    
    // API Data States
    const [datasets, setDatasets] = useState([])
    const [selectedDatasetId, setSelectedDatasetId] = useState('')
    
    const [statsData, setStatsData] = useState(null)
    const [statsLoading, setStatsLoading] = useState(false)
    
    const [totalArticles, setTotalArticles] = useState(0)
    const [galleryItems, setGalleryItems] = useState([])
    const [mapDusuns, setMapDusuns] = useState([])

    // Dummy values for unimplemented endpoints
    const [kasusStunting] = useState(16)
    const [pengaduanAktif] = useState(9)

    // FETCH INITIAL DATA (Datasets, Galeri, Articles)
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                // 1. Fetch Datasets
                const resDS = await apiFetch('/penduduk/datasets')
                if (resDS.ok) {
                    const dataDS = await resDS.json()
                    const sorted = (dataDS || []).sort((a,b) => b.tahun - a.tahun)
                    setDatasets(sorted)
                    if (sorted.length > 0) {
                        setSelectedDatasetId(sorted[0].id.toString())
                    }
                }
                
                // 2. Fetch Galeri
                const resGal = await apiFetch('/galeri')
                if (resGal.ok) {
                    const dataGal = await resGal.json()
                    setGalleryItems((dataGal.galeri || []).slice(0, 3) || []) // Max 3
                }

                // 3. Fetch Articles
                const resArt = await apiFetch('/articles')
                if (resArt.ok) {
                    const dataArt = await resArt.json()
                    setTotalArticles((dataArt.articles || []).length)
                }

                // 4. Fetch Dusun Boundaries for Map
                const resDusun = await apiFetch('/dusun')
                if (resDusun.ok) {
                    const dataDusun = await resDusun.json()
                    setMapDusuns(dataDusun.dusun || [])
                }

            } catch (error) {
                console.error("Failed to fetch initial data", error)
            }
        }
        fetchInitial()
    }, [refreshTrigger])

    // FETCH STATS WHEN DATASET CHANGES
    useEffect(() => {
        if (!selectedDatasetId) return
        const fetchStats = async () => {
            setStatsLoading(true)
            try {
                const res = await apiFetch(`/penduduk/datasets/${selectedDatasetId}/stats`)
                if (res.ok) {
                    const data = await res.json()
                    setStatsData(data)
                }
            } catch (err) {
                console.error("Failed to fetch stats for dataset", err)
            } finally {
                setStatsLoading(false)
            }
        }
        fetchStats()
    }, [selectedDatasetId, refreshTrigger])

    // DATA MAPPING & COMPUTATIONS
    
    // 1. Metric Cards Filter Multiplier (Simulasi karena tidak ada endpoint khusus rentang waktu API saat ini)
    const multiplier = useMemo(() => {
        let m = 1
        if (selectedDusun !== 'Semua') m *= 0.2 // Asumsi 1 dusun adalah 20%
        if (selectedWaktu === 'Bulan Ini') m *= 0.1 // Asumsi bulan ini 10%
        return m
    }, [selectedDusun, selectedWaktu])

    // Base values from API
    const basePenduduk = statsData && statsData.gender 
        ? (statsData.gender["Laki-laki"] || 0) + (statsData.gender["Perempuan"] || 0) 
        : 0

    const isNoDataLastYear = selectedWaktu === 'Tahun Ini'

    const metricCards = [
        { 
            label: 'Total Penduduk', 
            value: Math.floor(basePenduduk * multiplier).toLocaleString(), 
            change: isNoDataLastYear ? 'Tidak ada data tahun lalu' : '+3.2% vs Sblm', 
            up: isNoDataLastYear ? undefined : true, 
        },
        { 
            label: 'Kasus Stunting (Dummy)', 
            value: Math.floor(kasusStunting * multiplier).toLocaleString(), 
            change: isNoDataLastYear ? 'Tidak ada data tahun lalu' : '-5.1% vs Sblm', 
            up: isNoDataLastYear ? undefined : false, 
        },
        { 
            label: 'Berita Tayang', 
            value: Math.floor(totalArticles * multiplier).toLocaleString(), 
            change: isNoDataLastYear ? 'Tidak ada data tahun lalu' : '+8.5% vs Sblm', 
            up: isNoDataLastYear ? undefined : true, 
        },
        { 
            label: 'Pengaduan Aktif (Dummy)', 
            value: Math.floor(pengaduanAktif * multiplier).toLocaleString(), 
            change: isNoDataLastYear ? 'Tidak ada data tahun lalu' : '-2.0% vs Sblm', 
            up: isNoDataLastYear ? undefined : false, 
        },
    ]

    // 2. Gender Data Array for Recharts PieChart
    const genderArray = useMemo(() => {
        if (!statsData || !statsData.gender) return []
        return [
            { name: 'Laki-laki', value: statsData.gender['Laki-laki'] || 0, color: '#3B82F6' },
            { name: 'Perempuan', value: statsData.gender['Perempuan'] || 0, color: '#EC4899' },
        ]
    }, [statsData])

    // 3. Dusun Data Array for Table and BarChart
    const dusunArray = useMemo(() => {
        if (!statsData || !statsData.dusun) return []
        
        // Remove "Tidak Diketahui" or handle it gracefully
        return Object.entries(statsData.dusun)
            .filter(([name]) => name.toLowerCase().includes('dusun'))
            .map(([name, count], index) => {
                // Generate a dummy stunting count for now just to populate the graph
                const dummyStunting = Math.floor(count * 0.02) 
                
                let status = 'Aktif'
                let statusColor = 'bg-green-500/10 text-green-400'
                if (dummyStunting >= 5) {
                    status = 'Waspada'
                    statusColor = 'bg-red-500/10 text-red-400'
                } else if (dummyStunting >= 2) {
                    status = 'Perlu Perhatian'
                    statusColor = 'bg-orange-500/10 text-orange-400'
                }

                return {
                    id: `DS${index + 1}`,
                    name: name,
                    penduduk: count,
                    stunting: dummyStunting,
                    status: status,
                    statusColor: statusColor,
                    time: 'Hari ini'
                }
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [statsData])

    // 4. Combine Dusun boundaries with demographic stats for Map Tooltip
    const combinedMapDusuns = useMemo(() => {
        return mapDusuns.map(d => {
            const dusunNameKey = d.nama_dusun
            const statItem = dusunArray.find(s => s.name.toLowerCase() === dusunNameKey.toLowerCase()) || {}
            
            const getBreakdown = (sourceDict) => {
                if (!sourceDict) return {}
                const breakdown = {}
                for (const [key, dusunMap] of Object.entries(sourceDict)) {
                    // Match either direct name, uppercased, or exact map representation
                    const val = dusunMap[dusunNameKey] || dusunMap[dusunNameKey.toUpperCase()] || 0
                    if (val > 0) breakdown[key] = val
                }
                return breakdown
            }

            return {
                ...d,
                penduduk: statItem.penduduk || 0,
                stunting: statItem.stunting || 0,
                agama: getBreakdown(statsData?.religion_by_dusun),
                umur: getBreakdown(statsData?.age_by_dusun),
                gender: getBreakdown(statsData?.gender_by_dusun)
            }
        })
    }, [mapDusuns, dusunArray, statsData])

    // 5. Agama Data Array
    const agamaArray = useMemo(() => {
        if (!statsData || !statsData.religion) return []
        const entries = Object.entries(statsData.religion).map(([name, count]) => ({ name, value: count }))
        entries.sort((a, b) => b.value - a.value)
        const max = entries.length > 0 ? entries[0].value : 1
        return entries.map(e => ({ ...e, pct: (e.value / max) * 100 }))
    }, [statsData])

    // 6. Umur Data Array
    const umurArray = useMemo(() => {
        if (!statsData || !statsData.age_range) return []
        const entries = Object.entries(statsData.age_range).map(([name, count]) => ({ name, value: count }))
        let max = 1
        entries.forEach(e => { if(e.value > max) max = e.value })
        return entries.map(e => ({ ...e, pct: (e.value / max) * 100 }))
    }, [statsData])

    // 7. Dynamic Data for Side Panel
    const sidePanelData = useMemo(() => {
        let array = []
        let color = 'bg-blue-500'
        let title = 'Distribusi Demografi'
        
        if (sidePanelMode === 'agama') {
            array = agamaArray
            color = 'bg-blue-500'
            title = 'Distribusi Agama'
        } else if (sidePanelMode === 'umur') {
            array = umurArray
            color = 'bg-[#298064]'
            title = 'Rentang Umur Penduduk'
        } else if (sidePanelMode === 'gender') {
            let maxVal = 1
            genderArray.forEach(g => { if(g.value > maxVal) maxVal = g.value })
            array = genderArray.map(g => ({ ...g, pct: (g.value / maxVal) * 100 }))
            color = 'bg-[#EC4899]'
            title = 'Demografi Gender'
        }
        return { array, color, title }
    }, [sidePanelMode, agamaArray, umurArray, genderArray])

    return (
        <div className="flex flex-col gap-7 px-10 py-8">

            {/* Page Header & Quick Actions */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
                    >
                        Overview
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Pantau data penduduk, stunting, dan pengaduan Desa Puundoho
                    </p>
                </div>
                
                {/* Metric Filters */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="flex flex-col gap-1 items-start">
                        <select 
                            value={selectedDusun} 
                            onChange={(e) => setSelectedDusun(e.target.value)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-xs font-medium outline-none focus:border-[#298064] cursor-pointer"
                        >
                            <option value="Semua">Semua Dusun</option>
                            <option value="Dusun 1">Dusun 1</option>
                            <option value="Dusun 2">Dusun 2</option>
                            <option value="Dusun 3">Dusun 3</option>
                            <option value="Dusun 4">Dusun 4</option>
                            <option value="Dusun 5">Dusun 5</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <select 
                            value={selectedWaktu} 
                            onChange={(e) => setSelectedWaktu(e.target.value)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-xs font-medium outline-none focus:border-[#298064] cursor-pointer"
                        >
                            <option value="Tahun Ini">Tahun Ini</option>
                            <option value="Bulan Ini">Bulan Ini</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 items-end justify-end h-full">
                        <button 
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] text-white text-xs font-medium hover:bg-[#2A2A2E] transition-colors cursor-pointer"
                        >
                            <RiRefreshLine size={14} className={`${statsLoading ? 'animate-spin' : ''} text-[#6B6B70]`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-4">
                {metricCards.map((card) => (
                    <div key={card.label} className="flex flex-col gap-4 p-5 rounded-xl bg-[#141417] border border-[#1F1F23]">
                        <div className="flex items-center justify-between">
                            <span className="text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">{card.label}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white" style={{ fontFamily: 'DM Mono, monospace', fontSize: 32, fontWeight: 500, letterSpacing: -1 }}>
                                {card.value}
                            </span>
                            <div className="flex items-center gap-1">
                                {card.up !== undefined ? (
                                    card.up ? <RiStockLine size={14} className="text-green-400" /> : <RiArrowDownLine size={14} className="text-red-400" />
                                ) : null}
                                <span className={`text-xs font-medium ${card.up === undefined ? 'text-[#6B6B70]' : (card.up ? 'text-green-400' : 'text-red-400')} truncate`}>{card.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                {/* Visualisasi Demografi Gender */}
                <div className="flex flex-col gap-5 p-6 rounded-xl bg-[#141417] border border-[#1F1F23]">
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Demografi Berdasarkan Gender</span>
                        <select 
                            value={selectedDatasetId}
                            onChange={(e) => setSelectedDatasetId(e.target.value)}
                            disabled={datasets.length === 0}
                            className="bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-xs font-medium rounded-md outline-none px-2 py-1.5 focus:border-[#298064] cursor-pointer disabled:opacity-50"
                        >
                            {datasets.map(d => (
                                <option key={d.id} value={d.id}>Dataset {d.tahun}</option>
                            ))}
                            {datasets.length === 0 && <option value="">Tidak ada dataset</option>}
                        </select>
                    </div>
                    <div className="h-[220px] w-full mt-2 relative">
                        {statsLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[#6B6B70] text-sm">Memuat data...</div>
                        ) : genderArray.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[#6B6B70] text-sm">Data tidak tersedia</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderArray}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderArray.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1A1A1D', border: '1px solid #2A2A2E', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E4E4E5' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Visualisasi Kasus Stunting per Dusun */}
                <div className="flex flex-col gap-5 p-6 rounded-xl bg-[#141417] border border-[#1F1F23]">
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Sebaran Kasus Stunting Berdasarkan Dusun (Dummy)</span>
                    </div>
                    <div className="h-[220px] w-full mt-2 relative">
                        {statsLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[#6B6B70] text-sm">Memuat data...</div>
                        ) : dusunArray.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[#6B6B70] text-sm">Data tidak tersedia</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dusunArray} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2E" />
                                    <XAxis dataKey="name" stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1A1A1D', border: '1px solid #2A2A2E', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E4E4E5' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="stunting" fill="#EC4899" radius={[4, 4, 0, 0]} name="Kasus Stunting" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">Daftar Wilayah (Dusun)</span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] hover:border-[#6B6B70] text-[#ADADB0] text-xs font-medium hover:bg-[#2A2A2E] transition-colors cursor-pointer">
                        <RiDownloadLine size={14} className="text-[#6B6B70]" />
                        Ekspor
                    </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#1F1F23] bg-[#111113]">
                    <div className="grid grid-cols-5 px-5 py-3.5 border-b border-[#1F1F23] bg-[#141417]">
                        {['Wilayah', 'Total Penduduk', 'Kasus Stunting (Dummy)', 'Status (Dummy)', 'Terakhir Update'].map((h) => (
                            <span key={h} className="text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">{h}</span>
                        ))}
                    </div>
                    {statsLoading ? (
                        <div className="py-10 text-center text-[#6B6B70] text-sm bg-[#141417]">Memuat data wilayah...</div>
                    ) : dusunArray.length === 0 ? (
                        <div className="py-10 text-center text-[#6B6B70] text-sm bg-[#141417]">Belum ada data wilayah di dataset ini</div>
                    ) : dusunArray.map((row, i) => (
                        <div key={row.name} className={`grid grid-cols-5 items-center px-5 py-3.5 ${i < dusunArray.length - 1 ? 'border-b border-[#1F1F23]' : ''} bg-[#141417] hover:bg-[#1A1A1D] transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2A2A2E] flex items-center justify-center shrink-0">
                                    <span className="text-[#8B8B90] text-[10px] font-semibold">{row.id}</span>
                                </div>
                                <span className="text-white text-[13px] font-medium">{row.name}</span>
                            </div>
                            <span className="text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{row.penduduk} Jiwa</span>
                            <span className={`text-xs font-medium ${parseInt(row.stunting) >= 5 ? 'text-red-400' : (parseInt(row.stunting) > 0 ? 'text-orange-400' : 'text-[#ADADB0]')}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                                {row.stunting} kasus
                            </span>
                            <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-medium ${row.statusColor}`}>{row.status}</span>
                            <span className="text-[#6B6B70] text-xs">{row.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Map & Side Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Peta Persebaran Demografi</span>
                        <select 
                            value={mapLayer} 
                            onChange={e => setMapLayer(e.target.value)}
                            className="bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-xs font-medium rounded-md outline-none px-2 py-1.5 focus:border-[#298064] cursor-pointer"
                        >
                            <option value="umum">Umum (Total & Stunting)</option>
                            <option value="agama">Distribusi Agama</option>
                            <option value="umur">Rentang Umur</option>
                            <option value="gender">Gender</option>
                        </select>
                    </div>
                    <div className="h-[450px] w-full rounded-xl overflow-hidden border border-[#1F1F23] bg-[#141417] relative z-0 map-dark-mode">
                        <MapContainer center={[-3.1, 121.08]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <BaseVillageBoundary />
                        <MapBounds dusuns={combinedMapDusuns} />
                        {combinedMapDusuns.map(dusun => {
                            if (!dusun.geojson_data) return null;
                            try {
                                const geom = JSON.parse(dusun.geojson_data);
                                return (
                                    <GeoJSON 
                                        key={dusun.id + dusun.warna} // re-render on color change
                                        data={geom} 
                                        style={{ color: dusun.warna || '#3B82F6', fillColor: dusun.warna || '#3B82F6', fillOpacity: 0.5, weight: 2 }}
                                    >
                                        <MapTooltip sticky>
                                            <div className="p-1 min-w-[130px] font-sans">
                                                <div className="font-bold border-b border-gray-200 pb-1.5 mb-1.5 text-sm">{dusun.nama_dusun}</div>
                                                
                                                {mapLayer === 'umum' && (
                                                    <>
                                                        <div className="flex justify-between items-center text-xs mb-1">
                                                            <span className="text-gray-600">Total Penduduk:</span>
                                                            <span className="font-bold text-gray-800">{dusun.penduduk} Jiwa</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-600">Kasus Stunting:</span>
                                                            <span className="font-bold text-orange-600">{dusun.stunting} Kasus</span>
                                                        </div>
                                                    </>
                                                )}

                                                {mapLayer !== 'umum' && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5 border-b border-gray-200 pb-1">
                                                            Berdasarkan {mapLayer}
                                                        </div>
                                                        {Object.entries(dusun[mapLayer] || {}).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between items-center text-xs">
                                                                <span className="text-gray-600 mr-3">{k}:</span>
                                                                <span className="font-bold text-blue-600">{v}</span>
                                                            </div>
                                                        ))}
                                                        {Object.keys(dusun[mapLayer] || {}).length === 0 && (
                                                            <span className="text-xs text-gray-400 italic">Data kosong</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </MapTooltip>
                                    </GeoJSON>
                                );
                            } catch (e) { return null; }
                        })}
                    </MapContainer>
                </div>
                </div>

                {/* Side Demographics */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#141417] border border-[#1F1F23] flex-1">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-semibold">{sidePanelData.title}</span>
                            <select 
                                value={sidePanelMode} 
                                onChange={e => setSidePanelMode(e.target.value)}
                                className="bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-[11px] font-medium rounded-md outline-none px-2 py-1 focus:border-[#298064] cursor-pointer"
                            >
                                <option value="agama">Agama</option>
                                <option value="umur">Umur</option>
                                <option value="gender">Gender</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-3 mt-1 overflow-y-auto pr-1">
                            {statsLoading ? (
                                <span className="text-[#6B6B70] text-sm text-center py-4">Memuat data...</span>
                            ) : sidePanelData.array.length === 0 ? (
                                <span className="text-[#6B6B70] text-sm text-center py-4">Data tidak tersedia</span>
                            ) : sidePanelData.array.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#ADADB0] text-[13px]">{item.name}</span>
                                        <span className="text-white font-mono text-[13px]">{item.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#1A1A1D] rounded-full overflow-hidden flex items-center">
                                        <div 
                                            className={`h-full rounded-full ${item.color ? '' : sidePanelData.color}`} 
                                            style={{ width: `${item.pct}%`, backgroundColor: item.color ? item.color : undefined }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="flex flex-col gap-4 mt-4 pb-4">
                <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">Galeri Kegiatan Terbaru</span>
                    <button 
                        onClick={() => navigate('/dashboard/galeri')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-xs font-semibold hover:bg-[#2A2A2E] transition-colors cursor-pointer"
                    >
                        Ke Modul Galeri <RiArrowRightLine size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {galleryItems.length === 0 ? (
                        <div className="col-span-3 py-10 bg-[#141417] rounded-xl border border-[#1F1F23] text-center text-sm text-[#6B6B70]">Belum ada foto galeri</div>
                    ) : galleryItems.map((item) => (
                        <div key={item.id} className="rounded-xl overflow-hidden border border-[#1F1F23] bg-[#111113] flex flex-col hover:border-[#2A2A2E] transition-colors">
                            <div className="h-[140px] w-full bg-[#1A1A1D] relative group">
                                {item.images && item.images.length > 0 ? (
                                    <img 
                                        src={item.images[0]} 
                                        alt={item.caption} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                                    />
                                ) : null}
                                <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1D]" style={{ display: (!item.images || item.images.length === 0) ? 'flex' : 'none' }}>
                                    <RiImageLine size={32} className="text-[#2A2A2E]" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-4">
                                <span className="text-white text-[13px] font-semibold line-clamp-1" title={item.caption}>{item.caption || 'Tanpa Judul'}</span>
                                <span className="text-[#6B6B70] text-[11px] leading-relaxed">
                                    {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col gap-4 pb-8">
                <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">Log Aktivitas (Dummy)</span>
                </div>
                <div className="flex flex-col gap-2">
                    {defaultTransactions.map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-4 rounded-[10px] bg-[#141417] border border-[#1F1F23]">
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
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.badgeColor}`}>{item.badge}</span>
                                <span className={`text-[13px] font-medium text-right ${item.amountColor}`} style={{ fontFamily: 'DM Mono, monospace', minWidth: 100 }}>
                                    {item.amount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
