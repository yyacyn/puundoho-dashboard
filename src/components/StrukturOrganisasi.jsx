import { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import {
    RiAddLine,
    RiSearchLine,
    RiDeleteBinLine,
    RiImageAddLine,
    RiCloseLine,
    RiLoader4Line,
    RiGalleryLine,
    RiTimeLine,
} from 'react-icons/ri'
import { apiFetch, getImageKitAuth } from '../api'

const IMAGEKIT_PUBLIC_KEY = 'public_oaXjLRSYC16BGPDCCi3lpc5Fd64='
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_LENGTHS = {
    caption: 10000,
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function StrukturOrganisasi() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchItems = async () => {
        try {
            const res = await apiFetch('/struktur-organisasi')
            const data = await res.json()
            setItems(data.struktur_organisasi || [])
        } catch (err) {
            console.error('Failed to fetch struktur organisasi:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchItems() }, [])

    const filtered = items
        .filter(item => (item.caption || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const getSwalConfig = () => {
        const isLight = document.body.classList.contains('light-mode')
        return {
            background: isLight ? '#FFFFFF' : '#141417',
            color: isLight ? '#1A1A2E' : '#FFFFFF',
            confirmButtonColor: '#d33',
            cancelButtonColor: isLight ? '#D0D0D4' : '#2A2A2E',
            customClass: {
                popup: 'font-["Nunito_Sans",sans-serif]'
            }
        }
    }

    const handleDelete = async (id) => {
        const swalConfig = getSwalConfig()
        const result = await Swal.fire({
            ...swalConfig,
            title: 'Hapus data?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        })

        if (result.isConfirmed) {
            try {
                const res = await apiFetch(`/struktur-organisasi/${id}`, { method: 'DELETE' })
                if (res.ok) {
                    setItems(prev => prev.filter(item => item.id !== id))
                    Swal.fire({
                        ...swalConfig,
                        title: 'Terhapus!',
                        text: 'Data telah berhasil dihapus.',
                        icon: 'success',
                    })
                }
            } catch (err) {
                console.error('Failed to delete:', err)
                Swal.fire({
                    ...swalConfig,
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus data.',
                    icon: 'error',
                })
            }
        }
    }

    const handleEdit = (item) => {
        setEditTarget(item)
        setShowForm(true)
    }

    const handleSave = async (data) => {
        try {
            if (editTarget) {
                const res = await apiFetch(`/struktur-organisasi/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setItems(prev => prev.map(item => item.id === editTarget.id ? updated : item))
                    showToast('Struktur Organisasi berhasil diperbarui', 'success')
                } else {
                    showToast('Gagal memperbarui Struktur Organisasi', 'error')
                }
            } else {
                const res = await apiFetch('/struktur-organisasi', {
                    method: 'POST',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const created = await res.json()
                    setItems(prev => [created, ...prev])
                    showToast('Struktur Organisasi berhasil ditambahkan', 'success')
                } else {
                    showToast('Gagal menambahkan Struktur Organisasi', 'error')
                }
            }
            setShowForm(false)
            setEditTarget(null)
        } catch (err) {
            console.error('Failed to save struktur organisasi:', err)
            showToast('Terjadi kesalahan server', 'error')
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
                        Struktur Organisasi
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola struktur organisasi desa
                    </p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Tambah Data
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari struktur organisasi..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RiLoader4Line size={32} className="text-[#298064] animate-spin" />
                    <span className="text-[#6B6B70] text-sm">Memuat data...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-[#1F1F23] rounded-2xl">
                    <RiGalleryLine size={48} className="text-[#1F1F23]" />
                    <span className="text-[#6B6B70] text-sm text-center">
                        Belum ada struktur organisasi.<br />Klik tombol "Tambah Data" untuk memulai.
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="card bg-[#141417] border border-[#1F1F23] hover:border-[#2A2A2E] transition-all overflow-hidden"
                        >
                            <figure className="group relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => handleEdit(item)}>
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#1A1A1D] flex items-center justify-center">
                                        <RiGalleryLine size={32} className="text-[#2A2A2E]" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <span className="px-3 py-1.5 rounded-full bg-white border border-white/20 text-black text-xs font-semibold">
                                        Klik untuk Edit
                                    </span>
                                </div>
                            </figure>
                            <div className="card-body p-4 gap-2">
                                <p className="text-white text-sm line-clamp-2 font-medium min-h-[2.5rem]">
                                    {item.caption || <span className="text-[#4A4A4E] italic font-normal">Tanpa keterangan</span>}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1.5 text-[#6B6B70] text-[11px]">
                                        <RiTimeLine size={12} />
                                        {formatDate(item.created_at)}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors"
                                    >
                                        <RiDeleteBinLine size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <StrukturOrganisasiFormModal
                    initialData={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSave={handleSave}
                />
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

function StrukturOrganisasiFormModal({ initialData, onClose, onSave }) {
    const [caption, setCaption] = useState(initialData?.caption || '')
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const fileRef = useRef(null)

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError('')
        setFormErrors({})

        // Validate file
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Tipe file harus JPG, PNG, atau WebP.')
            setFormErrors({ image_url: 'Tipe file tidak didukung.' })
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Ukuran file maksimal 5MB.')
            setFormErrors({ image_url: 'Ukuran file terlalu besar.' })
            return
        }

        setUploading(true)
        try {
            const auth = await getImageKitAuth()

            const formData = new FormData()
            formData.append('file', file)
            formData.append('publicKey', IMAGEKIT_PUBLIC_KEY)
            formData.append('signature', auth.signature)
            formData.append('expire', auth.expire)
            formData.append('token', auth.token)
            formData.append('fileName', file.name)
            formData.append('folder', '/struktur-organisasi')

            const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            setImageUrl(data.url)
        } catch (err) {
            console.error('Upload failed:', err)
            setError('Gagal mengupload gambar.')
        } finally {
            setUploading(false)
            // reset file input
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    const removeImage = () => {
        setImageUrl('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setFormErrors({})

        const nextErrors = {}
        const captionValue = caption.trim()

        if (captionValue.length > MAX_LENGTHS.caption) {
            nextErrors.caption = `Caption/Keterangan maksimal ${MAX_LENGTHS.caption} karakter.`
        }

        if (!imageUrl) {
            nextErrors.image_url = 'Silakan unggah gambar struktur organisasi.'
        }

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors)
            setError(nextErrors.caption || nextErrors.image_url)
            return
        }

        setSaving(true)
        try {
            await onSave({ caption: captionValue, image_url: imageUrl })
        } catch {
            setError('Gagal menyimpan struktur organisasi.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6 overflow-hidden">
            <div className="w-full max-w-2xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E] shrink-0">
                    <h2 className="text-white text-base font-semibold">
                        {initialData ? 'Edit Struktur Organisasi' : 'Tambah Struktur Organisasi'}
                    </h2>
                    <button onClick={onClose} className="text-[#6B6B70] hover:text-[#FFFFFF] transition-colors">
                        <RiCloseLine size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        {error && (
                            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}
                        
                        {/* Image */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Foto Struktur Organisasi</label>
                            {formErrors.image_url && (
                                <p className="text-[11px] text-red-400">{formErrors.image_url}</p>
                            )}
                            <div className="flex items-start gap-4">
                                {imageUrl ? (
                                    <div className="relative w-48 rounded-xl overflow-hidden border border-[#2A2A2E] group">
                                        <img src={imageUrl} className="w-full h-auto object-cover" alt="" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-[#FFFFFF] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <RiCloseLine size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="w-48 aspect-[4/3] rounded-xl border-2 border-dashed border-[#2A2A2E] hover:border-[#298064] hover:bg-[#1A1A1D] transition-colors flex flex-col items-center justify-center gap-2 text-[#6B6B70]"
                                    >
                                        {uploading ? (
                                            <RiLoader4Line className="animate-spin" size={24} />
                                        ) : (
                                            <>
                                                <RiImageAddLine size={24} />
                                                <span className="text-[11px] font-medium">Unggah Foto</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={handleUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Caption */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Keterangan (Opsional)</label>
                            <textarea
                                maxLength={MAX_LENGTHS.caption}
                                value={caption}
                                onChange={e => {
                                    setCaption(e.target.value)
                                    if (formErrors.caption) setFormErrors(prev => ({ ...prev, caption: '' }))
                                    if (error) setError('')
                                }}
                                placeholder="Tulis keterangan struktur organisasi di sini..."
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl bg-[#1A1A1D] border text-white text-sm focus:border-[#298064] outline-none transition-colors resize-none placeholder:text-[#4A4A4E] ${formErrors.caption ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                            />
                            <div className="text-right text-[11px] text-[#6B6B70]">
                                {caption.length}/{MAX_LENGTHS.caption}
                            </div>
                            {formErrors.caption && (
                                <p className="text-[11px] text-red-400">{formErrors.caption}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 px-6 py-5 border-t border-[#2A2A2E] bg-[#141417] shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg bg-[#1A1A1D] text-[#8B8B90] text-sm font-medium hover:text-white transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="flex-1 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <RiLoader4Line className="animate-spin" /> : null}
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
