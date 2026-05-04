import { useState } from 'react'
import { RiSearchLine, RiFilePaper2Line, RiCheckDoubleLine, RiCloseCircleLine, RiTimeLine } from 'react-icons/ri'

export default function Pengajuan() {
    const [searchTerm, setSearchTerm] = useState('')

    const [pengajuanData, setPengajuanData] = useState([
        { id: 1, nama: 'Budi Santoso', jenis_pengajuan: 'Surat Keterangan Usaha', biaya: 0, kontak: '08123456789', status: 'pending', date: '2026-03-18' },
        { id: 2, nama: 'Siti Aminah', jenis_pengajuan: 'Surat Pengantar Nikah', biaya: 0, kontak: '08561234123', status: 'disetujui', date: '2026-03-17' },
        { id: 3, nama: 'Agus Setiawan', jenis_pengajuan: 'Surat Keterangan Tidak Mampu', biaya: 0, kontak: '08781234567', status: 'ditolak', date: '2026-03-16' },
    ])

    const filteredData = pengajuanData.filter(item => 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.jenis_pengajuan.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Main Table Container */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Pemohon</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Kontak</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Jenis Pengajuan</th>
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
                                        <RiFilePaper2Line size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada data pengajuan dokumen</span>
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.nama}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.kontak}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px] font-medium text-white">{d.jenis_pengajuan}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${d.status === 'pending' ? 'bg-orange-500/10 text-orange-400' : 
                                              d.status === 'disetujui' ? 'bg-green-500/10 text-green-400' : 
                                              'bg-red-500/10 text-red-400'}`}
                                        >
                                            {d.status === 'pending' ? 'Menunggu' : 
                                             d.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {d.status === 'pending' && (
                                                <>
                                                    <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-green-500/10 text-[#8B8B90] hover:text-green-400 transition-colors" title="Setujui">
                                                        <RiCheckDoubleLine size={15} />
                                                    </button>
                                                    <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors" title="Tolak">
                                                        <RiCloseCircleLine size={15} />
                                                    </button>
                                                </>
                                            )}
                                            {d.status !== 'pending' && (
                                                <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-orange-500/10 text-[#8B8B90] hover:text-orange-400 transition-colors" title="Kembalikan ke Pending">
                                                    <RiTimeLine size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
