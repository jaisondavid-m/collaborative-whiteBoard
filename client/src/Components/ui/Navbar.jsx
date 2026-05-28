import React , { useState , useEffect , useRef } from "react"
import { useNavigate, useLocation , Link } from "react-router-dom"
import { HiHome , HiSquares2X2 } from "react-icons/hi2"
import { IoNotifications, IoChevronDown, IoNotificationsOutline } from "react-icons/io5"
import { RiDoorOpenLine , RiUserLine , RiSettings3Line , RiLayoutGridLine , RiMenuLine , RiCloseLine, RiAddLine } from "react-icons/ri"
import { TbHexagon } from "react-icons/tb"

const NAV_LINKS = [
    { label: "Home", path: "/home" , Icon: HiHome },
    { label: "Rooms" , path: "/room" , Icon: HiSquares2X2 },
]

function DropdownItem({ Icon , label , onClick , danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors text-left
                    ${danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                `}
        >
            <Icon size={14} />
            {label}
        </button>
    )
}

function UserAvatar({ userId, onClick, dropdownRef, open }) {
    const initials = userId ? userId.slice(0,2).toUpperCase() : "??"
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onClick}
                className="flex items-center gap-2 group focus:outline-none"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <div className="w-8 h-8 rounded-full bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center text-xs font-bold border-2 border-transparent group-hover:border-[#4ecdc4] transition-all duration-150 select-none">
                    {initials}
                </div>
                <span
                    className="hidden sm:block text-xs text-gray-500 group-hover:text-gray-800 transition-colors max-w-[80px] truncate"
                >
                    {userId || "Guest"}
                </span>
                <IoChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-black/10 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-black/5">
                        <p className="text-xs font-semibold text-gray-800 truncate">{userId || "Guest"}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Logged in</p>
                    </div>
                    <div className="py-1">
                        <DropdownItem Icon={RiUserLine} label="Profile" onClick={() => {}} />
                        <DropdownItem Icon={RiSettings3Line} label="Setting" onClick={() => {}} />
                        <DropdownItem Icon={RiLayoutGridLine} label="My Rooms" onClick={() => {}} />
                    </div>
                    <div className="border-t border-black/5 py-1">
                        <DropdownItem
                            Icon={RiDoorOpenLine}
                            label="Logout"
                            danger
                            onClick={() => {
                                localStorage.removeItem("token")
                                localStorage.removeItem("userid")
                                window.location.href = "/login"
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function MobileMenu({ open , links , currentPath , onNavigate , userId , onLogout }) {

    if (!open) return null

    return (
        <div className="md:hidden bg-white border-t border-black/5 px-4 py-3 flex flex-col gap-1">
            {links.map(({path, label, Icon}) => (
                <button
                    key={path}
                    onClick={() => onNavigate(path)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                            ${currentPath === path
                                ? "bg-[#e6faf8] text-[#0f6e56] font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                >
                    <Icon size={15}/>
                    {label}
                </button>
            ))}
            <div className="border-t border-black/5 mt-2 pt-2">
                <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center text-xs font-bold">
                        {userId ? userId.slice(0, 2).toUpperCase() : "??"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{userId || "Guest"}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                    <RiDoorOpenLine size={15} /> Log Out
                </button>
            </div>
        </div>
    )
}

function Navbar() {

    const navigate = useNavigate()
    const location = useLocation()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const dropdownRef = useRef(null)

    const userId = localStorage.getItem("userid") || ""

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener("scroll", handleScroll, {passive: true})
        return () => window.removeEventListener("scroll",handleScroll)
    },[])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown",handleClickOutside)
        return () => document.removeEventListener("mousedown",handleClickOutside)
    },[])

    useEffect(() => {
        setMobileOpen(false)
        setDropdownOpen(false)
    },[location.pathname])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userid")
        window.location.href = "/login"
    }

    return (
        <nav
            className={`sticky top-0 z-40 font-mono transition-all duration-200 ${
                scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"
            } border-b border-black/10 `}
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="h-14 flex items-center justify-between gap-4">
                    <Link to="/home" className="flex items-center gap-2 shrink-0 group">
                        <span className="w-7 h-7 bg-[#4ecdc4] rounded-md flex items-center justify-center text-white shadow-sm group-hover:bg-[#3db8b0] transition-colors">
                            <TbHexagon size={16} strokeWidth={2.5} />
                        </span>
                        <span className="text-sm font-semibold text-gray-800 tracking-tight hidden xs:block">
                            SketchBoard
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
                        {NAV_LINKS.map(({ path, label, Icon }) => {
                            const active = location.pathname === path
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150 relative
                                        ${active 
                                            ? "text-[#0f6e56] font-medium"
                                            : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.04]"
                                        }
                                    `}
                                >
                                    <Icon size={14} />
                                    {label}
                                    {active && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#4ecdc4] rounded-full" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => navigate("/room")}
                            className={`hidden sm:flex items-center gap-1.5 text-xs font-medium bg-[#4ecdc4] text-white px-3 py-1.5 rounded-md hover:bg-[#3db8b0] active:scale-95 transition-all duration-150`}
                        >
                            <RiAddLine size={14} />
                            New Room
                        </button>
                        <button className="hidden sm:flex w-8 h-8 rounded-md items-center justify-center text-gray-400 hover:bg-black/[0.04] hover:text-gray-700 transition-colors relative">
                            <IoNotificationsOutline size={17} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#4ecdc4] rounded-full" />
                        </button>
                        <UserAvatar
                            userId={userId}
                            onClick={() => setDropdownOpen(o => !o)}
                            dropdownRef={dropdownRef}
                            open={dropdownOpen}
                        />
                        <button
                            className="md:hidden"
                            onClick={() => setMobileOpen(open => !open)}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileOpen ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
                        </button>
                    </div>
                </div>
            </div>
            <MobileMenu
                open={mobileOpen}
                links={NAV_LINKS}
                currentPath={location.pathname}
                onNavigate={navigate}
                userId={userId}
                onLogout={handleLogout}
            />
        </nav>
    )

}

export default Navbar