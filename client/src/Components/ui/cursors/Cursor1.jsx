import React, { useEffect, useRef, useState } from "react"

const TRAIL_COUNT = 12
const LERP_FACTOR = 0.12
const IDLE_TIMEOUT = 2000
const DOT_COLOR = "#4ecdc4"
const RING_COLOR = "#4ecdc4"
const TRAIL_COLOR = "#4ecdc4"

function lerp(a, b, t) {
    return a + (b - a) * t
}

function Cursor1() {

    const dotRef = useRef(null)
    const ringRef = useRef(null)
    const trailRef = useRef([])
    const state = useRef({
        mx: -200, my: -200,
        rx: -200, ry: -200,
        trail: Array.from({ length: TRAIL_COUNT }, () => (
            { x: -200, y: -200 }
        )),
        pressing: false,
        hovering: false,
        onText: false,
        disabled: false,
        visible: true,
        idleTimer: null,
        raf: null,
        reducedMotion: false,
    })

    // const [mounted, setMounted] = useState(false)

    useEffect(() => {

        // setMounted(true)

        const s = state.current
        s.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const dot = dotRef.current
        const ring = ringRef.current

        if (!dot || !ring) return

        const show = () => {
            s.visible = true
            dot.style.opacity = "1"
            ring.style.opacity = "1"
        }

        const hide = () => {
            s.visible = false
            dot.style.opacity = "0"
            ring.style.opacity = "0"
            trailRef.current.forEach(el => {
                if (el) {
                    el.style.opacity = "0"
                }
            })
        }

        const resetIdle = () => {
            clearTimeout(s.idleTimer)
            show()
            s.idleTimer = setTimeout(() => {
                hide()
            }, IDLE_TIMEOUT);
        }

        const onMove = (e) => {
            s.mx = e.clientX
            s.my = e.clientY
            resetIdle()
        }

        const onDown = (e) => {
            s.pressing = true
            dot.style.transform = "translate(-50%,-50%) scale(2)"
            dot.style.background = "#fff"
            ring.style.transform = "translate(-50%,-50%) scale(0.6)"
        }

        const onUp = () => {
            s.pressing = false
            dot.style.transform = "translate(-50%,-50%) scale(1)"
            dot.style.background = DOT_COLOR
            ring.style.transform = "translate(-50%,-50%) scale(1)"
        }

        const onOver = (e) => {
            const el = e.target
            const isDisabled =
                el.matches("[disabled],[aria-disabled=true]") ||
                el.closest("[disabled],[aria-disabled=true]")
            s.disabled = !!isDisabled

            const isText =
                el.matches("input[type=text],input[type=search],input[type=email],textarea") ||
                el.closest("[contenteditable=true]")
            s.onText = !!isText

            const isClickable = el.closest("a,button,[role=button],[tabindex]")
            s.hovering = !!isClickable && !isDisabled && !isText

            applyRingState()

        }

        const applyRingState = () => {
            if (s.onText) {
                ring.style.width = "2px"
                ring.style.height = "22px"
                ring.style.borderRadius = "1px"
                ring.style.border = `1.5px solid ${RING_COLOR}`
                ring.style.background = "transparent"
                ring.style.opacity = "0.9"
                ring.style.transition = "width .18s,height .18s,border-radius .18s"
            } else if(s.disabled) {
                ring.style.width = "28px"
                ring.style.height = "28px"
                ring.style.borderRadius = "50%"
                ring.style.border = `1.5px dashed ${RING_COLOR}`
                ring.style.background = "transparent"
                ring.style.opacity = "0.35"
                ring.style.transition = "width .18s,height .18s,opacity .18s"
            } else if (s.hovering) {
                ring.style.width = "50px"
                ring.style.height = "6px"
                ring.style.borderRadius = "3px"
                ring.style.border = "none"
                ring.style.background = RING_COLOR
                ring.style.opacity = "0.25"
                ring.style.transition = "width .2s,height .2s,border-radius .2s,opacity .2s"
            } else {
                ring.style.width = "28px"
                ring.style.height = "28px"
                ring.style.borderRadius = "50%"
                ring.style.border = `1.5px solid ${RING_COLOR}`
                ring.style.background = "transparent"
                ring.style.opacity = "1"
                ring.style.transition = "width .2s,height .2s, border-radius .2s,opacity .2s"
            }
        }

        const tick = () => {
            const { mx , my , trail , reducedMotion } = s
            s.rx = lerp(s.rx, mx, LERP_FACTOR)
            s.ry = lerp(s.ry, my, LERP_FACTOR)

            dot.style.left = `${mx}px`
            dot.style.top = `${my}px`
            ring.style.left = `${s.rx}px`
            ring.style.top = `${s.ry}px`

            if (!reducedMotion) {
                trail.unshift({ x: s.rx, y: s.ry })
                trail.length = TRAIL_COUNT
                trailRef.current.forEach((el, i) => {
                    if (!el || !trail[i]) return
                    const t = trail[i]
                    const alpha = (1-i/TRAIL_COUNT)*0.22
                    el.style.left = `${t.x}px`
                    el.style.top = `${t.y}px`
                    el.style.opacity = s.visible ? String(alpha) : "0"
                    const sz = Math.max(2, 7 - i * 0.45)
                    el.style.width = `${sz}px`
                    el.style.height = `${sz}px`
                })
            }
            s.raf = requestAnimationFrame(tick)
        }

        document.addEventListener("mousemove", onMove, { passive: true })
        document.addEventListener("mousedown",onDown)
        document.addEventListener("mouseup",onUp)
        document.addEventListener("mouseover",onOver, { passive: true })

        s.idleTimer = setTimeout(hide,IDLE_TIMEOUT)
        s.raf = requestAnimationFrame(tick)

        return () => {
            document.removeEventListener("mousemove", onMove)
            document.removeEventListener("mousedown", onDown)
            document.removeEventListener("mouseup",onUp)
            document.removeEventListener("mouseover", onOver)
            cancelAnimationFrame(s.raf)
            clearTimeout(s.idleTimer)
        }

    }, [])

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

    const base = {
        position: "fixed",
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-50%,-50%)",
    }

    return (
        <>
        {Array.from({ length: TRAIL_COUNT }).map((_,i) => (
            <div
                key={i}
                ref={el => trailRef.current[i] = el}
                style={{
                    ...base,
                    left: "-200px",
                    top: "-200px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: TRAIL_COLOR,
                    opacity: 0,
                    zIndex: 99996,
                }}
            />
        ))}
        <div
            ref={ringRef}
            style={{
                ...base,
                left: "-200px",
                top: "-200px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `1.5px solid ${RING_COLOR}`,
                background: "transparent",
                zIndex: 99997,
                transition: "width .2s,height .2s,border-radius .2s,opacity .2s,background .2s"
            }}
        />
        <div
            ref={dotRef}
            style={{
                ...base,
                left: "-200px",
                top: "-200px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: DOT_COLOR,
                zIndex: 99999,
                transition: "transform .08s ease, background .1s ease",
            }}
        />
        </>
    )
}

export default Cursor1