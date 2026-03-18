import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiGroupLine, RiAddLine, RiDeleteBinLine, RiExternalLinkLine, RiFileExcel2Line, RiSearchLine } from 'react-icons/ri'
import { apiFetch } from '../api'

export default function PendudukList() {
    const navigate = useNavigate()
    const [datasets, setDatasets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newYear, setNewYear] = useState(new Date().getFullYear())
    const [isSaving, setIsSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        fetchDatasets()
    }, [])

    const fetchDatasets = async () => {
        try {
            const res = await apiFetch('/penduduk/datasets')
            if (res.ok) {
                const data = await res.json()
                setDatasets(data || [])
            }
        } catch (error) {
            console.error('Error fetching datasets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateDataset = async (e) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const res = await apiFetch('/penduduk/datasets', {
                method: 'POST',
                body: JSON.stringify({ tahun: parseInt(newYear), nama_file: `Data Penduduk ${newYear}` })
            })
            if (res.ok) {
                const data = await res.json()
                setIsModalOpen(false)
                fetchDatasets()
                // Navigate to editor immediately
                navigate(`/dashboard/penduduk/${data.id}`)
                showToast('Dataset berhasil dibuat!', 'success')
            } else {
                const err = await res.json()
                showToast(err.error || 'Gagal menambahkan data tahun', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan jaringan', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteDataset = async (id) => {
        if (!confirm('Hapus seluruh data untuk tahun ini? Tindakan ini tidak dapat dibatalkan.')) return

        try {
            const res = await apiFetch(`/penduduk/datasets/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDatasets(datasets.filter(d => d.id !== id))
                showToast('Dataset berhasil dihapus', 'success')
            } else {
                showToast('Gagal menghapus data', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan server', 'error')
        }
    }

    const filteredDatasets = datasets.filter(d => 
        d.tahun.toString().includes(searchTerm) || 
        (d.nama_file && d.nama_file.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        Data Penduduk
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola data kependudukan berdasarkan dataset tahunan.
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
                        placeholder="Cari tahun atau nama file..."
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
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[40%]">Tahun</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Keterangan / File</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Total Penduduk</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tanggal Dibuat</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-16 bg-[#141417]">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-[#298064] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[#6B6B70] text-sm">Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDatasets.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiGroupLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Belum ada data tersedia</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredDatasets.map((d, i) => (
                                <tr 
                                    key={d.id} 
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filteredDatasets.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.tahun}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.nama_file || '-'}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.total_records.toLocaleString()} Jiwa</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{new Date(d.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/penduduk/${d.id}`)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors"
                                                title="Buka Editor"
                                            >
                                                <RiExternalLinkLine size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDataset(d.id)}
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

            {/* Create Dataset Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiGroupLine className="text-[#298064]" />
                                Buat Dataset Baru
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreateDataset} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Tahun Data</label>
                                <input
                                    type="number"
                                    required
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors"
                                    placeholder="Contoh: 2024"
                                />
                            </div>
                            <div className="bg-[#298064]/5 border border-[#298064]/10 rounded-lg p-3">
                                <p className="text-[12px] text-[#8B8B90] leading-relaxed">
                                    Dataset baru akan dibuat kosong. Anda dapat mengimpor file Excel dari tabel editor setelah dataset ini dibuat.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-[#298064] hover:bg-[#216650] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Buat Dataset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="toast toast-bottom toast-end z-[100] mb-4 mr-4">
                    <div className={`alert ${toast.type === 'success' ? 'alert-success bg-[#298064] text-white border-0' : 'alert-error bg-red-500/90 text-white border-0'} shadow-lg`}>
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
