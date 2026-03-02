import { useState } from 'react'
import {
    RiAddLine,
    RiSearchLine,
    RiEditLine,
    RiDeleteBinLine,
    RiEyeLine,
    RiFilter3Line,
    RiArrowUpLine,
    RiArrowDownLine,
    RiNewspaperLine,
} from 'react-icons/ri'

const MOCK_ARTICLES = [
    {
        id: 1,
        title: 'Gotong Royong Bulanan Desa Puundoho',
        slug: 'gotong-royong-bulanan',
        excerpt: 'Warga Desa Puundoho kembali mengadakan kegiatan gotong royong rutin setiap bulan...',
        author: 'Admin',
        status: 'published',
        created_at: '2026-02-10T08:00:00Z',
    },
    {
        id: 2,
        title: 'Pembagian Bantuan Sosial Triwulan I 2026',
        slug: 'bansos-triwulan-1-2026',
        excerpt: 'Dinas Sosial bekerja sama dengan pemerintah desa untuk menyalurkan bantuan...',
        author: 'Admin',
        status: 'published',
        created_at: '2026-02-08T09:30:00Z',
    },
    {
        id: 3,
        title: 'Penyuluhan Kesehatan — Pencegahan Stunting',
        slug: 'penyuluhan-pencegahan-stunting',
        excerpt: 'Program penyuluhan kesehatan untuk ibu hamil dan balita dalam rangka pencegahan...',
        author: 'Admin',
        status: 'draft',
        created_at: '2026-02-14T10:00:00Z',
    },
    {
        id: 4,
        title: 'Realisasi APBDes Kuartal Pertama 2026',
        slug: 'realisasi-apbdes-q1-2026',
        excerpt: 'Laporan realisasi Anggaran Pendapatan dan Belanja Desa periode Januari–Maret...',
        author: 'Admin',
        status: 'draft',
        created_at: '2026-02-16T14:00:00Z',
    },
    {
        id: 5,
        title: 'Festival Budaya Desa Puundoho 2026',
        slug: 'festival-budaya-2026',
        excerpt: 'Perayaan hari jadi desa yang ke-47 dimeriahkan dengan berbagai pertunjukan seni...',
        author: 'Admin',
        status: 'published',
        created_at: '2026-02-18T11:00:00Z',
    },
]

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function Articles() {
    const [articles, setArticles] = useState(MOCK_ARTICLES)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'published' | 'draft'
    const [sortDir, setSortDir] = useState('desc')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    // Filter + search + sort
    const filtered = articles
        .filter(a => filterStatus === 'all' || a.status === filterStatus)
        .filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
            sortDir === 'desc'
                ? new Date(b.created_at) - new Date(a.created_at)
                : new Date(a.created_at) - new Date(b.created_at)
        )

    const handleDelete = (id) =>
        setArticles(prev => prev.filter(a => a.id !== id))

    const handleEdit = (article) => {
        setEditTarget(article)
        setShowForm(true)
    }

    const published = articles.filter(a => a.status === 'published').length
    const draft = articles.filter(a => a.status === 'draft').length

    return (
        <div className="flex flex-col gap-7 px-10 py-8">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-white leading-tight"
                        style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, letterSpacing: -1 }}
                    >
                        Berita & Artikel
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola artikel dan berita yang ditampilkan di website desa
                    </p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] text-white text-[13px] font-medium hover:bg-[#1f6b50] transition-colors"
                >
                    <RiAddLine size={16} />
                    Tambah Artikel
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Artikel', value: articles.length, color: 'text-white' },
                    { label: 'Tayang', value: published, color: 'text-green-400' },
                    { label: 'Draft', value: draft, color: 'text-orange-400' },
                ].map(s => (
                    <div key={s.label} className="flex flex-col gap-3 p-5 rounded-xl bg-[#141417] border border-[#1F1F23]">
                        <span className="text-[#6B6B70] text-xs font-medium uppercase tracking-wide">{s.label}</span>
                        <span className={`text-3xl font-medium ${s.color}`}
                            style={{ fontFamily: 'DM Mono, monospace' }}>
                            {s.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari judul atau isi artikel..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    {['all', 'published', 'draft'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filterStatus === s
                                ? 'bg-[#298064] text-white'
                                : 'text-[#8B8B90] hover:text-white'
                                }`}
                        >
                            {s === 'all' ? 'Semua' : s === 'published' ? 'Tayang' : 'Draft'}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <button
                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#141417] border border-[#2A2A2E] text-[#8B8B90] text-xs font-medium hover:text-white hover:bg-[#1A1A1D] transition-colors"
                >
                    <RiFilter3Line size={14} className="text-[#6B6B70]" />
                    {sortDir === 'desc' ? 'Terbaru' : 'Terlama'}
                    {sortDir === 'desc'
                        ? <RiArrowDownLine size={13} />
                        : <RiArrowUpLine size={13} />
                    }
                </button>
            </div>

            {/* Article Table */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                {/* Head */}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] px-5 py-3.5 bg-[#141417] border-b border-[#1F1F23]">
                    {['Artikel', 'Penulis', 'Tanggal', 'Aksi'].map(h => (
                        <span key={h} className="text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">{h}</span>
                    ))}
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-[#141417]">
                        <RiNewspaperLine size={32} className="text-[#3A3A3E]" />
                        <span className="text-[#6B6B70] text-sm">Tidak ada artikel ditemukan</span>
                    </div>
                ) : (
                    filtered.map((article, i) => (
                        <div
                            key={article.id}
                            className={`grid grid-cols-[2fr_1fr_1fr_auto] items-center px-5 py-4 bg-[#141417] hover:bg-[#1A1A1D] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#1F1F23]' : ''
                                }`}
                        >
                            {/* Title + excerpt */}
                            <div className="flex flex-col gap-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-[13px] font-medium leading-snug">
                                        {article.title}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${article.status === 'published'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-orange-500/10 text-orange-400'
                                        }`}>
                                        {article.status === 'published' ? 'Tayang' : 'Draft'}
                                    </span>
                                </div>
                                <span className="text-[#6B6B70] text-xs leading-relaxed line-clamp-1">
                                    {article.excerpt}
                                </span>
                            </div>

                            {/* Author */}
                            <span className="text-[#ADADB0] text-[13px]">{article.author}</span>

                            {/* Date */}
                            <span className="text-[#6B6B70] text-xs">{formatDate(article.created_at)}</span>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    title="Pratinjau"
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-[#6B6B70] hover:text-white hover:bg-[#2A2A2E] transition-colors"
                                >
                                    <RiEyeLine size={15} />
                                </button>
                                <button
                                    onClick={() => handleEdit(article)}
                                    title="Edit"
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-[#6B6B70] hover:text-[#298064] hover:bg-[#2A2A2E] transition-colors"
                                >
                                    <RiEditLine size={15} />
                                </button>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    title="Hapus"
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-[#6B6B70] hover:text-red-400 hover:bg-[#2A2A2E] transition-colors"
                                >
                                    <RiDeleteBinLine size={15} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Article Form Modal */}
            {showForm && (
                <ArticleFormModal
                    article={editTarget}
                    onClose={() => setShowForm(false)}
                    onSave={(data) => {
                        if (editTarget) {
                            setArticles(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...data } : a))
                        } else {
                            setArticles(prev => [...prev, {
                                id: Date.now(),
                                author: 'Admin',
                                created_at: new Date().toISOString(),
                                ...data,
                            }])
                        }
                        setShowForm(false)
                    }}
                />
            )}
        </div>
    )
}

function ArticleFormModal({ article, onClose, onSave }) {
    const [title, setTitle] = useState(article?.title ?? '')
    const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
    const [content, setContent] = useState(article?.content ?? '')
    const [status, setStatus] = useState(article?.status ?? 'draft')

    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({ title, excerpt, content, status, slug: slugify(title) })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E]">
                    <h2 className="text-white text-base font-semibold">
                        {article ? 'Edit Artikel' : 'Tambah Artikel Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#6B6B70] hover:text-white transition-colors text-xl leading-none"
                    >✕</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide">Judul</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Judul artikel..."
                            className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm outline-none focus:border-[#298064] transition-colors placeholder:text-[#4A4A4E]"
                        />
                        {title && (
                            <span className="text-[#4A4A4E] text-[11px]">
                                Slug: /{slugify(title)}
                            </span>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide">Ringkasan</label>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="Ringkasan singkat artikel..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm outline-none focus:border-[#298064] transition-colors placeholder:text-[#4A4A4E] resize-none"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide">Konten</label>
                        <textarea
                            required
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Tulis isi artikel di sini..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm outline-none focus:border-[#298064] transition-colors placeholder:text-[#4A4A4E] resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide">Status</label>
                        <div className="flex items-center gap-2">
                            {['draft', 'published'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s
                                        ? s === 'published'
                                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                            : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                        : 'bg-[#1A1A1D] text-[#8B8B90] border border-[#2A2A2E] hover:text-white'
                                        }`}
                                >
                                    {s === 'published' ? 'Tayang' : 'Draft'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2A2E]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg bg-[#1A1A1D] text-[#8B8B90] text-sm font-medium hover:text-white hover:bg-[#2A2A2E] transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-lg bg-[#298064] text-white text-sm font-medium hover:bg-[#1f6b50] transition-colors"
                        >
                            {article ? 'Simpan Perubahan' : 'Buat Artikel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
