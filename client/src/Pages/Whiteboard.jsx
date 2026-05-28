import React , { useEffect , useRef , useState , useCallback } from "react"

import { useParams , useNavigate } from "react-router-dom"

import { joinRoomSocket } from "../api/room.api.js"

const TOOLS = {
    pen:    { label: "Pen", icon: "✏️", cursor: "crosshair" },
    eraser: { label: "Eraser", icon: "⬜", cursor: "cell" }
}

const COLORS = [
    "#1a1a2e","#e94560","#0f3460","#533483",
    "#f5a623","#7ed321","#ffffff","#ff6b6b",
    "#4ecdc4","#45b7d1"
]

const SIZES = [2,5,10,20,40]

function Whiteboard() {

    const { roomId } = useParams()
    const navigate = useNavigate()

    const canvasRef = useRef(null)
    const socketRef = useRef(null)
    const drawingRef = useRef(false)
    const lastPosRef = useRef({ x: 0, y:0 })

    const [tool,setTool]                =   useState("pen")
    const [color,setColor]              =   useState("#1a1a2e")
    const [size,setSize]                =   useState(5)
    const [connected,setConnected]      =   useState(false)

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
    },[])

    const replayHistory = useCallback((events) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        events.forEach(ev => {
            if (ev.type === "draw") drawSegment(ctx, ev)
        })
    },[drawSegment])

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
        const ws = joinRoomSocket(roomId)
        socketRef.current = ws

        ws.onopen = () => setConnected(true)
        ws.onclose = () => setConnected(false)

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                const canvas = canvasRef.current
                if (!canvas) return
                const ctx = canvas.getContext("2d")

                if (msg.type === "sync") replayHistory(msg.events)
                else if (msg.type === "draw") drawSegment(ctx, msg)
                else if (msg.type === "clear") ctx.clearRect(0, 0, canvas.width, canvas.height)
            } catch {}
        }
        return () => ws.close()
    },[roomId,drawSegment,replayHistory])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return 
        const resize = () => {
            const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
            canvas.getContext("2d").putImageData(imageData, 0, 0)
        }
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const ro = new ResizeObserver(resize)
        ro.observe(canvas)
        return () => ro.disconnect()
    },[])

    function getPos(e, canvas) {
        const rect = canvas.getBoundingClientRect()
        if (e.touched && e.touches.length > 0) return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const sendEvent = (type, payload = {} ) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, ...payload }))
        }
    }

    const onPointerDown = (e) => {
        e.preventDefault()
        drawingRef.current = true
        const pos = getPos(e, canvasRef.current)
        lastPosRef.current = pos
        sendEvent("begin",{ x:pos.x, y:pos.y, color: tool === "eraser" ? "#eraser" : color, size })
    }

    const onPointerMove = (e) => {
        e.preventDefault()
        if (!drawingRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const pos = getPos(e, canvas)
        const prev = lastPosRef.current
        const payload = {
            x: pos.x, y: pos.y,
            prevX: prev.x, prevY: prev.y,
            color: tool === "eraser" ? "#eraser" : color,
            size,
        }
        drawSegment(ctx, {...payload, type: "draw"})
        sendEvent("draw",payload)
        lastPosRef.current = pos
    }

    const onPointerUp = () => { drawingRef.current = false }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
        sendEvent("clear")
    }

    return (
        <div className="h-screen flex flex-col bg-[#0d0d14] text-[#e0e0e0] select-none font-mono">
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
                    <span className={`w-2 h-2 rounded-full inline-block ${connected ? "bg-[#4ecdc4]" : "bg-[#e94560]"}`}/>
                    <span className="text-xs text-[#888] tracking-widest">
                        {connected ? "Live" : "Offline"}
                    </span>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-[68px] bg-[#13133f] border-r border-[#1f1f33] flex flex-col py-3 gap-1 shrink-0 overflow-y-auto">
                    <section className="flex flex-col gap-1.5 px-2.5 pb-3 border-b border-[#1f1f33]">
                        <p className="text-[8px] tracking-[1.5px] text-[#444] text-center mb-1">Tool</p>
                        {Object.entries(TOOLS).map(([key,t]) => (
                            <button
                                key={key}
                                title={t.label}
                                onClick={() => setTool(key)}
                                className={`text-lg p-2 rounded-lg cursor-pointer border ${tool === key 
                                    ? "bg-[#1e1e30] border-[#4ecdc4]"
                                    : "bg-transparent border-transparent hover:bg-[#1a1a28]"
                                }`}
                            >
                                {t.icon}
                            </button>
                        ))}
                    </section>
                    <section
                        className="flex flex-col gap-1.5 px-2.5 py-3 border-b border-[#1f1f33]"
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
                                    className="w-[22px] h-[22px] rounded-[5px] cursor-pointer transition-transform hover:scale-110"
                                    style={{
                                        background: c,
                                        border: color === c ? "3px solid #fff" : "2px solid transparent",
                                        boxShadow: color === c ? "0 0 0 2px #4ecdc4" : "none"
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                    <section className="flex flex-col gap-1.5 px-2.5 py-3 border-b border-[#1f1f33]">
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
                <div className="flex-1 bg-[#f8f8f4] relative overflow-hidden">
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
                        onTouchEnd={onPointerUp}
                    />
                </div>
            </div>
        </div>
    )

}

export default Whiteboard