import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
    RiCustomerService2Line,
    RiArrowUpLine,
    RiArrowDownSLine,
    RiArrowRightSLine,
    RiSunLine,
    RiMoonLine,
} from 'react-icons/ri'

const navItems = [
    { icon: RiDashboard3Line, label: 'Overview', to: '/dashboard' },
    { icon: RiGroupLine, label: 'Penduduk', to: '/dashboard/penduduk' },
    { icon: RiHeartPulseLine, label: 'Stunting', to: '/dashboard/stunting' },
    {
        icon: RiMoneyDollarCircleLine,
        label: 'Keuangan',
        children: [
            { icon: RiBarChartBoxLine, label: 'APBDes', to: '/dashboard/keuangan/apbdes' },
            { icon: RiShoppingBag3Line, label: 'Belanja', to: '/dashboard/keuangan/belanja' },
        ],
    },
    { icon: RiMapPinLine, label: 'Listing', to: '/dashboard/listing' },
    { icon: RiNewspaperLine, label: 'Berita', to: '/dashboard/berita' },
    { icon: RiImageLine, label: 'Galeri', to: '/dashboard/galeri' },
    { icon: RiCustomerService2Line, label: 'Pengaduan', to: '/dashboard/pengaduan' },
]

const activeClass = 'bg-[#1A1A1D] text-white'
const inactiveClass = 'text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white'

export default function Sidebar({ user, onLogout }) {
    const location = useLocation()
    const [openMenus, setOpenMenus] = useState(() => {
        // Auto-open Keuangan if on a keuangan sub-route
        return { Keuangan: location.pathname.startsWith('/dashboard/keuangan') }
    })

    const toggle = (label) =>
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
                    {navItems.map(({ icon: Icon, label, to, children }) => {

                        // Parent with children (Keuangan)
                        if (children) {
                            const isGroupActive = location.pathname.startsWith('/dashboard/keuangan')
                            return (
                                <div key={label}>
                                    <button
                                        onClick={() => toggle(label)}
                                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${isGroupActive ? activeClass : inactiveClass}`}
                                    >
                                        <Icon size={17} className={isGroupActive ? 'text-[#298064]' : 'text-[#6B6B70]'} />
                                        <span className="flex-1">{label}</span>
                                        {openMenus[label]
                                            ? <RiArrowDownSLine size={16} className="text-[#6B6B70]" />
                                            : <RiArrowRightSLine size={16} className="text-[#6B6B70]" />
                                        }
                                    </button>
                                    {openMenus[label] && (
                                        <div className="flex flex-col gap-0.5 mt-0.5 ml-4 pl-3 border-l border-[#2A2A2E]">
                                            {children.map(({ icon: ChildIcon, label: childLabel, to: childTo }) => (
                                                <NavLink
                                                    key={childLabel}
                                                    to={childTo}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${isActive ? activeClass : inactiveClass}`
                                                    }
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            <ChildIcon size={15} className={isActive ? 'text-[#298064]' : 'text-[#6B6B70]'} />
                                                            {childLabel}
                                                        </>
                                                    )}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        // Regular nav item
                        return (
                            <NavLink
                                key={label}
                                to={to}
                                end={to === '/dashboard'} // exact match for Overview only
                                className={({ isActive }) =>
                                    `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${isActive ? activeClass : inactiveClass}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={17} className={isActive ? 'text-[#298064]' : 'text-[#6B6B70]'} />
                                        <span className="flex-1">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom — theme toggle + user + logout */}
            <div className="flex flex-col gap-4 pt-4">
                <div className="h-px bg-[#2A2A2E]" />

                {/* Light/Dark mode toggle */}
                <button
                    onClick={() => {
                        const isLight = document.body.classList.toggle('light-mode')
                        localStorage.setItem('theme', isLight ? 'light' : 'dark')
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white transition-colors"
                >
                    {typeof window !== 'undefined' && document.body.classList.contains('light-mode')
                        ? <RiMoonLine size={17} className="text-[#6B6B70]" />
                        : <RiSunLine size={17} className="text-[#6B6B70]" />
                    }
                    <span>Mode Terang/Gelap</span>
                </button>

                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-full bg-[#2A2A2E] flex items-center justify-center shrink-0">
                        <span className="text-[#8B8B90] text-xs font-semibold">
                            {user ? user.slice(0, 2).toUpperCase() : 'AD'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-white text-[13px] font-medium truncate">{user || 'Admin'}</span>
                        <span className="text-[#6B6B70] text-[11px] truncate">admin@desapuundoho.id</span>
                    </div>
                    <button onClick={onLogout} title="Logout">
                        <RiArrowUpLine size={16} className="text-[#6B6B70] hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
