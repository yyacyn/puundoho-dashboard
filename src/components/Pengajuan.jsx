import { useEffect, useState } from 'react'
import { RiSearchLine, RiFilePaper2Line, RiCheckDoubleLine, RiCloseCircleLine, RiTimeLine, RiArrowDownSLine, RiLoader4Line } from 'react-icons/ri'
import { apiFetch } from '../api'

export default function Pengajuan() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
    const [selectedPengajuan, setSelectedPengajuan] = useState(null)
    const [pendingStatus, setPendingStatus] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [pengajuanData, setPengajuanData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const statusFlow = {
        'Baru': ['Ditinjau', 'Ditolak'],
        'Ditinjau': ['Disetujui', 'Ditolak'],
        'Disetujui': [],
        'Ditolak': []
    }

    // Fetch pengajuan data
    useEffect(() => {
        const fetchPengajuan = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await apiFetch('/pengajuan')
                if (!res.ok) {
                    throw new Error('Gagal mengambil data pengajuan')
                }
                const json = await res.json()
                setPengajuanData(json.pengajuan || [])
            } catch (err) {
                console.error(err)
                setError(err.message)
                setPengajuanData([])
            } finally {
                setLoading(false)
            }
        }

        fetchPengajuan()
    }, [])

    const filteredData = pengajuanData.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleStatusChange = async (newStatus) => {
        const finalStatus = newStatus || pendingStatus
        if (!selectedPengajuan || !finalStatus) return

        if (finalStatus === 'Ditolak' && !rejectReason.trim()) {
            alert('Keterangan alasan penolakan harus diisi!')
            return
        }

        setIsUpdatingStatus(true)
        try {
            const response = await apiFetch(`/pengajuan/${selectedPengajuan.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: finalStatus, keterangan: rejectReason })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Gagal mengubah status')
            }

            const updatedPengajuan = await response.json()

            const updatedData = pengajuanData.map(item =>
                item.id === selectedPengajuan.id
                    ? updatedPengajuan
                    : item
            )
            setPengajuanData(updatedData)
            setSelectedPengajuan(updatedPengajuan)
            setPendingStatus('')
            setRejectReason('')
            setStatusDropdownOpen(false)
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Gagal mengubah status pengajuan')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Baru': return 'bg-blue-500/10 text-blue-400'
            case 'Ditinjau': return 'bg-purple-500/10 text-purple-400'
            case 'Disetujui': return 'bg-green-500/10 text-green-400'
            case 'Ditolak': return 'bg-red-500/10 text-red-400'
            default: return 'bg-gray-500/10 text-gray-400'
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
                        Pengajuan PPID
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola permintaan dokumen dan surat keterangan dari warga.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama pemohon atau jenis surat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Main Table Container */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Pemohon</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Jenis Pengajuan</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Judul</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tanggal</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Status</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex items-center justify-center gap-3">
                                        <RiLoader4Line size={24} className="text-[#298064] animate-spin" />
                                        <span className="text-[#6B6B70] text-sm">Memuat data pengajuan...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiFilePaper2Line size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada data pengajuan dokumen</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((d, i) => (
                                <tr
                                    key={d.id}
                                    onClick={() => {
                                        setSelectedPengajuan(d)
                                        setStatusDropdownOpen(false)
                                        setRejectReason(d.keterangan || '')
                                    }}
                                    className={`hover:bg-[#1A1A1D] transition-colors cursor-pointer ${i < filteredData.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.nama}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.kategori}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px] font-medium text-white">{d.judul}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${getStatusColor(d.status)}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setSelectedPengajuan(d)
                                                    setStatusDropdownOpen(true)
                                                    setRejectReason(d.keterangan || '')
                                                }}
                                                className="px-3 py-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#ADADB0] hover:text-white text-[12px] font-medium transition-colors flex items-center gap-1"
                                            >
                                                Ubah Status <RiArrowDownSLine size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail Pengajuan */}
            {selectedPengajuan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiFilePaper2Line className="text-[#298064]" />
                                Detail Pengajuan
                            </h3>
                            <button onClick={() => setSelectedPengajuan(null)} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-6 text-[13px]">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Pemohon</span>
                                    <span className="text-white font-medium">{selectedPengajuan.nama}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Tanggal</span>
                                    <span className="text-white font-medium">{new Date(selectedPengajuan.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Jenis Pengajuan</span>
                                    <span className="inline-flex px-2 py-1 rounded bg-[#2A2A2E] text-[#E4E4E5] font-medium text-[11px]">{selectedPengajuan.kategori}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Status</span>
                                    <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${getStatusColor(selectedPengajuan.status)}`}
                                    >
                                        {selectedPengajuan.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Ubah Status</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-white text-[13px] font-medium flex items-center justify-between hover:border-[#2A2A2E] transition-colors"
                                    >
                                        {pendingStatus || selectedPengajuan.status}
                                        <RiArrowDownSLine size={16} />
                                    </button>

                                    {statusDropdownOpen && (
                                        <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] shadow-lg">
                                            {statusFlow[selectedPengajuan.status]?.map((nextStatus) => (
                                                <button
                                                    key={nextStatus}
                                                    onClick={() => {
                                                        setPendingStatus(nextStatus)
                                                        setStatusDropdownOpen(false)
                                                        if (nextStatus !== 'Ditolak') {
                                                            setRejectReason('')
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-[13px] text-[#ADADB0] hover:bg-[#2A2A2E] hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                >
                                                    {nextStatus}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedPengajuan.status === 'Ditolak' && selectedPengajuan.keterangan && (
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Alasan Penolakan</span>
                                    <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-[#ADADB0] leading-relaxed">
                                        {selectedPengajuan.keterangan}
                                    </div>
                                </div>
                            )}

                            {pendingStatus === 'Ditolak' && (
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Alasan Penolakan (jika dipilih)</span>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Masukkan alasan penolakan..."
                                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-white text-[13px] placeholder-[#6B6B70] focus:outline-none focus:border-[#2A2A2E] resize-none"
                                        rows="3"
                                    />
                                </div>
                            )}

                            <div>
                                <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Isi Pengajuan</span>
                                <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-[#ADADB0] leading-relaxed">
                                    {selectedPengajuan.isi}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#1F1F23] bg-[#111113] flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPengajuan(null)}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#1A1A1D] hover:bg-[#2A2A2E] border border-[#2A2A2E] rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => handleStatusChange()}
                                disabled={!pendingStatus || isUpdatingStatus || (pendingStatus === 'Ditolak' && !rejectReason.trim())}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#298064] hover:bg-[#236d55] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                {isUpdatingStatus ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}