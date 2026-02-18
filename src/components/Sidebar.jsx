import { useState } from 'react'
import {
    RiDashboard3Line,
    RiGroupLine,
    RiHeartPulseLine,
    RiMoneyDollarCircleLine,
    RiBarChartBoxLine,
    RiShoppingBag3Line,
    RiMapPinLine,
    RiNewspaperLine,
    RiImageLine,
    RiReceiptLine,
    RiCustomerService2Line,
    RiArrowUpLine,
    RiArrowDownSLine,
    RiArrowRightSLine,
} from 'react-icons/ri'

const navItems = [
    { icon: RiDashboard3Line, label: 'Overview', active: true },
    { icon: RiGroupLine, label: 'Penduduk', active: false },
    { icon: RiHeartPulseLine, label: 'Stunting', active: false },
    {
        icon: RiMoneyDollarCircleLine,
        label: 'Keuangan',
        active: false,
        children: [
            { icon: RiBarChartBoxLine, label: 'APBDes' },
            { icon: RiShoppingBag3Line, label: 'Belanja' },
        ],
    },
    { icon: RiMapPinLine, label: 'Listing', active: false },
    { icon: RiNewspaperLine, label: 'Berita', active: false },
    { icon: RiImageLine, label: 'Galeri', active: false },
    { icon: RiCustomerService2Line, label: 'Pengaduan', active: false },
]

export default function Sidebar({ user, onLogout }) {
    const [openMenus, setOpenMenus] = useState({ Keuangan: false })

    const toggleMenu = (label) =>
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))

    return (
        <aside
            className="flex flex-col justify-between w-[240px] shrink-0 h-full px-4 py-6 overflow-y-auto"
            style={{ background: '#141417' }}
        >
            {/* Top */}
            <div className="flex flex-col gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#2A2A2E]">
                    <span
                        className="text-white font-semibold tracking-[4px]"
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 15 }}
                    >
                        PUUNDOHO
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#298064] shrink-0" />
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-0.5">
                    {navItems.map(({ icon: Icon, label, active, children }) => (
                        <div key={label}>
                            <button
                                onClick={() => children && toggleMenu(label)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${active
                                        ? 'bg-[#1A1A1D] text-white'
                                        : 'text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white'
                                    }`}
                            >
                                <Icon
                                    size={17}
                                    className={active ? 'text-[#298064]' : 'text-[#6B6B70]'}
                                />
                                <span className="flex-1">{label}</span>
                                {children && (
                                    openMenus[label]
                                        ? <RiArrowDownSLine size={16} className="text-[#6B6B70]" />
                                        : <RiArrowRightSLine size={16} className="text-[#6B6B70]" />
                                )}
                            </button>

                            {/* Sub-items */}
                            {children && openMenus[label] && (
                                <div className="flex flex-col gap-0.5 mt-0.5 ml-4 pl-3 border-l border-[#2A2A2E]">
                                    {children.map(({ icon: ChildIcon, label: childLabel }) => (
                                        <button
                                            key={childLabel}
                                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white transition-colors text-left"
                                        >
                                            <ChildIcon size={15} className="text-[#6B6B70]" />
                                            {childLabel}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom */}
            <div className="flex flex-col gap-4 pt-4">
                <div className="h-px bg-[#2A2A2E]" />

                {/* Account */}
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-full bg-[#2A2A2E] flex items-center justify-center shrink-0">
                        <span className="text-[#8B8B90] text-xs font-semibold">
                            {user ? user.slice(0, 2).toUpperCase() : 'AD'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-white text-[13px] font-medium truncate">
                            {user || 'Admin'}
                        </span>
                        <span className="text-[#6B6B70] text-[11px] truncate">
                            admin@desapuundoho.id
                        </span>
                    </div>
                    <button onClick={onLogout} title="Logout">
                        <RiArrowUpLine size={16} className="text-[#6B6B70] hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
