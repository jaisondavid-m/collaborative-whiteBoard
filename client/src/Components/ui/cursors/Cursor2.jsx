import React , { useEffect , useRef , useState } from "react"

const LERP = 0.10
const ROT_IDLE = 0.30
const ROT_HOVER = 1.20
const ACCENT = "#e94560"
const SUPPORT = "#4ecdc4"
const ARM_IDLE = 14
const ARM_HOVER = 6
const GAP = 7
const CORNER_IDLE = 18
const CORNER_HOVER = 11

function lerp(a, b, t) {
    return a + (b-a)*t
}

function Cursor2() {

    const svgRef = useRef(null)
    const ringRef = useRef(null)
    const armRefs = useRef([])
    const cornersRef = useRef([])
    const dotRef = useRef(null)

    // const [ mounted , setMounted ] = useState(false)

    useEffect(() => {
        // setMounted(true)
        const s = {
            mx: -300, my: -300,
            cx: -300, cy: -300,
            rotation: 0,
            rotSpeed: ROT_IDLE,
            armLen: ARM_IDLE,
            cornerPos: CORNER_IDLE,
            scale: 1,
            targetScale: 1,
            hovering: false,
            onText: false,
            disabled: false,
            raf: null,
        }
        
        const svg = svgRef.current
        const ring = ringRef.current
        const dot = dotRef.current

        if (!svg || !ring || !dot) return

        const [ top , bot , lft , rgt ] = armRefs.current
        
        // const corners = cornersRef.current

        const setArms = (len) => {
            if (!top) return
            top.setAttribute("y1", String(-GAP))
            top.setAttribute("y2",String(-(GAP+len)))
            bot.setAttribute("y1",String(GAP))
            bot.setAttribute("y2",String(GAP+len))
            lft.setAttribute("x1",String(-GAP))
            lft.setAttribute("x2",String(-(GAP+len)))
            rgt.setAttribute("x1",String(GAP))
            rgt.setAttribute("x2",String(GAP+len))
        }

        const setCorners = (pos) => {

            const p = pos

            /* top-left */
            corners[0]?.setAttribute("x1",String(-p))
            corners[0]?.setAttribute("x2",String(-p+5))
            corners[0]?.setAttribute("y1",String(-p))
            corners[0]?.setAttribute("y2",String(-p))
            corners[1]?.setAttribute("x1",String(-p))
            corners[1]?.setAttribute("x2",String(-p))
            corners[1]?.setAttribute("y1",String(-p))
            corners[1]?.setAttribute("y2",String(-p+5))

            /* top-rignt */
            corners[2]?.setAttribute("x1",String(p))
            corners[2]?.setAttribute("x2",String(p-5))
            corners[2]?.setAttribute("y1",String(-p))
            corners[2]?.setAttribute("y2",String(-p))
            corners[3]?.setAttribute("x1",String(p))
            corners[3]?.setAttribute("x2",String(p))
            corners[3]?.setAttribute("y1",String(-p))
            corners[3]?.setAttribute("y2",String(-p+5))

            /* bottom-left */
            corners[4]?.setAttribute("x1",String(-p))
            corners[4]?.setAttribute("x2",String(-p+5))
            corners[4]?.setAttribute("y1",String(p))
            corners[4]?.setAttribute("y2",String(p))
            corners[5]?.setAttribute("x1",String(-p))
            corners[5]?.setAttribute("x2",String(-p))
            corners[5]?.setAttribute("y1",String(p))
            corners[5]?.setAttribute("y2",String(p-5))

            /* bottom-right */
            corners[6]?.setAttribute("x1",String(p))
            corners[6]?.setAttribute("x2",String(p-5))
            corners[6]?.setAttribute("y1",String(p))
            corners[6]?.setAttribute("y2",String(p))
            corners[7]?.setAttribute("x1",String(p))
            corners[7]?.setAttribute("x2",String(p))
            corners[7]?.setAttribute("y1",String(p))
            corners[7]?.setAttribute("y2",String(p-5))

        }

        setArms(ARM_IDLE)
        setCorners(CORNER_IDLE)

        const onMove = (e) => {
            s.mx = e.clientX
            s.my = e.clientY
        }

        const onOver = (e) => {
            const el = e.target
            s.disabled = !!(el.matches("[disabled],[aria-disabled=true]") || el.closest("[disabled],[aria-disabled=true]"))
            s.onText = !!(el.matches('input,textarea,[contenteditabled="true"]'))
            s.hovering = !s.disabled && !s.onText && !!el.closest("a,button,[role=button],[tabindex]")
            s.rotSpeed = s.hovering ? ROT_HOVER : ROT_IDLE
        }

        const onDown = () => {
            s.targetScale = 0.72
            setTimeout(() => {
                s.targetScale = 1
            },120)
        }

        const tick = () => {
            s.cx = lerp(s.cx, s.mx, LERP)
            s.cy = lerp(s.cy, s.my, LERP)
            s.scale = lerp(s.scale, s.targetScale, 0.22)

            svg.style.left = `${s.cx}px`
            svg.style.top = `${s.cy}px`
            svg.style.transform = `translate(-50%, -50%) scale(${s.scale})`

            if (!s.onText && !s.disabled) {
                s.rotation = (s.rotation + s.rotSpeed) % 360
                ring.setAttribute("transform",`rotate(${s.rotation})`)
            }

            const targetArm = s.onText ? 0 : s.hovering ? ARM_HOVER : ARM_IDLE
            s.armLen = lerp(s.armLen, targetArm, 0.14)
            setArms(s.armLen)

            const targetC = s.hovering ? CORNER_HOVER : CORNER_IDLE
            s.cornerPos = lerp(s.cornerPos, targetC, 0.14)
            setCorners(s.cornerPos)

            const op = s.disabled ? "0.3" : "1"
            svg.style.opacity = op

            s.raf = requestAnimationFrame(tick)
        }

        document.addEventListener("mousemove", onMove, { passive: true })
        document.addEventListener("mouseover", onOver, { passive: true })
        document.addEventListener("mousedown", onDown)

        s.raf = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(s.raf)
            document.removeEventListener("mousemove",onMove)
            document.removeEventListener("mouseover",onOver)
            document.removeEventListener("mousedown",onDown)
        }
    },[])

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) {
            return
        }
        document.body.classList.add("custom-cursor")
        return () => {
            document.body.classList.remove("custom-cursor")
        }
    },[])

    // if (!mounted) return null

    const lw = { strokeWidth: "1.2" , strokeLinecap: "round" } 
    const cw = { strokeWidth: "1" , strokeLinecap: "round" }

    return (
        <svg
            ref={svgRef}
            width="80"
            height="80"
            viewBox="-40 -40 80 80"
            style={{
                position: "fixed",
                pointerEvents: "none",
                zIndex: 99999,
                left: "-300px",
                top: "-300px",
                overflow: "visible"
            }}
        >
            <g ref={ringRef}>
                <circle
                    cx="0" cy="0" r="22"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="0.8"
                    strokeDasharray="3 5"
                    opacity="0.5"
                />
            </g>
            <line
                ref={el => armRefs.current[0] = el }
                x1="0" y1={GAP} x2="0" y2={-(GAP+ARM_IDLE)}
                stroke={ACCENT} {...lw}
            />
            <line
                ref={el => armRefs.current[1] = el}
                x1="0" y1={GAP} x2="0" y2={GAP+ARM_IDLE}
                stroke={ACCENT} {...lw}
            />
            <line
                ref={el => armRefs.current[2] = el}
                x1={-GAP} y1="0" x2={-(GAP+ARM_IDLE)} y2="0"
                stroke={ACCENT} {...lw}
            />
            <line
                ref={el => armRefs.current[3] = el}
                x1={GAP} y1="0" x2={GAP+ARM_IDLE} y2="0"
                stroke={ACCENT} {...lw}
            />

            {Array.from({ length: 8 }).map((_,i) => (
                <line
                    key={i}
                    ref={el => cornersRef.current[i] = el}
                    stroke={SUPPORT} {...cw}
                    opacity="0.75"
                />
            ))}
            <circle ref={dotRef} cx="0" cy="0" r="2.5" fill={ACCENT} />
        </svg>
    )
}

export default Cursor2