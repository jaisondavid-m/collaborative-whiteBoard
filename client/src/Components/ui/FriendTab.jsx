import React, { useState, useEffect } from "react"
import API from "../../api/axios.js"

import {
    RiSearchLine,
    RiUserForbidLine,
    RiUserLine,
} from "react-icons/ri"


import { Avatar } from "../../Pages/Friends.jsx"
import LoadingRows from "./LoadingRows.jsx"
import Empty from "./Empty.jsx"

import ConfirmBlockModal from "./ConfirmBlockModal.jsx"

function FriendsTab({ toast }) {

    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState("")
    const [blocking, setBlocking] = useState(null)
    const [blockTarget, setBlockTarget] = useState(null)

    useEffect(() => {
        API.get("/api/friends/list")
            .then(r => setFriends(r.data.data ?? []))
            .catch(() => toast("Failed to load friends", "error"))
            .finally(() => setLoading(false))
    }, [])

    const filtered = friends.filter(f =>
        f.userid?.toLowerCase().includes(query.toLowerCase())
    )

    const handleBlock = async (id) => {

        // if (!window.confirm(`Block ${id}? This removes them as a friend`)) return

        setBlocking(id)

        try {

            await API.post(`/api/friends/block/${id}`)
            setFriends(p => p.filter(f => f.userid !== id))
            toast(`${id} blocked`)
            setBlockTarget(null)

        } catch (err) {
            toast(err.response?.data?.error || "Failed to block user", "error")
        } finally {
            setBlocking(null)
        }

    }

    if (loading) return <LoadingRows />

    return (
        <div>
            {
                friends.length > 0 && (
                    <div className="relative mb-4" >
                        <RiSearchLine
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200"
                        />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search friends..."
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm font-mono bg-gray-50 outline-none focus:border-[#4ecdc4] transition-colors"
                        />
                    </div>
                )
            }

            {
                !filtered.length ? (
                    <Empty
                        icon={RiUserLine}
                        title={query ? "No match" : "No friends yet"}
                        sub={query ? "Try a different name" : "Accept a request or send one to get started"}
                    />
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {
                            filtered.map(f => (
                                <li key={f.userid} className="flex items-center gap-3 py-3.5 px-1" >
                                    <Avatar id={f.userid} />
                                    <div className="flex-1 min-w-0" >
                                        <p className="text-sm font-medium text-gray-900 font-mono truncate" >
                                            {f.userid}
                                        </p>
                                        {f.role && (
                                            <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.5
                                            rounded-md bg-gray-100 text-gray-500 capitalize" >
                                                {f.role}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0" >
                                        <button
                                            onClick={() => setBlockTarget(f.userid)}
                                            disabled={blocking === f.userid}
                                            aria-label="Block"
                                            title="Block"
                                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300
                                            hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-40"
                                        >
                                            <RiUserForbidLine size={15} />
                                        </button>
                                        <div className="w-2 h-2 rounded-full bg-[#4ecdc4] shrink-0" title="Friend" />
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                    
                )
            }
            <ConfirmBlockModal
                target={blockTarget}
                onClose={() => setBlockTarget(null)}
                onConfirm={handleBlock}
            />
        </div>
    )

}

export default FriendsTab