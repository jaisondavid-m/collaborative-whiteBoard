import React , { useEffect , useRef , useState } from "react"
import { useLocation } from "react-router-dom"
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
    const location = useLocation()

    const [conversations, setConversations] = useState([])
    const [selectedConv, setSelectedConv] = useState(
        location.state?.userId ?? null
    )
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)

    const bottomRef = useRef(null)

    const avatarColor = (id) => {
        const colors = [
            { bg: "rgba(78,205,196,0.15)" , text: "#0f6e56" },
            { bg: "rgba(83,74,183,0.12)" , text: "#3c3489" },
            { bg: "rgba(216,90,48,0.12)" , text: "#993c1d" },
            { bg: "rgba(212,83,126,0.12)" , text: "#72243e" }
        ]
        const i = id.charCodeAt(0) % colors.length
        return colors[i]
    }

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
    },[messages])

    const sendMessage = async () => {

        const text = input.trim()

        if (!text || !selectedConv || sending) return 

        setSending(true)

        try {
            const res = await API.post("/api/messages/send", {
                receiverId: selectedConv,
                content: text,
            })
            setMessages(m => [...m, res.data.data])
            setInput("")
        } catch {} finally {
            setSending(false)
        }
    }

    const grouped = messages.filter(m => !m.isDeleted).reduce((acc, msg, i, arr) => {

        const prev = arr[i - 1]
        const next = arr[i + 1]
        const samePrev = prev?.senderId === msg.senderId
        const sameNext = next?.senderId === msg.senderId
        const position = samePrev && sameNext ? "mid"
            : samePrev ? "last"
            : sameNext ? "first"
            : "only";
        acc.push({ ...msg, position })
        return acc
    },[])

    const isNewDay = (curr, prev) => {
        if (!prev) return true
        return new Date(curr.CreatedAt).toDateString() !== new Date(prev.CreatedAt).toDateString()
    }

    return (
        <div 
            className="flex overflow-hidden bg-[#f5f5f2] font-mono" style={{ height: "calc(100vh - 56px)" }}
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
                            const color = avatarColor(otherId)
                            
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
                                    {/* <div className="w-9 h-9 rounded-full bg-[#4ecdc4] flex items-center justify-center text-white text-xs font-medium shrink-0" >
                                        {otherId.slice(0, 2).toUpperCase()}
                                    </div> */}
                                    <div
                                        style={{ background: color.bg, color: color.text }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                                    >       
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
                        <div className="px-4 py-3 bg-white border-b border-black/[0.07] flex items-center gap-2.5 shrink-0" >
                            <div
                                style={{ background: avatarColor(selectedConv).bg, color: avatarColor(selectedConv).text }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium"
                            >
                                {selectedConv.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="m-0 text-sm font-medium text-gray-900" >{selectedConv}</p>
                            {/* <p className="m-0 text-sm font-medium text-gray-900" >{selectedConv}</p> */}
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col" >
                            {
                                // messages.filter(m => !m.isDeleted).map(msg => (
                                //     <MessageBubble 
                                //         key={msg.ID} 
                                //         msg={msg}
                                //         isMe={msg.senderId ===  myId}
                                //     />
                                // ))
                                grouped.map(msg => (
                                    <MessageBubble
                                        key={msg.ID}
                                        msg={msg}
                                        // msg={msg}
                                        isMe={msg.senderId === myId}
                                        position={msg.position}
                                    />
                                ))
                            }
                            <div ref={bottomRef} />
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border-t border-black/[0.07]" >
                            {/* <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage() }
                                placeholder={`Message ${selectedConv}`}
                                className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono outline-none bg-[#f5f5f2] focus:border-[#4ecdc4]"
                            /> */}
                            <textarea
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value)
                                    e.target.style.height = "auto"
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder={`Message ${selectedConv}`}
                                rows={1}
                                className="flex-1 resize-none focus:border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono outline-none 
                                bg-[#f5f5f2] focus:border-[#4ecdc4] min-h-[36px]"
                                style={{ maxHeight: 120 }}
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