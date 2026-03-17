import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table'
import * as XLSX from 'xlsx'
import {
    RiArrowLeftLine,
    RiFileExcel2Line,
    RiSaveLine,
    RiDeleteBinLine,
    RiSearchLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiRefreshLine,
    RiAddLine,
    RiDownloadLine,
    RiUserAddLine
} from 'react-icons/ri'
import { apiFetch } from '../api'
import ColumnMappingModal from './ColumnMappingModal'

// --- CUSTOM CELL COMPONENT FOR INLINE EDITING ---
const EditableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)
    const [isEditing, setIsEditing] = useState(false)

    // Sync state with prop
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const onBlur = () => {
        setIsEditing(false)
        if (value !== initialValue) {
            table.options.meta?.updateData(row.original.id, column.id, value)
        }
    }

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur()
        }
        if (e.key === 'Escape') {
            setValue(initialValue)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <input
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className="w-full bg-[#0A0A0B] text-white px-2 py-1 rounded border border-[#298064] outline-none text-sm"
            />
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-[#1A1A1D] px-2 py-0.5 rounded transition-colors truncate min-h-[22px] flex items-center"
        >
            {value === true ? 'Ya' : value === false ? 'Tidak' : value || '-'}
        </div>
    )
}

export default function PendudukEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    })
    const [dataset, setDataset] = useState(null)
    const [isImporting, setIsImporting] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [mappingData, setMappingData] = useState(null) // { headers, rawData }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch records
            const recordsRes = await apiFetch(`/penduduk/datasets/${id}/records`)
            if (recordsRes.ok) {
                const result = await recordsRes.json()
                setData(result.penduduk || [])
            }

            // Fetch dataset info for the year
            const datasetRes = await apiFetch('/penduduk/datasets')
            if (datasetRes.ok) {
                const allDatasets = await datasetRes.json()
                const current = allDatasets.find(d => d.id === parseInt(id))
                setDataset(current)
            }
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // --- TABLE COLUMNS DEFINITION ---
    const columns = useMemo(() => [
        { accessorKey: 'nik', header: 'NIK', cell: EditableCell },
        { accessorKey: 'no_kk', header: 'No KK', cell: EditableCell },
        { accessorKey: 'nama', header: 'Nama Lengkap', cell: EditableCell },
        { accessorKey: 'jenis_kelamin', header: 'JK', cell: EditableCell },
        { accessorKey: 'status_kawin', header: 'Status', cell: EditableCell },
        { accessorKey: 'tempat_lahir', header: 'Tempat Lahir', cell: EditableCell },
        { 
            accessorKey: 'tanggal_lahir', 
            header: 'Tgl Lahir', 
            cell: ({ getValue, row, column, table }) => {
                const val = getValue()
                // Format ISO string to YYYY-MM-DD
                const displayVal = val && String(val).includes('T') ? val.split('T')[0] : val
                return <EditableCell getValue={() => displayVal} row={row} column={column} table={table} />
            }
        },
        { accessorKey: 'agama', header: 'Agama', cell: EditableCell },
        { accessorKey: 'pekerjaan', header: 'Pekerjaan', cell: EditableCell },
        { accessorKey: 'alamat', header: 'Alamat', cell: EditableCell },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <button
                    onClick={() => handleDeleteRow(row.original.id)}
                    className="p-1.5 rounded bg-transparent hover:bg-red-500/10 text-[#6B6B70] hover:text-red-400 transition-colors"
                >
                    <RiDeleteBinLine size={14} />
                </button>
            ),
        }
    ], [])

    // --- TABLE INSTANCE ---
    const table = useReactTable({
        data,
        columns,
        state: { 
            globalFilter,
            pagination
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            updateData: async (recordId, columnId, value) => {
                // Instantly update UI for speed
                setData(old => old.map(row => row.id === recordId ? { ...row, [columnId]: value } : row))

                try {
                    const res = await apiFetch(`/penduduk/records/${recordId}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ [columnId]: value })
                    })
                    if (!res.ok) throw new Error('Failed to save')
                } catch (error) {
                    alert('Gagal menyimpan perubahan. Data akan dikembalikan.')
                    fetchData() // Refresh on error
                }
            }
        }
    })

    const handleDeleteRow = async (recordId) => {
        if (!confirm('Hapus baris ini?')) return
        try {
            const res = await apiFetch(`/penduduk/records/${recordId}`, { method: 'DELETE' })
            if (res.ok) {
                setData(old => old.filter(row => row.id !== recordId))
            }
        } catch (error) {
            alert('Gagal menghapus')
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]

                // Convert to raw matrix to find header zone
                const rawMatrix = XLSX.utils.sheet_to_json(ws, { header: 1 })

                // STEP 1: Find the data start row (look for 1 in NO URUT)
                // Also find the anchor row for 'NIK' to know where to start looking
                let anchorRowIndex = -1
                for (let i = 0; i < Math.min(rawMatrix.length, 30); i++) {
                    const row = rawMatrix[i]
                    if (Array.isArray(row) && row.some(cell => String(cell || '').toLowerCase().includes('nik'))) {
                        anchorRowIndex = i
                        break
                    }
                }

                if (anchorRowIndex === -1) anchorRowIndex = 0

                // Find where the actual data starts (the row with numeric 1, 2, 3...)
                let dataStartRow = -1
                for (let i = anchorRowIndex; i < Math.min(rawMatrix.length, anchorRowIndex + 15); i++) {
                    const row = rawMatrix[i]
                    if (Array.isArray(row)) {
                        // Look for a cell that is exactly 1 (numeric or string)
                        const hasOne = row.some(cell => cell === 1 || cell === "1")
                        if (hasOne) {
                            dataStartRow = i
                            break
                        }
                    }
                }

                // If no '1' found, fallback to the row after anchor
                if (dataStartRow === -1) dataStartRow = anchorRowIndex + 1

                // STEP 2: Collect headers from everything ABOVE dataStartRow
                const columnHeaders = {} // { colIndex: [labels...] }
                for (let rowIdx = 0; rowIdx < dataStartRow; rowIdx++) {
                    const row = rawMatrix[rowIdx]
                    if (!Array.isArray(row)) continue
                    row.forEach((cell, colIdx) => {
                        const val = String(cell || '').trim()
                        if (val !== '' && !val.match(/^\(\d+\)$/)) { // Ignore (1), (2) sub-labels
                            if (!columnHeaders[colIdx]) columnHeaders[colIdx] = []
                            if (!columnHeaders[colIdx].includes(val)) {
                                columnHeaders[colIdx].push(val)
                            }
                        }
                    })
                }

                // STEP 3: Create merged header strings and clean data
                const finalHeadersMap = {} // colIndex -> mergedLabel
                const allHeaderLabels = []

                Object.entries(columnHeaders).forEach(([colIdx, labels]) => {
                    const merged = labels.join(' ').trim()
                    finalHeadersMap[colIdx] = merged
                    allHeaderLabels.push(merged)
                })

                // Get only data rows starting from dataStartRow
                const dataRows = rawMatrix.slice(dataStartRow)

                // Convert to objects
                const dataObjects = dataRows.map(row => {
                    const obj = {}
                    Object.entries(finalHeadersMap).forEach(([colIdx, label]) => {
                        obj[label] = row[parseInt(colIdx)] ?? ''
                    })
                    return obj
                }).filter(o => Object.values(o).some(v => String(v).trim() !== '')) // Remove empty rows

                setMappingData({
                    headers: [...new Set(allHeaderLabels)],
                    rawData: dataObjects
                })
            } catch (error) {
                alert('Error parsing file: ' + error.message)
            } finally {
                e.target.value = null // Reset input
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleConfirmImport = async (cleanedData) => {
        setMappingData(null)
        setIsImporting(true)
        try {
            const res = await apiFetch(`/penduduk/datasets/${id}/bulk`, {
                method: 'POST',
                body: JSON.stringify(cleanedData)
            })

            if (res.ok) {
                const result = await res.json()
                alert(`Import Berhasil! ${result.message}`)
                fetchData()
            } else {
                const err = await res.json()
                alert(err.error || 'Import Gagal')
            }
        } catch (error) {
            alert('Request error: ' + error.message)
        } finally {
            setIsImporting(false)
        }
    }

    const handleAddRow = async (formData) => {
        try {
            const res = await apiFetch(`/penduduk/datasets/${id}/bulk`, {
                method: 'POST',
                body: JSON.stringify([formData])
            })
            if (res.ok) {
                fetchData()
                setIsAddModalOpen(false)
            } else {
                const err = await res.json()
                alert(err.error || 'Gagal menambah data')
            }
        } catch (error) {
            alert('Gagal menambah baris')
        }
    }

    const handleExportExcel = () => {
        setIsExporting(true)
        try {
            const exportData = data.map(({ id, dataset_id, created_at, updated_at, ...rest }) => ({
                ...rest,
                tanggal_lahir: rest.tanggal_lahir ? rest.tanggal_lahir.split('T')[0] : ''
            }))
            
            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Data Penduduk")
            
            XLSX.writeFile(wb, `Data_Penduduk_${dataset?.tahun || 'Export'}.xlsx`)
        } catch (error) {
            alert('Export gagal: ' + error.message)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-[#0A0A0B]">
            {/* Toolbar */}
            <div className="p-3.5 border-b border-[#2A2A2E] bg-[#141417] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/penduduk')}
                        className="p-2 rounded-lg bg-[#1A1A1D] text-[#8B8B90] hover:text-white transition-colors border border-[#2A2A2E]"
                    >
                        <RiArrowLeftLine size={18} />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-white font-semibold text-sm leading-none">Editor Data Penduduk</h2>
                        {dataset && <span className="text-[#298064] text-[11px] font-bold mt-1">Dataset Tahun {dataset.tahun}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-56 mr-2">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]" size={14} />
                        <input
                            placeholder="Cari data..."
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B] border border-[#2A2A2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#298064] transition-all"
                        />
                    </div>
                    
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1D] hover:bg-[#2A2A2E] text-white text-xs font-semibold rounded-xl border border-[#2A2A2E] transition-all"
                    >
                        <RiUserAddLine size={14} className="text-[#298064]" />
                        <span>Tambah</span>
                    </button>

                    <button
                        onClick={handleExportExcel}
                        disabled={isExporting || data.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1D] hover:bg-[#2A2A2E] text-white text-xs font-semibold rounded-xl border border-[#2A2A2E] transition-all disabled:opacity-30"
                    >
                        <RiDownloadLine size={14} className="text-blue-400" />
                        <span>Export</span>
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2 bg-[#298064]/10 hover:bg-[#298064]/20 text-[#298064] text-xs font-bold rounded-xl border border-[#298064]/20 cursor-pointer transition-all">
                        <RiFileExcel2Line size={14} />
                        {isImporting ? 'Importing...' : 'Import'}
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isImporting} />
                    </label>

                    <button 
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-[#1A1A1D] text-[#8B8B90] hover:text-white transition-all border border-[#2A2A2E]"
                        title="Refresh"
                    >
                        <RiRefreshLine size={16} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-[#0A0A0B]">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-[#6B6B70]">Memuat dataset...</div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="sticky top-0 z-10 bg-[#141417]">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-[#2A2A2E] resident-table-header-row">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-3 py-4 text-[10px] font-bold text-[#6B6B70] uppercase tracking-wider bg-[#111113]">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="resident-table-tbody">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="border-b border-[#1F1F23] hover:bg-[#1A1A1D] transition-colors group resident-table-row">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-3 py-1 text-[13px] text-[#ADADB0] focus-within:text-white bg-[#141417]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-t border-[#1F1F23] bg-[#141417] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-[#6B6B70]">
                    <span>Menampilkan {table.getPaginationRowModel().rows.length} dari {data.length} baris</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1.5 rounded-md bg-[#1A1A1D] text-[#6B6B70] hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <RiArrowLeftSLine size={16} />
                    </button>
                    <span className="text-xs text-[#8B8B90]">
                        Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-1.5 rounded-md bg-[#1A1A1D] text-[#6B6B70] hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <RiArrowRightSLine size={16} />
                    </button>
                </div>
            </div>

            {/* Mapping Modal */}
            {mappingData && (
                <ColumnMappingModal
                    headers={mappingData.headers}
                    rawData={mappingData.rawData}
                    onConfirm={handleConfirmImport}
                    onClose={() => setMappingData(null)}
                />
            )}

            {/* Add Resident Modal */}
            {isAddModalOpen && (
                <AddResidentModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSave={handleAddRow} 
                />
            )}
        </div>
    )
}

// --- MODAL COMPONENT FOR ADDING RESIDENT ---
function AddResidentModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        nik: '',
        no_kk: '',
        nama: '',
        jenis_kelamin: 'L',
        tempat_lahir: '',
        tanggal_lahir: '',
        agama: 'Islam',
        pend_terakhir: '',
        pekerjaan: '',
        status_kawin: 'Belum Kawin',
        alamat: '',
        dusun: '',
        rt: '',
        rw: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#141417] border border-[#2A2A2E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-[#2A2A2E] flex justify-between items-center">
                    <h3 className="text-white font-semibold">Tambah Penduduk Baru</h3>
                    <button onClick={onClose} className="text-[#6B6B70] hover:text-white">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">NIK</label>
                        <input required value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">No KK</label>
                        <input value={form.no_kk} onChange={e => setForm({...form, no_kk: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Nama Lengkap</label>
                        <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Jenis Kelamin</label>
                        <select value={form.jenis_kelamin} onChange={e => setForm({...form, jenis_kelamin: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]">
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Agama</label>
                        <input value={form.agama} onChange={e => setForm({...form, agama: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Tempat Lahir</label>
                        <input value={form.tempat_lahir} onChange={e => setForm({...form, tempat_lahir: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Tanggal Lahir</label>
                        <input type="date" value={form.tanggal_lahir} onChange={e => setForm({...form, tanggal_lahir: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Pekerjaan</label>
                        <input value={form.pekerjaan} onChange={e => setForm({...form, pekerjaan: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Alamat</label>
                        <input value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2A2A2E] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#298064]" />
                    </div>

                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8B8B90] hover:text-white">Batal</button>
                        <button type="submit" className="px-6 py-2 bg-[#298064] hover:bg-[#216650] text-white text-sm font-semibold rounded-lg transition-all">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
