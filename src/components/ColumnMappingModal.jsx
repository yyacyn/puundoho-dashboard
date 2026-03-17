import { useState, useEffect } from 'react'
import { RiCloseLine, RiArrowRightLine, RiAlertLine, RiCheckLine } from 'react-icons/ri'

const DB_FIELDS = [
    { key: 'nik', label: 'NIK (Wajib)', required: true },
    { key: 'no_kk', label: 'No KK', required: true },
    { key: 'nama', label: 'Nama Lengkap', required: true },
    { key: 'jenis_kelamin', label: 'Jenis Kelamin (L/P)', required: true },
    { key: 'status_kawin', label: 'Status Kawin', required: false },
    { key: 'tempat_lahir', label: 'Tempat Lahir', required: false },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir', required: false },
    { key: 'agama', label: 'Agama', required: false },
    { key: 'pend_terakhir', label: 'Pendidikan Terakhir', required: false },
    { key: 'pekerjaan', label: 'Pekerjaan', required: false },
    { key: 'alamat', label: 'Alamat', required: false },
    { key: 'kedudukan_keluarga', label: 'Kedudukan Keluarga', required: false },
]

export default function ColumnMappingModal({ headers, rawData, onConfirm, onClose }) {
    const [mapping, setMapping] = useState({})
    const [preview, setPreview] = useState([])
    const [skipFirstRow, setSkipFirstRow] = useState(false) // Default false because PendudukEditor already finds data start

    // Clean headers: remove nulls or undefined
    const validHeaders = (headers || []).filter(h => h && String(h).trim() !== '')

    // Simple heuristic: Try to auto-match headers with priority
    useEffect(() => {
        if (!headers || headers.length === 0) return;
        
        const initialMapping = {}
        const usedHeaders = new Set()

        // Helper function to check if header matches a field
        const matchesField = (hLower, fieldKey) => {
            const field = DB_FIELDS.find(f => f.key === fieldKey)
            if (!field) return false
            
            // Exact match
            if (hLower === field.key || hLower === field.label.toLowerCase()) return true
            
            // Field-specific matching
            switch (fieldKey) {
                case 'nik':
                    return hLower === 'nik'
                case 'no_kk':
                    return hLower === 'no kk' || hLower === 'kk' || hLower === 'no.kk' || hLower === 'kartu keluarga'
                case 'nama':
                    return hLower === 'nama' || hLower === 'nama lengkap'
                case 'jenis_kelamin':
                    return hLower === 'jk' || hLower === 'jenis kelamin' || hLower === 'l/p' || hLower === 'sex'
                case 'tempat_lahir':
                    return hLower.includes('tempat lahir') || hLower === 'tempat'
                case 'tanggal_lahir':
                    return hLower.includes('tanggal lahir') || hLower === 'tanggal' || hLower === 'tgl' || hLower === 'tgl lahir'
                case 'status_kawin':
                    return hLower.includes('status kawin') || hLower.includes('marital') || hLower === 'status'
                case 'agama':
                    return hLower.includes('agama')
                case 'pend_terakhir':
                    return hLower.includes('pendidikan') || hLower.includes('sekolah') 
                case 'pekerjaan':
                    return hLower.includes('pekerjaan') || hLower.includes('profesi') || hLower.includes('kerja')
                case 'alamat':
                    return hLower.includes('alamat') || hLower.includes('address')
                case 'kedudukan_keluarga':
                    return hLower.includes('kedudukan') || hLower.includes('hubungan') || hLower.includes('shdk')
                default:
                    return false
            }
        }

        // PRIORITY 1: Required fields first (NIK, No KK, Nama)
        const priority1Fields = ['nik', 'no_kk', 'nama']
        for (const key of priority1Fields) {
            for (const h of validHeaders) {
                const hLower = String(h).toLowerCase()
                if (!usedHeaders.has(h) && matchesField(hLower, key)) {
                    initialMapping[key] = h
                    usedHeaders.add(h)
                    break
                }
            }
        }

        // PRIORITY 2: Date-related fields (before generic matching)
        const priority2Fields = ['tempat_lahir', 'tanggal_lahir']
        for (const key of priority2Fields) {
            for (const h of validHeaders) {
                const hLower = String(h).toLowerCase()
                if (!usedHeaders.has(h) && matchesField(hLower, key)) {
                    initialMapping[key] = h
                    usedHeaders.add(h)
                    break
                }
            }
        }

        // PRIORITY 3: Other fields
        for (const f of DB_FIELDS) {
            if (initialMapping[f.key]) continue
            
            for (const h of validHeaders) {
                const hLower = String(h).toLowerCase()
                if (!usedHeaders.has(h) && matchesField(hLower, f.key)) {
                    initialMapping[f.key] = h
                    usedHeaders.add(h)
                    break
                }
            }
        }

        // PRIORITY 4: Fuzzy/partial matches for remaining unmapped fields
        for (const f of DB_FIELDS) {
            if (initialMapping[f.key]) continue
            
            for (const h of validHeaders) {
                const hLower = String(h).toLowerCase()
                if (!usedHeaders.has(h) && (
                    hLower.includes(f.key) ||
                    hLower.includes(f.label.split(' ')[0].toLowerCase())
                )) {
                    initialMapping[f.key] = h
                    usedHeaders.add(h)
                    break
                }
            }
        }

        setMapping(initialMapping)
    }, [headers])

    // Helper: Convert Excel serial date to YYYY-MM-DD
    const convertExcelDate = (excelDate) => {
        if (typeof excelDate === 'number') {
            // Excel dates are days since 1900-01-01 (with 1900 leap year bug)
            const jsDate = new Date((excelDate - 25569) * 86400 * 1000)
            const iso = jsDate.toISOString().split('T')[0]
            // Validate it's a reasonable date (between 1900 and 2100)
            if (iso.startsWith('19') || iso.startsWith('20')) {
                return iso
            }
        }
        return null
    }

    // Helper: Parse date string in various formats to YYYY-MM-DD
    const parseDateString = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null

        let str = dateStr.trim()
        
        // Remove backticks and other invalid characters
        str = str.replace(/[`']/g, '')
        
        // Replace multiple slashes/dashes with single
        str = str.replace(/[-/]+/g, '/')

        // Try to extract day, month, year from various formats
        let day = null, month = null, year = null

        // Format: DD/MM/YYYY or DD/MM/YY (standard with 2 separators)
        let match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
        if (match) {
            day = parseInt(match[1], 10)
            month = parseInt(match[2], 10)
            year = parseInt(match[3], 10)
            // Convert 2-digit year
            if (year < 100) {
                year = year > 50 ? 1900 + year : 2000 + year
            }
        }

        // Format: DD/MMYYYY (missing separator - e.g., "09/071994")
        if (!day) {
            match = str.match(/^(\d{1,2})\/(\d{2})(\d{4})$/)
            if (match) {
                day = parseInt(match[1], 10)
                month = parseInt(match[2], 10)
                year = parseInt(match[3], 10)
            }
        }

        // Format: D/MYYYY or DD/MMYYYY (variable day/month - e.g., "9/71994")
        if (!day) {
            match = str.match(/^(\d{1,2})\/(\d{1,2})(\d{4})$/)
            if (match) {
                day = parseInt(match[1], 10)
                month = parseInt(match[2], 10)
                year = parseInt(match[3], 10)
            }
        }

        // Format: YYYY/MM/DD
        if (!day) {
            match = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
            if (match) {
                year = parseInt(match[1], 10)
                month = parseInt(match[2], 10)
                day = parseInt(match[3], 10)
            }
        }

        // Format: DDMMYYYY (8 digits no separator)
        if (!day) {
            match = str.match(/^(\d{2})(\d{2})(\d{4})$/)
            if (match) {
                day = parseInt(match[1], 10)
                month = parseInt(match[2], 10)
                year = parseInt(match[3], 10)
            }
        }

        // Format: DDMMYY (6 digits no separator)
        if (!day) {
            match = str.match(/^(\d{2})(\d{2})(\d{2})$/)
            if (match) {
                day = parseInt(match[1], 10)
                month = parseInt(match[2], 10)
                year = parseInt(match[3], 10)
                year = year > 50 ? 1900 + year : 2000 + year
            }
        }

        // Try to parse month names (e.g., "08-Feb", "Feb-08-1990")
        if (!day) {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des']
            const monthNamesEn = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            
            // Format: DD-MMM or DD-MMM-YYYY
            const monthMatch = str.match(/^(\d{1,2})[-/]([a-zA-Z]+)[-/]?(19|20)?(\d{2})?$/i)
            if (monthMatch) {
                day = parseInt(monthMatch[1], 10)
                const monthStr = monthMatch[2].toLowerCase().substring(0, 3)
                // Find month index
                let monthIdx = monthNames.indexOf(monthStr)
                if (monthIdx === -1) {
                    monthIdx = monthNamesEn.indexOf(monthStr)
                }
                if (monthIdx !== -1) {
                    month = monthIdx + 1
                    // Handle year
                    if (monthMatch[4]) {
                        year = parseInt(monthMatch[3] + monthMatch[4], 10)
                    } else {
                        year = 1970 // Default year if not specified
                    }
                }
            }
        }

        // Validate
        if (!day || !month || !year) return null
        
        // Final strict check for days in month (handling leap years)
        const daysInMonth = (m, y) => {
            return m === 2 ? (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31
        }
        
        if (month < 1 || month > 12 || day < 1 || day > daysInMonth(month, year) || year < 1900 || year > 2100) {
            return null
        }

        // Return YYYY-MM-DD format
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    // Update preview when mapping/skip changes
    useEffect(() => {
        if (rawData && rawData.length > 0) {
            const dataToPreview = skipFirstRow ? rawData.slice(1) : rawData
            const sampleRows = dataToPreview.slice(0, 3).map(row => {
                if (!row) return {}
                const cleaned = {}
                DB_FIELDS.forEach(f => {
                    const rawHeader = mapping[f.key]
                    let val = (rawHeader && row[rawHeader]) ? row[rawHeader] : ''

                    // EXCEL DATE CONVERSION for preview
                    if (f.key === 'tanggal_lahir') {
                        // Try Excel serial date conversion first
                        const converted = convertExcelDate(val)
                        if (converted) {
                            val = converted
                        } else {
                            // Try parsing string date (DD-MM-YYYY, DD/MM/YYYY, etc.)
                            const parsed = parseDateString(val)
                            if (parsed) {
                                val = parsed
                            } else {
                                // If parsing fails (invalid date like Feb 31), use fallback
                                val = '1970-01-01'
                            }
                        }
                    }

                    // Logic for combined Place & Date splitting
                    const hLower = String(rawHeader || '').toLowerCase()
                    if (hLower.includes('tempat') && hLower.includes('tanggal')) {
                        // Split only on FIRST comma to avoid breaking date formats like "09/071994"
                        const commaIndex = String(val).indexOf(',')
                        let placePart, datePart
                        
                        if (commaIndex !== -1) {
                            placePart = String(val).substring(0, commaIndex).trim()
                            datePart = String(val).substring(commaIndex + 1).trim()
                        } else {
                            // No comma, try to split on space or use entire value for place
                            const parts = String(val).split(/\s+/)
                            placePart = parts[0] || ''
                            datePart = parts.slice(1).join(' ') || ''
                        }
                        
                        if (f.key === 'tempat_lahir') {
                            val = placePart
                        }
                        if (f.key === 'tanggal_lahir') {
                            // Try to convert if it's an Excel serial date
                            const converted = convertExcelDate(parseFloat(datePart))
                            if (converted) {
                                datePart = converted
                            } else {
                                // Try parsing string date (handles "09/071994", "15/02/86", etc.)
                                const parsed = parseDateString(datePart)
                                if (parsed) {
                                    datePart = parsed
                                } else if (!datePart || datePart === '') {
                                    datePart = '1970-01-01'
                                }
                            }
                            val = datePart
                        }
                    }

                    // Cleaning for preview
                    let cleanVal = String(val).trim()
                    if (f.key === 'nik' || f.key === 'no_kk') {
                        cleanVal = cleanVal.replace(/[^0-9]/g, '')
                        // Handle empty or invalid values - generate placeholder
                        if (!cleanVal || cleanVal.length === 0) {
                            const timestamp = Date.now().toString().slice(-8)
                            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
                            cleanVal = (f.key === 'nik' ? '000000000000' : '0000000000000000').slice(0, 16 - timestamp.length - random.length) + timestamp + random
                        }
                        cleanVal = cleanVal.slice(0, 16).padStart(16, '0')
                    }
                    if (f.key === 'tanggal_lahir' && (!cleanVal || cleanVal === '')) {
                        cleanVal = '1970-01-01'
                    }

                    cleaned[f.key] = cleanVal
                })
                return cleaned
            })
            setPreview(sampleRows)
        }
    }, [mapping, rawData, skipFirstRow])

    const handleConfirm = () => {
        const missing = DB_FIELDS.filter(f => f.required && !mapping[f.key])
        if (missing.length > 0) {
            alert(`Harap petakan kolom wajib: ${missing.map(f => f.label).join(', ')}`)
            return
        }

        const dataToImport = skipFirstRow ? rawData.slice(1) : rawData

        const cleaned = dataToImport.map(row => {
            const obj = {}
            DB_FIELDS.forEach(f => {
                const rawHeader = mapping[f.key]
                let val = row[rawHeader] ?? ''

                // EXCEL DATE CONVERSION (e.g. 30218 -> 1982-09-24)
                if (f.key === 'tanggal_lahir') {
                    const converted = convertExcelDate(val)
                    if (converted) {
                        val = converted
                    } else {
                        // Try parsing string date (DD-MM-YYYY, DD/MM/YYYY, etc.)
                        const parsed = parseDateString(val)
                        if (parsed) {
                            val = parsed
                        } else {
                            // If parsing fails (invalid date like Feb 31), use fallback
                            val = '1970-01-01'
                        }
                    }
                }

                // Logic for combined Place & Date splitting
                // Only split if the mapped column contains BOTH words
                const hLower = String(rawHeader || '').toLowerCase()
                if (hLower.includes('tempat') && hLower.includes('tanggal')) {
                    // Split only on FIRST comma to avoid breaking date formats like "09/071994"
                    const commaIndex = String(val).indexOf(',')
                    let placePart, datePart
                    
                    if (commaIndex !== -1) {
                        placePart = String(val).substring(0, commaIndex).trim()
                        datePart = String(val).substring(commaIndex + 1).trim()
                    } else {
                        // No comma, try to split on space or use entire value for place
                        const parts = String(val).split(/\s+/)
                        placePart = parts[0] || ''
                        datePart = parts.slice(1).join(' ') || ''
                    }
                    
                    if (f.key === 'tempat_lahir') {
                        val = placePart
                    }
                    if (f.key === 'tanggal_lahir') {
                        // Try to convert if it's an Excel serial date
                        const converted = convertExcelDate(parseFloat(datePart))
                        if (converted) {
                            datePart = converted
                        } else {
                            // Try parsing string date (handles "09/071994", "15/02/86", etc.)
                            const parsed = parseDateString(datePart)
                            if (parsed) {
                                datePart = parsed
                            } else {
                                // If parsing fails (invalid date like Feb 31), use fallback
                                datePart = '1970-01-01'
                            }
                        }
                        val = datePart
                    }
                }

                // Final cleaning and data types
                let finalVal = String(val).trim()

                // NIK & NO_KK Cleaning: strictly digits and max 16 chars
                if (f.key === 'nik' || f.key === 'no_kk') {
                    finalVal = finalVal.replace(/[^0-9]/g, '')
                    // Handle empty or invalid values - generate placeholder
                    if (!finalVal || finalVal.length === 0) {
                        // Generate placeholder: current timestamp + random
                        const timestamp = Date.now().toString().slice(-8)
                        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
                        finalVal = (f.key === 'nik' ? '000000000000' : '0000000000000000').slice(0, 16 - timestamp.length - random.length) + timestamp + random
                    }
                    finalVal = finalVal.slice(0, 16)
                    // Pad with zeros if still less than 16
                    finalVal = finalVal.padStart(16, '0')
                }

                // Fallback for required DATE fields that cannot be empty
                if (f.key === 'tanggal_lahir' && (!finalVal || finalVal === '')) {
                    finalVal = '1970-01-01'
                }

                if (f.key === 'bisa_baca') obj[f.key] = true
                else if (f.key === 'kewarganegaraan') obj[f.key] = 'WNI'
                else if (f.key === 'jenis_kelamin') {
                    const jk = finalVal.toUpperCase()
                    obj[f.key] = jk.includes('P') ? 'P' : 'L'
                }
                else obj[f.key] = finalVal
            })
            return obj
        })

        onConfirm(cleaned)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="w-full max-w-4xl bg-[#141417] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2E]">
                    <div>
                        <h2 className="text-white text-base font-semibold">Petakan Kolom Excel</h2>
                        <p className="text-[#6B6B70] text-[11px] mt-0.5">Sesuaikan kolom dari file Excel Anda dengan database kependudukan.</p>
                    </div>
                    <button onClick={onClose} className="text-[#6B6B70] hover:text-white transition-colors">
                        <RiCloseLine size={24} />
                    </button>
                </div>

                {!headers || headers.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center text-[#6B6B70]">
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    </div>
                ) : (

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* LEFT: MAPPING FORM */}
                    <div className="flex-1 overflow-y-auto p-6 border-r border-[#2A2A2E]">
                        <div className="flex items-center gap-2 p-3 mb-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                            <RiCheckLine size={16} className="shrink-0" />
                            <span>Kami mencoba menebak kolom Anda secara otomatis. Silakan periksa kembali.</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-[#1A1A1D] border border-[#2A2A2E]">
                            <input 
                                type="checkbox" 
                                id="skipFirstRow"
                                checked={skipFirstRow}
                                onChange={e => setSkipFirstRow(e.target.checked)}
                                className="w-4 h-4 rounded border-[#2A2A2E] bg-[#0A0A0B] text-emerald-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                            />
                            <label htmlFor="skipFirstRow" className="text-white text-xs cursor-pointer select-none">
                                Abaikan baris pertama data (Gunakan jika ada sub-header/judul kolom tambahan)
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-y-5">
                            {DB_FIELDS.map(field => (
                                <div key={field.key} className="flex flex-col gap-1.5">
                                    <label className="text-white text-xs font-semibold flex items-center justify-between">
                                        <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                                        {mapping[field.key] && <span className="text-emerald-500 text-[10px]">Terpetakan</span>}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <select
                                                value={mapping[field.key] ?? ''}
                                                onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className={`w-full px-3 py-2.5 rounded-xl bg-[#1A1A1D] border text-xs outline-none transition-all cursor-pointer appearance-none ${
                                                    mapping[field.key] ? 'border-emerald-500/40 text-white' : 'border-[#2A2A2E] text-[#6B6B70] hover:border-[#4A4A4E]'
                                                }`}
                                            >
                                                <option value="">-- Lewati kolom ini --</option>
                                                {validHeaders.map((h, i) => (
                                                    <option key={`${h}-${i}`} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW PANEL */}
                    <div className="w-full lg:w-96 bg-[#0A0A0B] flex flex-col p-6 overflow-hidden">
                        <h3 className="text-[#ADADB0] text-[10px] font-bold uppercase tracking-widest mb-4">Pratinjau Hasil (3 Baris Pertama)</h3>
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {preview.map((row, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-[#141417] border border-[#2A2A2E] text-[11px] space-y-2">
                                    <div className="font-bold text-white border-b border-[#2A2A2E] pb-1.5 mb-2">Baris #{idx + 1}</div>
                                    {DB_FIELDS.filter(f => mapping[f.key]).map(f => (
                                        <div key={f.key} className="flex justify-between gap-4">
                                            <span className="text-[#6B6B70]">{f.key}:</span>
                                            <span className="text-[#ADADB0] text-right truncate max-w-[150px]">{row[f.key]}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <div className="flex items-start gap-2 text-orange-400 text-[10px] leading-relaxed">
                                <RiAlertLine size={14} className="shrink-0" />
                                <span><b>Tempat/Tgl Lahir:</b> Jika kolom digabung (cth: "Jakarta, 1990-01-01"), kami akan otomatis memisahkannya.</span>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                <div className="p-6 border-t border-[#2A2A2E] flex items-center justify-end gap-3 bg-[#111113] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-transparent text-[#8B8B90] text-xs font-medium hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-2.5 rounded-xl bg-emerald-600 !text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/10"
                    >
                        Konfirmasi Impor
                    </button>
                </div>
            </div>
        </div>
    )
}
