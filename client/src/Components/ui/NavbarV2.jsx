import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
    HiHome,
    HiSquares2X2,
    HiOutlineInformationCircle,
} from "react-icons/hi2"

import {
    RiUserLine,
    RiSettings3Line,
    RiLayoutGridLine,
    RiFileList3Line,
    RiMenuLine,
    RiCloseLine,
    RiDoorOpenLine,
    RiChat3Line
} from "react-icons/ri"

import { IoNotificationsOutline } from "react-icons/io5"
import { TbHexagon } from "react-icons/tb"

import NotificationModal from "./notification/NotificationModal"
import API from "../../api/axios.js"

function NavbarV2() {

    const navigate = useNavigate()
    const location = useLocation()

    const role = localStorage.getItem("role") || ""
    const userId = localStorage.getItem("userid") || ""

    const isPrivileged =
        role === "admin" || role === "superadmin"

    const [mobileOpen, setMobileOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [profileOpen, setProfileOpen] = useState(false)

    const profileRef = useRef(null)

    const navLinks = [
        {
            label: "Home",
            path: "/home",
            icon: HiHome,
        },
        {
            label: "Rooms",
            path: "/room",
            icon: HiSquares2X2,
        },
        {
            label: "Chat",
            path: "/chat",
            icon: RiChat3Line,
        },
        {
            label: "Profile",
            path: "/profile",
            icon: RiUserLine,
        },
        {
            label: "About",
            path: "/about",
            icon: HiOutlineInformationCircle,
        },
        {
            label: "Settings",
            path: "/setting",
            icon: HiOutlineInformationCircle,
        }
    ]

    if (isPrivileged) {
        navLinks.push(
            {
                label: "Admin",
                path: "/admin",
                icon: RiLayoutGridLine,
            },
            {
                label: "Audit",
                path: "/audit-logs",
                icon: RiFileList3Line,
            }
        )
    }

    useEffect(() => {

        const fetchCount = () => {
            API.get("/api/notifications/unread-count")
                .then((res) =>
                    setUnreadCount(res.data?.count ?? 0)
                )
                .catch(() => { })
        }

        fetchCount()

        const interval = setInterval(fetchCount, 30000)

        return () => clearInterval(interval)

    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target)
            ) {
                setProfileOpen(false)
            }
        }

        document.addEventListener("mousedown",handleClick)

        return () =>
            document.removeEventListener("mousedown",handleClick)

    },[])

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userid")
        localStorage.removeItem("role")
        navigate("/login", { replace: true })
    }

    return (
        <div>
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200" >
                <div className="max-w-7xl mx-auto px-4" >
                    <div className="h-16 flex items-center justify-between" >
                        {/* Logo */}
                        <Link
                            to="/home"
                            className="flex items-center gap-2 shrink-0"
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#4ecdc4] text-white flex items-center justify-center" >
                                <TbHexagon size={18} />
                            </div>
                            <span className="font-semibold text-gray-800" >
                                SketchBoard
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1" >
                            {navLinks.map((item) => {
                                const Icon = item.icon
                                const active = location.pathname === item.path
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path)
                                        }}
                                        className={`
                                            flex items-center gap-2
                                            px-4 py-2 rounded-lg text-sm
                                            transition
                                            ${active
                                                ? "bg-white shadow-sm text-[#0f6e56]"
                                                : "text-gray-600 hover:text-black"
                                            }
                                            `}
                                    >
                                        <Icon size={16} />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-2" >
                            <button
                                onClick={() => {
                                    setNotifOpen(true)
                                }}
                                className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                            >
                                <IoNotificationsOutline size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#4ecdc4] text-white text-[10px] flex items-center justify-center">
                                        {unreadCount > 9
                                            ? "9+"
                                            : unreadCount
                                        }
                                    </span>
                                )}
                            </button>
                            <div className="relative border-none" ref={profileRef} >
                                <button
                                    onClick={() => {
                                        // navigate("/profile")
                                        setProfileOpen(!profileOpen)
                                    }}
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#e6faf8] text-[#0f6e56] flex items-center justify-center text-xs font-bold" >
                                        {
                                            userId
                                                ? userId.slice(0, 2).toUpperCase()
                                                : "??"
                                        }
                                    </div>
                                </button>
                                {
                                    profileOpen && (
                                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg" >
                                            <button
                                                onClick={() => navigate("/profile")}
                                                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <RiUserLine size={18} />
                                                <span>Profile</span>
                                            </button>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <RiDoorOpenLine size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )
                                }
                            </div>

                            <button
                                onClick={() => {
                                    setMobileOpen(!mobileOpen)
                                }}
                                className="lg:hidden w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                            >
                                {
                                    mobileOpen ? (
                                        <RiCloseLine size={20} />
                                    ) : (
                                        <RiMenuLine size={20} />
                                    )
                                }
                            </button>

                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white" >
                        <div className="p-4 flex flex-col gap-1" >

                            {navLinks.map((item) => {

                                const Icon = item.icon

                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path)
                                            setMobileOpen(false)
                                        }}
                                        className={`
                                            flex items-center gap-3
                                            px-4 py-3
                                            rounded-xl text-sm
                                            ${location.pathname ===
                                                item.path
                                                ? "bg-[#e6faf8] text-[#0f6e56]"
                                                : "hover:bg-gray-50"
                                            }
                                            `}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </button>
                                )
                            })}

                            <div className="border-t mt-2 pt-2" >
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
                                >
                                    <RiDoorOpenLine size={18} />
                                    Logout
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </nav>

            <NotificationModal
                open={notifOpen}
                onClose={() => {
                    setNotifOpen(false)
                }}
                onCountChange={() => {
                    API.get("/api/notifications/unread-count")
                        .then((r) =>
                            setUnreadCount(
                                r.data?.count ?? 0
                            )
                        )
                }}
            />
        </div>
    )
}

export default NavbarV2