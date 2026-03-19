import { useState, useEffect } from 'react'
import {
    RiAddLine,
    RiSearchLine,
    RiEditLine,
    RiDeleteBinLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiFilter3Line,
    RiMapPinLine,
    RiCloseLine,
    RiLoader4Line,
} from 'react-icons/ri'
import { apiFetch } from '../api'

// Leaflet
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'

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

function formatDate(iso) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

// Map Bounds Dynamic Configuration
function MapBounds({ dusuns }) {
    const map = useMap();
    useEffect(() => {
        if (!dusuns || dusuns.length === 0) return;
        let bounds = L.latLngBounds()
        let hasValidBounds = false;
        
        dusuns.forEach(d => {
            if (d.geojson_data) {
                try {
                    const geo = JSON.parse(d.geojson_data)
                    const layer = L.geoJSON(geo)
                    bounds.extend(layer.getBounds())
                    hasValidBounds = true
                } catch(e) {}
            }
        })

        if (hasValidBounds) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [dusuns, map]);
    return null;
}

export default function DusunList() {
    const [dusuns, setDusuns] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortDir, setSortDir] = useState('desc')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchDusuns = async () => {
        try {
            const res = await apiFetch('/dusun')
            if (res.ok) {
                 const data = await res.json()
                 setDusuns(data.dusun || [])
            } else {
                 setDusuns([]) // graceful fallback if backend is not ready
            }
        } catch (err) {
            console.error('Failed to fetch dusun:', err)
            setDusuns([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDusuns() }, [])

    const filtered = dusuns
        .filter(d => d.nama_dusun.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) =>
            sortDir === 'desc'
                ? new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
                : new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
        )

    const handleDelete = async (id) => {
        if (!confirm('Hapus batas dusun ini?')) return
        try {
            const res = await apiFetch(`/dusun/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDusuns(prev => prev.filter(d => d.id !== id))
            }
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const handleEdit = (dusun) => {
        setEditTarget(dusun)
        setShowForm(true)
    }

    const handleSave = async (data) => {
        try {
            if (editTarget) {
                const res = await apiFetch(`/dusun/${editTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setDusuns(prev => prev.map(d => d.id === editTarget.id ? updated : d))
                    showToast('Dusun berhasil diperbarui!', 'success')
                } else {
                    showToast('Gagal memperbarui dusun', 'error')
                }
            } else {
                const res = await apiFetch('/dusun', {
                    method: 'POST',
                    body: JSON.stringify(data),
                })
                if (res.ok) {
                    const created = await res.json()
                    setDusuns(prev => [created, ...prev])
                    showToast('Dusun berhasil ditambahkan!', 'success')
                } else {
                    showToast('Gagal menambahkan dusun', 'error')
                }
            }
            setShowForm(false)
            setEditTarget(null)
        } catch (err) {
            console.error('Failed to save dusun:', err)
            showToast('Terjadi kesalahan server', 'error')
            throw err
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
                        Pemetaan Dusun
                    </h1>
                    <p className="text-[#6B6B70] text-sm">
                        Kelola batas wilayah administrasi dusun pada peta desa.
                    </p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#298064] hover:bg-[#1f6b50] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <RiAddLine size={18} />
                    Dusun Baru
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#141417] border border-[#2A2A2E]">
                    <RiSearchLine size={15} className="text-[#6B6B70] shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama dusun..."
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
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase w-[40%]">Dusun</th>
                            <th className="text-left px-5 py-3.5 text-[#6B6B70] text-[11px] font-semibold tracking-wide uppercase">Warna Pada Peta</th>
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
                                        <span className="text-[#6B6B70] text-sm">Memuat dusun...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16 bg-[#141417]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RiMapPinLine size={32} className="text-[#3A3A3E]" />
                                        <span className="text-[#6B6B70] text-sm">Tidak ada dusun ditemukan</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 10).map((dusun, i) => (
                                <tr
                                    key={dusun.id}
                                    className={`hover:bg-[#1A1A1D] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#1F1F23]' : ''}`}
                                >
                                    <td className="px-5 py-4 bg-[#141417] text-white text-[13px] font-medium leading-snug">
                                        {dusun.nama_dusun}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417]">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="w-4 h-4 rounded-full border border-white/20" 
                                                style={{ backgroundColor: dusun.warna || '#4A90E2' }}
                                            />
                                            <span className="text-[#8B8B90] text-xs font-mono uppercase">{dusun.warna || '#4A90E2'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-[#8B8B90] text-[13px]">
                                        {formatDate(dusun.created_at)}
                                    </td>
                                    <td className="px-5 py-4 bg-[#141417] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(dusun)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:bg-[#2A2A2E] text-[#8B8B90] hover:text-white transition-colors"
                                            >
                                                <RiEditLine size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dusun.id)}
                                                className="p-1.5 rounded bg-[#1A1A1D] hover:!bg-red-500/10 text-[#8B8B90] hover:text-red-400 transition-colors"
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

            {/* MAP PREVIEW */}
            <div className="flex flex-col gap-2 h-[450px]">
                <h2 className="text-white text-md font-semibold tracking-tight leading-none px-1">
                    Peta Gabungan Wilayah Dusun
                </h2>
                <div className="flex-1 rounded-xl overflow-hidden border border-[#2A2A2E] z-0 map-dark-mode">
                    <MapContainer center={[-3.1, 121.08]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <BaseVillageBoundary />
                        <MapBounds dusuns={filtered} />
                        {filtered.map(dusun => {
                            if (!dusun.geojson_data) return null;
                            try {
                                const geom = JSON.parse(dusun.geojson_data);
                                return (
                                    <GeoJSON 
                                        key={dusun.id + dusun.warna} // Force re-render if color changes
                                        data={geom} 
                                        style={{ color: dusun.warna, fillColor: dusun.warna, fillOpacity: 0.4, weight: 2 }}
                                    />
                                );
                            } catch (e) { return null; }
                        })}
                    </MapContainer>
                </div>
            </div>

            {/* FORM MODAL */}
            {showForm && (
                <DusunFormModal
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


// Component to handle Geoman Drawing controls inside React Leaflet
function GeomanControls({ initialGeojson, onGeoJsonChanged, color }) {
    const map = useMap();
    
    useEffect(() => {
        // Init PM
        map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: true,
            drawText: false,
            drawCircle: false,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: true,
        });

        const updateData = () => {
             // Retrieve all drawn layers by PM
             const layers = map.pm.getGeomanDrawLayers();
             if (layers.length === 0) {
                 onGeoJsonChanged('');
             } else {
                 // For MVP, we extract the first polygon layer
                 const geojsonData = layers[0].toGeoJSON();
                 onGeoJsonChanged(JSON.stringify(geojsonData.geometry));
             }
        }

        map.on('pm:create', (e) => {
            const layer = e.layer;
            layer.on('pm:edit', updateData);
            layer.on('pm:dragend', updateData);
            updateData();
        });

        map.on('pm:remove', (e) => {
            updateData();
        });

        return () => {
            map.pm.removeControls();
            map.off('pm:create');
            map.off('pm:remove');
        }
    }, [map]); // Init once

    // Update global appearance for new shapes when color changes
    useEffect(() => {
        map.pm.setPathOptions({
            color: color || '#298064',
            fillColor: color || '#298064',
            fillOpacity: 0.4,
            weight: 3
        });
    }, [color, map]);

    // Load initial drawing if exists
    useEffect(() => {
        // We only load initial once
        if (initialGeojson && initialGeojson !== '') {
            try {
                const geom = JSON.parse(initialGeojson);
                const layer = L.geoJSON(geom, {
                    style: {
                        color: color || '#298064',
                        fillColor: color || '#298064',
                        weight: 3,
                        fillOpacity: 0.4
                    }
                }).addTo(map);

                // Allow this imported layer to be edited by geoman
                layer.eachLayer((boundLayer) => {
                     boundLayer.on('pm:edit', () => {
                         const layers = map.pm.getGeomanDrawLayers(true); // Includes imported
                         if (layers.length > 0) {
                             onGeoJsonChanged(JSON.stringify(layers[0].toGeoJSON().geometry));
                         }
                     });
                     // Add an indicator that it's a pm layer
                     boundLayer.options.pmIgnore = false;
                     L.PM.reInitLayer(boundLayer);
                })
                
                map.fitBounds(layer.getBounds(), { padding: [20, 20] });
            } catch (err) {
                console.error("Invalid initial geojson:", err);
            }
        }
        // eslint-disable-next-line
    }, []); 

    return null;
}

// Background layer for the village official limits
function BaseVillageBoundary() {
    const [geoData, setGeoData] = useState(null)
    const map = useMap();

    useEffect(() => {
        fetch('/puundoho_boundary.geojson')
            .then(res => res.json())
            .then(data => {
                setGeoData(data)
                // Center map to village boundaries if found
                try {
                     const layer = L.geoJSON(data)
                     map.fitBounds(layer.getBounds())
                } catch(e) {}
            })
            .catch(err => console.error("Error loading base map", err))
    }, [map])

    if (!geoData) return null;

    return (
        <GeoJSON 
            data={geoData} 
            style={{
                color: '#EAB308', // Yellow
                weight: 4,
                opacity: 0.8,
                fillOpacity: 0.05,
                dashArray: '5, 10'
            }}
            interactive={false}
        />
    )
}

function DusunFormModal({ initialData, onClose, onSave }) {
    const isEdit = !!initialData
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        nama_dusun: initialData?.nama_dusun || '',
        warna: initialData?.warna || '#298064',
        geojson_data: initialData?.geojson_data || '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.geojson_data) {
            alert('Silakan gambar batas dusun terlebih dahulu pada peta (Gunakan ikon Polygon di sisi kiri peta).');
            return;
        }
        setSaving(true)
        try {
            await onSave(formData)
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const mapCenter = [-3.1, 121.08] // Default center

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="w-full max-w-6xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E] shrink-0">
                    <h2 className="text-white text-base font-semibold">
                        {isEdit ? 'Edit Batas Dusun' : 'Pemetaan Dusun Baru'}
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
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Nama Dusun</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Dusun I, Dusun II"
                                value={formData.nama_dusun}
                                onChange={e => setFormData(f => ({ ...f, nama_dusun: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E] text-white text-sm placeholder:text-[#4A4A4E] focus:border-[#298064] outline-none transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#8B8B90] text-xs font-semibold uppercase tracking-wider">Warna Peta</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    required
                                    value={formData.warna}
                                    onChange={e => setFormData(f => ({ ...f, warna: e.target.value }))}
                                    className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                                />
                                <span className="text-white text-sm font-mono">{formData.warna}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-1 mt-4 p-4 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E]">
                            <h3 className="text-white text-sm font-semibold mb-1">Panduan Menggambar</h3>
                            <ul className="text-[#8B8B90] text-xs list-disc pl-4 space-y-2">
                                <li>Garis kuning terputus-putus pada peta adalah batas terluar permanen Desa Puundoho.</li>
                                <li>Klik ikon <strong>Polygon</strong> pada panel kontrol di sebelah kiri peta.</li>
                                <li>Klik titik-titik (ujung) pada peta untuk mulai membentuk batas wilayah Dusun.</li>
                                <li>Klik kembali pada titik awal (pertama) untuk menyelesaikan (menutup) gambar polygon.</li>
                                <li>Fitur geoman memungkinkan Anda untuk menggeser (*drag*) titik yang sudah diletakkan jika tidak pas.</li>
                            </ul>
                            {formData.geojson_data && (
                                <div className="mt-3 inline-flex items-center text-xs text-[#298064] font-medium bg-[#298064]/10 px-2.5 py-1.5 rounded-lg border border-[#298064]/20 border-teal">
                                    ✓ Koordinat Polygon telah tersimpan.
                                </div>
                            )}
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
                        <label className="text-[#8B8B90] text-xs font-medium uppercase tracking-wide mb-1.5 shrink-0">Editor Peta Interaktif</label>
                        <div className="flex-1 rounded-xl overflow-hidden border border-[#2A2A2E] z-0 map-dark-mode relative">
                            <MapContainer 
                                center={mapCenter} 
                                zoom={14} 
                                scrollWheelZoom={true} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {/* Static Village Boundary Layer */}
                                <BaseVillageBoundary />
                                {/* Geoman Interactive Draw Layer */}
                                <GeomanControls 
                                    initialGeojson={initialData?.geojson_data} 
                                    onGeoJsonChanged={(json) => setFormData(f => ({ ...f, geojson_data: json }))} 
                                    color={formData.warna}
                                />
                            </MapContainer>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
