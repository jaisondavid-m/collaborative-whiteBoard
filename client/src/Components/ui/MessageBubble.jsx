import React, { useRef, useState } from "react"
import { formatTime } from "../../Pages/Chat.jsx"

function MessageBubble({ msg, isMe, position = "only", onDelete }) {

    const [showModal, setShowModal] = useState(false)
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
        if (!isMe) return
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

    return (
        <>
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-0.5`} >
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
                            <span className="text-[10px] text-gray-400 mt-1 px-0.5" >
                                {formatTime(msg.CreatedAt)}
                            </span>
                        )
                    }

                </div>
            </div>

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