import React from "react"
import { formatTime } from "../../Pages/Chat.jsx"

function MessageBubble({ msg, isMe }) {
    return (
        <div className={`flex items-end gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row" }`} >
            <div className={`max-w-[68%] flex flex-col ${isMe ? "items-end" : "items-start" }`} >
                <div
                    className={`px-3 py-2 text-[13px] font-mono leading-[1.45] break-words
                            ${
                                isMe
                                    ? "bg-[#4ecdc4] text-white rounded-[14px_14px_3px_14px] break-words"
                                    : "bg-white text-gray-900 border border-black/[0.07] rounded-[14px_14px_14px_3px]"
                            }
                        `}
                >
                    {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5" >
                    {formatTime(msg.CreatedAt)}
                </span>
            </div>
        </div>
    )
}

export default MessageBubble