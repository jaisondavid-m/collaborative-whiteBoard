import React, { useState, useEffect, useRef } from "react"
import {
    RiUserForbidLine,
    RiCloseLine,
    RiAlertLine,
} from "react-icons/ri"

const HOLD_MS = 3000

function ConfirmBlockModal({ target, onClose, onConfirm }) {

    const open = Boolean(target)

    const [secondsLeft, setSecondsLeft] = useState(3)
    const [ready, setReady] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const intervalRef = useRef(null)

    useEffect(() => {

        if (!open) return

        setReady(false)
        setSubmitting(false)
        setSecondsLeft(3)

        const startAt = Date.now()

        intervalRef.current = setInterval(() => {

            const elapsed = Date.now() - startAt
            const remaining = Math.max(0, HOLD_MS - elapsed)
            const wholeSeconds = Math.ceil(remaining / 1000)

            setSecondsLeft(wholeSeconds)

            if (remaining <= 0) {
                setReady(true)
                clearInterval(intervalRef.current)
            }

        }, 100)

        return () => clearInterval(intervalRef)

    },[open, target])

    if (!open) return null

    const progress = ((HOLD_MS - secondsLeft * 1000) / HOLD_MS)
    const circumference = 2 * Math.PI * 9
    const dashOffset = circumference * (1 - Math.min(1, Math.max(0, (3 - secondsLeft) / 3)))

    const handleConfirm = async () => {

        if (!ready || submitting) return

        setSubmitting(true)

        try {
            await onConfirm(target)
        } finally {
            setSubmitting(false)
        }

    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-modal-title"
        >
            <div
                className="absolute inset-0 bg-gray-900/40 backdro-blur-[2px] backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
                onClick={() => !submitting && onClose()}
            />
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200
                overflow-hidden animate-[modalIn_180ms_cubic-bezier(0.16,1,0.3,1)"
            >
                <button
                    onClick={() => !submitting && onClose()}
                    disabled={submitting}
                    aria-label="Cancel"
                    className="absoulte top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center
                    text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                    <RiCloseLine size={16} />
                </button>

                <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center" >
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4" >
                        <RiUserForbidLine size={24} className="text-red-500" />
                    </div>
                    <h2 title="block-modal-title" className="text-base font-semibold text-gray-900 font-mono" >
                        Block this user?
                    </h2>
                    <p className="mt-2 text-sm font-mono px-3 py-1.5 rounded-lg bg-gray-50 
                    border border-gray-100 text-gray-700 max-w-full truncate" >
                        {target}
                    </p>
                    <div className="mt-3 flex items-start gap-2 text-left bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5" >
                        <RiAlertLine size={15} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 font-mono leading-relaxed" >
                            This removes them as a friend and blocks future friend requests
                            and messages between you. You can unblock them later.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center gap-2.5 w-full" >
                        <button
                            onClick={() => !submitting && onClose()}
                            disabled={submitting}
                            className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium
                            font-mono hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!ready || submitting}
                            className={`relative flex-1 h-11 rounded-xl text-sm font-medium font-mono
                                flex items-center justify-center gap-2 transition-all overflow-hidden
                                    ${
                                        ready
                                            ? "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }
                                `}
                        >
                            {
                                submitting ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : ready ? (
                                    <>
                                        <RiUserForbidLine size={15} />
                                        Block
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90 shrink-0" >
                                            <circle
                                                cx="10" cy="10" r="9"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeOpacity="0.15"
                                                strokeWidth="2"
                                            />
                                            <circle
                                                cx="10" cy="10" r="9"
                                                fill="none"
                                                stroke="currentCOlor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={dashOffset}
                                                style={{ transition: "stroke-dashoffset 100ms linear" }}
                                            />
                                        </svg>
                                        Wait {secondsLeft}s
                                    </>
                                )
                            }
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes modalIn {
                        from { opacity:0; transform: scale(0.95) translateY(8px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}
            </style>
        </div>
    )

}

export default ConfirmBlockModal