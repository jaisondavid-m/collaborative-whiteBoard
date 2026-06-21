import React, { useState, useEffect } from "react"
import API from "../../api/axios.js"
import { RiUserFollowLine, RiUserForbidLine } from "react-icons/ri"

import LoadingRows from "./LoadingRows.jsx"
import Empty from "./Empty.jsx"
import { Avatar } from "../../Pages/Friends.jsx"

import ConfirmUnblockModal from "./ConfirmUnblockModal.jsx"

function BlockedTab({ toast }) {

    const [blocked, setBlocked] = useState([])
    const [loading, setLoading] = useState(true)
    const [unblocking, setUnblocking] = useState(null)
    const [unblockTarget, setUnblockingTarget] = useState(null)
    

    useEffect(() => {
        API.get("/api/friends/blocked")
            .then(r => setBlocked(r.data.data ?? []))
            .catch(() => toast("Failed to load blocked users", "error"))
            .finally(() => setLoading(false))
    }, [])

    const unblock = async (userid) => {

        setUnblocking(userid)

        try {
            await API.delete(`/api/friends/block/${userid}`)
            setBlocked(p => p.filter(u => u.userid !== userid))
            toast("User unblocked")
            setUnblockingTarget(null)
        } catch (err) {
            toast(err.response?.data?.error || "Failed to unblock", "error")
        } finally {
            setUnblocking(null)
        }
    }

    if (loading) return <LoadingRows />

    if (!blocked.length) {
        return (
            <Empty
                icon={RiUserForbidLine}
                title="No blocked users"
                sub="Users you block will appear here"
            />
        )
    }

    return (
        <>
            <ul className="divide-y divide-gray-100" >
                {
                    blocked.map(u => (
                        <li key={u.userid} className="flex items-center gap-3 py-3.5 px-1" >
                            <Avatar id={u.userid} />
                            <div className="flex-1 min-w-0" >
                                <p className="text-sm font-medium text-gray-900 font-mono truncate" >
                                    {u.userid}
                                </p>
                            </div>
                            <button
                                onClick={() => setUnblockingTarget(u.userid)}
                                disabled={unblocking === u.userid}
                                className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-200
                            text-gray-500 hover:border-[#4ecdc4] hover:text-[#0f6e56] transition-colors disabled:opacity-40"
                            >
                                {
                                    unblocking === u.userid
                                        ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                                        : "Unblock"
                                }
                            </button>
                        </li>
                    ))
                }
            </ul>
            <ConfirmUnblockModal
                open={Boolean(unblockTarget)}
                title="Unblock this user?"
                target={unblockTarget}
                sub="They'll be able to send you friend requests and messages again"
                icon={RiUserFollowLine}
                confirmLabel="Unblock"
                confirmTone="teal"
                submitting={unblocking === unblockTarget}
                onClose={() => setUnblockingTarget(null)}
                onConfirm={() => unblock(unblockTarget)}
            />
        </>

    )

}

export default BlockedTab