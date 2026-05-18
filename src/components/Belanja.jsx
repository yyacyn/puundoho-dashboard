import { useState, useRef, useEffect } from 'react'
import { RiAddLine, RiSearchLine, RiShoppingBag3Line, RiEdit2Line, RiDeleteBinLine, RiStarLine, RiStarFill, RiPhoneLine, RiImageAddLine, RiLoader4Line, RiEditLine, RiCloseLine } from 'react-icons/ri'
import { apiFetch, getImageKitAuth } from '../api'

const IMAGEKIT_PUBLIC_KEY = 'public_oaXjLRSYC16BGPDCCi3lpc5Fd64='
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_LENGTHS = { nama: 255, deskripsi: 10000, kontak: 15, image_url: 500, harga: 9 }
const MAX_DECIMAL_VALUE = 5
const DECIMAL_PATTERN = /^\d{1,3}(\.\d{1,2})?$/

const formatRupiah = (num) => {
    if (!num && num !== 0) return 'Rp 0'
    return 'Rp ' + Number(num).toLocaleString('id-ID')
}

function StarRating({ rating }) {
    const stars = []
    for (let i = 1; i <= 5; i++) {
        stars.push(
            i <= Math.round(rating)
                ? <RiStarFill key={i} size={13} className="text-yellow-400" />
                : <RiStarLine key={i} size={13} className="text-[#3A3A3E]" />
        )
    }
    return <div className="flex items-center gap-0.5">{stars} <span className="text-[#6B6B70] text-[11px] ml-1">{rating}</span></div>
}

export default function ProdukDesa() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [produkData, setProdukData] = useState([])

    const [form, setForm] = useState({ nama: '', deskripsi: '', harga: '', rating: '', kontak: '', image_url: '' })
    const [error, setError] = useState('')
    const [formErrors, setFormErrors] = useState({})


    const fetchProduk = async () => {
        try {
            const res = await apiFetch('/produk-desa')
            const data = await res.json()
            setProdukData(data.produk || [])
        } catch (err) {
            console.error('Fetch produk error:', err)
        }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchProduk() }, [])

    const filteredData = produkData.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const resetFormAndClose = () => {
        setForm({ nama: '', deskripsi: '', harga: '', rating: '', kontak: '', image_url: '' })
        setEditingId(null)
        setIsModalOpen(false)
        setError('')
        setFormErrors({})
    }

    const handleEdit = (d) => {
        setForm({
            nama: d.nama,
            deskripsi: d.deskripsi || '',
            harga: d.harga?.toString() || '',
            rating: d.rating?.toString() || '',
            kontak: d.kontak || '',
            image_url: d.image_url || ''
        })
        setEditingId(d.id)
        setFormErrors({})
        setIsModalOpen(true)
    }

    const validateRating = (value) => {
        if (value === '') return ''
        if (!DECIMAL_PATTERN.test(value)) {
            return 'Rating harus berupa angka desimal dengan maksimal 2 angka di belakang koma.'
        }

        const numericValue = Number(value)
        if (Number.isNaN(numericValue)) {
            return 'Rating harus berupa angka yang valid.'
        }

        if (numericValue < 0 || numericValue > MAX_DECIMAL_VALUE) {
            return `Rating harus berada di rentang 0 - ${MAX_DECIMAL_VALUE}.`
        }

        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const nextErrors = {}
        const nama = form.nama.trim()
        const deskripsi = form.deskripsi.trim()
        const kontak = form.kontak.trim()
        const harga = form.harga.trim()
        const rating = form.rating.trim()

        if (!nama) {
            nextErrors.nama = `Nama produk wajib diisi (1-${MAX_LENGTHS.nama} karakter).`
        } else if (nama.length > MAX_LENGTHS.nama) {
            nextErrors.nama = `Nama produk maksimal ${MAX_LENGTHS.nama} karakter.`
        }

        if (deskripsi.length > MAX_LENGTHS.deskripsi) {
            nextErrors.deskripsi = `Deskripsi maksimal ${MAX_LENGTHS.deskripsi} karakter.`
        }

        if (!harga) {
            nextErrors.harga = 'Harga wajib diisi (maksimal 9 digit).'
        } else if (!/^\d+$/.test(harga)) {
            nextErrors.harga = 'Harga harus berupa angka tanpa tanda baca.'
        } else if (harga.length > 9) {
            nextErrors.harga = 'Harga maksimal 9 digit.'
        }

        const ratingError = validateRating(rating)
        if (ratingError) {
            nextErrors.rating = ratingError
        }

        if (!kontak) {
            nextErrors.kontak = `Kontak wajib diisi (1-${MAX_LENGTHS.kontak} karakter).`
        } else if (kontak.length > MAX_LENGTHS.kontak) {
            nextErrors.kontak = `Kontak maksimal ${MAX_LENGTHS.kontak} karakter.`
        }

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors)
            setError(nextErrors.nama || nextErrors.harga || nextErrors.rating || nextErrors.kontak || nextErrors.deskripsi)
            return
        }

        const body = {
            nama,
            deskripsi: form.deskripsi,
            harga: Number(harga),
            rating: rating === '' ? 0 : Number(rating),
            kontak,
            image_url: form.image_url,
        }
        try {
            if (editingId) {
                await apiFetch(`/produk-desa/${editingId}`, { method: 'PUT', body: JSON.stringify(body) })
            } else {
                await apiFetch('/produk-desa', { method: 'POST', body: JSON.stringify(body) })
            }
            fetchProduk()
            resetFormAndClose()
        } catch (err) {
            setError('Gagal menyimpan: ' + (err.message || 'terjadi kesalahan'))
            console.error('Gagal menyimpan: ', err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus produk ini?')) return
        try {
            await apiFetch(`/produk-desa/${id}`, { method: 'DELETE' })
            fetchProduk()
        } catch (err) {
            alert('Gagal menghapus: ' + err.message)
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
                        Produk Desa
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola katalog produk BUMDes dan UMKM desa yang ditampilkan di website.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setIsModalOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Tambah Produk
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari produk desa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
                </div>
                <span className="text-[#6B6B70] text-[11px] shrink-0">{filteredData.length} produk</span>
            </div>

            {/* Product Cards Grid */}
            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RiShoppingBag3Line size={40} className="text-[#3A3A3E]" />
                    <span className="text-[#6B6B70] text-sm">Belum ada produk desa</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map(d => (
                        <div key={d.id} className="rounded-xl bg-[#141417] border border-[#1F1F23] overflow-hidden hover:border-[#2A2A2E] transition-colors group">
                            {/* Image */}
                            <div className="relative aspect-[16/9] bg-[#0A0A0B]">
                                {d.image_url ? (
                                    <img src={d.image_url} alt={d.nama} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <RiShoppingBag3Line size={36} className="text-[#2A2A2E]" />
                                    </div>
                                )}
                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(d)}
                                        className="p-2 bg-white/60 hover:bg-white/80 rounded-lg !text-black transition-colors"
                                        title="Edit"
                                    >
                                        <RiEdit2Line size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(d.id)}
                                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg !text-white backdrop-blur-sm transition-colors"
                                        title="Hapus"
                                    >
                                        <RiDeleteBinLine size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex flex-col gap-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-white text-[14px] font-semibold leading-snug line-clamp-1 flex-1">{d.nama}</h3>
                                    <span className="text-[#298064] text-[13px] font-bold shrink-0" style={{ fontFamily: 'DM Mono, monospace' }}>
                                        {formatRupiah(d.harga)}
                                    </span>
                                </div>
                                <p className="text-[#6B6B70] text-[12px] leading-relaxed line-clamp-2">{d.deskripsi || 'Tidak ada deskripsi.'}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-[#1F1F23]">
                                    <StarRating rating={d.rating} />
                                    <div className="flex items-center gap-1 text-[#6B6B70] text-[11px]">
                                        <RiPhoneLine size={12} />
                                        <span>{d.kontak}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#141417] border border-[#2A2A2E] rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl">
                        <div className="p-6 border-b border-[#2A2A2E] flex justify-between items-center sticky top-0 bg-[#141417] z-10">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <RiShoppingBag3Line className="text-[#298064]" />
                                {editingId ? 'Ubah Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button onClick={resetFormAndClose} className="text-[#6B6B70] hover:text-white transition-colors">
                                &times;
                            </button>
                        </div>
                        <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                            {/* Image uploader */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Foto Produk</label>
                                <ProductImageUploader
                                    value={form.image_url}
                                    onChange={url => setForm(prev => ({ ...prev, image_url: url }))}
                                />
                                {formErrors.image_url && <p className="text-[11px] text-red-400 mt-1">{formErrors.image_url}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Nama Produk</label>
                                <input
                                    maxLength={MAX_LENGTHS.nama}
                                    type="text"
                                    value={form.nama}
                                    onChange={e => {
                                        setForm(prev => ({ ...prev, nama: e.target.value }))
                                        if (formErrors.nama) setFormErrors(prev => ({ ...prev, nama: '' }))
                                        if (error) setError('')
                                    }}
                                    className={`w-full px-4 py-2.5 bg-[#0A0A0B] border rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors ${formErrors.nama ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                                    placeholder="Mis. Madu Hutan Puundoho"
                                />
                                <div className="text-right text-[11px] text-[#6B6B70] mt-1">
                                    {formErrors.nama ? (
                                        <span className="text-[11px] text-red-400">{formErrors.nama}</span>
                                    ) : (
                                        <span className="text-[#6B6B70] text-[11px]">
                                            {form.nama.length}/{MAX_LENGTHS.nama}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Deskripsi</label>
                                <textarea
                                    maxLength={MAX_LENGTHS.deskripsi}
                                    value={form.deskripsi}
                                    onChange={e => {
                                        setForm(prev => ({ ...prev, deskripsi: e.target.value }))
                                        if (formErrors.deskripsi) setFormErrors(prev => ({ ...prev, deskripsi: '' }))
                                        if (error) setError('')
                                    }}
                                    className={`w-full px-4 py-2.5 bg-[#0A0A0B] border rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors min-h-[80px] ${formErrors.deskripsi ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                                    placeholder="Deskripsi singkat produk..."
                                ></textarea>
                                <div className="text-right text-[11px] text-[#6B6B70] mt-1">
                                    {formErrors.deskripsi ? (
                                        <span className="text-[11px] text-red-400">{formErrors.deskripsi}</span>
                                    ) : (
                                        <span className="text-[#6B6B70] text-[11px]">
                                            {form.deskripsi.length}/{MAX_LENGTHS.deskripsi}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Harga (Rp)</label>
                                    <input
                                        maxLength={MAX_LENGTHS.harga}
                                        type="text" inputMode="numeric"
                                        value={form.harga}
                                        onChange={e => {
                                            setForm(prev => ({ ...prev, harga: e.target.value.replace(/\D/g, '') }))
                                            if (formErrors.harga) setFormErrors(prev => ({ ...prev, harga: '' }))
                                            if (error) setError('')
                                        }}
                                        className={`w-full px-4 py-2.5 bg-[#0A0A0B] border rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors ${formErrors.harga ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                                        placeholder="85000"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Rating (0-5)</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={form.rating}
                                        onChange={e => {
                                            setForm(prev => ({ ...prev, rating: e.target.value }))
                                            if (formErrors.rating) setFormErrors(prev => ({ ...prev, rating: '' }))
                                            if (error) setError('')
                                        }}
                                        className={`w-full px-4 py-2.5 bg-[#0A0A0B] border rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors ${formErrors.rating ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                                        placeholder="4.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider mb-1.5 leading-none">Kontak</label>
                                <input
                                    maxLength={MAX_LENGTHS.kontak}
                                    type="text"
                                    inputMode="numeric"
                                    value={form.kontak}
                                    onChange={e => {
                                        setForm(prev => ({ ...prev, kontak: e.target.value }))
                                        if (formErrors.kontak) setFormErrors(prev => ({ ...prev, kontak: '' }))
                                        if (error) setError('')
                                    }}
                                    className={`w-full px-4 py-2.5 bg-[#0A0A0B] border rounded-lg text-sm text-white focus:outline-none focus:border-[#298064] transition-colors ${formErrors.kontak ? 'border-red-500' : 'border-[#2A2A2E]'}`}
                                    placeholder="81298XXXXX88"
                                />
                                <div className="text-right text-[11px] text-[#6B6B70] mt-1">
                                    {formErrors.kontak ? (
                                        <span className="text-[11px] text-red-400">{formErrors.kontak}</span>
                                    ) : (
                                        <span className="text-[#6B6B70] text-[11px]">
                                            {form.kontak.length}/{MAX_LENGTHS.kontak}
                                        </span>
                                    )}
                                </div>
                            </div>


                            <div className="flex gap-3 justify-end mt-2">
                                <button type="button" onClick={resetFormAndClose} className="px-4 py-2 text-sm font-medium text-[#8B8B90] hover:text-white transition-colors">
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


// --- Product Image Uploader ---
function ProductImageUploader({ value, onChange }) {
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setError('')

        const lowerName = (file.name || '').toLowerCase()
        const hasValidExt = ALLOWED_IMAGE_EXTS.some(ext => lowerName.endsWith(ext))

        if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !hasValidExt) {
            setError('Tipe file harus JPG, PNG, atau WebP.')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Ukuran file maksimal 5MB.')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        if (file.name.length > 512) {
            setError('Nama file maksimal 512 karakter.')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setUploading(true)
        try {
            const authData = await getImageKitAuth()
            const formData = new FormData()
            formData.append('file', file)
            formData.append('fileName', file.name)
            formData.append('publicKey', IMAGEKIT_PUBLIC_KEY)
            formData.append('signature', authData.signature)
            formData.append('expire', authData.expire)
            formData.append('token', authData.token)
            formData.append('folder', '/produk-desa')

            const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            onChange(data.url)
        } catch (err) {
            console.error(err)
            alert('Upload gagal: ' + err.message)
        } finally {
            setUploading(false)
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="flex flex-col gap-2">
            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                    {error}
                </div>
            )}
            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#2A2A2E] aspect-[16/9] bg-[#0A0A0B]">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm" title="Ganti Foto">
                            <RiEditLine size={18} />
                        </button>
                        <button type="button" onClick={() => onChange('')} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm" title="Hapus">
                            <RiDeleteBinLine size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2A2A2E] hover:border-[#298064] hover:bg-[#1A1A1D] transition-colors aspect-[16/9] bg-[#0A0A0B] disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <RiLoader4Line size={24} className="text-[#298064] animate-spin" />
                            <span className="text-[#6B6B70] text-[13px] font-medium">Mengunggah...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-[#1A1A1D] flex items-center justify-center">
                                <RiImageAddLine size={20} className="text-[#8B8B90]" />
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[#ADADB0] text-[13px] font-medium">Pilih Foto Produk</span>
                                <span className="text-[#6B6B70] text-[11px]">JPG, PNG atau WebP (Maks. 5MB)</span>
                            </div>
                        </>
                    )}
                </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
    )
}
