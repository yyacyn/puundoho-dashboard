import { useState, useEffect, useRef } from 'react'
import {
    RiAddLine,
    RiSearchLine,
    RiEditLine,
    RiDeleteBinLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiFilter3Line,
    RiMapPinLine,
    RiImageAddLine,
    RiCloseLine,
    RiLoader4Line,
} from 'react-icons/ri'
import { apiFetch, getImageKitAuth } from '../api'

// Leaflet
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix missing marker icons in React Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = customIcon

// ImageKit Consts
const IMAGEKIT_PUBLIC_KEY = 'public_oaXjLRSYC16BGPDCCi3lpc5Fd64='
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/yyacyn'

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

// Component to dynamically set map view bounds to markers
function MapBounds({ listings }) {
    const map = useMap();
    useEffect(() => {
        if (!listings || listings.length === 0) return;
        const validCoords = listings.map(l => {
            const parts = l.koordinat.split(',').map(s => parseFloat(s.trim()));
            return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) ? parts : null;
        }).filter(Boolean);

        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [listings, map]);
    return null;
}

export default function Listing() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortDir, setSortDir] = useState('desc')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    // Fetch listings from API
    const fetchListings = async () => {
        try {
            const res = await apiFetch('/listings')
            const data = await res.json()
            setListings(data.listings || [])
        } catch (err) {
            console.error('Failed to fetch listings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchListings() }, [])

    // Filter + search + sort (client-side on fetched data)
    const filtered = listings
        .filter(l => l.nama.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) =>
            sortDir === 'desc'
                ? new Date(b.created_at) - new Date(a.created_at)
                : new Date(a.created_at) - new Date(b.created_at)
        )

    const handleDelete = async (id) => {
        if (!confirm('Hapus listing fasilitas ini?')) return
        try {
            const res = await apiFetch(`/listings/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setListings(prev => prev.filter(l => l.id !== id))
            }
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const handleEdit = (listing) => {
        setEditTarget(listing)
        setShowForm(true)
    }

    const handleSave = async (data) => {
        try {
            if (editTarget) {
                const res = await apiFetch(`/listings/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setListings(prev => prev.map(l => l.id === editTarget.id ? updated : l))
                }
            } else {
                const res = await apiFetch('/listings', {
                    method: 'POST',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const created = await res.json()
                    setListings(prev => [created, ...prev])
                }
            }
            setShowForm(false)
            setEditTarget(null)
        } catch (err) {
            console.error('Failed to save listing:', err)
            throw err
        }
    }

    return (
        <div className="flex flex-col gap-6 p-8 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-white text-2xl font-semibold tracking-tight leading-none">
                        Listing Fasilitas
                    </h1>
                    <p className="text-[#8B8B90] text-sm">
                        Kelola direktori dan lokasi fasilitas desa.
                    </p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    <span>Fasilitas Baru</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama fasilitas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[#ADADB0] text-[13px] outline-none placeholder:text-[#4A4A4E]"
                    />
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

            {/* Table */}
            <div className="rounded-xl overflow-hidden border border-[#1F1F23]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#141417] border-b border-[#1F1F23]">
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[40%]">Fasilitas</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Koordinat (Lat, Lng)</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Didaftarkan</th>
                            <th className="text-right px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16 bg-[#141417]">
                                    <div className="flex items-center justify-center gap-3">
                                        <RiLoader4Line size={24} className="text-[#298064] animate-spin" />
                                        <span className="text-[#6B6B70] text-sm">Memuat listing...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiMapPinLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada tempat ditemukan</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 10).map((listing, i) => ( // Cap at 10 rows
                                <tr
                                    key={listing.id}
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-3">
                                            {/* Image thumbnail */}
                                            {listing.image_url ? (
                                                <img
                                                    src={listing.image_url}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#2A2A2E]"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[#1F1F23] flex items-center justify-center shrink-0">
                                                    <RiMapPinLine size={16} className="text-[#4A4A4E]" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-[13px] font-medium leading-snug truncate block">
                                                    {listing.nama}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#8B8B90] text-xs font-mono">
                                        {listing.koordinat}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#8B8B90] text-[13px]">
                                        {formatDate(listing.created_at)}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(listing)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors"
                                            >
                                                <RiEditLine size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(listing.id)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors"
                                            >
                                                <RiDeleteBinLine size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        {filtered.length > 10 && (
                            <tr className="border-t border-[#1F1F23]">
                                <td colSpan={4} className="text-center py-3 bg-[#1A1A1D]">
                                    <span className="text-xs text-[#8B8B90]">Menampilkan 10 data terbaru. Terdapat {filtered.length - 10} data lainnya di map.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MAP PREVIEW */}
            <div className="flex flex-col gap-2 h-[450px]">
                <h2 className="text-white text-md font-semibold tracking-tight leading-none px-1">
                    Peta Fasilitas Desa
                </h2>
                <div className="flex-1 rounded-xl overflow-hidden border border-[#2A2A2E] z-0 map-dark-mode">
                    <MapContainer center={[-4.1, 122.5]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapBounds listings={filtered} />
                        {filtered.map(listing => {
                            const parts = listing.koordinat.split(',').map(s => parseFloat(s.trim()));
                            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                return (
                                    <Marker key={listing.id} position={parts}>
                                        <Popup>
                                            <div className="flex flex-col items-center gap-1.5 !m-0 !text-center w-32">
                                                {listing.image_url && (
                                                    <img src={listing.image_url} className="w-full h-20 object-cover rounded shadow" alt={listing.nama} />
                                                )}
                                                <span className="font-semibold text-[13px] leading-tight mt-1 truncate w-full">{listing.nama}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            }
                            return null;
                        })}
                    </MapContainer>
                </div>
            </div>

            {/* FORM MODAL */}
            {showForm && (
                <ListingFormModal
                    initialData={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}


// --- FORM COMPONENT ---
// Component to handle map clicks in the modal
function LocationPickerMap({ coordinateString, onLocationSelected }) {
    useMapEvents({
        click(e) {
            onLocationSelected(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`)
        }
    })

    const parts = coordinateString.split(',').map(s => parseFloat(s.trim()))
    const hasValidCoords = parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])
    
    // Default to village center if no valid coords yet
    const center = hasValidCoords ? parts : [-3.1, 121.08]
    
    const map = useMap()
    useEffect(() => {
        if (hasValidCoords) {
             map.setView(center, map.getZoom())
        }
    }, [coordinateString]) // eslint-disable-line

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hasValidCoords && <Marker position={parts} />}
        </>
    )
}

function ListingFormModal({ initialData, onClose, onSave }) {
    const isEdit = !!initialData
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        nama: initialData?.nama || '',
        koordinat: initialData?.koordinat || '',
        image_url: initialData?.image_url || '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await onSave(formData)
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const mapCenter = [-3.1, 121.08] // Default Desapuundoho center

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="w-full max-w-6xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E] shrink-0">
                    <h2 className="text-white text-base font-semibold">
                        {isEdit ? 'Edit Fasilitas' : 'Fasilitas Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#6B6B70] hover:text-white transition-colors p-1"
                    >
                        <RiCloseLine size={24} />
                    </button>
                </div>

                {/* Two-column form */}
                <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
                    
                    {/* ── LEFT PANEL (35%) — Inputs ── */}
                    <div className="w-[35%] shrink-0 flex flex-col gap-6 px-6 py-5 overflow-y-auto border-r border-[#2A2A2E]">
                        
                        {/* Image Uploader */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Foto Fasilitas</label>
                            <ImageUploader
                                value={formData.image_url}
                                onChange={url => setFormData(prev => ({ ...prev, image_url: url }))}
                            />
                        </div>

                        {/* Nama */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Nama Fasilitas</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Puskesmas Puundoho"
                                value={formData.nama}
                                onChange={e => setFormData(f => ({ ...f, nama: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm placeholder:text-[#4A4A4E] focus:border-[#298064] outline-none transition-colors"
                            />
                        </div>

                        {/* Koordinat */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Koordinat</label>
                            <input
                                type="text"
                                required
                                placeholder="-4.12345, 122.56789"
                                value={formData.koordinat}
                                onChange={e => setFormData(f => ({ ...f, koordinat: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm font-mono placeholder:text-[#4A4A4E] focus:border-[#298064] outline-none transition-colors"
                            />
                            <p className="text-xs text-[#6B6B70] mt-1 leading-relaxed">
                                Anda dapat mengetik manual, atau <strong className="text-white">klik pada peta di sebelah kanan</strong> untuk menandai lokasi fasilitas.
                            </p>
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
                                className="flex-1 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" /> Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL (65%) — Map view ── */}
                    <div className="flex-1 flex flex-col px-6 py-5 overflow-hidden">
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide mb-1.5 shrink-0">Pilih Lokasi di Peta</label>
                        <div className="flex-1 rounded-xl overflow-hidden border border-[#2A2A2E] z-0 map-dark-mode">
                            <MapContainer 
                                center={mapCenter} 
                                zoom={14} 
                                scrollWheelZoom={true} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <LocationPickerMap 
                                    coordinateString={formData.koordinat} 
                                    onLocationSelected={coords => setFormData(f => ({ ...f, koordinat: coords }))} 
                                />
                            </MapContainer>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}


// --- IMAGE UPLOADER COMPONENT ---
// Reused perfectly from Articles.jsx
function ImageUploader({ value, onChange }) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

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
            formData.append('folder', '/listings')

            const res = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Upload failed')
            }

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
        <div>
            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#2A2A2E] aspect-[21/9] bg-[#0A0A0B]">
                    <img src={value} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm"
                            title="Ganti Foto"
                        >
                            <RiEditLine size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm"
                            title="Hapus"
                        >
                            <RiDeleteBinLine size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2A2A2E] hover:border-[#298064] hover:bg-[#1A1A1D] transition-colors aspect-[21/9] bg-[#0A0A0B] disabled:opacity-50"
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
                                <span className="text-[#ADADB0] text-[13px] font-medium">Pilih Foto Fasilitas</span>
                                <span className="text-[#6B6B70] text-[11px]">JPG, PNG atau WebP (Maks. 5MB)</span>
                            </div>
                        </>
                    )}
                </button>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}
