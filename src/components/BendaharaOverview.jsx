import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    RiArrowDownLine,
    RiShoppingBag3Line,
    RiArrowRightLine,
    RiBarChartBoxLine,
    RiRefreshLine,
    RiStockLine,
} from 'react-icons/ri'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { apiFetch } from '../api'

const formatRupiah = (num) => {
    if (!num && num !== 0) return 'Rp 0'
    return 'Rp ' + Number(num).toLocaleString('id-ID')
}

const formatRupiahShort = (num) => {
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)}jt`
    return formatRupiah(num)
}

const COLORS = ['#298064', '#2dd4bf', '#60a5fa', '#f97316', '#ef4444']

export default function BendaharaOverview() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const [apbdList, setApbdList] = useState([])
    const [selectedYear, setSelectedYear] = useState('')
    const [apbdSummary, setApbdSummary] = useState({ tahun: new Date().getFullYear(), total_pendapatan: 0, total_pengeluaran: 0 })
    
    const [produkCount, setProdukCount] = useState(0)
    const [pendapatanData, setPendapatanData] = useState([])
    const [pengeluaranData, setPengeluaranData] = useState([])

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                // Fetch products count
                const resProd = await apiFetch('/produk-desa')
                const dataProd = await resProd.json()
                setProdukCount(dataProd.produk ? dataProd.produk.length : 0)

                // Fetch APBDes list
                const resApbd = await apiFetch('/apbdes')
                const dataApbd = await resApbd.json()
                const list = dataApbd.apbdes || []
                setApbdList(list)
                
                if (list.length > 0) {
                    setSelectedYear(list[0].id)
                }
            } catch (err) {
                console.error("Failed to fetch dashboard base data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchBaseData()
    }, [refreshTrigger])

    useEffect(() => {
        if (!selectedYear) return
        
        const fetchYearDetails = async () => {
            try {
                const chosen = apbdList.find(a => String(a.id) === String(selectedYear))
                if (chosen) setApbdSummary(chosen)

                const [resP, resK] = await Promise.all([
                    apiFetch(`/apbdes/${selectedYear}/pendapatan`),
                    apiFetch(`/apbdes/${selectedYear}/pengeluaran`)
                ])
                const dataP = await resP.json()
                const dataK = await resK.json()
                
                setPendapatanData(dataP.pendapatan || [])
                setPengeluaranData(dataK.pengeluaran || [])
            } catch (err) {
                console.error("Failed to fetch APBDes details", err)
            }
        }
        fetchYearDetails()
    }, [selectedYear, apbdList])

    const sisa = apbdSummary.total_pendapatan - apbdSummary.total_pengeluaran

    const prevYearData = apbdList.find(a => Number(a.tahun) === Number(apbdSummary.tahun) - 1)
    const calcChange = (current, previous) => {
        if (!previous || previous === 0) return { text: 'Tidak ada data tahun lalu', up: undefined }
        const diff = current - previous
        const pct = (Math.abs(diff) / previous) * 100
        return { text: `${diff >= 0 ? '+' : '-'}${pct.toFixed(1)}% vs Sblm`, up: diff >= 0 }
    }

    const pendChange = calcChange(apbdSummary.total_pendapatan, prevYearData?.total_pendapatan)
    const pengChange = calcChange(apbdSummary.total_pengeluaran, prevYearData?.total_pengeluaran)

    const metricCards = [
        { 
            label: 'Total Pendapatan', 
            value: formatRupiahShort(apbdSummary.total_pendapatan), 
            change: pendChange.text, 
            up: pendChange.up, 
        },
        { 
            label: 'Total Pengeluaran', 
            value: formatRupiahShort(apbdSummary.total_pengeluaran), 
            change: pengChange.text, 
            up: pengChange.up, 
        },
        { 
            label: 'Sisa Anggaran', 
            value: formatRupiahShort(Math.abs(sisa)), 
            change: sisa >= 0 ? 'Surplus' : 'Defisit', 
            up: sisa >= 0 ? true : false, 
        },
        { 
            label: 'Produk BUMDes', 
            value: produkCount.toString(), 
            change: 'Total item terdaftar', 
            up: undefined, 
        },
    ]

    // Map to recharts format
    const pendapatanBreakdown = useMemo(() => {
        if (pendapatanData.length === 0) return [{ name: 'Belum ada data', value: 1 }]
        return pendapatanData.map(d => ({ name: d.kategori, value: d.jumlah }))
    }, [pendapatanData])

    const pengeluaranBreakdown = useMemo(() => {
        return pengeluaranData.map(d => ({ name: d.bidang, jumlah: d.jumlah }))
    }, [pengeluaranData])

    return (
        <div className="flex flex-col gap-7 px-10 py-8">
            {/* Header & Metric Filters */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
                    >
                        Overview
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Ringkasan keuangan dan pengelolaan produk BUMDes Desa Puundoho.
                    </p>
                </div>
                
                {/* Metric Filters */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="flex flex-col gap-1 items-start">
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] text-[#ADADB0] text-xs font-medium outline-none focus:border-[#298064] cursor-pointer"
                        >
                            {apbdList.map(a => (
                                <option key={a.id} value={a.id}>Tahun {a.tahun}</option>
                            ))}
                            {apbdList.length === 0 && <option value="">Belum ada data</option>}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 items-end justify-end h-full">
                        <button 
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#1A1A1D] border border-[#2A2A2E] text-white text-xs font-medium hover:bg-[#2A2A2E] transition-colors cursor-pointer"
                        >
                            <RiRefreshLine size={14} className={`${loading ? 'animate-spin' : ''} text-[#6B6B70]`} />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pendapatan Pie Chart */}
                <div className="rounded-xl bg-[#141417] border border-[#1F1F23] p-5">
                    <h3 className="text-white text-sm font-semibold mb-4">Komposisi Pendapatan</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pendapatanBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pendapatanBreakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span className="text-[#ADADB0] text-[11px]">{value}</span>}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1A1A1D', border: '1px solid #2A2A2E', borderRadius: 8, fontSize: 12, color: '#E4E4E5' }}
                                    itemStyle={{ color: '#E4E4E5' }}
                                    labelStyle={{ color: '#8B8B90' }}
                                    formatter={(val) => formatRupiahShort(val)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pengeluaran Bar Chart */}
                <div className="rounded-xl bg-[#141417] border border-[#1F1F23] p-5">
                    <h3 className="text-white text-sm font-semibold mb-4">Pengeluaran per Bidang</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pengeluaranBreakdown} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" />
                                <XAxis type="number" tick={{ fill: '#6B6B70', fontSize: 10 }} tickFormatter={formatRupiahShort} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#ADADB0', fontSize: 11 }} width={100} />
                                <Tooltip
                                    contentStyle={{ background: '#1A1A1D', border: '1px solid #2A2A2E', borderRadius: 8, fontSize: 12, color: '#E4E4E5' }}
                                    itemStyle={{ color: '#E4E4E5' }}
                                    labelStyle={{ color: '#8B8B90' }}
                                    formatter={(val) => formatRupiah(val)}
                                />
                                <Bar dataKey="jumlah" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <button
                    onClick={() => navigate('/dashboard/keuangan/apbdes')}
                    className="flex items-center justify-between p-5 rounded-xl bg-[#141417] border border-[#1F1F23] hover:border-[#298064]/40 transition-colors group text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#298064]/10 flex items-center justify-center">
                            <RiBarChartBoxLine size={20} className="text-[#298064]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-semibold">Kelola APBDes</span>
                            <span className="text-[#6B6B70] text-[11px]">Kelola pendapatan dan pengeluaran desa</span>
                        </div>
                    </div>
                    <RiArrowRightLine size={18} className="text-[#6B6B70] group-hover:text-[#298064] transition-colors" />
                </button>
                <button
                    onClick={() => navigate('/dashboard/keuangan/belanja')}
                    className="flex items-center justify-between p-5 rounded-xl bg-[#141417] border border-[#1F1F23] hover:border-[#298064]/40 transition-colors group text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <RiShoppingBag3Line size={20} className="text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-semibold">Kelola Produk Desa</span>
                            <span className="text-[#6B6B70] text-[11px]">Atur katalog produk BUMDes dan UMKM</span>
                        </div>
                    </div>
                    <RiArrowRightLine size={18} className="text-[#6B6B70] group-hover:text-[#298064] transition-colors" />
                </button>
            </div>
        </div>
    )
}
