import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    RiDashboard3Line,
    RiGroupLine,
    RiHeartPulseLine,
    RiBarChartBoxLine,
    RiShoppingBag3Line,
    RiMapPinLine,
    RiMap2Line,
    RiHandCoinLine,
    RiNewspaperLine,
    RiImageLine,
    RiCustomerService2Line,
    RiArrowDownSLine,
    RiArrowRightSLine,
    RiMoonLine,
    RiSunLine,
    RiLogoutBoxRLine,
    RiFilePaper2Line
} from 'react-icons/ri'

const navItems = [
    { icon: RiDashboard3Line, label: 'Overview', to: '/dashboard', roles: ['admin', 'bendahara'] },
    { icon: RiGroupLine, label: 'Penduduk', to: '/dashboard/penduduk', roles: ['admin'] },
    { icon: RiHeartPulseLine, label: 'Stunting', to: '/dashboard/stunting', roles: ['admin'] },
    { icon: RiHandCoinLine, label: 'Bansos', to: '/dashboard/bansos', roles: ['bendahara'] },
    { icon: RiMap2Line, label: 'Dusun Desa', to: '/dashboard/dusun', roles: ['admin'] },
    { icon: RiBarChartBoxLine, label: 'IDM & SDGs', to: '/dashboard/idm-sdgs', roles: ['admin'] },
    { icon: RiBarChartBoxLine, label: 'APBDes', to: '/dashboard/keuangan/apbdes', roles: ['bendahara'] },
    { icon: RiShoppingBag3Line, label: 'Produk Desa', to: '/dashboard/keuangan/belanja', roles: ['bendahara'] },
    { icon: RiMapPinLine, label: 'Listing', to: '/dashboard/listing', roles: ['admin'] },
    { icon: RiNewspaperLine, label: 'Berita', to: '/dashboard/berita', roles: ['admin'] },
    { icon: RiImageLine, label: 'Galeri', to: '/dashboard/galeri', roles: ['admin'] },
    { icon: RiCustomerService2Line, label: 'Pengaduan', to: '/dashboard/pengaduan', roles: ['admin'] },
    { icon: RiFilePaper2Line, label: 'Pengajuan PPID', to: '/dashboard/pengajuan', roles: ['admin'] },
]

const activeClass = 'bg-[#1A1A1D] text-white'
const inactiveClass = 'text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white'

export default function Sidebar({ user, role = 'admin', onLogout }) {
    const location = useLocation()
    const [openMenus, setOpenMenus] = useState({})
    const [isLightMode, setIsLightMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'light' ||
                (document.documentElement.getAttribute('data-theme') === 'light')
        }
        return false
    })

    const toggle = (label) =>
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))

    const toggleTheme = () => {
        const newTheme = isLightMode ? 'dark' : 'light'
        setIsLightMode(!isLightMode)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        if (newTheme === 'light') {
            document.body.classList.add('light-mode')
        } else {
            document.body.classList.remove('light-mode')
        }
    }

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
                    {navItems
                        .filter(item => item.roles.includes(role))
                        .map(({ icon: Icon, label, to, children }) => {

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

            {/* Bottom — user + theme toggle + logout */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-[#2A2A2E]">
                <div className="flex flex-col flex-1 min-w-0 px-2">
                    <span className="text-white text-[13px] font-medium truncate">{user || 'Admin'}</span>
                    <span className="text-[#6B6B70] text-[11px] capitalize">{role}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={toggleTheme}
                        title={isLightMode ? 'Mode Gelap' : 'Mode Terang'}
                        className="p-2 rounded-lg text-[#8B8B90] hover:bg-[#1A1A1D] hover:text-white transition-colors"
                    >
                        {isLightMode
                            ? <RiMoonLine size={18} />
                            : <RiSunLine size={18} />
                        }
                    </button>
                    <button
                        onClick={onLogout}
                        title="Logout"
                        className="p-2 rounded-lg text-[#8B8B90] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <RiLogoutBoxRLine size={18} />
                    </button>
                </div>
            </div>
        </aside>
    )
}
