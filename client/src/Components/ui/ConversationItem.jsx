import React from "react"
import AvatarCircle from "../../utils/AvatarCircle"
import timeAgo from "../../utils/TimeAgo.js"

function ConversationItem({ conv, myId, selected, onClick, online }) {

    const otherId = conv.user1Id === myId ? conv.user2Id : conv.user1Id
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 border-l-2 transition-colors
                    ${selected
                    ? "bg-[#4ecdc4]/10 border-l-[#4ecdc4]"
                    : "border-l-transparent hover:bg-black/[0.03]"
                }
                `}
        >
            <div className="relative shrink-0" >
                <AvatarCircle userId={otherId} />
                {online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#4ecdc4] border-2 border-white" />
                )}
            </div>
            <div className="flex-1 min-w-0" >
                <div className="flex justify-between items-baseline" >
                    <span className="text-[13px] font-medium text-gray-900 truncate" >
                        {otherId}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1 font-mono" >
                        {timeAgo(conv.UpdatedAt)}
                    </span>

                </div>
                <p className="text-xs text-gray-400 truncate m-0" >
                    {conv.lastSender === myId ? "You: " : ""} {conv.lastMessage || "..."}
                </p>
            </div>
        </button>
    )
}

export default ConversationItem