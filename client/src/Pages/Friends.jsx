import React, { useEffect, useState } from "react"
import API from "../api/axios.js"
import {
    RiUserLine,
    RiCheckLine,
    RiCloseLine,
    RiUserAddLine,
    RiTimeLine,
    RiSearchLine,
} from "react-icons/ri"
import timeAgo from "../utils/TimeAgo.js"


// -- Tabs --
const TABS = [
    { id: "requests",       label: "Requests",      icon: RiTimeLine },
    { id: "friends",        label: "Friends",       icon: RiUserLine },
    { id: "add",            label: "Add Friend",    icon: RiUserAddLine },
]

function Avatar({ id, size = "md" }) {

    const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"

    return (
        <div className={`${dim} rounded-full bg-[#e6faf8] text-[#0f6e56] flex items-center justify-center font-bold shrink-0 font-mono`} >
            {id ? id.slice(0, 2) : "??"}
        </div>
    )

}

function RequestTab({ toast }) {

    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(null)

    return (
        <ul className="divide-y divide-gray-100" >
            {requests.map(req => (
                <li key={req.ID} className="flex items-center gap-3 py-3.5 px-1" >
                    <Avatar id={req.sender_id} />
                    <div className="flex-1 min-w-0" >
                        <p className="text-sm font-medium text-gray-900 font-mono truncate" >
                            {req.sender_id}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5" >
                            {timeAgo(req.CreatedAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" >
                        <button
                            onClick={() => {}}
                            disabled={acting === req.ID}
                            aria-label="Decline"
                            className=""
                        >
                            <RiCloseLin size={16}/>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}

function FriendsTab({ toast }) {
    return (
        <div>
            Friends tab
        </div>
    )
}

function AddTab({ toast }) {
    return (
        <div>
            Add tab
        </div>
    )
}

function Friends() {

    const [tab, setTab] = useState("requests")

    return (
        <>
            <div className="min-h-screen bg-[#f5f5f2] py-8 px-4">
                <div className="max-w-lg mx-auto" >

                    {/* Header */}
                    <div className="mb-6" >
                        <h1 className="text-xl font-semibold text-gray-900 font-mono">Friends</h1>
                        <p className="text-sm text-gray-400 font-mono mt-0.5" >Manage your connections</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" >
                        {/* Top bar */}
                        <div className="flex border-b border-gray-100 bg-gray-50/60" >
                            {TABS.map(t => {

                                const Icon = t.icon
                                const active = tab === t.id

                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium font-mono transition-colors border-b-2
                                                ${
                                                    active
                                                        ? "border-[#4ecdc4] text-[#0f6e56] bg-white"
                                                        : "border-transparent text-gray-400 hover:text-gray-600"
                                                }
                                            `}
                                    >
                                        <Icon size={14} />
                                        {t.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="px-4 py-4 min-h-[300px]" >
                            { tab === "requests" && <RequestTab />  }
                            { tab === "friends"  && <FriendsTab/>   }
                            { tab === "add"      && <AddTab/>       }
                        </div>

                    </div>
                </div>
            </div>
        </>

    )
}

export default Friends