import { useState, useEffect } from 'react'
import {
    RiBarChartBoxLine,
    RiShieldStarLine,
    RiPlantLine,
    RiGroupLine,
    RiLoader4Line,
    RiErrorWarningLine,
    RiGlobalLine,
    RiLineChartLine
} from 'react-icons/ri'

export default function IdmSdgs() {
    const [activeTab, setActiveTab] = useState('sdgs')
    const [sdgData, setSdgData] = useState(null)
    const [idmData, setIdmData] = useState(null)
    const [loadingSdg, setLoadingSdg] = useState(true)
    const [loadingIdm, setLoadingIdm] = useState(true)
    const [errorSdg, setErrorSdg] = useState(null)
    const [errorIdm, setErrorIdm] = useState(null)
    
    // Year Selection State
    const [idmYear, setIdmYear] = useState('2024')

    // Fetch SDGs independently
    useEffect(() => {
        const fetchSdg = async () => {
            setLoadingSdg(true)
            setErrorSdg(null)
            try {
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
                const res = await fetch(`${BASE_URL}/sdgs`)
                if (res.ok) {
                    setSdgData(await res.json())
                } else {
                    setErrorSdg('Gagal mengambil data SDGs')
                }
            } catch (err) {
                console.error(err)
                setErrorSdg('Gagal terhubung ke server untuk SDGs.')
            } finally {
                setLoadingSdg(false)
            }
        }
        fetchSdg()
    }, [])

    // Fetch IDM dependently on selected year
    useEffect(() => {
        const fetchIdm = async () => {
            setLoadingIdm(true)
            setErrorIdm(null)
            try {
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
                // Pass the tahun parameter to our go backend wrapper
                const res = await fetch(`${BASE_URL}/idm?tahun=${idmYear}`)
                if (res.ok) {
                    const json = await res.json()
                    // Check if JSON indicates an error or payload is empty
                    if (json.error || !json.mapData || Object.keys(json.mapData).length === 0) {
                        setIdmData(null)
                        setErrorIdm(`Data IDM untuk tahun ${idmYear} belum tersedia atau tidak dirilis.`)
                    } else {
                        setIdmData(json)
                        setErrorIdm(null)
                    }
                } else {
                    setIdmData(null)
                    setErrorIdm(`Gagal mengambil data IDM tahun ${idmYear}`)
                }
            } catch (err) {
                console.error(err)
                setIdmData(null)
                setErrorIdm('Gagal terhubung ke server untuk IDM.')
            } finally {
                setLoadingIdm(false)
            }
        }
        fetchIdm()
    }, [idmYear])

    const summaries = idmData?.mapData?.SUMMARIES || {}
    const rows = idmData?.mapData?.ROW || []
    
    // Extrapolate Composite Indices from IDM rows
    const IKS = rows.find(r => r.INDIKATOR?.includes('IKS'))?.SKOR || 0
    const IKE = rows.find(r => r.INDIKATOR?.includes('IKE'))?.SKOR || 0
    const IKL = rows.find(r => r.INDIKATOR?.includes('IKL'))?.SKOR || 0

    return (
        <div className="flex flex-col gap-6 px-10 py-8 min-h-full">
            {/* Header */}
            <div className="flex flex-col gap-1.5 border-b border-[#2A2A2E] pb-5">
                <h1 className="text-white leading-tight font-bold" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}>
                    Indeks & Capaian Desa
                </h1>
                <p className="text-[#6B6B70] text-sm">
                    Pantauan otomatis skor Indeks Desa Membangun (IDM) dan SDGs langsung dari server Kementerian secara real-time.
                </p>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                {/* TABS & FILTER BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-2 p-1.5 bg-[#141417] rounded-xl w-max border border-[#2A2A2E]">
                        <button
                            onClick={() => setActiveTab('sdgs')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'sdgs' ? 'bg-[#298064] text-white shadow-md' : 'text-[#8B8B90] hover:text-white hover:bg-[#1A1A1D]'
                            }`}
                        >
                            SDGs Desa ({sdgData?.average || '-'})
                        </button>
                        <button
                            onClick={() => setActiveTab('idm')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'idm' ? 'bg-[#298064] text-white shadow-md' : 'text-[#8B8B90] hover:text-white hover:bg-[#1A1A1D]'
                            }`}
                        >
                            IDM ({summaries?.STATUS || '-'})
                        </button>
                    </div>

                    {/* Filter IDM Year (Only show when IDM tab is active) */}
                    {activeTab === 'idm' && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-200">
                            <label className="text-[#8B8B90] text-sm font-medium uppercase tracking-wider text-xs">Tahun Data:</label>
                            <select 
                                value={idmYear} 
                                onChange={e => setIdmYear(e.target.value)}
                                className="bg-[#141417] text-white border border-[#2A2A2E] rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-[#298064] hover:border-[#3A3A3E] transition-colors appearance-none cursor-pointer pr-10 relative"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238B8B90%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.7rem top 50%',
                                    backgroundSize: '0.65rem auto'
                                }}
                            >
                                <option value="2025">Tahun 2025</option>
                                <option value="2024">Tahun 2024</option>
                                <option value="2023">Tahun 2023</option>
                                <option value="2022">Tahun 2022</option>
                                <option value="2021">Tahun 2021</option>
                                <option value="2020">Tahun 2020</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* CONTENT TAB: SDGs */}
                {activeTab === 'sdgs' && (
                    <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300 pb-10">
                        {loadingSdg && (
                            <div className="flex items-center justify-center py-20 gap-3">
                                <RiLoader4Line size={30} className="text-[#298064] animate-spin" />
                                <span className="text-[#8B8B90]">Memuat SDGs...</span>
                            </div>
                        )}
                        {errorSdg && !loadingSdg && (
                            <div className="text-center py-10 text-red-400">{errorSdg}</div>
                        )}
                        
                        {!loadingSdg && !errorSdg && sdgData && (
                            <>
                                <div className="bg-[#298064]/10 border border-[#298064]/20 rounded-xl p-4 flex gap-3">
                                    <RiGlobalLine size={24} className="text-[#298064] mt-0.5 shrink-0" />
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[#298064] text-sm font-bold">Apa itu SDGs Desa?</h3>
                                        <p className="text-[#8B8B90] text-sm leading-relaxed">
                                            SDGs (Sustainable Development Goals) Desa adalah sekumpulan rencana aksi global (PBB) yang dilokalkan oleh Kementerian Desa demi pemerataan ekonomi, pendidikan, kesehatan, dan penanggulangan kemiskinan di tingkat desa.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sdgData.data.map(item => (
                                        <div key={item.goals} className="flex flex-col rounded-xl bg-[#141417] border border-[#2A2A2E] overflow-hidden group hover:border-[#3A3A3E] transition-colors relative isolate">
                                            <div className="h-40 w-full bg-[#1A1A1D] relative">
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={`Goals ${item.goals}`} 
                                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                )}
                                                <div className="absolute inset-0"></div>
                                                
                                                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                                    <span className="text-white text-3xl font-black tracking-tighter mix-blend-overlay opacity-90 drop-shadow-md">#{item.goals}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col gap-3">
                                                <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2 h-10">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-end justify-between border-t border-[#2A2A2E] pt-3 mt-1">
                                                    <span className="text-[#8B8B90] text-xs font-medium uppercase tracking-wider">Skor</span>
                                                    <span className={`text-xl font-bold font-mono ${item.score > 80 ? 'text-[#298064]' : item.score > 40 ? 'text-yellow-500' : 'text-red-400'}`}>
                                                        {item.score}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CONTENT TAB: IDM */}
                {activeTab === 'idm' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
                        {loadingIdm && (
                            <div className="flex items-center justify-center py-20 gap-3">
                                <RiLoader4Line size={30} className="text-[#298064] animate-spin" />
                                <span className="text-[#8B8B90]">Mengambil data IDM tahun {idmYear}...</span>
                            </div>
                        )}
                        
                        {errorIdm && !loadingIdm && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 flex flex-col items-center gap-3 text-center mt-4 mx-auto max-w-2xl">
                                <RiErrorWarningLine size={48} className="text-red-400" />
                                <span className="text-white font-semibold text-lg">{errorIdm}</span>
                                <span className="text-[#8B8B90] text-sm">Kemendesa mungkin belum merilis rekapitulasi data pada situs pusat untuk Desa Puundoho pada rentang tahun ini.</span>
                            </div>
                        )}

                        {!loadingIdm && !errorIdm && idmData && (
                            <>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 mb-1">
                                    <RiLineChartLine size={24} className="text-yellow-600 mt-0.5 shrink-0" />
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-yellow-600 text-sm font-bold">Apa itu Indeks Desa Membangun (IDM)?</h3>
                                        <p className="text-[#8B8B90] text-sm leading-relaxed">
                                            IDM adalah indeks komposit dari Pemerintah Pusat yang menilai status kemandirian dan kemajuan desa melalui 3 pilar utama: Ketahanan Sosial, Ketahanan Ekonomi, dan Ketahanan Lingkungan.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-6 rounded-2xl bg-[#141417] border border-[#2A2A2E] flex flex-col gap-1">
                                        <span className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider mb-2">Status IDM Saat Ini</span>
                                        <span className="text-white text-2xl font-black">{summaries.STATUS || 'N/A'}</span>
                                        <span className="text-[#298064] text-sm font-medium mt-1">Skor: {Number(summaries.SKOR_SAAT_INI).toFixed(3)}</span>
                                    </div>
                                    
                                    <div className="p-6 rounded-2xl bg-[#141417] from-[#141417] to-[#1A1A1D] border border-yellow-500/20 flex flex-col gap-1">
                                        <span className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider mb-2">Target Berikutnya</span>
                                        <span className="text-yellow-500 text-2xl font-black">{summaries.TARGET_STATUS || 'N/A'}</span>
                                        <span className="text-[#6B6B70] text-sm mt-1">Skor Min: {summaries.SKOR_MINIMAL}</span>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-[#141417] border border-[#2A2A2E] flex flex-col gap-1 md:col-span-2 justify-center">
                                        <h3 className="text-white text-[15px] font-medium leading-relaxed">
                                            Desa Anda saat ini masih kekurangan <strong className="text-orange-400">{Number(summaries.PENAMBAHAN).toFixed(4)}</strong> skor secara nasional untuk bisa naik *level* menjadi Desa berstatus <strong className="text-yellow-500">{summaries.TARGET_STATUS}</strong> pada IDM di tahun berikutnya.
                                        </h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                                    <div className="flex flex-col p-5 bg-[#1A1A1D] rounded-2xl border border-[#2A2A2E] hover:border-[#3A3A3E] transition-colors relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-5">
                                            <RiGroupLine size={140} />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <RiGroupLine size={20} className="text-blue-400" />
                                            </div>
                                            <span className="text-white font-semibold">IKS (Sosial)</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-auto">
                                            <span className="text-4xl font-bold font-mono text-white">{Number(IKS).toFixed(3)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col p-5 bg-[#1A1A1D] rounded-2xl border border-[#2A2A2E] hover:border-[#3A3A3E] transition-colors relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-5">
                                            <RiBarChartBoxLine size={140} />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                <RiBarChartBoxLine size={20} className="text-yellow-500" />
                                            </div>
                                            <span className="text-white font-semibold">IKE (Ekonomi)</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-auto">
                                            <span className="text-4xl font-bold font-mono text-white">{Number(IKE).toFixed(3)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col p-5 bg-[#1A1A1D] rounded-2xl border border-[#2A2A2E] hover:border-[#3A3A3E] transition-colors relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 opacity-5">
                                            <RiPlantLine size={140} />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <RiPlantLine size={20} className="text-green-400" />
                                            </div>
                                            <span className="text-white font-semibold">IKL (Lingkungan)</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-auto">
                                            <span className="text-4xl font-bold font-mono text-white">{Number(IKL).toFixed(3)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex flex-col gap-3">
                                    <h3 className="text-white font-semibold text-lg">Indikator Rekomendasi Pembangunan</h3>
                                    <p className="text-[#6B6B70] text-sm -mt-2">Rekomendasi dari Pusat berdasarkan kekurangan pilar penunjang Indeks Desa Membangun.</p>
                                    <div className="rounded-xl overflow-hidden border border-[#2A2A2E] mt-2">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="uppercase tracking-wider text-[#8B8B90] bg-[#141417] text-[10px] sm:text-xs">
                                                <tr>
                                                    <th className="p-4 border-b border-[#2A2A2E]">Indikator Terukur</th>
                                                    <th className="p-4 border-b border-[#2A2A2E]">Keterangan Saat Ini</th>
                                                    <th className="p-4 border-b border-[#2A2A2E] text-center w-28">Skor</th>
                                                    <th className="p-4 border-b border-[#2A2A2E]">Saran Kegiatan Intervensi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.filter(r => r.NO !== null).map((row, idx) => {
                                                    const scoreColor = row.SKOR >= 4 
                                                        ? 'bg-[#298064] text-white' 
                                                        : row.SKOR >= 3 
                                                            ? 'bg-yellow-500/20 text-yellow-500' 
                                                            : 'bg-red-500/20 text-red-400';
                                                    
                                                    return (
                                                    <tr key={idx} className="hover:bg-[#1A1A1D] transition-colors bg-[#141417] border-b border-[#1F1F23]">
                                                        <td className="p-4 text-white font-medium truncate max-w-[200px]" title={row.INDIKATOR}>{row.INDIKATOR}</td>
                                                        <td className="p-4 text-[#8B8B90] text-xs max-w-[250px] truncate" title={row.KETERANGAN}>{row.KETERANGAN || '-'}</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`inline-block w-6 h-6 rounded leading-6 font-mono text-xs font-semibold ${scoreColor}`} >{row.SKOR}</span>
                                                        </td>
                                                        <td className={`p-4 text-xs truncate max-w-[300px] ${row.KEGIATAN === '-' ? 'text-[#6B6B70] italic' : 'text-orange-400'}`} title={row.KEGIATAN}>
                                                            {row.KEGIATAN !== '-' ? row.KEGIATAN : 'Sudah memenuhi / Tidak Butuh Intervensi'}
                                                        </td>
                                                    </tr>
                                                )})}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
