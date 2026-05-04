import { useEffect, useMemo, useState } from 'react'
import { RiAddLine, RiSearchLine, RiHeartPulseLine, RiEdit2Line, RiDeleteBinLine, RiLoader4Line } from 'react-icons/ri'
import { apiFetch } from '../api'

const DUSUN_OPTIONS = ['Dusun 1', 'Dusun 2', 'Dusun 3', 'Dusun 4', 'Dusun 5']
const STATUS_OPTIONS = ['Stunting', 'Beresiko', 'Normal']

const initialForm = {
    nik_anak: '',
    nama_anak: '',
    lokasi_dusun: 'Dusun 1',
    tanggal_lahir: '',
    tinggi_badan: '',
    berat_badan: '',
    status: 'Normal',
    tanggal_pemeriksaan: '',
}

function formatOptionalNumber(value) {
    if (value === null || value === undefined || value === '') return '-'
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return '-'
    return numberValue.toFixed(1)
}

export default function StuntingList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [stuntingData, setStuntingData] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(initialForm)

    const loadStunting = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await apiFetch('/stunting', { cache: 'no-store' })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Gagal memuat data stunting')
            }
            setStuntingData(data.stunting || [])
        } catch (err) {
            console.error('Fetch stunting error:', err)
            setError(err.message || 'Gagal memuat data stunting')
            setStuntingData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStunting()
    }, [])

    const filteredData = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase()
        if (!keyword) return stuntingData

        return stuntingData.filter((item) =>
            (item.nama_anak || '').toLowerCase().includes(keyword) ||
            (item.dusun || item.lokasi_dusun || '').toLowerCase().includes(keyword) ||
            (item.nik_anak || '').toLowerCase().includes(keyword) ||
            (item.status || '').toLowerCase().includes(keyword)
        )
    }, [searchTerm, stuntingData])

    const resetFormAndClose = () => {
        setForm(initialForm)
        setEditingId(null)
        setIsModalOpen(false)
    }

    const handleOpenCreate = () => {
        setForm(initialForm)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setEditingId(item.id)
        setForm({
            nik_anak: item.nik_anak || '',
            nama_anak: item.nama_anak || '',
            lokasi_dusun: item.lokasi_dusun || item.dusun || 'Dusun 1',
            tanggal_lahir: item.tanggal_lahir || '',
            tinggi_badan: item.tinggi_badan ?? '',
            berat_badan: item.berat_badan ?? '',
            status: item.status || 'Normal',
            tanggal_pemeriksaan: item.tanggal_pemeriksaan || '',
        })
        setIsModalOpen(true)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const payload = {
                nik_anak: form.nik_anak.trim(),
                nama_anak: form.nama_anak.trim(),
                lokasi_dusun: form.lokasi_dusun,
                tanggal_lahir: form.tanggal_lahir || '',
                tinggi_badan: form.tinggi_badan === '' ? '' : String(form.tinggi_badan),
                berat_badan: form.berat_badan === '' ? '' : String(form.berat_badan),
                status: form.status,
                tanggal_pemeriksaan: form.tanggal_pemeriksaan || '',
            }

            const endpoint = editingId ? `/stunting/${editingId}` : '/stunting'
            const method = editingId ? 'PUT' : 'POST'

            const res = await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Gagal menyimpan data stunting')
            }

            await loadStunting()
            resetFormAndClose()
        } catch (err) {
            console.error('Save stunting error:', err)
            setError(err.message || 'Gagal menyimpan data stunting')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus data stunting ini?')) return

        try {
            const res = await apiFetch(`/stunting/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Gagal menghapus data stunting')
            }
            await loadStunting()
        } catch (err) {
            console.error('Delete stunting error:', err)
            setError(err.message || 'Gagal menghapus data stunting')
        }
    }

    return (
        <div className="flex flex-col gap-7 px-10 py-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
                    >
                        Data Stunting
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola data catatan kasus stunting pada balita secara per Dusun.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Data Baru
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama anak, NIK, Dusun, atau status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            <div className="rounded-xl overflow-x-auto border border-[#1F1F23]">
                <table className="w-full min-w-[980px] border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">NIK Anak</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Nama Balita</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Dusun</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Umur (Bulan)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Berat (Kg)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tinggi (Cm)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tgl Pemeriksaan</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Status</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="text-center py-16 bg-[#141417]">
                                    <div className="inline-flex items-center gap-2 text-[#8B8B90] text-sm">
                                        <RiLoader4Line className="animate-spin" size={18} />
                                        Memuat data stunting...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiHeartPulseLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Belum ada data stunting</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((d, i) => (
                                <tr
                                    key={d.id}
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filteredData.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{d.nik_anak || '-'}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className="text-white text-[13px] font-medium leading-snug">{d.nama_anak}</span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.dusun || d.lokasi_dusun}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{d.umur_bulan || 0} bln</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{formatOptionalNumber(d.berat_badan)} kg</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{formatOptionalNumber(d.tinggi_badan)} cm</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.tanggal_pemeriksaan || '-'}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${d.status === 'Stunting' ? 'bg-red-500/10 text-red-500' :
                                                d.status === 'Beresiko' ? 'bg-orange-500/10 text-orange-400' :
                                                    'bg-green-500/10 text-green-400'}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(d)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <RiEdit2Line size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors"
                                                title="Hapus"
                                            >
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiHeartPulseLine className="text-[#298064]" />
                                {editingId ? 'Edit Kasus Stunting' : 'Tambah Kasus Stunting'}
                            </h3>
                            <button onClick={resetFormAndClose} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleFormSubmit}>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">NIK Anak (Opsional)</label>
                                <input
                                    type="text"
                                    value={form.nik_anak}
                                    onChange={(e) => setForm((prev) => ({ ...prev, nik_anak: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Contoh: 7408..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Nama Balita</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nama_anak}
                                    onChange={(e) => setForm((prev) => ({ ...prev, nama_anak: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Masukkan nama..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Dusun Wilayah</label>
                                <select
                                    value={form.lokasi_dusun}
                                    onChange={(e) => setForm((prev) => ({ ...prev, lokasi_dusun: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                                >
                                    {DUSUN_OPTIONS.map((dusun) => (
                                        <option key={dusun} value={dusun}>{dusun}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Tanggal Lahir (Opsional)</label>
                                <input
                                    type="date"
                                    value={form.tanggal_lahir}
                                    onChange={(e) => setForm((prev) => ({ ...prev, tanggal_lahir: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Tanggal Pemeriksaan (Opsional)</label>
                                <input
                                    type="date"
                                    value={form.tanggal_pemeriksaan}
                                    onChange={(e) => setForm((prev) => ({ ...prev, tanggal_pemeriksaan: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Berat Badan (Kg, Opsional)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.berat_badan}
                                    onChange={(e) => setForm((prev) => ({ ...prev, berat_badan: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Mis. 8.5"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Tinggi Badan (Cm, Opsional)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={form.tinggi_badan}
                                    onChange={(e) => setForm((prev) => ({ ...prev, tinggi_badan: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Mis. 75.0"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex gap-3 justify-end mt-2">
                                <button type="button" onClick={resetFormAndClose} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-[#298064] hover:bg-[#216650] disabled:bg-[#216650]/60 text-white text-sm font-medium rounded-lg transition-all"
                                >
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
