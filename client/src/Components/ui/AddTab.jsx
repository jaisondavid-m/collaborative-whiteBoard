import React, { useState } from "react"

import API from "../../api/axios.js"

import {
    RiUserAddLine
} from "react-icons/ri"

function AddTab({ toast }) {

    const [receiverId, setReceiverId] = useState("")
    const [sending, setSending] = useState(false)

    const send = async () => {

        const id = receiverId.trim()

        if (!id) return

        setSending(true)

        try {
            await API.post("/api/friends/request", { receiver_id: id })
            toast("Friend request send!")
        } catch (e) {
            toast(e.response?.data?.error || "Failed to send request", "error")
        } finally {
            setSending(false)
        }

    }

    return (
        <div className="max-w-sm mx-auto pt-6" >
            <div className="mb-6 text-center" >
                <div className="w-14 h-14 rounded-2xl bg-[#e56faf8] text-[#0f6e56] flex items-center justify-center mx-auto mb-3" >
                    <RiUserAddLine size={14} />
                </div>
                <p className="text-sm text-gray-500 font-mono" >
                    Enter a user ID to send a friend request
                </p>
            </div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-2" >
                User ID
            </label>
            <input
                value={receiverId}
                onChange={e => setReceiverId(e.target.value) }
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="e.g. json2007"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                font-mono outline-none bg-gray-50 focus:border-[#4ecdc4] transition-colors mb-3"
            />
            <button
                onClick={send}
                disabled={!receiverId.trim() || sending}
                className="w-full py-2.5 rounded-xl bg-[#4ecdc4] text-white text-sm font-medium
                font-mono hover:bg-[#3bb8b0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {sending ? "Sending..." : "Send Request" }
            </button>
        </div>
    )
}

export default AddTab