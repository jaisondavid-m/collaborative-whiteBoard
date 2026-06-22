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
        pressTimer.current = setTimeout(() => {
            setShowModal(true)
        },600)
    }

    const handlePressEnd = () => {
        clearTimeout(pressTimer.current)
    }

    const handleDelete = () => {
        setShowModal(false)
        onDelete(msg.ID)
    }

    return (
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
    )
}

export default MessageBubble