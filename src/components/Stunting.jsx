import { useState, useEffect } from 'react'
import { RiAddLine, RiSearchLine, RiHeartPulseLine, RiEdit2Line, RiDeleteBinLine } from 'react-icons/ri'
// We will mock fetch functionality here until the backend is built.

export default function StuntingList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [stuntingData, setStuntingData] = useState([
        { id: 1, nama_anak: 'Budi Santoso', dusun: 'Dusun 1', umur_bulan: 35, berat_badan: '10.5', status: 'Stunting' },
        { id: 2, nama_anak: 'Siti Aminah', dusun: 'Dusun 3', umur_bulan: 42, berat_badan: '12.0', status: 'Beresiko' },
        { id: 3, nama_anak: 'Rizky', dusun: 'Dusun 2', umur_bulan: 24, berat_badan: '8.5', status: 'Stunting' },
        { id: 4, nama_anak: 'Ayu', dusun: 'Dusun 3', umur_bulan: 18, berat_badan: '7.2', status: 'Stunting' },
        { id: 5, nama_anak: 'Andi', dusun: 'Dusun 4', umur_bulan: 48, berat_badan: '13.5', status: 'Normal' },
    ])

    const filteredData = stuntingData.filter(item => 
        item.nama_anak.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.dusun.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Data Stunting
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola data catatan kasus stunting pada balita secara per Dusun.
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
                        placeholder="Cari nama anak atau nama Dusun..."
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
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Nama Balita</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Dusun</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Umur (Bulan)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Berat (Kg)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Status</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-16 bg-[#141417]">
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
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-[13px] font-medium leading-snug">{d.nama_anak}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]">{d.dusun}</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{d.umur_bulan} bln</td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]" style={{ fontFamily: 'DM Mono, monospace' }}>{d.berat_badan} kg</td>
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
                                            <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors" title="Edit">
                                                <RiEdit2Line size={15} />
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

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiHeartPulseLine className="text-[#298064]" />
                                Tambah Kasus Stunting
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form className="p-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false) }}>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Nama Balita</label>
                                <input type="text" required className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors" placeholder="Masukkan nama..." />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Dusun Wilayah</label>
                                <select className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-[#ADADB0] focus:outline-none focus:border-[#298064] transition-colors">
                                    <option value="Dusun 1">Dusun 1</option>
                                    <option value="Dusun 2">Dusun 2</option>
                                    <option value="Dusun 3">Dusun 3</option>
                                    <option value="Dusun 4">Dusun 4</option>
                                    <option value="Dusun 5">Dusun 5</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Umur (Bulan)</label>
                                    <input type="number" required className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors" placeholder="Mis. 24" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Berat (Kg)</label>
                                    <input type="number" step="0.1" required className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors" placeholder="Mis. 8.5" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
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
        </div>
    )
}
