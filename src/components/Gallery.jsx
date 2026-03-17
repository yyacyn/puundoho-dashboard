import { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import {
    RiAddLine,
    RiSearchLine,
    RiEditLine,
    RiDeleteBinLine,
    RiImageAddLine,
    RiCloseLine,
    RiLoader4Line,
    RiGalleryLine,
    RiTimeLine,
} from 'react-icons/ri'
import { apiFetch, getImageKitAuth } from '../api'

const IMAGEKIT_PUBLIC_KEY = 'public_oaXjLRSYC16BGPDCCi3lpc5Fd64='

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

export default function Gallery() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    const fetchGallery = async () => {
        try {
            const res = await apiFetch('/galeri')
            const data = await res.json()
            setItems(data.galeri || [])
        } catch (err) {
            console.error('Failed to fetch gallery:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchGallery() }, [])

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
            title: 'Hapus foto?',
            text: "Item yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        })

        if (result.isConfirmed) {
            try {
                const res = await apiFetch(`/galeri/${id}`, { method: 'DELETE' })
                if (res.ok) {
                    setItems(prev => prev.filter(item => item.id !== id))
                    Swal.fire({
                        ...swalConfig,
                        title: 'Terhapus!',
                        text: 'Foto telah berhasil dihapus.',
                        icon: 'success',
                    })
                }
            } catch (err) {
                console.error('Failed to delete:', err)
                Swal.fire({
                    ...swalConfig,
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus foto.',
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
                const res = await apiFetch(`/galeri/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setItems(prev => prev.map(item => item.id === editTarget.id ? updated : item))
                }
            } else {
                const res = await apiFetch('/galeri', {
                    method: 'POST',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const created = await res.json()
                    setItems(prev => [created, ...prev])
                }
            }
            setShowForm(false)
            setEditTarget(null)
        } catch (err) {
            console.error('Failed to save gallery item:', err)
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
                        Galeri Foto
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola koleksi foto dan dokumentasi kegiatan desa
                    </p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Tambah Foto
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari caption foto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RiLoader4Line size={32} className="text-[#298064] animate-spin" />
                    <span className="text-[#6B6B70] text-sm">Memuat galeri...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-[#1F1F23] rounded-2xl">
                    <RiGalleryLine size={48} className="text-[#1F1F23]" />
                    <span className="text-[#6B6B70] text-sm text-center">
                        Belum ada koleksi foto.<br />Klik tombol "Tambah Foto" untuk memulai.
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
                                {item.images && item.images.length > 0 ? (
                                    <img 
                                        src={item.images[0]} 
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
                                {item.images && item.images.length > 1 && (
                                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                                        +{item.images.length - 1} FOTO
                                    </div>
                                )}
                            </figure>
                            <div className="card-body p-4 gap-2">
                                <p className="text-white text-sm line-clamp-2 font-medium min-h-[2.5rem]">
                                    {item.caption || <span className="text-[#4A4A4E] italic font-normal">Tanpa caption</span>}
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
                <GalleryFormModal
                    initialData={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}

function GalleryFormModal({ initialData, onClose, onSave }) {
    const [caption, setCaption] = useState(initialData?.caption || '')
    const [images, setImages] = useState(initialData?.images || [])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const fileRef = useRef(null)

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setUploading(true)
        try {
            const auth = await getImageKitAuth()
            
            const uploadedUrls = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY)
                    formData.append('signature', auth.signature)
                    formData.append('expire', auth.expire)
                    formData.append('token', auth.token)
                    formData.append('fileName', file.name)
                    formData.append('folder', '/galeri')

                    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                        method: 'POST',
                        body: formData,
                    })
                    if (!res.ok) throw new Error('Upload failed')
                    const data = await res.json()
                    return data.url
                })
            )
            setImages(prev => [...prev, ...uploadedUrls])
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Gagal mengupload gambar.')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (images.length === 0) {
            alert('Pilih setidaknya satu foto')
            return
        }
        setSaving(true)
        await onSave({ caption, images })
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6 overflow-hidden">
            <div className="w-full max-w-4xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E] shrink-0">
                    <h2 className="text-white text-base font-semibold">
                        {initialData ? 'Edit Item Galeri' : 'Tambah Foto Galeri'}
                    </h2>
                    <button onClick={onClose} className="text-[#6B6B70] hover:text-[#FFFFFF] transition-colors">
                        <RiCloseLine size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        {/* Image Grid */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Koleksi Foto</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#2A2A2E] group">
                                        <img src={url} className="w-full h-full object-cover" alt="" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-[#FFFFFF] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <RiCloseLine size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="aspect-square rounded-xl border-2 border-dashed border-[#2A2A2E] hover:border-[#298064] hover:bg-[#1A1A1D] transition-colors flex flex-col items-center justify-center gap-2 text-[#6B6B70]"
                                >
                                    {uploading ? (
                                        <RiLoader4Line className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <RiImageAddLine size={24} />
                                            <span className="text-[10px] font-medium">Unggah</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={handleUpload}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Caption */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Caption/Keterangan</label>
                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="Tulis keterangan foto di sini..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm focus:border-[#298064] outline-none transition-colors resize-none placeholder:text-[#4A4A4E]"
                            />
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
