import { useState, useEffect, useRef, useMemo } from 'react'
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
    RiImageAddLine,
    RiCloseLine,
    RiLoader4Line,
} from 'react-icons/ri'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { apiFetch, getImageKitAuth } from '../api'

const IMAGEKIT_PUBLIC_KEY = 'public_oaXjLRSYC16BGPDCCi3lpc5Fd64='
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/yyacyn'

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function Articles() {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortDir, setSortDir] = useState('desc')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    // Fetch articles from API
    const fetchArticles = async () => {
        try {
            const res = await apiFetch('/articles')
            const data = await res.json()
            setArticles(data.articles || [])
        } catch (err) {
            console.error('Failed to fetch articles:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchArticles() }, [])

    // Filter + search + sort (client-side on fetched data)
    const filtered = articles
        .filter(a => filterStatus === 'all' || a.status === filterStatus)
        .filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.excerpt || '').toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
            sortDir === 'desc'
                ? new Date(b.created_at) - new Date(a.created_at)
                : new Date(a.created_at) - new Date(b.created_at)
        )

    const handleDelete = async (id) => {
        if (!confirm('Hapus artikel ini?')) return
        try {
            const res = await apiFetch(`/articles/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setArticles(prev => prev.filter(a => a.id !== id))
            }
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const handleEdit = (article) => {
        setEditTarget(article)
        setShowForm(true)
    }

    const handleSave = async (data) => {
        try {
            if (editTarget) {
                const res = await apiFetch(`/articles/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setArticles(prev => prev.map(a => a.id === editTarget.id ? updated : a))
                }
            } else {
                const res = await apiFetch('/articles', {
                    method: 'POST',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const created = await res.json()
                    setArticles(prev => [created, ...prev])
                }
            }
        } catch (err) {
            console.error('Failed to save:', err)
        }
        setShowForm(false)
    }

    const published = articles.filter(a => a.status === 'published').length
    const draft = articles.filter(a => a.status === 'draft').length

    return (
        <div className="flex flex-col gap-7 px-10 py-8">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-white leading-tight font-bold"
                        style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 38, letterSpacing: -1 }}
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
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[50%]">Artikel</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Penulis</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Tanggal</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16 bg-[#141417]">
                                    <div className="flex items-center justify-center gap-3">
                                        <RiLoader4Line size={24} className="text-[#298064] animate-spin" />
                                        <span className="text-[#6B6B70] text-sm">Memuat artikel...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiNewspaperLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada artikel ditemukan</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((article, i) => (
                                <tr
                                    key={article.id}
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#1F1F23]' : ''
                                        }`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            {/* Cover thumbnail */}
                                            {article.cover_image ? (
                                                <img
                                                    src={article.cover_image}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#2A2A2E]"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[#1F1F23] flex items-center justify-center shrink-0">
                                                    <RiNewspaperLine size={16} className="text-[#4A4A4E]" />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-[13px] font-medium leading-snug truncate block">
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
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className="text-[#ADADB0] text-[13px]">{article.author}</span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <span className="text-[#6B6B70] text-xs whitespace-nowrap">{formatDate(article.created_at)}</span>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-1">
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
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Article Form Modal */}
            {showForm && (
                <ArticleFormModal
                    article={editTarget}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Image Upload via ImageKit (client-side with server-signed auth)
// ---------------------------------------------------------------------------

function ImageUploader({ value, onChange }) {
    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(value || '')

    useEffect(() => { setPreview(value || '') }, [value])

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            // 1. Get server-signed auth params
            const auth = await getImageKitAuth()

            // 2. Upload to ImageKit
            const formData = new FormData()
            formData.append('file', file)
            formData.append('publicKey', IMAGEKIT_PUBLIC_KEY)
            formData.append('signature', auth.signature)
            formData.append('expire', auth.expire)
            formData.append('token', auth.token)
            formData.append('fileName', file.name)
            formData.append('folder', '/articles')

            const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            const url = data.url
            setPreview(url)
            onChange(url)
        } catch (err) {
            console.error('Image upload failed:', err)
            alert('Gagal mengupload gambar. Coba lagi.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide">Cover Image</label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Cover"
                        className="w-full h-[180px] rounded-lg object-cover border border-[#2A2A2E]"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="px-3 py-2 rounded-lg bg-[#298064] text-white text-xs font-medium hover:bg-[#1f6b50] transition-colors"
                        >
                            Ganti
                        </button>
                        <button
                            type="button"
                            onClick={() => { setPreview(''); onChange('') }}
                            className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-[140px] rounded-lg border-2 border-dashed border-[#2A2A2E] bg-[#1A1A1D] flex flex-col items-center justify-center gap-2 hover:border-[#298064] transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <RiLoader4Line size={24} className="text-[#298064] animate-spin" />
                            <span className="text-[#6B6B70] text-xs">Mengupload...</span>
                        </>
                    ) : (
                        <>
                            <RiImageAddLine size={24} className="text-[#4A4A4E]" />
                            <span className="text-[#6B6B70] text-xs">Klik untuk upload gambar cover</span>
                            <span className="text-[#4A4A4E] text-[10px]">JPG, PNG, WebP, maks 5MB</span>
                        </>
                    )}
                </button>
            )}

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Article Form Modal
// ---------------------------------------------------------------------------

function ArticleFormModal({ article, onClose, onSave }) {
    const [title, setTitle] = useState(article?.title ?? '')
    const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
    const [content, setContent] = useState(article?.content ?? '')
    const [status, setStatus] = useState(article?.status ?? 'draft')
    const [coverImage, setCoverImage] = useState(article?.cover_image ?? '')
    const [saving, setSaving] = useState(false)
    const quillRef = useRef(null)

    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSave({
            title,
            excerpt,
            content,
            status,
            slug: slugify(title),
            cover_image: coverImage,
        })
        setSaving(false)
    }

    // Custom image handler: upload to ImageKit instead of base64
    const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return

            try {
                const auth = await getImageKitAuth()
                const formData = new FormData()
                formData.append('file', file)
                formData.append('publicKey', IMAGEKIT_PUBLIC_KEY)
                formData.append('signature', auth.signature)
                formData.append('expire', auth.expire)
                formData.append('token', auth.token)
                formData.append('fileName', file.name)
                formData.append('folder', '/articles/content')

                const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) throw new Error('Upload failed')
                const data = await res.json()

                // Insert image at cursor position
                const editor = quillRef.current?.getEditor()
                if (editor) {
                    const range = editor.getSelection(true)
                    editor.insertEmbed(range.index, 'image', data.url)
                    editor.setSelection(range.index + 1)
                }
            } catch (err) {
                console.error('Image upload failed:', err)
                alert('Gagal mengupload gambar. Coba lagi.')
            }
        }
    }

    // Memoize modules so Quill doesn't re-render on every keystroke
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: { image: imageHandler },
        },
    }), [])

    const quillFormats = useMemo(() => [
        'header', 'bold', 'italic', 'underline',
        'list', 'link', 'image',
    ], [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="w-full max-w-6xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E] shrink-0">
                    <h2 className="text-white text-base font-semibold">
                        {article ? 'Edit Artikel' : 'Tambah Artikel Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#6B6B70] hover:text-white transition-colors"
                    >
                        <RiCloseLine size={20} />
                    </button>
                </div>

                {/* Two-column form */}
                <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">

                    {/* ── LEFT PANEL (35%) — metadata ── */}
                    <div className="w-[35%] shrink-0 flex flex-col gap-4 px-6 py-5 overflow-y-auto border-r border-[#2A2A2E]">

                        {/* Cover Image Upload */}
                        <ImageUploader value={coverImage} onChange={setCoverImage} />

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
                                rows={3}
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
                        <div className="flex items-center gap-3 pt-3 mt-auto border-t border-[#2A2A2E]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg bg-[#1A1A1D] text-[#8B8B90] text-sm font-medium hover:text-white hover:bg-[#2A2A2E] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg bg-[#298064] text-white text-sm font-medium hover:bg-[#1f6b50] transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : article ? 'Simpan' : 'Buat'}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL (65%) — content editor ── */}
                    <div className="flex-1 flex flex-col px-6 py-5 overflow-hidden">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide mb-1.5 shrink-0">Konten Artikel</label>
                        <div className="quill-dark flex-1 flex flex-col overflow-hidden [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                placeholder="Tulis isi artikel di sini..."
                                modules={quillModules}
                                formats={quillFormats}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

