import React, { useEffect, useRef, useState, useCallback } from "react"

import { useParams, useNavigate, useLocation } from "react-router-dom"

import { joinRoomSocket } from "../api/room.api.js"

import { useAuthStore } from "../store/authStore.js"

import { useToast } from "../hooks/useToast.js"
import ToastContainer from "../Components/ui/Toast.jsx"

const TOOLS = {
    pen: { label: "Pen", icon: "✏️", cursor: "crosshair" },
    eraser: { label: "Eraser", icon: "⬜", cursor: "cell" },

    rectangle: { label: "Rectangle", icon: "▭", cursor: "crosshair" },
    circle: { label: "Circle", icon: "◯", cursor: "crosshair" },
    line: { label: "Line", icon: "/", cursor: "crosshair" }
}

const COLORS = [
    "#1a1a2e", "#e94560", "#0f3460", "#533483",
    "#f5a623", "#7ed321", "#ffffff", "#ff6b6b",
    "#4ecdc4", "#45b7d1"
]

const SIZES = [2, 5, 10, 20, 40]

function Whiteboard() {

    const { token } = useAuthStore()
    const { roomId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const roomPassword = location.state?.password || ""

    const canvasRef = useRef(null)
    const socketRef = useRef(null)
    const drawingRef = useRef(false)
    const startPosRef = useRef({ x: 0, y: 0 })
    const lastPosRef = useRef({ x: 0, y: 0 })
    const chatContainerRef = useRef(null)

    const [tool, setTool] = useState("pen")
    const [color, setColor] = useState("#1a1a2e")
    const [size, setSize] = useState(5)
    const [connected, setConnected] = useState(false)
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState("")

    const { toasts, toast } = useToast()

    const myUserID = localStorage.getItem("userid") || "anonymous"

    const drawSegment = useCallback((ctx, event) => {
        const isErase = event.color === "#eraser"
        ctx.save()
        ctx.globalCompositeOperation = isErase ? "destination-out" : "source-over"
        ctx.strokeStyle = isErase ? "rgba(0,0,0,1)" : event.color
        ctx.lineWidth = event.size
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(event.prevX, event.prevY)
        ctx.lineTo(event.x, event.y)
        ctx.stroke()
        ctx.restore()
    }, [])

    const drawShape = useCallback((ctx, shape) => {

        ctx.save()

        ctx.strokeStyle = shape.color
        ctx.lineWidth = shape.size
        ctx.lineCap = "round"

        const width = shape.x - shape.startX
        const height = shape.y - shape.startY

        if (shape.tool === "rectangle") {
            ctx.strokeRect(
                shape.startX,
                shape.startY,
                width,
                height,
            )
        } else if (shape.tool === "circle") {
            const radius = Math.sqrt(width * width + height * height)
            ctx.beginPath()
            ctx.arc(
                shape.startX,
                shape.startY,
                radius,
                0,
                Math.PI * 2
            )
            ctx.stroke()
        } else if (shape.tool === "line") {
            ctx.beginPath()
            ctx.moveTo(shape.startX, shape.startY)
            ctx.lineTo(shape.x, shape.y)
            ctx.stroke()
        }
        ctx.restore()
    }, [])

    const replayHistory = useCallback((events) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        events.forEach(ev => {
            if (ev.type === "draw") drawSegment(ctx, ev)
            else if (ev.type === "shape") drawShape(ctx, ev)
        })
    }, [drawSegment])

    useEffect(() => {

        const container = chatContainerRef.current

        // chatEndRef.current?.scrollIntoView({ behavior: "smooth" })

        if (container) {
            container.scrollTop = container.scrollHeight
        }

        // const ws = joinRoomSocket(roomId)
        // socketRef.current = ws

        // ws.onopen = () => setConnected(true)
        // ws.onclose = () => setConnected(false)

        // ws.onmessage = (event) => {
        //     try {
        //         const msg = JSON.parse(event.data)
        //         const canvas = canvasRef.current
        //         if (!canvas) return
        //         const ctx = canvas.getContext("2d")

        //         if (msg.type === "sync") replayHistory(msg.events)
        //         else if (msg.type)
        //     }
        // }

    }, [messages])

    // useEffect(() => {

    //     const socket = joinRoomSocket(roomId)

    //     socket.onopen = () => {
    //         console.log("Connected")
    //     }

    //     socket.onmessage = (event) => {
    //         console.log(event.data)
    //     }

    //     return () => {
    //         socket.close()
    //     }

    // },[roomId])

    useEffect(() => {

        if (!token) {
            navigate("/login")
            return
        }

        let cancelled = false
        let reconnectAttempt = 0
        let reconnectTimer = null

        const connect = () => {
            const ws = joinRoomSocket(roomId, token, roomPassword)
            socketRef.current = ws
            ws.onopen = () => {
                if (cancelled) return
                setConnected(true)
                reconnectAttempt = 0
            }
            ws.onclose = () => {
                if (cancelled) return
                setConnected(false)
                const delay = Math.min(1000 * 2 ** reconnectAttempt, 15000)
                reconnectAttempt++
                reconnectTimer = setTimeout(connect, delay)
            }
            ws.onerror = () => {
                if (!cancelled) toast("Connection error - retrying")
            }
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data)
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const ctx = canvas.getContext("2d")

                    if (msg.type === "sync") replayHistory(msg.events)
                    else if (msg.type === "draw") drawSegment(ctx, msg)
                    else if (msg.type === "clear") ctx.clearRect(0, 0, canvas.width, canvas.height)
                    else if (msg.type === "presence") setUsers(msg.users)
                    else if (msg.type === "chat") setMessages(prev => [...prev, msg])
                    else if (msg.type === "shape") drawShape(ctx, msg)
                } catch { }
            }
        }

        connect()


        return () => {
            cancelled = true
            clearTimeout(reconnectTimer)
            socketRef.current?.close()
        }
    }, [roomId, token, drawSegment, replayHistory,])


    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const resize = () => {
            const ctx = canvas.getContext("2d", { willReadFrequently: true })
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
            // ctx.getContext("2d", { willReadFrequently: true }).putImageData(imageData, 0, 0)
            ctx.putImageData(imageData, 0, 0)
        }
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const ro = new ResizeObserver(resize)
        ro.observe(canvas)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (location.state?.flash) {
            toast(location.state.flash)
        }
    }, [])

    function getPos(e, canvas) {
        const rect = canvas.getBoundingClientRect()
        if (e.touches && e.touches.length > 0) return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const sendEvent = (type, payload = {}) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, ...payload }))
        }
    }

    const onPointerDown = (e) => {
        e.preventDefault()
        drawingRef.current = true
        const pos = getPos(e, canvasRef.current)
        startPosRef.current = pos
        lastPosRef.current = pos
        sendEvent("begin", { x: pos.x, y: pos.y, color: tool === "eraser" ? "#eraser" : color, size })
    }

    const onPointerMove = (e) => {
        e.preventDefault()
        if (!drawingRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const pos = getPos(e, canvas)

        if (tool === "pen" || tool === "eraser") {
            const prev = lastPosRef.current
            const payload = {
                x: pos.x,
                y: pos.y,
                prevX: prev.x,
                prevY: prev.y,
                color: tool === "eraser" ? "#eraser" : color,
                size,
            }
            drawSegment(ctx, { ...payload, type: "draw" })
            sendEvent("draw", payload)
            lastPosRef.current = pos
        }
        // const prev = lastPosRef.current
        // const payload = {
        //     x: pos.x, y: pos.y,
        //     prevX: prev.x, prevY: prev.y,
        //     color: tool === "eraser" ? "#eraser" : color,
        //     size,
        // }
        // drawSegment(ctx, {...payload, type: "draw"})
        // sendEvent("draw",payload)
        // lastPosRef.current = pos
    }

    const onPointerUp = (e) => {
        if (!drawingRef.current) return
        drawingRef.current = false
        if (
            tool === "rectangle" ||
            tool === "circle" ||
            tool === "line"
        ) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")

            const pos = getPos(e, canvas)

            const payload = {
                tool,
                startX: startPosRef.current.x,
                startY: startPosRef.current.y,
                x: pos.x,
                y: pos.y,
                color,
                size,
            }
            drawShape(ctx, payload)
            sendEvent("shape", payload)
        }
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
        sendEvent("clear")
    }

    const sendChat = () => {

        const text = chatInput.trim()
        if (!text) return
        sendEvent("chat", { text })
        setChatInput("")

    }

    const formatTime = (ts) => {
        if (!ts) return ""
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="h-screen flex flex-col bg-[#0d0d14] text-[#e0e0e0] font-mono">
            {/* <h1 className="text-4xl font-bold">WhiteBoard Room: {roomId}</h1> */}
            <header className="flex items-center justify-between px-5 h-12 bg-[#13131f] border-b border-[#1f1f33] shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-transparent border border-[#2a2a40] text-[#aaa] px-3 py-1 rounded-md cursor-pointer text-base hover:border-[#4ecdc4] transition-colors"
                    >
                        ←
                    </button>
                    <span className="flex items-center gap-1.5 text-sm tracking-widest">
                        <span className="text-[#4ecdc4] text-lg">⬡</span>
                        {roomId}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${connected ? "bg-[#4ecdc4]" : "bg-[#e94560] animate-pulse"}`} />
                    <span className="text-xs text-[#888] tracking-widest">
                        {connected ? "Live" : "Offline"}
                    </span>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden lg:flex w-[92px] bg-[#13133f] border-r border-[#1f1f33] flex flex-col py-4 gap-2 shrink-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
                    <section className="flex flex-col gap-1.5 px-2.5 pb-3 border-b border-[#1f1f33]">
                        <p className="text-[8px] tracking-[1.5px] text-[#444] text-center mb-1">Tool</p>
                        {Object.entries(TOOLS).map(([key, t]) => (
                            <button
                                key={key}
                                title={t.label}
                                onClick={() => setTool(key)}
                                className={`flex flex-col items-center gap-1 text-lg p-2.5 rounded-lg cursor-pointer border transition-all duration-150 ${tool === key
                                    ? "bg-[#1e1e30] border-[#4ecdc4] shadow-[0_0_8px_rgba(78,205,196,0.4)] scale-105"
                                    : "bg-transparent border-transparent hover:bg-[#1a1a28] hover:scale-105"
                                    }`}
                            >
                                <span>{t.icon}</span>
                                <span className="text-[8px] text-[#888] tracking-wide" >{t.label}</span>
                            </button>
                        ))}
                    </section>
                    <section
                        className="flex flex-col gap-2 px-3 py-4 border-b border-[#1f1f33]"
                    >
                        <p className="text-[8px] tracking-[1.5px] text-[#444] text-center mb-1">COLOR</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setColor(c);
                                        setTool("pen")
                                    }}
                                    className="w-[26px] h-[26px] rounded-[6px] cursor-pointer transition-transform hover:scale-110"
                                    style={{
                                        background: c,
                                        border: color === c ? "2px solid #4ecdc4" : "2px solid transparent",
                                        boxShadow: color === c ? "0 0 0 2px rgba(78,205,196,0.3)" : "none",
                                        transform: color === c ? "scale(1.1)" : "scale(1)"
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                    <section className="flex flex-col gap-2 px-3 py-4 border-b border-[#1f1f33]">
                        <p className="text-[8px] tracking-[1.5px] text-[#444] text-center mb-1">SIZE</p>
                        {SIZES.map(s => (
                            <button
                                key={s}
                                onClick={() => setSize(s)}
                                className={`py-1.5 rounded-md cursor-pointer border transition-all
                                        ${size === s
                                        ? "bg-[#1e1e30] border-[#4ecdc4]"
                                        : "bg-transparent border-transparent hover:bg-[#1a1a28]"
                                    }
                                    `}
                            >
                                <div
                                    className="rounded-full mx-auto"
                                    style={{
                                        width: Math.min(s, 20),
                                        height: Math.min(s, 20),
                                        background: size === s ? "#4ecdc4" : "#666"
                                    }}
                                />
                            </button>
                        ))}
                    </section>
                    <section className="flex flex-col px-2.5 pt-3 mt-auto">
                        <button
                            onClick={clearCanvas}
                            className="bg-transparent border border-[#3a1a1a] text-[#e94560] rounded-lg py-2 cursor-pointer text-lg w-full hover:bg-[#2a1010] transition-colors"
                        >
                            🗑<br /><span className="text-[9px]">CLEAR</span>
                        </button>
                    </section>
                </aside>
                <div className="flex-1 bg-[#f8f8f4] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full block touch-none"
                        style={{ cursor: TOOLS[tool]?.cursor ?? "crosshair" }}
                        onMouseDown={onPointerDown}
                        onMouseMove={onPointerMove}
                        onMouseUp={onPointerUp}
                        onMouseLeave={onPointerUp}
                        onTouchStart={onPointerDown}
                        onTouchMove={onPointerMove}
                        onTouchEnd={(e) => onPointerUp(e.changedTouches[0])}
                    />
                </div>
                <aside className="hidden lg:flex w-[220px] bg-[#13131f] border-l border-[#1f1f33] flex flex-col shrink-0">
                    <div className="px-3 py-2 border-b border-[#1f1f33]">
                        <p className="text-[8px] tracking-[1.5px] text-[#444] mb-2">ONLINE - {users.length}</p>
                        <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto">
                            {users.length === 0 && (
                                <div className="flex flex-col items-center gap-1 text-[#444] py-4" >
                                    <span className="text-lg opacity-40" >👥</span>
                                    <span className="text-[10px] text-[#444]">No users Yet</span>
                                </div>

                            )}
                            {users.map(u => (
                                <div key={u} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] shrink-0" />
                                    <span className={`text-[11px] truncate ${u === myUserID ? "text-[#4ecdc4]" : "text-[#aaa]"}`}>
                                        {u === myUserID ? `${u} (you)` : u}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
                        {messages.length === 0 && (
                            <span className="text-[10px] text-[#333] mt-2 text-center">No Messages Yet</span>
                        )}
                        {messages.map((m, i) => {
                            const isMe = m.userId === myUserID
                            return (
                                <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    <span className="text-[9px] text-[#555] mb-0.5">{m.userId} · {formatTime(m.timestamp)}</span>
                                    <div className={`px-2 py-1.5 rounded-lg text-[11px] max-w-full break-words leading-relaxed ${isMe ? "bg-[#0f3460] text-[#a0d0f0]" : "bg-[#1e1e30] text-[#ccc]"
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            )
                        })}
                        {/* <div ref={chatEndRef} /> */}
                    </div>
                    <div className="px-2 py-2 border-t border-[#1f1f33] flex gap-1.5">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendChat()}
                            placeholder="Message..."
                            className="flex-1 bg-[#1a1a2e] border border-[#2a2a40] text-[#e0e0e0] text-[11px] px-2 py-1.5 rounded-md outline-none focus:border-[#4ecdc4] placeholder:text-[#444] font-mono"
                        />
                        <button
                            onClick={sendChat}
                            className="bg-[#4ecdc4] text-[#0d0d14] text-[11px] font-bold px-2 py-1.5 rounded-md hover:bg-[#3db8b0] transition-colors cursor-pointer"
                        >
                            ↑
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )

}

export default Whiteboard