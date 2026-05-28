import React from "react"

function ToastContainer({ toasts = [] }) {
    if (!toasts.length) return null
    return (
        <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
            {toasts.map(t => (
                <div
                    key={t.id}
                    // className={`flex items-center gap-3 bg-white border rounded-lg px-4 py-3 text-sm shadow-none
                    //         ${t.type === "error"
                    //             ? "border-l-[3px] border-l-[#e94560] border-black/10"
                    //             : "border-l-[3px] border-l-[#4ecdc4] border-black/10"
                    //         }
                    //     `}
                    className={`
                        animate-[fadeIn_.25s_ease]
                        flex items-center gap-3
                        bg-white border rounded-xl
                        px-4 py-3 text-sm
                        shadow-lg transition-all duration-300
                        ${
                            t.type === "error"
                                ? "border-l-4 border-l-red-500 border-gray-200"
                                : "border-l-4 border-l-emerald-500 border-gray-200"
                        }
                    `}
                    style={{ minWidth: 220, maxWidth: 320 }}
                >
                    <span className={`
                        flex h-6 w-6 items-center justify-center
                        rounded-full text-white text-xs font-bold
                        ${
                            t.type === "error"
                                ? "bg-red-500" 
                                : "bg-emerald-500"
                        }
                    `}>
                        {t.type === "error" ? "✕" : "✓" }
                    </span>
                    <span className="text-gray-700">{t.message}</span>
                </div>
            ))}
        </div>
    )
}

export default ToastContainer