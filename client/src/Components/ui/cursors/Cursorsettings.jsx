import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import Cursor1 from "./Cursor1.jsx"
import Cursor2 from "./Cursor2.jsx"

const OPTIONS = [
    {
        id: "default",
        label: "System Default",
        tag: "Native OS pointer",
        description: "Uses your operating system,s native cursor. Nothing is added to the page.",
        accent: "#aaaaaa",
        PreviewSVG: () => (
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" >
                <polygon
                    points="4,2 4,30 11,22 17,34 21, 32 15,20 25,20"
                    fill="#aaaaaa" stroke="#0d0d14" strokeWidth="1.5" strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        id: "cursor1",
        label: "Dot · Ring",
        tag: "Spring-lagged, morphing",
        description: "A teal dot that snaps to the pointer . A hollow ring trails behind with a spring delay.\
        On buttons the ring morphs into a pill bar; on text fields it becomes a caret; 12-dot trail follows the ring.",
        accent: "#4ecdc4",
        PreviewSVG: () => (
            <svg width="44" height="44" viewBox="-22 -22 44 44" fill="none" >
                {[12, 10, 8].map((r, i) => (
                    <circle key={i} cx={-i * 3} cy={i * 1.5} r={r} stroke="#4ecdc4" strokeWidth="1.2" opacity={0.15 + i * 0.1} />
                ))}
                <circle cx="0" cy="0" r="14" stroke="#4ecdc4" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#4ecdc4" />
            </svg>
        ),
    },
    {
        id: "cursor2",
        label: "Reticle",
        tag: "Rotating, precision crosshair",
        description: "A red crosshair with four retractabled arms and L-shaped corner marks. A dashed outer ring rotates continuously; it accelerates on interactive elements.\
        The whole reticle pulses on click. Arms vanish on text fields",
        accent: "#e94560",
        PreviewSVG: () => (
            <svg width="44" height="44" viewBox="-22 -22 44 44" fill="none">
                <circle
                    cx="0" cy="0" r="18" stroke="#e94560" strokeWidth="0.8"
                    strokeDasharray="3 5" opacity="0.5"
                />
                <line x1="0" y1="-7" x2="0" y2="-15" stroke="#e94560" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="0" y1="7" x2="0" y2="15" stroke="#e94560" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="-7" y1="0" x2="-15" y2="0" stroke="#e94560" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="7" y1="0" x2="15" y2="0" stroke="#e94560" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="-15" y1="-15" x2="-10" y2="-15" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="-15" y1="-15" x2="-15" y2="-10" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="15" y1="-15" x2="10" y2="-15" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="15" y1="-15" x2="15" y2="-10" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="-15" y1="15" x2="-10" y2="15" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="-15" y1="15" x2="-15" y2="10" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="15" y1="15" x2="10" y2="15" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <line x1="15" y1="15" x2="15" y2="10" stroke="#4ecdc4" strokeWidth="1" strokeLinecap="round" />
                <circle cx="0" cy="0" r="2.5" fill="#e94560" />
            </svg>
        )
    }
]

function Badge({ label, color }) {
    return (
        <span style={{
            fontSize: "10px",
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            padding: "2px 7px",
            borderRadius: "4px",
            border: `1px solid ${color}44`,
            color: color,
            background: `${color}12`,
        }}>
            {label}
        </span>
    )
}

function SandboxZone({ active }) {

    const tags = ["button", "link", "input", "disabled"]

    return (
        <div style={{
            background: "#0d0d14",
            border: "1px solid #1f1f33",
            borderRadius: "12px",
            padding: "20px 24px",
            marginTop: "8px",
        }}>
            <p style={{ fontSize: "11px", color: "#444", letterSpacing: "0.12em", marginBottom: "14px" }}>
                LIVE PREVIEW - move mouse here
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <button
                    style={{
                        background: "#13131f",
                        border: "1px solid #2a2a40",
                        color: "#4ecdc4",
                        borderRadius: "8px",
                        padding: "7px 16px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        cursor: active !== "default" ? "none" : "pointer"
                    }}
                >
                    Hover me
                </button>
                <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    style={{
                        color: "#4ecdc4",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        cursor: active !== "default" ? "none" : "pointer"
                    }}
                >
                    A link
                </a>
                <input
                    type="text"
                    placeholder="Type here"
                    style={{
                        background: "#1a1a28",
                        border: "1px solid #2a2a40",
                        color: "#e0e0e0",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        outline: "none",
                        cursor: active !== "default" ? "none" : "text"
                    }}
                />
                <button
                    disabled
                    style={{
                        background: "#13131f",
                        border: "1px solid #1f1f33",
                        color: "#444",
                        borderRadius: "8px",
                        padding: "7px 16px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        cursor: active !== "default" ? "none" : "not-allowed"
                    }}
                >
                    Disabled
                </button>
                <div style={{
                    fontSize: "11px",
                    color: "#555",
                    fontFamily: "monospace"
                }}>
                    Plain area
                </div>
            </div>
        </div>
    )
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1,3),16)
    const g = parseInt(hex.slice(3,5),16)
    const b = parseInt(hex.slice(5,7),16)
    const luminance = (0.299*r+0.587*g + 0.114*b)/255
    return luminance > 0.55 ? "#0d0d14" : "#ffffff"
}

function CursorSettings() {

    const navigate = useNavigate()
    const savedRef = useRef(localStorage.getItem("cursorStyle") || "default")
    const [selected, setSelected] = useState(savedRef.current)
    const [saveState, setSaveState] = useState("idle")
    const [canUndo, setCanUndo] = useState(false)

    useLayoutEffect(() => {
        const prev = document.body.style.cursor
        document.body.style.cursor = selected !== "default" ? "none" : ""
        document.body.style.background = "#0d0d14"
        return () => {
            document.body.style.cursor = prev
        }
    }, [selected])

    useEffect(() => {
        const ids = OPTIONS.map(o => o.id)
        const onKey = (e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                setSelected(cur => {
                    const i = ids.indexOf(cur)
                    return ids[(i + 1) % ids.length]
                })
            }
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                setSelected(cur => {
                    const i = ids.indexOf(cur)
                    return ids[(i - 1 + ids.length) % ids.length]
                })
            }
        }
        window.addEventListener("keydown", onKey)
        return () => {
            window.removeEventListener("keydown", onKey)
        }
    }, [])

    const handleSave = () => {
        setSaveState("saving")
        setTimeout(() => {
            localStorage.setItem("cursorStyle", selected)
            savedRef.current = selected
            setSaveState("saved")
            setCanUndo(false)
            setTimeout(() => {
                setSaveState("idle")
                window.location.reload()
            }, 800)
        }, 250)
    }

    const handleUndo = () => {
        setSelected(savedRef.current)
        setCanUndo(false)
    }

    const handleSelect = (id) => {
        setSelected(id)
        setCanUndo(id !== savedRef.current)
    }

    const isDirty = selected !== savedRef.current

    const activeOption = OPTIONS.find(o => o.id === selected)
    const accentColor = activeOption?.accent || "#4ecdc4"

    return (
        <div
            className="min-h-screen bg-[#0d0d14] text-[#e0e0e0] font-mono"
            style={{ cursor: selected !== "default" ? "none" : "" }}
        >
            {selected === "cursor1" && <Cursor1 />}
            {selected === "cursor2" && <Cursor2 />}
            {/* -- Header -- */}
            <header className="flex items-center justify-between px-5 h-12 bg-[#13131f] border-b border-[#1f1f33] shrink-0" >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-transparent border border-[#2a2a40] text-[#aaa] px-3 py-1 rounded-md
                        text-sm transition-colors"
                        style={{ cursor: selected !== "default" ? "none" : "pointer" , borderColor: accentColor }}
                    >
                        ← Back
                    </button>
                    <span className="flex items-center gap-1.5 text-sm tracking-widest text-[#666]">
                        <span style={{ color: accentColor }} >⬡</span>
                        Settings
                        <span className="text-[#333]" ></span>
                        <span className="text-[#aaa]" >Cursor</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span style={{ fontSize: "10px", color: "#e94560", letterSpacing: "0.08em" }} >
                            ● unsaved
                        </span>
                    )}
                    <span className="text-[10px] text-[#333] tracking-widest" >↑↓ to cycle</span>
                </div>
            </header>
            <main className="min-h-screen mx-auto px-6 py-10" >
                <div className="mb-8">
                    <h1 className="text-lg font-medium text-[#e0e0e0] mb-1 tracking-wide">
                        Cursor Style
                    </h1>
                    <p className="text-xs text-[#444] leading-relaxed">
                        Choose how your pointer looks across the entire site.
                        Custom cursors replace the OS pointer with a canvas layer.
                        Change take effect after reload.
                    </p>
                </div>
                <div className="flex flex-col gap-3 mb-8" role="radiogroup" aria-label="Cursor style options" >
                    {OPTIONS.map((opt) => {
                        const active = selected === opt.id
                        return (
                            <div
                                key={opt.id}
                                role="radio"
                                aria-checked={active}
                                tabIndex={0}
                                onClick={() => handleSelect(opt.id)}
                                onKeyDown={(e) => e.key === "Enter" && handleSelect(opt.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    padding: "16px 20px",
                                    borderRadius: "14px",
                                    background: active ? "#0c0c1e" : "#13131f",
                                    border: active ? `1.5px solid ${opt.accent}` : `1px solid #1f1f33`,
                                    cursor: selected !== "default" ? "none" : "pointer",
                                    transition: "border-color .15s,background .15s",
                                    outline: "none",
                                    userSelect: "none",
                                }}
                            >
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    minWidth: "60px",
                                    borderRadius: "10px",
                                    background: "#0d0d14",
                                    border: "1px solid #1a1a28",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                >
                                    <opt.PreviewSVG />
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0 }} >
                                    <div style={{ display: "flex", alignContent: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }} >
                                        <span
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                color: active ? opt.accent : "#d0d0d0",
                                                transition: "color .15s",
                                            }}
                                        >
                                            {opt.label}
                                        </span>
                                        <Badge label={opt.tag} color={opt.accent} />
                                        {active && opt.id !== "default" && (
                                            <Badge label="active" color={opt.accent} />
                                        )}
                                    </div>
                                    <p style={{ fontSize: "11px", color: "#555", lineHeight: "1.65", margin: 0 }}>
                                        {opt.description}
                                    </p>
                                </div>
                                <div style={{
                                    width: "16px",
                                    height: "16px",
                                    minWidth: "16px",
                                    borderRadius: "50%",
                                    border: `1.5px solid ${active ? opt.accent : "#333"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: "2px",
                                    transition: "border-color .15s",
                                }}>
                                    {active && (
                                        <div
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background: opt.accent,
                                            }}
                                        />
                                    )}
                                </div>

                            </div>
                        )
                    })}
                    <div className="mb-8">
                        <p className="text-10px]" >
                            Interactive preview
                        </p>
                        <SandboxZone active={selected} />
                    </div>

                    <div style={{
                        background: "#0a0a12",
                        border: "1px solid #1a1a28",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        marginBottom: "28px",

                    }} >
                        <p style={{
                            fontSize: "11px", color: "#555", margin: "0 0 8px", letterSpacing: "0.08em"
                        }} >
                            HOW IT WORKS
                        </p>
                        {[
                            "Custom cursors set cursor: none on the body so the OS pointer is hidden.",
                            "A canvas layer renders the chosen cursor via requestAnimationFrame.",
                            "On text inputs the ring becomes a caret. On disabled elements opacity drops.",
                            "Cursor1 adds a 12-dot fading trail (skipped if prefers-reduced-motion is set).",
                            "Cursor2 outer ring rotates at 0.3°/frame, accelerating to 1.2°/frame on hover.",
                        ].map((note, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "5px",
                                    alignItems: "flex-start",
                                }}
                            >
                                <span style={{ color: accentColor, fontSize: "10px", marginTop: "2px", flexShrink: 0 }} >◈</span>
                                <p style={{ fontSize: "11px", color: "#444", margin: 0, lineHeight: "1.6" }} >{note}</p>
                            </div>
                        ))}
                    </div>

                    {/* ---action row---- */}
                    <div style={{ display: "flex", gap: "10px" }} >
                        {canUndo && (
                            <button
                                onClick={handleUndo}
                                style={{
                                    background: "transparent",
                                    border: "1px solid #2a2a40",
                                    color: "#888",
                                    borderRadius: "10px",
                                    padding: "12px 20px",
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                    cursor: selected !== "default" ? "none" : "pointer",
                                    letterSpacing: "0.6em",
                                    flexShrink: 0,
                                }}
                            >
                                ↩ Revert
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                background: saveState === "saved" 
                                    ? "#0fe656"
                                    : selected === "default"
                                    ? "#2a2a40"
                                    : accentColor,
                                border: selected === "default" && saveState === "idle"
                                    ? "1px solid #aaaaaa"
                                    : "none",
                                color: saveState === "saved" 
                                    ? "#fff" 
                                    : selected === "default"
                                    ? "#aaaaaa"
                                    : getContrastColor(accentColor),
                                borderRadius: "10px",
                                padding: "13px 20px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                letterSpacing: "0.08em",
                                cursor: selected !== "default" ? "none" : "pointer",
                                transition: "background .2s",
                                opacity: saveState !== "idle" ? 0.85 : 1,
                            }}
                        >
                            {saveState === "idle" && "Apply & Reload"}
                            {saveState === "saving" && "Saving..."}
                            {saveState === "saved" && "✓ Saved"}
                        </button>
                    </div>

                    {/* --- other settings --- */}
                    <div style={{ marginTop: "48px" }}>
                        <p style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#2a2a40", marginBottom: "12px" }} >
                            MORE SETTINGS
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} >
                            {[
                                { label: "Account", icon: "◎", path: "/setting/account" },
                                { label: "Notifications", icon: "◈", path: "/setting/notifications" },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "12px 18px",
                                        background: "#13131f",
                                        border: "1px solid #1f1f33",
                                        borderRadius: "10px",
                                        color: "#888",
                                        fontSize: "12px",
                                        fontFamily: "monospace",
                                        cursor: selected !== "default" ? "none" : "pointer",
                                        transition: "border-color .15s, color .15s",
                                        textAlign: "left",
                                        width: "100%"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor =  accentColor
                                        e.currentTarget.style.color = "#e0e0e0"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "#1f1f33"
                                        e.currentTarget.style.color = "#888"
                                    }}
                                >
                                    <span style={{ color: accentColor, fontSize: "14px" }} >
                                        {item.label}
                                    </span>
                                    <span style={{ marginLeft: "auto", color: "#2a2a40", fontSize: "11px" }} >
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CursorSettings