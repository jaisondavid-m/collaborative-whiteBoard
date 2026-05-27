import React from "react"

function ToastContainer({ toasts }) {
    if (!toasts.length) return null
    return (
        <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-centter gap-3 bg-white border rounded-lg px-4 py-3 text-sm shadow-none
                            ${t.type === "error"
                                ? "border-l-[3px] border-l-[#e94560] border-black/10"
                                : "border-l-[3px] border-l-[#4ecdc4] border-black/10"
                            }
                        `}
                    style={{ minWidth: 220, maxWidth: 320 }}
                >
                    <span className={t.type === "error" ? "text-[#e94560]" : "text-[#4ecdc4]"}>
                        {t.type === "error" ? "✕" : "✓" }
                    </span>
                    <span className="text-gray-700">{t.message}</span>
                </div>
            ))}
        </div>
    )
}

export default ToastContainer