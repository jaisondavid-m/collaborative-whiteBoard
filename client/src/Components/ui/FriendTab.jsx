import React, { useState, useEffect } from "react"
import API from "../../api/axios.js"

import {
    RiSearchLine,
    RiUserLine,
} from "react-icons/ri"


import { Avatar } from "../../Pages/Friends.jsx"
import LoadingRows from "./LoadingRows.jsx"
import Empty from "./Empty.jsx"

function FriendsTab({ toast }) {

    const [friends, setFriends] = useState([])
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState("")

    useEffect(() => {
        API.get("/api/friends/list")
            .then(r => setFriends(r.data.data ?? []))
            .catch(() => toast("Failed to load friends", "error"))
            .finally(() => setLoading(false))
    }, [])

    const filtered = friends.filter(f =>
        f.user_id?.toLowerCase().includes(query.toLowerCase())
    )

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
                                <li key={f.user_id} className="flex items-center gap-3 py-3.5 px-1" >
                                    <Avatar id={f.user_id} />
                                    <div className="flex-1 min-w-0" >
                                        <p className="text-sm font-medium text-gray-900 font-mono truncate" >
                                            {f.user_id}
                                        </p>
                                        {f.role && (
                                            <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.5
                                            rounded-md bg-gray-100 text-gray-500 capitalize" >
                                                {f.role}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#4ecdc4] shrink-0" title="Friend" />
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    )

}

export default FriendsTab