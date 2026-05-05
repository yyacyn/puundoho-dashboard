import { useState, useEffect } from 'react'
import { RiSearchLine, RiDeleteBinLine, RiCustomerService2Line, RiCheckDoubleLine, RiTimeLine, RiImageLine, RiLoader4Line, RiArrowDownSLine } from 'react-icons/ri'
import { apiFetch } from '../api'



export default function PengaduanList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPengaduan, setSelectedPengaduan] = useState(null)
    const [imgLoading, setImgLoading] = useState(true)
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
    const [pendingStatus, setPendingStatus] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [pengaduanData, setPengaduanData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const statusFlow = {
        'Baru': ['Ditinjau', 'Ditolak'],
        'Ditinjau': ['Diproses', 'Ditolak'],
        'Diproses': ['Selesai'],
        'Selesai': [],
        'Ditolak': []
    }

    // Fetch pengaduan data
    useEffect(() => {
        const fetchPengaduan = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await apiFetch('/pengaduan')
                if (!res.ok) {
                    throw new Error('Gagal mengambil data pengaduan')
                }
                const json = await res.json()
                setPengaduanData(json.pengaduan || [])
            } catch (err) {
                console.error(err)
                setError(err.message)
                setPengaduanData([])
            } finally {
                setLoading(false)
            }
        }

        fetchPengaduan()
    }, [])

    const filteredData = pengaduanData.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleStatusChange = async (newStatus) => {
        const finalStatus = newStatus || pendingStatus
        if (!selectedPengaduan || !finalStatus) return

        if (finalStatus === 'Ditolak' && !rejectReason.trim()) {
            alert('Keterangan alasan penolakan harus diisi!')
            return
        }

        setIsUpdatingStatus(true)
        try {
            const response = await apiFetch(`/pengaduan/${selectedPengaduan.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: finalStatus, keterangan: rejectReason })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Gagal mengubah status')
            }

            const updatedPengaduan = await response.json()

            const updatedData = pengaduanData.map(item =>
                item.id === selectedPengaduan.id
                    ? updatedPengaduan
                    : item
            )
            setPengaduanData(updatedData)
            setSelectedPengaduan(updatedPengaduan)
            setPendingStatus('')
            setRejectReason('')
            setStatusDropdownOpen(false)
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Gagal mengubah status: ' + error.message)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Baru': return 'bg-blue-500/10 text-blue-400'
            case 'Ditinjau': return 'bg-purple-500/10 text-purple-400'
            case 'Diproses': return 'bg-orange-500/10 text-orange-400'
            case 'Selesai': return 'bg-green-500/10 text-green-400'
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
                        Pengaduan Masyarakat
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola dan tindak lanjuti laporan serta keluhan yang masuk dari warga desa.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari pengaduan, nama pelapor..."
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

            {/* Loading Message */}
            {loading && (
                <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg">
                    Memuat data pengaduan...
                </div>
            )}

            {/* Main Table Container */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Pelapor</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Kategori</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[35%]">Judul Laporan</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tanggal</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Status</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiCustomerService2Line size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada data pengaduan</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((d, i) => (
                                <tr
                                    key={d.id}
                                    onClick={() => {
                                        setImgLoading(true)
                                        setSelectedPengaduan(d)
                                    }}
                                    className={`hover:bg-[#1A1A1D] transition-colors cursor-pointer ${i < filteredData.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.nama}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.kategori}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px] max-w-xs" title={d.judul}>
                                        <span className="truncate">{d.judul}</span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#8B8B90] text-[13px] whitespace-nowrap">{new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${getStatusColor(d.status)}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2 relative" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setSelectedPengaduan(d)
                                                    setStatusDropdownOpen(true)
                                                    setRejectReason(d.keterangan || '')
                                                }}
                                                className="px-3 py-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#ADADB0] hover:text-white text-[12px] font-medium transition-colors flex items-center gap-1"
                                            >
                                                Ubah Status <RiArrowDownSLine size={12} />
                                            </button>
                                            <button className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors" title="Hapus">
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

            {/* Modal Detail Pengaduan */}
            {selectedPengaduan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-2xl overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiCustomerService2Line className="text-[#298064]" />
                                Detail Pengaduan
                            </h3>
                            <button onClick={() => setSelectedPengaduan(null)} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-6 text-[13px]">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Pelapor</span>
                                    <span className="text-white font-medium">{selectedPengaduan.nama}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Tanggal</span>
                                    <span className="text-white font-medium">{new Date(selectedPengaduan.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Kategori</span>
                                    <span className="inline-flex px-2 py-1 rounded bg-[#2A2A2E] text-[#E4E4E5] font-medium text-[11px]">{selectedPengaduan.kategori}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-1">Status</span>
                                    <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${selectedPengaduan.status === 'Baru' ? 'bg-blue-500/10 text-blue-400' :
                                            selectedPengaduan.status === 'Proses' ? 'bg-orange-500/10 text-orange-400' :
                                                selectedPengaduan.status === 'Ditolak' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-green-500/10 text-green-400'}`}
                                    >
                                        {selectedPengaduan.status}
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
                                        {selectedPengaduan.status}
                                        <RiArrowDownSLine size={16} />
                                    </button>

                                    {statusDropdownOpen && (
                                        <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] shadow-lg">
                                            {statusFlow[selectedPengaduan.status]?.map((nextStatus) => (
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

                            {selectedPengaduan.status === 'Ditolak' && selectedPengaduan.keterangan && (
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Alasan Penolakan</span>
                                    <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-[#ADADB0] leading-relaxed">
                                        {selectedPengaduan.keterangan}
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
                                <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Isi Laporan</span>
                                <div className="p-4 rounded-lg bg-[#0A0A0B] border border-[#1F1F23] text-[#ADADB0] leading-relaxed">
                                    {selectedPengaduan.isi}
                                </div>
                            </div>

                            {selectedPengaduan.foto_url && (
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#6B6B70] uppercase mb-2">Lampiran Foto</span>
                                    <div className="relative rounded-lg overflow-hidden border border-[#1F1F23] bg-[#0A0A0B] max-w-sm min-h-[150px] flex items-center justify-center">
                                        {imgLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <RiLoader4Line className="animate-spin text-[#6B6B70]" size={24} />
                                            </div>
                                        )}
                                        <img
                                            src={selectedPengaduan.foto_url}
                                            alt="Lampiran Pengaduan"
                                            className={`w-full h-auto max-h-[250px] object-cover transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setImgLoading(false)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-[#1F1F23] bg-[#111113] flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPengaduan(null)}
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