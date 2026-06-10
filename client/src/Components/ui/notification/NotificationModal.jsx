import React, { useEffect, useState, useCallback } from "react"
import { IoClose, IoCheckmarkDoneOutline } from "react-icons/io5"
import { RiBellLine } from "react-icons/ri"
import API from "../../../api/axios"

const TYPE_STYLES = {
    info: { bar: "bg-[#4ecdc4]", badge: "bg-[#e6faf8] text-[#0f6e56]", label: "Info" },
    warning: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700", label: "Warning" },
    alert: { bar: "bg-red-400", badge: "bg-red-50 text-red-700", label: "Alert" },
}

function timeAgo(dateStr) {

    const diff = Date.now() - new Date(dateStr)
    const m = Math.floor(diff / 60000)

    if (m < 1) return "Just now"
    if (m < 60) return `${m}m ago`

    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`

}

function NotificationModal({ open, onClose, onCountChange }) {

    const [notifs, setNotifs] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchNotifs = useCallback(() => {

        if (!open) return
        setLoading(true)

        API.get("/api/notifications")
            .then(res => setNotifs(res.data.notifications ?? []))
            .finally(() => setLoading(false))

    }, [open])

    useEffect(() => {
        fetchNotifs()
    }, [fetchNotifs])

    const markRead = async (id) => {
        await API.put(`/api/notifications/${id}/read`)
        setNotifs(
            prev => prev.map(n =>
                n.ID === id 
                    ? {
                         ...n, 
                         is_read: true ,
                         justRead: true,
                      } 
                    : n
            )
        )
        onCountChange?.()
    }

    const markAllRead = async () => {
        await API.put("/api/notifications/read-all")
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
        onCountChange?.()
    }

    const unread = notifs.filter(n => !n.is_read).length

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-14 pr-6" >
            <div
                className="absolute inset-0"
                onClick={onClose} 
            />
            <div className="relative w-full max-w-md bg-white/90 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-white/40 overflow-hidden font-mono flex flex-col max-h-[80vh]" >
                <div
                    className="absolute -top-2 right-8 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200"
                />
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#f8ffff] to-white" >
                    <div className="flex items-center gap-2" >
                        <RiBellLine size={16} className="text-[#4ecdc4]" />
                        <span className="text-sm font-semibold text-gray-800" >Notifications</span>
                        {unread > 0 && (
                            <span className="px-2 py-0.5 bg-[#4ecdc4] text-white text-[10px] rounded-full animate-pulse" >
                                {unread}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2" >
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#0f6e56] transition-colors"
                            >
                                <IoCheckmarkDoneOutline size={14} /> All read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <IoClose size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1" >
                    {loading && (
                        <div className="text-center py-10 text-xs text-gray-400" >
                            Loading..
                        </div>
                    )}
                    {!loading && notifs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-14 text-gray-400" >
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center" >
                                <RiBellLine size={28} />
                            </div>
                            <p className="text-sm font-medium mt-4" >You're all caught up</p>
                            <p className="text-xs text-gray-400 mt-1" >
                                No new notifications
                            </p>
                        </div>
                    )}
                    {!loading && notifs.map(n => {
                        const s = TYPE_STYLES[n.type] ?? TYPE_STYLES.info
                        return (
                            <div
                                key={n.ID}
                                onClick={() => !n.is_read && markRead(n.ID)}
                                className={`group relative flex gap-3 px-5 py-4 border-b border-gray-100 transition-all duration-200 cursor-pointer hover:translate-x-1 hover:shadow-sm
                                        ${
                                            n.is_read 
                                                ? "bg-white" 
                                                : "bg-[#f7fffe] hover:bg-[#eefaf8]"
                                        }
                                    `}
                            >
                                {/* Color bar */}
                                <div className={`absolute left-0 top-3 bottom-3 w-0.5 ${s.bar} rounded-r`} />
                                <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center ${s.badge}`} >
                                    <RiBellLine size={14} />
                                </div>
                                <div className="flex-1 min-w-0 pl-2" >
                                    <div className="flex items-center justify-between gap-2 mb-0.5" >
                                        <span className="text-xs font-semibold text-gray-800 truncate" >{n.title}</span>
                                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${s.badge}`} >
                                            {s.label}
                                        </span>
                                    </div> 
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2" >{n.message}</p> 
                                    <div className="flex items-center justify-between mt-1.5" >
                                        <span className="text-[10px] text-gray-400" >
                                            {timeAgo(n.CreatedAt)}
                                        </span>
                                        {!n.is_read && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

}

export default NotificationModal