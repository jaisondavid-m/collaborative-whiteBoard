import React , { useState } from "react"
import { IoClose } from "react-icons/io5"
import { RiBellLine } from "react-icons/ri"
import API from "../../../api/axios.js"

const TYPES = [
    { value: "info" , label: "Info" , color: "bg-[#4ecdc4]" },
    { value: "warning" , label: "Warning" , color: "bg-amber-400" },
    { value: "alert" , label: "Alert" , color: "bg-red-400" },
]

function SendNotificationModal({ open, onClose, users, onSent }) {

    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [type, setType] = useState("info")
    const [mode, setMode] = useState("broadcast") // broadcast | select
    const [selected, setSelected] = useState([])
    const [sending, setSending] = useState(false)
    const [error, setError] = useState("")

    if (!open) return null

    const toggleUser = (uid) =>
        setSelected(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [ ...prev, uid ])

    const handleSend = async () => {

        if (!title.trim() || !message.trim()) {
            setError("Title and message are required.")
            return
        }

        if (mode === "select" && selected.length === 0) {
            setError("Select at least one recipient.")
            return
        }

        setError("")
        setSending(true)

        try{
            await API.post("/admin/notifications/send", {
                title,
                message,
                type,
                recipients: mode === "broadcast" ? [] : selected,
            })
            setTitle("")
            setMessage("")
            setSelected([])
            setMode("broadcast")
            onSent?.()
            onClose()
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send")
        } finally {
            setSending(false)
        }
    }

    const activeUsers = users.filter(u => !u.is_deleted)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg font-mono overflow-hidden" >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/8" >
                    <div className="flex items-center gap-2" >
                        <RiBellLine size={16} className="text-[#4ecdc4]" />
                        <span className="text-sm font-semibold text-gray-800" >Send Notification</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <IoClose size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto" >
                    {/* Type */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block" >Type</label>
                        <div className="flex gap-2" >
                            {TYPES.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setType(t.value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all
                                            ${type === t.value
                                                ? `border-transparent text-white ${t.color}`
                                                : "border-black/10 text-gray-600 hover:border-gray-300"
                                            }
                                        `}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${type === t.value ? "bg-white" : t.color}`} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block" >Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Notification title..."
                            className="w-full text-sm border border-black/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#4ecdc4] transition-colors placeholder:text-gray-300"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={3}
                            placeholder="Write the message..."
                            className="w-full text-sm border border-black/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#4ecdc4] transition-colors resize-none placeholder:text-gray-300"
                        />
                    </div>

                    {/* Recipients */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block" >Recipients</label>
                        <div className="flex gap-2 mb-3" >
                            {["broadcast","select"].map(m => (
                                <button
                                    key={m}
                                    onClick={() => {setMode(m); setSelected([])}}
                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize
                                            ${mode === m 
                                                ? "bg-[#4ecdc4] text-white border-transparent"
                                                : "border-black/10 text-gray-600 hover:border-gray-300"
                                            }
                                        `}
                                >
                                    {m == "broadcast" ? "Broadcast (All)" : "Select Users" }
                                </button>
                            ))}
                        </div>

                        {mode === "select" && (
                            <div className="border border-black/10 rounded-xl overflow-hidden max-h-44 overflow-y-auto" >
                                {activeUsers.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4" >No users found</p>
                                )}
                                {activeUsers.map(u => (
                                    <label
                                        key={u.userid}
                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-black/5 last:border-0
                                                ${selected.includes(u.userid) ? "bg-[#f0fcfb]" : "hover:bg-gray-50"}
                                            `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(u.userid)}
                                            onChange={() => toggleUser(u.userid)}
                                            className="accent-[#4ecdc4]"
                                        />
                                        <div className="w-6 h-6 rounded-full bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center text-xs font-bold" >
                                            {u.userid.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-gray-700" >{u.userid}</span>
                                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full
                                                ${
                                                    u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                                                }
                                            `} >
                                            {u.role}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {mode === "select" && selected.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1.5" >{selected.length} user(s) selected</p>
                        )}
                    </div>
                    {error && <p className="text-xs text-red-500" >{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/8" >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border border-black/10 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={sending}
                        onClick={handleSend}
                        className="px-5 py-2 text-sm bg-[#4ecdc4] text-white rounded-xl hover:bg-[#3db8b0] disabled:opacity-50  transition-all active:scale-95 font-medium"
                    >
                        {sending ? "Sending..." : mode === "broadcast" ? "Broadcast →" : `Send to selected ${selected.length} users →` }
                    </button>
                </div>
            </div>
        </div>
    )

}

export default SendNotificationModal