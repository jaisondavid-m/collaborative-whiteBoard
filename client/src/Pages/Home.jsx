import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import API from "../api/axios.js"

function Home() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [recentRooms, setRecentRooms] = useState([])
    const [stats, setStats] = useState({ active: 0, sessions: 0, collaborators: 0 })

    // const recentRooms = [
    //     { id: "alpha-01", name: "Project X", users: 2, live: true },
    //     { id: "sys-02", name: "System Design", users: 1, live: false, ago: "2h ago" },
    //     { id: "ux-033", name: "UX Brainstorm", users: 0, live: false, ago: "Yesterday" }
    // ]

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr)
        const h = Math.floor(diff/36e5)
        if (h < 1) return "Just Now"
        if (h < 24) return `${h}h ago`
        return `${Math.floor(h/24)}d ago`
    }

    useEffect(() => {
        API.get("/api/room/list")
            .then(res => {
                setRecentRooms(res.data.rooms ?? [])
            })
            .catch(() => {
                setError("Failed to load rooms")
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono">
            <header className="h-14 bg-white border-b border-black/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-7 h-7 bg-[#4ecdc4] rounded-md flex items-center justify-center text-white text-sm">⬡</span>
                    SketchBoard
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/room")}
                        className="flex items-center gap-1.5 text-sm border border-black/20 px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors"
                    >
                        + New Room
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center text-xs font-medium  select-none">
                        User
                    </div>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-medium text-gray-900 mb-1">Welcome Back !!</h1>
                <p className="text-sm text-gray-500 mb-8">Pick Up where you left off or start a new session.</p>

                <div className="grid grid-cols-3 gap-3 mb-10">
                    {[
                        { label: "Active rooms", value: recentRooms.filter(r => r.live).length },
                        { label: "Sessoins this week", value: 12 },
                        { lable: "Collaborators", value: 4 },
                    ].map(s => (
                        <div key={s.label} className="bg-black/[0.04] rounded-lg p-4 text-center">
                            <p className="text-2xl font-medium text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-800">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-10">
                    <button
                        onClick={() => navigate("/room")}
                        className="bg-white border border-black/10 rounded-xl p-4 text-left hover:border-[#4ecdc4] transition-colors group"
                    >
                        <span className="text-xl block mb-2">✏️</span>
                        <p className="text-sm font-medium text-gray-800">Create a Room</p>
                        <p className="text-xs text-gray-400 mt-0.5">Start a new whiteboard session</p>
                    </button>
                    <button
                        onClick={() => navigate("/room")}
                        className="bg-white border border-black/10 rounded-xl p-4 text-left hover:border-[#4ecdc4] transition-colors"
                    >
                        <span className="text-xl block mb-2">🔗</span>
                        <p className="text-sm font-medium text-gray-800">Join a room</p>
                        <p className="text-xs text-gray-400 mt-0.5">Enter with an existing room ID</p>
                    </button>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-800">Recent Rooms</h2>
                    <button
                        onClick={() => navigate("/room")}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Manage Rooms →
                    </button>
                </div>
                {loading && <p className="text-sm text-gray-400 text-center py-6">Loading rooms...</p>}
                {error && <p className="text-sm text-gray-400 text-center py-6">{error}</p>}
                {!loading && recentRooms.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-center text-sm">
                        No rooms yet. Create one to get started.
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {recentRooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => navigate(`/whiteboard/${room.roomId}`)}
                            className="bg-white border border-black/10 rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#4ecdc4] transition-colors text-left w-full"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-lg bg-[#e1f5ee] flex items-center justify-center text-base">
                                    🗺
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{room.name}</p>
                                    <p className="text-xs text-gray-400">{room.roomId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                                {room.live
                                    ? <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] inline-block" />
                                        <span className="text-[#0f6e56]">Live · {room.users}</span>
                                    </>
                                    : <span className="text-gray-400">{timeAgo(room.UpdatedAt)}</span>
                                }
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Home