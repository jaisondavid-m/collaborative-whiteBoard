import React, { useRef, useState } from "react"
import { formatTime } from "../../Pages/Chat.jsx"

const API_ORIGIN = import.meta.env.API_URL || "http://localhost:8000"

const resolveImageUrl = (path) => {

    if (!path) return ""

    if (/^https?:\/\//i.test(path)) return path

    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`

}

function MessageBubble({ msg, isMe, position = "only", onDelete, onEdit }) {

    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(msg.content)
    const pressTimer = useRef(null)

    const radius = isMe
        ? {
            only: "16px 16px 4px 16px",
            first: "16px 16px 4px 16px",
            mid: "4px 4px 4px 16px",
            last: "4px 16px 4px 16px",
        }[position]
        : {
            only: "16px 16px 16px 4px",
            first: "16px 16px 16px 4px",
            mid: "4px 16px 16px 4px",
            last: "4px 16px 16px 16px",
        }[position];

    const handlePressStart = () => {
        if (!isMe || msg.isDeleted) return
        pressTimer.current = setTimeout(() => {
            setShowModal(true)
        }, 600)
    }

    const handlePressEnd = () => {
        clearTimeout(pressTimer.current)
    }

    const handleDelete = () => {
        setShowModal(false)
        onDelete(msg.ID)
    }

    const handleEditClick = () => {
        setEditText(msg.content)
        setShowModal(false)
        setIsEditing(true)
    }

    const handleSaveEdit = () => {

        const trimmed = editText.trim()

        if (!trimmed || trimmed === msg.content) {
            setIsEditing(false)
            return
        }

        onEdit(msg.ID, trimmed)
        setIsEditing(false)

    }

    const handleCancelEdit = () => {
        setEditText(msg.content)
        setIsEditing(false)
    }

    return (
        <>
            <div
                className={`flex ${isMe ? "justify-end" : "justify-start"} mb-0.5
                ${position === "only" || position === "last" ? "mb-3" : "mb-0.5"}` }
            >
                <div className={`max-w-[62%] flex flex-col ${isMe ? "items-end" : "items-start"}`} >
                    {
                        isEditing ? (
                            <div className="flex flex-col gap-1.5 w-full" >
                                <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSaveEdit()
                                        }
                                        if (e.key === "Escape") {
                                            handleCancelEdit()
                                        }
                                    }}
                                    rows={2}
                                    className="px-3 py-2 text-[12.5px] font-mono leading-relaxed border border-[#4ecdc4] rounded-2xl
                                    outline-none resize-none bg-white text-gray-900 w-full"
                                />
                                <div className="flex items-center gap-2 justify-end" >
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-[10px] px-2 py-1 rounded-md border border-black/10
                                        text-gray-400 bg-transparent cursor-pointer font-mono"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="text-[10px] px-2 py-1 rounded-md bg-[#4ecdc4] text-white
                                        border-none cursor-pointer font-mono"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : msg.isDeleted ? (
                            <div
                                className="px-3 py-2 text-[12.5px] font-mono italic text-gray-400 bg-black/[0.03] border border-black/[0.06]"
                                style={{
                                    borderRadius: radius
                                }}
                            >
                                This message was deleted
                            </div>
                        ) : msg.messageType === "image" ? (
                            <a 
                                href={resolveImageUrl(msg.content)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden"
                                style={{
                                    borderRadius: radius
                                }}
                            >
                                <img
                                    src={resolveImageUrl(msg.content)}
                                    alt="sent attachment" 
                                    loading="lazy"
                                    className="max-w-220px max-h-[280px] w-full object-cover"
                                    onMouseDown={handlePressStart}
                                    onMouseUp={handlePressEnd}
                                    onMouseLeave={handlePressEnd}
                                    onTouchStart={handlePressStart}
                                    onTouchEnd={handlePressEnd}
                                />
                            </a>
                        ) : (
                            <div
                                className={`px-3 py-2 text-[12.5px] font-mono leading-relaxed break-words
                                        ${
                                            isMe
                                                ? "bg-[#4ecdc4] text-white"
                                                : "bg-white text-gray-900 border border-black/[0.07]"
                                        }
                                    `}
                                style={{
                                    borderRadius: radius
                                }}
                                onMouseDown={handlePressStart}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                onTouchStart={handlePressStart}
                                onTouchEnd={handlePressEnd}
                            >
                                {msg.content}
                            </div>
                        )
                    }

                    {
                        !isEditing && (position === "last" || position === "only") && (
                            <span className="text-[10px] text-gray-400 mt-1 px-0.5 flex items-center gap-0.5" >
                                {
                                    msg.isEdited && !msg.isDeleted && (
                                        <span className="italic" >
                                            edited{" "}
                                        </span>
                                    )
                                }
                                {formatTime(msg.CreatedAt)}
                                {isMe && (
                                    <span>
                                        { msg.isRead ? "✓✓" : "✓" }
                                    </span>
                                )}
                            </span>
                        )
                    }

                </div>
            </div>
            {/* <div className={
                `flex ${isMe ? "justify-end" : "justify-start"} mb-0.5
                ${position === "only" || position === "last" ? "mb-3" : "mb-0.5"}`
            } >
                <div className={`max-w-[62%] flex flex-col ${isMe ? "items-end" : "items-start"}`} >
                    <div
                        className={`px-3 py-2 text-[12.5px] font-mono leading-relaxed break-words
                            ${isMe
                                ? "bg-[#4ecdc4] text-white"
                                : "bg-white text-gray-900 border border-black/[0.07]"
                            }
                        `}
                        style={{ borderRadius: radius }}
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                    >
                        {msg.content}
                    </div>
                    {
                        (position === "last" || position === "only") && (
                            <span className="text-[10px] text-gray-400 mt-1 px-0.5 flex items-center gap-0.5" >
                                {formatTime(msg.CreatedAt)}
                                {isMe && (
                                    <span className={`text-[10px] ${msg.isRead ? "text-[#4ecdc4]" : "text-gray-300"}`} >
                                        { msg.isRead ? "✓✓" : "✓" }
                                    </span>
                                )}
                            </span>
                        )
                    }
                </div>
            </div> */}

            {/* Modal */}
            {
                showModal && isMe && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center pb-10"
                        onClick={() => setShowModal(false)}
                    >

                        <div className="absolute inset-0 bg-black/20" />

                        <div
                            className="relative bg-white rounded-2xl shadow-xl w-[250px] overflow-hidden z-10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-4 py-3 border-b border-black/[0.06]" >
                                <p className="text-[11px] text-gray-400 font-mono m-0 truncate" >
                                    {msg.content}
                                </p>
                            </div>
                            <button
                                onClick={handleEditClick}
                                className="w-full text-left px-4 py-3 text-[13px] font-mono text-[#e07b5e] hover:bg-[#e07b5e]/10
                                transition-colors border-none bg-transparent cursor-pointer"
                            >
                                Edit Message
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-3 text-[13px] font-mono text-[#e07b5e] hover:bg-[#e07b5e]/10
                            transition-colors border-none bg-transparent cursor-pointer"
                            >
                                Delete Message
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full text-left px-4 py-3 text-[13px] font-mono text-gray-400 bg-transparent
                            hover:bg-black/[0.07] transition-colors border-none border-t border-black/[0.06] cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )
            }
        </>

    )
}

export default MessageBubble