import React , { useEffect , useRef , useState } from "react"
import API from "../api/axios.js"

import MessageBubble from "../Components/ui/MessageBubble.jsx"


export const formatTime = (dateStr) => {

    if (!dateStr) return ""

    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// function MessageBubble({ msg, isMe }) {

//     return (
//         <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "" }`} >
//             <div>
//                 {msg.content}
//             </div>
//             <span>{formatTime(msg.CreatedAt)}</span>
//         </div>
//     )
 
// }

function Chat() {

    const myId = localStorage.getItem("userid") || ""

    const [conversations, setConversations] = useState([])
    const [selectedConv, setSelectedConv] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)

    const bottomRef = useRef(null)

    useEffect(() => {
        API.get("/api/messages/conversations")
            .then(res => setConversations(res.data.data ?? []))
            .catch(() => {})
    },[])

    useEffect(() => {
        if (!selectedConv) return
        setMessages([])
        API.get(`/api/messages/${selectedConv}`)
            .then(res => setMessages(res.data.data ?? []))
            .catch(() => {})
    },[selectedConv])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    },[])

    const sendMessage = async () => {

        const text = input.trim()

        if (!text || !selectedConv || sending) return 

        setSending(true)

        try {
            const res = await API.post("/api/messages/send", {
                receiverId: selectedConv,
                content: text,
            })
            setMessages(m => [ ...m. res.data.data ])
            setInput("")
        } catch {} finally {
            setSending(false)
        }
    }

    return (
        <div 
            className="flex overflow-hidden bg-[#f5f5f2] font-mono"
            // style={{ height: "calc(100vh-64px)" }} 
        >
            {/* Sidebar */}
            <aside className="w-[260px] shrink-0 flex flex-col bg-white border-r border-black/[0.08]" >
                <div className="px-3.5 py-3 border-b border-black/[0.06]" >
                    <h2 className="m-0 text-sm font-medium text-gray-900" >Messages</h2>
                </div>  
                <div className="flex-1 overflow-y-auto" >
                    {
                        conversations.map(conv => {

                            const otherId = conv.user1Id === myId ? conv.user2Id : conv.user1Id
                            
                            return (
                                <button
                                    key={conv.ID}
                                    onClick={() => setSelectedConv(otherId)}
                                    className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 border-l-2 transition-colors
                                            ${selectedConv === otherId
                                                ? "bg-[#4ecdc4]/10 border-l-[#4ecdc4]"
                                                : "border-l-transparent hover:bg-black/[0.03]"
                                            }
                                        `}
                                >
                                    <div className="w-9 h-9 rounded-full bg-[#4ecdc4] flex items-center justify-center text-white text-xs font-medium shrink-0" >
                                        {otherId.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-900 truncate" >{otherId}</span>
                                </button>
                            )

                        })
                    }
                </div>
            </aside>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0" >
                {!selectedConv ? (
                    <div className="flex items-center justify-center h-full text-gray-300 font-mono text-sm" >
                        Select a conversation
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-2.5 bg-white border-b border-black/[0.07] shrink-0" >
                            <p className="m-0 text-sm font-medium text-gray-900" >{selectedConv}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col" >
                            {
                                messages.filter(m => !m.isDeleted).map(msg => (
                                    <MessageBubble 
                                        key={msg.ID} 
                                        msg={msg}
                                        isMe={msg.senderId ===  myId}
                                    />
                                ))
                            }
                            <div ref={bottomRef} />
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border-t border-black/[0.07]" >
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage() }
                                placeholder={`Message ${selectedConv}`}
                                className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono outline-none bg-[#f5f5f2] focus:border-[#4ecdc4]"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || sending}
                                className="h-9 px-3.5 rounded-xl text-[13px] font-mono font-medium bg-[#4ecdc4] text-white border-none cursor-pointer disabled:opacity-40"
                            >
                                {sending ? "..." : "Send" }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )

}

export default Chat