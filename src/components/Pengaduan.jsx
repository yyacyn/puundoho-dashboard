import { useState } from 'react'
import { RiSearchLine, RiDeleteBinLine, RiCustomerService2Line, RiCheckDoubleLine, RiTimeLine, RiImageLine, RiLoader4Line } from 'react-icons/ri'

export default function PengaduanList() {
    const [searchTerm, setSearchTerm] = useState('')

    const [selectedPengaduan, setSelectedPengaduan] = useState(null)
    const [imgLoading, setImgLoading] = useState(true)

    const [pengaduanData, setPengaduanData] = useState([
        { id: 1, nama: 'Ahmad Wahyudi', kategori: 'Infrastruktur', isi: 'Jalan berlubang di dekat balai dusun 2 sangat berbahaya.', foto_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80', status: 'Baru', date: '2026-03-18' },
        { id: 2, nama: 'Siti Rahayu', kategori: 'Layanan', isi: 'Air bersih mati sejak pagi di RT 03', foto_url: null, status: 'Proses', date: '2026-03-17' },
        { id: 3, nama: 'Budi Santoso', kategori: 'Lingkungan', isi: 'Sampah menumpuk di area lapangan terbuka', foto_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80', status: 'Selesai', date: '2026-03-15' },
    ])

    const filteredData = pengaduanData.filter(item => 
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Main Table Container */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Pelapor</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Kategori</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[35%]">Isi Pengaduan</th>
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
                                    <td className="px-5 py-4 bg-[#141417] text-[#ADADB0] text-[13px] max-w-xs" title={d.isi}>
                                        <div className="flex items-center gap-2">
                                            <span className="truncate">{d.isi}</span>
                                            {d.foto_url && <RiImageLine size={14} className="text-[#6B6B70] shrink-0" title="Ada Lampiran Foto" />}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#6B6B70] text-[13px]">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className={`inline-flex px-2 py-1 rounded text-[11px] font-medium 
                                            ${d.status === 'Baru' ? 'bg-blue-500/10 text-blue-400' : 
                                              d.status === 'Proses' ? 'bg-orange-500/10 text-orange-400' : 
                                              'bg-green-500/10 text-green-400'}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {d.status !== 'Selesai' && (
                                                <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-green-500/10 text-[#8B8B90] hover:text-green-400 transition-colors" title="Tandai Selesai">
                                                    <RiCheckDoubleLine size={15} />
                                                </button>
                                            )}
                                            {d.status === 'Baru' && (
                                                <button className="p-1.5 rounded bg-[#1A1A1D] hover:bg-orange-500/10 text-[#8B8B90] hover:text-orange-400 transition-colors" title="Proses Laporan">
                                                    <RiTimeLine size={15} />
                                                </button>
                                            )}
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
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
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
                                    <span className="text-white font-medium">{new Date(selectedPengaduan.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                                              'bg-green-500/10 text-green-400'}`}
                                    >
                                        {selectedPengaduan.status}
                                    </span>
                                </div>
                            </div>
                            
                            
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
