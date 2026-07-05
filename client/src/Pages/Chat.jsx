import React, { useEffect, useRef, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import API from "../api/axios.js"

import MessageBubble from "../Components/ui/MessageBubble.jsx"
import ShowNewChat from "../Components/ui/ShowNewChat.jsx"
import ConversationItem from "../Components/ui/ConversationItem.jsx"
import AvatarCircle from "../utils/AvatarCircle.jsx"

import { useAuthStore } from "../store/authStore.js"

import { Image as ImageIcon, Loader2 } from "lucide-react"
 
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

    const { userid: myId } = useAuthStore()
    // const myId = localStorage.getItem("userid") || ""
    const location = useLocation()
    const navigate = useNavigate()

    const [conversations, setConversations] = useState([])
    const [selectedConv, setSelectedConv] = useState(
        location.state?.userId ?? null
    )
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [sidebarSearch, setSidebarSearch] = useState("")
    const [showNewChat, setShowNewChat] = useState(false)
    const [newChatUser, setNewChatUser] = useState("")
    const [unreadCount, setUnreadCount] = useState(0)
    const [friendStatus, setFriendStatus] = useState(null)
    const [friendshipId, setFriendshipId] = useState(null)
    const [incomingReq, setIncomingReq] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState(new Set())
    const [typingUsers, setTypingUsers] = useState(new Set())
    const [hasMoreMsgs, setHasMoreMsgs] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)


    const bottomRef = useRef(null)
    const wsRef = useRef(null)
    const inputRef = useRef(null)
    const textareaRef = useRef(null)
    const typingTimerRef = useRef(null)
    const selectedConvRef = useRef(selectedConv)
    const messagesContainerRef = useRef(null)
    const prevScrollHeightRef = useRef(0)
    const justPrependedRef = useRef(false)

    const avatarColor = (id) => {
        const colors = [
            { bg: "rgba(78,205,196,0.15)", text: "#0f6e56" },
            { bg: "rgba(83,74,183,0.12)", text: "#3c3489" },
            { bg: "rgba(216,90,48,0.12)", text: "#993c1d" },
            { bg: "rgba(212,83,126,0.12)", text: "#72243e" }
        ]
        const i = id.charCodeAt(0) % colors.length
        return colors[i]
    }

    const fetchConversations = useCallback(() => {
        API.get("/api/messages/conversations")
            .then(res => setConversations(res.data.data ?? []))
            .catch(() => { })
    }, [])

    const fetchUnread = useCallback(() => {
        API.get("/api/messages/unread-count")
            .then(res => setUnreadCount(res.data.unreadCount ?? 0))
            .catch(() => { })
    }, [])

    const loadFriendStatus = useCallback(async (userId) => {

        if (!userId) {
            setFriendStatus(null)
            setFriendshipId(null)
            setIncomingReq(null)
            return
        }

        try {
            const [friendsRes, reqRes, blockedRes, blockedByRes] = await Promise.all([
                API.get("/api/friends/list"),
                API.get("/api/friends/requests"),
                API.get("/api/friends/blocked"),
                API.get(`/api/friends/blocked-by/${userId}`)
            ])
            const friends = friendsRes.data.data ?? []
            const reqs = reqRes.data.data ?? []
            const blocked = blockedRes.data.data ?? []

            const friendship = friends.find(f => f.user1_id === userId || f.user2_id === userId)
            const blockedByThem = blockedByRes.data.blocked

            if (friendship) {
                setFriendStatus("friend")
                setFriendshipId(friendship.friendship_id)
                setIncomingReq(null)
                return
            }

            const isBlocked = blocked.find(b => b.UserID === userId)

            if (blockedByThem) {
                setFriendStatus("blockedByThem")
                setFriendshipId(null)
                setIncomingReq(null)
                return
            }

            if (isBlocked) {
                setFriendStatus("blocked")
                setFriendStatus("blocked")
                setFriendshipId(null)
                setIncomingReq(null)
                return
            }

            const sent = reqs.find(r => r.sender_id === myId && r.receiver_id === userId)
            const received = reqs.find(r => r.sender_id === userId && r.receiver_id === myId)

            if (sent) {
                setFriendStatus("sent")
                setFriendshipId(null)
                setIncomingReq(null)
                return
            }

            if (received) {
                setFriendStatus("received")
                setFriendshipId(null)
                setIncomingReq(received)
                return
            }

            setFriendStatus(null)
            setFriendshipId(null)
            setIncomingReq(null)

        } catch (_) { }

    }, [myId])

    const emitTyping = useCallback((isTyping) => {

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

        if (!selectedConvRef.current) return

        wsRef.current.send(JSON.stringify({
            type: "typing",
            payload: { receiverId: selectedConvRef.current, typing: isTyping }
        }))

    }, [])

    useEffect(() => {
        fetchConversations()
        fetchUnread()
    }, [fetchConversations, fetchUnread])

    useEffect(() => {
        loadFriendStatus(selectedConv)
    }, [selectedConv, loadFriendStatus])

    useEffect(() => {
        selectedConvRef.current = selectedConv
    },[selectedConv])

    useEffect(() => {
        const token = localStorage.getItem("token") || ""
        const ws = new WebSocket(`ws://localhost:8000/ws/private?token=${token}`)
        wsRef.current = ws
        ws.onmessage = (e) => {

            try {

                const event = JSON.parse(e.data)

                if (event.type === "message") {

                    const msg = event.payload
                    setSelectedConv(prev => {
                        if (prev === msg.senderId) {
                            // setMessages(m => [...m, msg])
                            API.put(`/api/messages/${msg.ID}/read`).catch(() => { })
                        } else {
                            setUnreadCount(c => c + 1)
                        }
                        return prev
                    })

                    setTypingUsers(prev => {
                        const next = new Set(prev)
                        next.delete(event.payload.senderId)
                        return next
                    })
                    fetchConversations()

                }

                if (event.type === "presence") {

                    const { userId, online } = event.payload

                    setOnlineUsers(prev => {
                        const next = new Set(prev)
                        online ? next.add(userId) : next.delete(userId)
                        return next
                    })

                }

                if (event.type === "typing") {

                    const { senderId, typing } = event.payload

                    setTypingUsers(prev => {
                        const next = new Set(prev)
                        typing ? next.add(senderId) : next.delete(senderId)
                        return next
                    })

                }

            } catch (_) { }
        }
        ws.onerror = () => { }
        ws.onclose = () => { }
        return () => ws.close()
    }, [fetchConversations])

    useEffect(() => {
        if (!selectedConv) return
        setLoadingMsgs(true)
        setMessages([])
        setHasMoreMsgs(true)
        API.get(`/api/messages/${selectedConv}`, { params: { limit: 30 } })
            .then(res => {
                setMessages(res.data.data ?? [])
                setHasMoreMsgs(res.data.hasMore ?? false)
            })
            .catch(() => { })
            .finally(() => setLoadingMsgs(false))
        fetchUnread()
        setTimeout(() =>
            inputRef.current?.focus()
            , 100)
    }, [selectedConv, fetchUnread])

    useEffect(() => {
        if (justPrependedRef.current) {
            justPrependedRef.current = false
            const container = messagesContainerRef.current
            if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeightRef.current
            }
            return 
        }
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const loadOlderMessages = useCallback(async () => {

        if (!selectedConv || loadingMore || !hasMoreMsgs || messages.length === 0) return 

        const oldestId = messages[0]?.ID

        if (!oldestId) return 

        setLoadingMore(true)

        const container = messagesContainerRef.current

        prevScrollHeightRef.current = container ? container.scrollHeight : 0

        try {
            const res = await API.get(`/api/messages/${selectedConv}`, {
                params: { limit: 30, beforeId: oldestId }
            })
            const older = res.data.data ?? []
            setHasMoreMsgs(res.data.hasMore ?? false)

            if (older.length > 0) {
                justPrependedRef.current = true
                setMessages(m => [...older, ...m])
            }
        } catch {}
        finally {
            setLoadingMore(false)
        }

    }, [selectedConv, loadingMore, hasMoreMsgs, messages])

    const handleMessagesScroll = () => {

        const container = messagesContainerRef.current

        if (!container) return 

        if (container.scrollTop < 60 && hasMoreMsgs && !loadingMore) {
            loadOlderMessages()
        }

    }

    const sendMessage = async () => {

        const text = input.trim()

        if (!text || !selectedConv || sending) return

        emitTyping(false)
        clearTimeout(typingTimerRef.current)
        setSending(true)

        try {
            const res = await API.post("/api/messages/send", {
                receiverId: selectedConv,
                content: text,
            })
            setMessages(m => [...m, res.data.data])
            setInput("")
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
            fetchConversations()
        } catch { } finally {
            setSending(false)
        }
    }

    const grouped = messages.reduce((acc, msg, i, arr) => {

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
    }, [])

    const isBlocked = friendStatus === "blocked"
    const isFriend = friendStatus === "friend"
    const hasSent = friendStatus === "sent"
    const hasReceived = friendStatus === "received"
    const isBlockedByThem = friendStatus === "blockedByThem"
    const canSend = input.trim() && !sending && !isBlocked && !isBlockedByThem

    const filteredConvs = conversations.filter(c => {
        const other = c.user1Id === myId ? c.user2Id : c.user1Id
        return other.toLowerCase().includes(sidebarSearch.toLowerCase())
    })

    // const isNewDay = (curr, prev) => {
    //     if (!prev) return true
    //     return new Date(curr.CreatedAt).toDateString() !== new Date(prev.CreatedAt).toDateString()
    // }

    const fileInputRef = useRef(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    const deleteMessage = async (msgId) => {
        try {
            await API.delete(`/api/messages/${msgId}`)
            setMessages(m => m.filter(x => x.ID !== msgId))
        } catch { }
    }

    const editMessage = async (msgId, newContent) => {
        try {
            const res = await API.put(`/api/messages/${msgId}/edit`, {
                content: newContent,
            })
            setMessages(m =>
                m.map(x => (x.ID === msgId ? { ...x, content: res.data.data.content } : x))
            )
        } catch { }
    }

    const sendImageMessage = async (file) => {

        if (!file || !selectedConv || uploadingImage) return 

        const formData = new FormData()

        formData.append("receiverId", selectedConv)
        formData.append("image", file)

        setUploadingImage(true)

        try {
            const res = await API.post("/api/messages/send-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            setMessages(m => [...m, res.data.data])
            fetchConversations()
        } catch {
            //
        } finally {
            setUploadingImage(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }

    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) sendImageMessage(file)
    }

    const startChat = (userId) => {

        const uid = userId.trim()

        if (!uid || uid === myId) return

        setSelectedConv(uid)
        setShowNewChat(false)
        setNewChatUser("")

    }

    const sendFriendRequest = async () => {
        try {
            await API.post("/api/friends/request", {
                receiver_id: selectedConv
            })
            loadFriendStatus(selectedConv)
        } catch (_) { }
    }

    const removeFriend = async () => {
        try {
            await API.delete(`/api/friends/${friendshipId}`)
            loadFriendStatus(selectedConv)
        } catch (_) { }
    }

    const blockUser = async () => {
        try {
            await API.post(`/api/friends/block/${selectedConv}`)
            loadFriendStatus(selectedConv)
        }
        catch (_) { }
    }

    const unblockUser = async () => {
        try {
            await API.delete(`/api/friends/block/${selectedConv}`)
            loadFriendStatus(selectedConv)
        }
        catch (_) { }
    }

    const respondRequest = async (action) => {

        if (!incomingReq) return

        try {
            await API.put(`/api/friends/request/${incomingReq.ID}`, { action })
            loadFriendStatus(selectedConv)
        }
        catch (_) { }

    }

    return (
        <div
            className="flex overflow-hidden bg-[#f5f5f2] font-mono" style={{ height: "calc(100vh - 56px)" }}
        // style={{ height: "calc(100vh-64px)" }}  
        >
            {/* Sidebar */}
            <aside className="w-[260px] shrink-0 flex flex-col bg-white border-r border-black/[0.08]" >
                <div className="px-3.5 pt-3 pb-2.5 border-b border-black/[0.06] flex flex-col gap-2" >
                    <div className="flex items-center justify-between" >
                        <h2 className="m-0 text-sm font-medium text-gray-900" >Messages</h2>
                        <div className="flex items-center gap-1.5" >
                            {unreadCount > 0 && (
                                <span className="bg-[#4ecdc4] text-white rounded-full text-[10px] px-1.5 py-px font-medium" >
                                    {unreadCount}
                                </span>
                            )}
                            <button
                                onClick={() => setShowNewChat(v => !v)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md border border-black/10
                                    text-base text-gray-500 cursor-pointer transition-colors 
                                        ${showNewChat
                                        ? "bg-[#4ecdc4]/10"
                                        : "bg-transparent hover:bg-black/[0.03]"
                                    }
                                    `}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    {showNewChat && (
                        <ShowNewChat
                            newChatUser={newChatUser}
                            setNewChatUser={setNewChatUser}
                            startChat={startChat}
                        />
                    )}
                    <input
                        value={sidebarSearch}
                        onChange={e => setSidebarSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full text-xs px-2.5 py-1.5 border border-black/10 rounded-lg
                        font-mono outline-none bg-[#f5f5f2] focus:border-[#4ecdc4] transition-colors"
                    />
                </div>
                <div className="flex-1 overflow-y-auto" >
                    {filteredConvs.length === 0 && (
                        <div className="py-8 px-3.5 text-center" >
                            <p className="text-xs text-gray-300 m-0" >
                                No Conversation yet
                            </p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="mt-2.5 text-[11px] text-[#4ecdc4] bg-transparent border-none cursor-pointer underline font-mono"
                            >
                                Start one →
                            </button>
                        </div>
                    )}
                    {
                        filteredConvs.map(conv => (

                            <ConversationItem
                                key={conv.ID}
                                conv={conv}
                                myId={myId}
                                selected={selectedConv === (
                                    conv.user1Id === myId ? conv.user2Id : conv.user1Id
                                )}
                                onClick={() =>
                                    setSelectedConv(conv.user1Id === myId ? conv.user2Id : conv.user1Id)
                                }
                                online={onlineUsers.has(conv.user1Id === myId ? conv.user2Id : conv.user1Id)}
                            />

                            // const otherId = conv.user1Id === myId ? conv.user2Id : conv.user1Id
                            // const color = avatarColor(otherId)

                            // return (
                            //     <button
                            //         key={conv.ID}
                            //         onClick={() => setSelectedConv(otherId)}
                            //         className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 border-l-2 transition-colors
                            //                 ${selectedConv === otherId
                            //                     ? "bg-[#4ecdc4]/10 border-l-[#4ecdc4]"
                            //                     : "border-l-transparent hover:bg-black/[0.03]"
                            //                 }
                            //             `}
                            //     >
                            //         {/* <div className="w-9 h-9 rounded-full bg-[#4ecdc4] flex items-center justify-center text-white text-xs font-medium shrink-0" >
                            //             {otherId.slice(0, 2).toUpperCase()}
                            //         </div> */}
                            //         <div
                            //             style={{ background: color.bg, color: color.text }}
                            //             className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                            //         >       
                            //             {otherId.slice(0, 2).toUpperCase()}
                            //         </div>
                            //         <span className="text-[13px] font-medium text-gray-900 truncate" >{otherId}</span>

                            //     </button>
                            // )

                        ))
                    }
                </div>
                <button
                    onClick={() => navigate("/friends")}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-black/[0.06]
                    text-[11px] text-gray-400 hover:text-[#0f6e56] hover:bg-[#4ecdc4]/5
                    bg-transparent border-none cursor-pointer transition-colors font-mono"
                >
                    <span className="text-base leading-none" >👥</span>
                    Manage friends &amp; blocked
                </button>
            </aside>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col min-w-0" >
                {!selectedConv ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 font-mono gap-2" >
                        <div className="text-4xl" >💬</div>
                        <p className="text-[13px] m-0" >Select a conversation</p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 py-2.5 bg-white border-b border-black/[0.07] flex items-center gap-2.5 shrink-0" >
                            <AvatarCircle userId={selectedConv} size={32} />
                            <div className="flex-1 min-w-0" >
                                <div className="flex items-center gap-1.5" >
                                    <p className="m-0 text-sm font-medium text-gray-900 truncate" >{selectedConv}</p>
                                    {onlineUsers.has(selectedConv) && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] shrink-0" />
                                    )}
                                </div>

                                {typingUsers.has(selectedConv) ? (
                                    <span className="text-[10px] text-[#4ecdc4] font-mono" >typing...</span>
                                ) : (
                                    <>
                                        {isFriend && (
                                            <span
                                                className="text-[9px] text-[#0f6e56] bg-[rgba(78,205,196,0.12)] px-1.5 py-px rounded-full font-mono"
                                            >
                                                Friend
                                            </span>
                                        )}
                                        {isBlocked && (
                                            <span className="text-[9px] text-[#993c1d] bg-[rgba(216,90,48,0.1)] px-1.5 py-px rounded-full font-mono" >
                                                Blocked
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0" >
                                {!isFriend && !hasSent && !hasReceived && !isBlocked && !isBlockedByThem && (
                                    <button
                                        onClick={sendFriendRequest}
                                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#4ecdc4]/10 text-[#0f6e56] border
                                        border-[#4ecdc4]/30 cursor-pointer font-mono hover:bg-[#4ecdc4]/20 transition-colors"
                                    >
                                        + Add friend
                                    </button>
                                )}
                                {hasSent && !isBlockedByThem && (
                                    <span
                                        className="text-[11px] px-2.5 py-1 rounded-lg border border-black/10 text-gray-400 font-mono"
                                    >
                                        Request sent
                                    </span>
                                )}
                                {isFriend && !isBlockedByThem && (
                                    <button
                                        onClick={removeFriend}
                                        className="text-[11px] px-2.5 py-1 rounded-lg border border-black/10 text-gray-200 bg-transparent cursor-pointer font-mono hover:border-[#e07b5e]/40
                                        hover:text-[#e07b5e] transition-colors"
                                    >
                                        Unfriend
                                    </button>
                                )}
                                {!isBlockedByThem && (
                                    !isBlocked ? (
                                        <button
                                            onClick={blockUser}
                                            className="text-[11px] px-2.5 py-1 rounded-lg border border-black/10 text-gray-400 bg-transparent cursor-pointer
                                        font-mono hover:border-[#e07b5e]/40 hover:text-[#e07b5e] transition-colors"
                                        >
                                            Block
                                        </button>
                                    ) : (
                                        <button
                                            onClick={unblockUser}
                                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#e07b5e]/10 text-[#993c1d] border border-[#e07b5e]/30 cursor-pointer font-mono
                                        hover:bg-[#e07b5e]/20 transition-colors"
                                        >
                                            Unblock
                                        </button>
                                    )
                                )}
                            </div>
                            {/* <div
                                style={{ background: avatarColor(selectedConv).bg, color: avatarColor(selectedConv).text }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium"
                            >
                                {selectedConv.slice(0, 2).toUpperCase()}
                            </div> */}
                        </div>
                        {hasReceived && incomingReq && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-[#4ecdc4]/5 border-b border-[#4ecdc4]/20 shrink-0" >
                                <p className="flex-1 text-[12px] text-gray-600 font-mono m-0" >
                                    <span className="font-medium" >{selectedConv}</span> sent you a friend request
                                </p>
                                <button
                                    onClick={() => respondRequest("accept")}
                                    className="text-[11px] px-2 py-1 rounded-md bg-[#4ecdc4] text-white border-none cursor-pointer font-mono"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => respondRequest("reject")}
                                    className="text-[11px] px-2 py-1 rounded-md border
                                    border-black/10 text-gray-400 bg-transparent cursor-pointer font-mono"
                                >
                                    Decline
                                </button>
                            </div>
                        )}

                        {isBlocked && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#e07b5e]/5 border-b border-[#e07b5e]/20 shrink-0" >
                                <span className="text-[#e07b5e]" >⊘</span>
                                <p className="text-[12px] text-[#993c1d] font-mono m-0 flex-1" >
                                    You have blocked this user. Unblock to send messages.
                                </p>
                            </div>
                        )}
                        {isBlockedByThem && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/[0.03] border-b border-black/[0.06] shrink-0" >
                                <span className="text-gray-400" >⊘</span>
                                <p className="text-[12px] text-gray-400 font-mono m-0 flex-1" >
                                    You cannot message this user.
                                </p>
                            </div>
                        )}

                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col"
                            onScroll={handleMessagesScroll}
                        >
                            {loadingMore && (
                                <p className="text-[10px] text-gray-300 text-center font-mono mb-2" >
                                    Loading earlier messages.
                                </p>
                            )}
                            {loadingMsgs && (
                                <p className="text-xs text-gray-300 text-center m-auto" >
                                    Loading...
                                </p>
                            )}
                            {!loadingMsgs && grouped.length === 0 && !isBlocked && !isBlockedByThem && (
                                <div className="m-auto text-center text-gray-300" >
                                    <div className="text-3xl mb-2" >👋🏿</div>
                                    <p className="text-xs font-mono" >Say hello to {selectedConv}</p>
                                </div>
                            )}
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
                                        onDelete={deleteMessage}
                                        onEdit={editMessage}
                                    />
                                ))
                            }
                            <div ref={bottomRef} />
                        </div>

                        <div className="flex items-end gap-2 px-3.5 py-2.5 bg-white border-t border-black/[0.07] shrink-0" >
                            {/* <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage() }
                                placeholder={`Message ${selectedConv}`}
                                className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono outline-none bg-[#f5f5f2] focus:border-[#4ecdc4]"
                            /> */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isBlocked || isBlockedByThem || uploadingImage}
                                className={`h-9 w-9 flex items-center justify-center rounded-xl border border-black/10 shrink-0 text-base
                                        ${
                                            isBlocked || isBlockedByThem
                                                ? "text-gray-200 cursor-not-allowed bg-black/[0.03]"
                                                : "text-gray-500 bg-[#f5f5f2] hover:bg-black/[0.05] cursor-pointer"
                                        }
                                    `}
                                title="Send image"
                            >
                                {
                                    uploadingImage
                                        ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <ImageIcon size={18} strokeWidth={1.8} />
                                        )
                                }
                            </button>
                            <textarea
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value)
                                    e.target.style.height = "auto"
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                                    emitTyping(true)
                                    clearTimeout(typingTimerRef.current)
                                    typingTimerRef.current = setTimeout(() => emitTyping(false), 2000)
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder={isBlocked || isBlockedByThem ? "You can't message this user" : `Message ${selectedConv}`}
                                rows={1}
                                disabled={isBlocked || isBlockedByThem}
                                // className={`flex-1 resize-none focus:border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono outline-none 
                                // bg-[#f5f5f2] focus:border-[#4ecdc4] min-h-[36px]`}
                                className={`flex-1 resize-none border border-black/10 rounded-xl px-3 py-2 text-[13px] font-mono
                                        outline-none leading-relaxed transition-colors focus:border-[#4ecdc4] min-h-[36px] 
                                            ${isBlocked || isBlockedByThem ? "bg-black/[0.03] text-gray-300 cursor-not-allowed" : "bg-[#f5f5f2]"}
                                    `}
                                style={{ maxHeight: 120 }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!canSend}
                                // className="h-9 px-3.5 rounded-xl text-[13px] font-mono font-medium bg-[#4ecdc4] text-white border-none cursor-pointer disabled:opacity-40"
                                className={`h-9 px-3.5 rounded-xl text-[13px] font-mono font-medium shrink-0 border-none transition-colors
                                        ${canSend
                                        ? "bg-[#4ecdc4] text-white cursor-pointer hover:bg-[#3ab8b0]"
                                        : "bg-black/[0.06] text-gray-300 cursor-default"
                                    }
                                    `}
                            >
                                {sending ? "..." : "Send"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )

}

export default Chat