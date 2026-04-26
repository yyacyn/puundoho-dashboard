import { useState, useEffect } from 'react'
import { RiAddLine, RiSearchLine, RiHandCoinLine, RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri'
import { apiFetch } from '../api'

export default function Bansos() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [bansosData, setBansosData] = useState([])
    const [error, setError] = useState('')

    const [pendudukList, setPendudukList] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeField, setActiveField] = useState('') // 'nik' or 'nama'
    const [editingId, setEditingId] = useState(null)

    const [form, setForm] = useState({
        nama_program: '', dusun: 'Dusun 1', nik: '', nama: '', status: 'Menunggu', tanggal: '', keterangan: ''
    })

    const loadBansos = async () => {
        try {
            setError('')
            const res = await apiFetch('/bansos')
            if (!res.ok) throw new Error('Gagal mengambil data bansos')

            const data = await res.json()
            setBansosData(data.bansos || [])
        } catch (err) {
            console.error(err)
            setError('Gagal memuat data bansos dari server')
        }
    }

    useEffect(() => {
        let isMounted = true

        const fetchPenduduk = async () => {
            try {
                const resDS = await apiFetch('/penduduk/datasets')
                if (!resDS.ok) return
                const datasets = await resDS.json()
                if (!datasets || datasets.length === 0) return

                const newestId = datasets.sort((a, b) => b.tahun - a.tahun)[0].id
                const resRec = await apiFetch(`/penduduk/datasets/${newestId}/records`)
                if (!resRec.ok) return
                const dataRec = await resRec.json()
                if (isMounted) {
                    setPendudukList(dataRec.penduduk || [])
                }
            } catch (err) {
                console.error(err)
            }
        }

        const fetchInitialData = async () => {
            setLoading(true)
            await Promise.all([fetchPenduduk(), loadBansos()])
            if (isMounted) {
                setLoading(false)
            }
        }

        fetchInitialData()

        return () => {
            isMounted = false
        }
    }, [])

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))

        if (field === 'nik' || field === 'nama') {
            if (value.length >= 2) {
                const results = pendudukList.filter(p => {
                    const nikMatch = field === 'nik' && p.nik && p.nik.includes(value)
                    const namaMatch = field === 'nama' && p.nama && p.nama.toLowerCase().includes(value.toLowerCase())
                    return nikMatch || namaMatch
                }).slice(0, 5)

                setSuggestions(results)
                setShowSuggestions(results.length > 0)
                setActiveField(field)
            } else {
                setShowSuggestions(false)
            }
        }
    }

    const selectResident = (resident) => {
        let cleanDusun = 'Dusun 1' // Default fallback
        if (resident.alamat) {
            const a = resident.alamat.toLowerCase()
            if (a.includes('1') || a.includes('satu') || a.includes(' i ') || a.endsWith(' i') || a === 'i') cleanDusun = 'Dusun 1'
            if (a.includes('2') || a.includes('dua') || a.includes(' ii ') || a.endsWith(' ii') || a === 'ii') cleanDusun = 'Dusun 2'
            if (a.includes('3') || a.includes('tiga') || a.includes(' iii ') || a.endsWith(' iii') || a === 'iii') cleanDusun = 'Dusun 3'
            if (a.includes('4') || a.includes('empat') || a.includes(' iv ') || a.endsWith(' iv') || a === 'iv') cleanDusun = 'Dusun 4'
            if (a.includes('5') || a.includes('lima') || a.includes(' v ') || a.endsWith(' v') || a === 'v') cleanDusun = 'Dusun 5'
        }

        setForm(prev => ({
            ...prev,
            nik: resident.nik,
            nama: resident.nama,
            dusun: cleanDusun
        }))
        setShowSuggestions(false)
    }

    const resetFormAndClose = () => {
        setForm({ nama_program: '', dusun: 'Dusun 1', nik: '', nama: '', status: 'Menunggu', tanggal: '', keterangan: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    const handleEdit = (d) => {
        setForm({
            nama_program: d.nama_program,
            dusun: d.lokasi_dusun,
            nik: d.nik_penerima || '',
            nama: d.nama_penerima,
            status: d.status,
            tanggal: d.tanggal_penyaluran || '',
            keterangan: d.keterangan || ''
        })
        setEditingId(d.id)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus data bansos ini?')) return

        try {
            const res = await apiFetch(`/bansos/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Gagal menghapus data bansos')
            setBansosData(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus data bansos')
        }
    }

    const resetForm = () => {
        setForm({ nama_program: '', dusun: 'Dusun 1', nik: '', nama: '', status: 'Menunggu', tanggal: '', keterangan: '' })
        setEditingId(null)
        setShowSuggestions(false)
        setSuggestions([])
        setActiveField('')
    }

    const handleSave = async (e) => {
        e.preventDefault()

        const payload = {
            nama_program: form.nama_program,
            nik_penerima: form.nik,
            nama_penerima: form.nama,
            lokasi_dusun: form.dusun,
            status: form.status,
            tanggal_penyaluran: form.tanggal,
            keterangan: form.keterangan,
        }

        try {
            setSaving(true)
            const res = editingId
                ? await apiFetch(`/bansos/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                })
                : await apiFetch('/bansos', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                })

            if (!res.ok) throw new Error('Gagal menyimpan data bansos')

            await loadBansos()
            resetForm()
            setIsModalOpen(false)
        } catch (err) {
            console.error(err)
            alert('Gagal menyimpan data bansos')
        } finally {
            setSaving(false)
        }
    }

    const filteredData = bansosData.filter(item =>
        item.nama_penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi_dusun.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nik_penerima || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-7 px-10 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
                    >
                        Bantuan Sosial
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola data penerima bantuan sosial (Bansos) dan status penyalurannya.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Data Baru
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari penerima, program, atau dusun..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            {/* Main Table Container */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Nama Penerima & NIK</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Program & Dusun</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tanggal Penyaluran</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Keterangan</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Status</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex items-center justify-center gap-3">
                                        <RiHandCoinLine size={32} className="text-[#3A3A3E] animate-pulse" />
                                        <span className="text-[#6B6B70] text-sm">Memuat data bansos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiHandCoinLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-red-400 text-sm">{error}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiHandCoinLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Belum ada data bansos</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((d, i) => (
                                <tr
                                    key={d.id}
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filteredData.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.nama_penerima}</span>
                                            <span className="text-[#6B6B70] text-[11px]" style={{ fontFamily: 'DM Mono, monospace' }}>{d.nik_penerima}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#ADADB0] text-[13px]">{d.nama_program}</span>
                                            <span className="text-[#6B6B70] text-[11px]">{d.lokasi_dusun}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>
                                        {d.tanggal_penyaluran ? new Date(d.tanggal_penyaluran).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px] max-w-[200px] truncate" title={d.keterangan}>
                                        {d.keterangan || '-'}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex w-fit px-2 py-1 rounded text-[11px] font-medium 
                                            ${d.status === 'Tersalurkan' ? 'bg-green-500/10 text-green-400' :
                                                d.status === 'Ditolak' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-orange-500/10 text-orange-400'}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(d)} className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors" title="Edit">
                                                <RiEdit2Line size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors" title="Hapus">
                                                <RiDeleteBinLine size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center sticky top-0 bg-[#141417] z-10">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiHandCoinLine className="text-[#298064]" />
                                {editingId ? 'Ubah Penerima Bansos' : 'Tambah Penerima Bansos'}
                            </h3>
                            <button onClick={resetFormAndClose} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form className="p-6 flex flex-col gap-5" onSubmit={handleSave}>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Nama Program</label>
                                    <input
                                        type="text" required
                                        value={form.nama_program} onChange={e => handleInputChange('nama_program', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                        placeholder="Mis. BLT Dana Desa"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Dusun Wilayah</label>
                                    <select
                                        value={form.dusun} onChange={e => handleInputChange('dusun', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                                    >
                                        <option value="Dusun 1">Dusun 1</option>
                                        <option value="Dusun 2">Dusun 2</option>
                                        <option value="Dusun 3">Dusun 3</option>
                                        <option value="Dusun 4">Dusun 4</option>
                                        <option value="Dusun 5">Dusun 5</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">NIK Penerima</label>
                                    <input
                                        type="text" pattern="[0-9]{16}" title="16 Digit NIK"
                                        value={form.nik} onChange={e => handleInputChange('nik', e.target.value)}
                                        onFocus={() => { if (form.nik.length >= 2) setShowSuggestions(true); setActiveField('nik') }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                        placeholder="16 digit NIK"
                                    />
                                    {showSuggestions && activeField === 'nik' && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg shadow-xl z-50 max-h-[150px] overflow-y-auto">
                                            {suggestions.map(s => (
                                                <div key={s.id} className="px-3 py-2 hover:bg-[#2A2A2E] cursor-pointer text-sm transition-colors border-b border-[#2A2A2E] last:border-0" onClick={() => selectResident(s)}>
                                                    <div className="text-white font-medium">{s.nik}</div>
                                                    <div className="text-[#6B6B70] text-[11px]">{s.nama} - {s.alamat || 'Tidak diketahui'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 relative">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Nama Penerima</label>
                                    <input
                                        type="text" required
                                        value={form.nama} onChange={e => handleInputChange('nama', e.target.value)}
                                        onFocus={() => { if (form.nama.length >= 2) setShowSuggestions(true); setActiveField('nama') }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                        placeholder="Sesuai KTP..."
                                    />
                                    {showSuggestions && activeField === 'nama' && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg shadow-xl z-50 max-h-[150px] overflow-y-auto">
                                            {suggestions.map(s => (
                                                <div key={s.id} className="px-3 py-2 hover:bg-[#2A2A2E] cursor-pointer text-sm transition-colors border-b border-[#2A2A2E] last:border-0" onClick={() => selectResident(s)}>
                                                    <div className="text-white font-medium">{s.nama}</div>
                                                    <div className="text-[#6B6B70] text-[11px]">{s.nik} - {s.alamat || 'Tidak diketahui'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Status</label>
                                    <select
                                        value={form.status} onChange={e => handleInputChange('status', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                                    >
                                        <option value="Menunggu">Menunggu</option>
                                        <option value="Tersalurkan">Tersalurkan</option>
                                        <option value="Ditolak">Ditolak</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Tanggal Penyaluran</label>
                                    <input
                                        type="date"
                                        value={form.tanggal} onChange={e => handleInputChange('tanggal', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Keterangan (Opsional)</label>
                                <textarea
                                    value={form.keterangan} onChange={e => handleInputChange('keterangan', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors min-h-[80px]"
                                    placeholder="Tambahkan catatan..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button type="button" onClick={() => { resetForm(); setIsModalOpen(false) }} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#298064] hover:bg-[#216650] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all">
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
