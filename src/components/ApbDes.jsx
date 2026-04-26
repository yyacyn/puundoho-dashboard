import { useState, useMemo, useRef, useEffect } from 'react'
import { RiAddLine, RiSearchLine, RiMoneyDollarCircleLine, RiEdit2Line, RiDeleteBinLine, RiArrowUpLine, RiArrowDownLine, RiFileUploadLine, RiLoader4Line, RiCloseLine } from 'react-icons/ri'
import { apiFetch } from '../api'

const formatRupiah = (num) => {
    if (!num && num !== 0) return 'Rp 0'
    return 'Rp ' + Number(num).toLocaleString('id-ID')
}

export default function ApbDes() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [activeTab, setActiveTab] = useState('pendapatan')
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
    const [pdfParsing, setPdfParsing] = useState(false)
    const [pdfResult, setPdfResult] = useState(null)
    const [pdfError, setPdfError] = useState('')
    const pdfInputRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [subLoading, setSubLoading] = useState(false)

    const [apbdList, setApbdList] = useState([])
    const [pendapatanData, setPendapatanData] = useState([])
    const [pengeluaranData, setPengeluaranData] = useState([])
    const [selectedYear, setSelectedYear] = useState(null)

    const currentY = new Date().getFullYear()
    const availableYearsForDropdown = Array.from({ length: 10 }, (_, i) => currentY - 2 + i)
    const [form, setForm] = useState({ tahun: currentY, kategori: '', bidang: '', jumlah: '' })

    // Fetch APBD list
    const fetchApbdList = async () => {
        try {
            const res = await apiFetch('/apbdes', { cache: 'no-store' })
            const data = await res.json()
            const list = data.apbdes || []
            setApbdList(list)
            if (list.length > 0 && !selectedYear) {
                setSelectedYear(list[0].id)
            }
        } catch (err) {
            console.error('Fetch APBD error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch sub-data when year changes
    const fetchSubData = async (apbdId) => {
        if (!apbdId) return
        setSubLoading(true)
        try {
            const resP = await apiFetch(`/apbdes/${apbdId}/pendapatan`, { cache: 'no-store' });
            const dataP = await resP.json();
            const pList = dataP.pendapatan || [];

            const resK = await apiFetch(`/apbdes/${apbdId}/pengeluaran`, { cache: 'no-store' });
            const dataK = await resK.json();
            const kList = dataK.pengeluaran || [];

            // Update state secara eksplisit
            setPendapatanData(pList);
            setPengeluaranData(kList);
        } catch (err) {
            console.error('Fetch sub-data error:', err)
        } finally {
            setSubLoading(false)
        }
    }

    useEffect(() => { fetchApbdList() }, [])
    useEffect(() => { if (selectedYear) fetchSubData(selectedYear) }, [selectedYear])

    const currentApbd = apbdList.find(a => a.id === selectedYear)

    const filteredPendapatan = pendapatanData.filter(d =>
        d.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const filteredPengeluaran = pengeluaranData.filter(d =>
        d.bidang.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPendapatan = useMemo(() => filteredPendapatan.reduce((sum, d) => sum + d.jumlah, 0), [filteredPendapatan])
    const totalPengeluaran = useMemo(() => filteredPengeluaran.reduce((sum, d) => sum + d.jumlah, 0), [filteredPengeluaran])
    const sisa = totalPendapatan - totalPengeluaran

    const resetFormAndClose = () => {
        setForm({ tahun: currentY, kategori: '', bidang: '', jumlah: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    const handleEditPendapatan = (d) => {
        setActiveTab('pendapatan')
        const apbd = apbdList.find(a => a.id === d.id_apbd)
        setForm({ tahun: apbd ? apbd.tahun : currentY, kategori: d.kategori, bidang: '', jumlah: d.jumlah.toString() })
        setEditingId(d.id)
        setIsModalOpen(true)
    }

    const handleEditPengeluaran = (d) => {
        setActiveTab('pengeluaran')
        const apbd = apbdList.find(a => a.id === d.id_apbd)
        setForm({ tahun: apbd ? apbd.tahun : currentY, kategori: '', bidang: d.bidang, jumlah: d.jumlah.toString() })
        setEditingId(d.id)
        setIsModalOpen(true)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        try {
            let targetApbdId = null
            const existingApbd = apbdList.find(a => a.tahun === Number(form.tahun))
            if (existingApbd) {
                targetApbdId = existingApbd.id
            } else {
                const res = await apiFetch('/apbdes', {
                    method: 'POST',
                    body: JSON.stringify({ tahun: Number(form.tahun), total_pendapatan: 0, total_pengeluaran: 0 })
                })
                const data = await res.json()
                targetApbdId = data.id
            }

            if (activeTab === 'pendapatan') {
                const body = { id_apbd: targetApbdId, kategori: form.kategori, jumlah: Number(form.jumlah) }
                if (editingId) {
                    await apiFetch(`/apbdes/pendapatan/${editingId}`, { method: 'PUT', body: JSON.stringify(body) })
                } else {
                    await apiFetch('/apbdes/pendapatan', { method: 'POST', body: JSON.stringify(body) })
                }
            } else {
                const body = { id_apbd: targetApbdId, bidang: form.bidang, jumlah: Number(form.jumlah) }
                if (editingId) {
                    await apiFetch(`/apbdes/pengeluaran/${editingId}`, { method: 'PUT', body: JSON.stringify(body) })
                } else {
                    await apiFetch('/apbdes/pengeluaran', { method: 'POST', body: JSON.stringify(body) })
                }
            }

            if (targetApbdId !== selectedYear) {
                setSelectedYear(targetApbdId)
            } else {
                fetchSubData(selectedYear)
            }
            fetchApbdList()
            resetFormAndClose()
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message)
        }
    }

    const handleDeletePendapatan = async (id) => {
        if (!confirm('Hapus pendapatan ini?')) return
        await apiFetch(`/apbdes/pendapatan/${id}`, { method: 'DELETE' })
        fetchSubData(selectedYear)
        fetchApbdList()
    }

    const handleDeletePengeluaran = async (id) => {
        if (!confirm('Hapus pengeluaran ini?')) return
        await apiFetch(`/apbdes/pengeluaran/${id}`, { method: 'DELETE' })
        fetchSubData(selectedYear)
        fetchApbdList()
    }

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPdfParsing(true)
        setPdfError('')
        setPdfResult(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/apbdes/parse-pdf`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                    body: formData,
                }
            )
            const data = await res.json()
            if (!res.ok) {
                setPdfError(data.error || 'Gagal memproses PDF')
            } else {
                setPdfResult(data)
            }
        } catch (err) {
            setPdfError('Gagal menghubungi server: ' + err.message)
        } finally {
            setPdfParsing(false)
            if (pdfInputRef.current) pdfInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col gap-7 px-10 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
                    >
                        APBDes
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola Anggaran Pendapatan dan Belanja Desa. Transparansi keuangan desa.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {apbdList.length > 0 ? (
                        <select
                            value={selectedYear || ''}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="px-4 py-2.5 bg-[#141417] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                        >
                            {apbdList.map(a => (
                                <option key={a.id} value={a.id}>Tahun {a.tahun}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="px-4 py-2.5 bg-[#141417] border border-[#2A2A2E] rounded-lg text-sm text-[#6B6B70]">
                            Belum ada APBDes
                        </div>
                    )}
                    <button
                        onClick={() => { setPdfResult(null); setPdfError(''); setIsPdfModalOpen(true) }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141417] border border-[#2A2A2E] text-[#ADADB0] hover:text-white text-sm font-medium transition-colors"
                    >
                        <RiFileUploadLine size={16} />
                        Import PDF / JSON
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#141417] border border-[#1F1F23] p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <RiArrowUpLine size={18} className="text-green-400" />
                        </div>
                        <span className="text-[#6B6B70] text-[11px] font-semibold uppercase tracking-wider">Total Pendapatan</span>
                    </div>
                    <span className="text-white text-xl font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {formatRupiah(totalPendapatan)}
                    </span>
                </div>
                <div className="rounded-xl bg-[#141417] border border-[#1F1F23] p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <RiArrowDownLine size={18} className="text-red-400" />
                        </div>
                        <span className="text-[#6B6B70] text-[11px] font-semibold uppercase tracking-wider">Total Pengeluaran</span>
                    </div>
                    <span className="text-white text-xl font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {formatRupiah(totalPengeluaran)}
                    </span>
                </div>
                <div className="rounded-xl bg-[#141417] border border-[#1F1F23] p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <RiMoneyDollarCircleLine size={18} className="text-blue-400" />
                        </div>
                        <span className="text-[#6B6B70] text-[11px] font-semibold uppercase tracking-wider">Sisa Anggaran</span>
                    </div>
                    <span className={`text-xl font-bold ${sisa >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                        {formatRupiah(sisa)}
                    </span>
                </div>
            </div>

            {/* Tab Toggle & Tambah Data */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141417] border border-[#1F1F23] w-fit">
                    <button
                        onClick={() => setActiveTab('pendapatan')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pendapatan' ? 'bg-[#298064] text-white' : 'text-[#8B8B90] hover:text-white'}`}
                    >
                        Pendapatan
                    </button>
                    <button
                        onClick={() => setActiveTab('pengeluaran')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pengeluaran' ? 'bg-[#298064] text-white' : 'text-[#8B8B90] hover:text-white'}`}
                    >
                        Pengeluaran
                    </button>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null)
                        const currentApbdYear = selectedYear ? apbdList.find(a => a.id === selectedYear)?.tahun : currentY
                        setForm({ tahun: currentApbdYear || currentY, kategori: '', bidang: '', jumlah: '' })
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Tambah {activeTab === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran'}
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder={activeTab === 'pendapatan' ? 'Cari kategori pendapatan...' : 'Cari bidang pengeluaran...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-12">No</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">
                                {activeTab === 'pendapatan' ? 'Kategori Pendapatan' : 'Bidang Pengeluaran'}
                            </th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Jumlah (Rp)</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading || subLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiLoader4Line size={32} className="text-[#298064] animate-spin" />
                                        <span className="text-[#6B6B70] text-sm">Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : activeTab === 'pendapatan' ? (
                            filteredPendapatan.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 bg-[#141417]">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RiMoneyDollarCircleLine size={32} className="text-[#3A3A3E]" />
                                            <span className="text-[#6B6B70] text-sm">Belum ada data pendapatan</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPendapatan.map((d, i) => (
                                    <tr key={d.id} className={`hover:bg-[#1A1A1D] transition-colors ${i < filteredPendapatan.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}>
                                        <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{i + 1}</td>
                                        <td className="px-5 py-4 bg-[#141417]">
                                            <span className="text-white text-[13px] font-medium">{d.kategori}</span>
                                        </td>
                                        <td className="px-5 py-4 bg-[#141417] text-right">
                                            <span className="text-green-400 text-[13px] font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>
                                                {formatRupiah(d.jumlah)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 bg-[#141417] text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditPendapatan(d)} className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors" title="Edit">
                                                    <RiEdit2Line size={15} />
                                                </button>
                                                <button onClick={() => handleDeletePendapatan(d.id)} className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors" title="Hapus">
                                                    <RiDeleteBinLine size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            filteredPengeluaran.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 bg-[#141417]">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RiMoneyDollarCircleLine size={32} className="text-[#3A3A3E]" />
                                            <span className="text-[#6B6B70] text-sm">Belum ada data pengeluaran</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPengeluaran.map((d, i) => (
                                    <tr key={d.id} className={`hover:bg-[#1A1A1D] transition-colors ${i < filteredPengeluaran.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}>
                                        <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{i + 1}</td>
                                        <td className="px-5 py-4 bg-[#141417]">
                                            <span className="text-white text-[13px] font-medium">{d.bidang}</span>
                                        </td>
                                        <td className="px-5 py-4 bg-[#141417] text-right">
                                            <span className="text-red-400 text-[13px] font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>
                                                {formatRupiah(d.jumlah)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 bg-[#141417] text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditPengeluaran(d)} className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors" title="Edit">
                                                    <RiEdit2Line size={15} />
                                                </button>
                                                <button onClick={() => handleDeletePengeluaran(d.id)} className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors" title="Hapus">
                                                    <RiDeleteBinLine size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                    {/* Footer Total */}
                    <tfoot>
                        <tr className="bg-[#141417] border-t border-[#1F1F23]">
                            <td className="px-5 py-3.5 bg-[#141417]" colSpan="2">
                                <span className="text-[#6B6B70] text-[11px] font-semibold uppercase tracking-wider">
                                    Total {activeTab === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran'}
                                </span>
                            </td>
                            <td className="px-5 py-3.5 bg-[#141417] text-right">
                                <span className={`text-[13px] font-bold ${activeTab === 'pendapatan' ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                                    {formatRupiah(activeTab === 'pendapatan' ? totalPendapatan : totalPengeluaran)}
                                </span>
                            </td>
                            <td className="px-5 py-3.5 bg-[#141417]"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiMoneyDollarCircleLine className="text-[#298064]" />
                                {editingId ? 'Ubah' : 'Tambah'} {activeTab === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran'}
                            </h3>
                            <button onClick={resetFormAndClose} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form className="p-6 flex flex-col gap-4" onSubmit={handleFormSubmit}>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">
                                    Tahun Anggaran
                                </label>
                                <select
                                    required
                                    value={form.tahun}
                                    onChange={e => setForm(prev => ({ ...prev, tahun: Number(e.target.value) }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                >
                                    {availableYearsForDropdown.map(y => (
                                        <option key={y} value={y}>Tahun {y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">
                                    {activeTab === 'pendapatan' ? 'Kategori Pendapatan' : 'Bidang Pengeluaran'}
                                </label>
                                <input
                                    type="text" required
                                    value={activeTab === 'pendapatan' ? form.kategori : form.bidang}
                                    onChange={e => {
                                        const val = e.target.value
                                        setForm(prev => activeTab === 'pendapatan' ? { ...prev, kategori: val } : { ...prev, bidang: val })
                                    }}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder={activeTab === 'pendapatan' ? 'Mis. Dana Desa (DD)' : 'Mis. Pembangunan Desa'}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Jumlah (Rupiah)</label>
                                <input
                                    type="number" required min="0"
                                    value={form.jumlah}
                                    onChange={e => setForm(prev => ({ ...prev, jumlah: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Mis. 800000000"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={resetFormAndClose} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="px-6 py-2 bg-[#298064] hover:bg-[#216650] text-white text-sm font-medium rounded-lg transition-all">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PDF Import Modal */}
            {isPdfModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiFileUploadLine className="text-[#298064]" />
                                Import APBDes dari Dokumen
                            </h3>
                            <button onClick={() => setIsPdfModalOpen(false)} className="text-[#6B6B70] hover:text-white transition-colors">
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-5">
                            <p className="text-[#6B6B70] text-sm leading-relaxed">
                                Upload dokumen APBDes dalam format <span className="text-white font-medium">PDF</span> atau <span className="text-white font-medium">JSON</span>. Sistem akan mengekstrak tabel pendapatan dan pengeluaran secara otomatis.
                            </p>

                            {/* Upload Area */}
                            <div>
                                <input type="file" ref={pdfInputRef} accept=".pdf,.json" className="hidden" onChange={handlePdfUpload} />
                                <button
                                    type="button"
                                    disabled={pdfParsing}
                                    onClick={() => pdfInputRef.current?.click()}
                                    className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2A2A2E] hover:border-[#298064] hover:bg-[#1A1A1D] transition-colors py-10 bg-[#0A0A0B] disabled:opacity-50"
                                >
                                    {pdfParsing ? (
                                        <>
                                            <RiLoader4Line size={28} className="text-[#298064] animate-spin" />
                                            <span className="text-[#ADADB0] text-sm font-medium">Memproses dokumen...</span>
                                            <span className="text-[#6B6B70] text-[11px]">Ini mungkin memakan waktu beberapa detik</span>
                                        </>
                                    ) : (
                                        <>
                                            <RiFileUploadLine size={28} className="text-[#6B6B70]" />
                                            <span className="text-[#ADADB0] text-sm font-medium">Klik untuk upload file PDF atau JSON APBDes</span>
                                            <span className="text-[#6B6B70] text-[11px]">Maksimal 10MB</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Error */}
                            {pdfError && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {pdfError}
                                </div>
                            )}

                            {/* Results */}
                            {pdfResult && (
                                <div className="flex flex-col gap-3">
                                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                        {pdfResult.message}
                                    </div>
                                    {pdfResult.tables && pdfResult.tables.length > 0 ? (
                                        pdfResult.tables.map((table, ti) => (
                                            <div key={ti} className="rounded-lg border border-[#1F1F23] overflow-hidden">
                                                <div className="px-4 py-2 bg-[#1A1A1D] text-[#ADADB0] text-xs font-semibold uppercase tracking-wider">
                                                    {table.title || `Tabel ${ti + 1}`}
                                                </div>
                                                <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                                                    <table className="w-full text-[12px]">
                                                        <tbody>
                                                            {table.rows.map((row, ri) => (
                                                                <tr key={ri} className={ri === 0 ? 'bg-[#1A1A1D] font-medium' : 'border-t border-[#1F1F23]'}>
                                                                    {row.map((cell, ci) => (
                                                                        <td key={ci} className="px-3 py-2 bg-[#141417] text-[#ADADB0] whitespace-nowrap">
                                                                            {cell}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[#6B6B70] text-sm">Tidak ada tabel yang terdeteksi dalam PDF.</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsPdfModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
