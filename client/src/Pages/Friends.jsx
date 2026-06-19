import React, { useEffect, useState } from "react"
import API from "../api/axios.js"
import {
    RiUserLine,
    RiCheckLine,
    RiCloseLine,
    RiUserAddLine,
    RiTimeLine,
    RiSearchLine,
    RiUserForbidLine,
} from "react-icons/ri"

import { useToast }  from "../hooks/useToast.js"
import ToastContainer from "../Components/ui/Toast.jsx"
import LoadingRows from "../Components/ui/LoadingRows.jsx"
import Empty from "../Components/ui/Empty.jsx"

import FriendsTab from "../Components/ui/FriendTab.jsx"
import AddTab from "../Components/ui/AddTab.jsx"
import BlockedTab from "../Components/ui/BlockedTab.jsx"

import timeAgo from "../utils/TimeAgo.js"


// -- Tabs --
const TABS = [
    { id: "requests",       label: "Requests",      icon: RiTimeLine },
    { id: "friends",        label: "Friends",       icon: RiUserLine },
    { id: "add",            label: "Add Friend",    icon: RiUserAddLine },
    { id: "blocked",        label: "Blocked",       icon: RiUserForbidLine }
]

export const Avatar = ({ id, size = "md" }) => {

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

    useEffect(() => {
        API.get("/api/friends/requests")
            .then(r => setRequests(r.data.data ?? []))
            .catch(() => toast("Failed to load requests", "error"))
            .finally(() => setLoading(false))
    },[])

    const respond = async (requestId, action) => {

        setActing(requestId)

        try {
            await API.put(`/api/friends/request/${requestId}`, { action })
            setRequests(p => p.filter(r => r.ID !== requestId))
            toast(action === "accept" ? "Request accepted!" : "Request declined")
        } catch (e) {
            toast(e.response?.data?.error || "Something went wrong", "error")
        } finally {
            setActing(null)
        }
    }

    if (loading) return <LoadingRows />

    if (!requests.length) {
        return (
            <Empty
                icon={RiTimeLine}
                title="No pending requests"
                sub="When someone sends you a friend request, it shows up here"
            />
        )
    }

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
                            onClick={() => {respond(req.ID, "reject")}}
                            disabled={acting === req.ID}
                            aria-label="Decline"
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-200
                            hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                            <RiCloseLine size={16}/>
                        </button>
                        <button
                            onClick={() => {respond(req.ID, "accept")}}
                            disabled={acting === req.ID}
                            aria-label="Accept"
                            className="w-8 h-8 rounded-lg bg-[#4ecdc4] flex items-center justify-center
                            text-white hover:bg-[#3bb8b0] transition-colors disabled:opacity-40"
                        >
                            {
                                acting === req.ID
                                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <RiCheckLine size={16} />
                            }
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}

// function FriendsTab({ toast }) {
//     return (
//         <div>
//             Friends tab
//         </div>
//     )
// }

// function AddTab({ toast }) {
//     return (
//         <div>
//             Add tab
//         </div>
//     )
// }

function Friends() {

    const [tab, setTab] = useState("friends")
    const { toasts, toast } = useToast()

    return (
        <>
            <ToastContainer toasts={toasts} />
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
                            { tab === "requests" && <RequestTab toast={toast} />  }
                            { tab === "friends"  && <FriendsTab toast={toast} />   }
                            { tab === "add"      && <AddTab toast={toast} />       }
                            { tab === "blocked"  && <BlockedTab toast={toast} /> }
                        </div>

                    </div>
                </div>
            </div>
        </>

    )
}

export default Friends