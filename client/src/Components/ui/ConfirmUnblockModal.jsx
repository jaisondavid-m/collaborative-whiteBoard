import React , { useEffect } from "react"
import { RiCloseLine } from "react-icons/ri"

function ConfirmUnblockModal({
    open,
    title,
    target,
    sub,
    icon: Icon,
    confirmLabel = "Confirm",
    confirmTone = "teal",
    submitting = false,
    onClose,
    onConfirm,
}) {

    useEffect(() => {

        if (!open) return

        const onKey = (e) => {
            if (e.key === "Escape" && !submitting) onClose()
        }

        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    },[])

    if (!open) null

    const toneClasses = confirmTone === "red"
        ? "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200"
        : "bg-[#4ecdc4] text-white hover:bg-[#3bb8b0] shadow-sm shadow-teal-100"

    const iconWrapClasses = confirmTone === "red"
        ? "bg-red-50 text-red-500"
        : "bg-[#e6faf8] text-[#0f6e56]"

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        > 
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
                onClick={() => !submitting && onClose()}
            />
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200
                overflow-hidden animate-[modalIn_180ms_cubic-bezier(0.16,1,0.3,1)]"
            >
                <button
                    onClick={() => !submitting && onClose()}
                    disabled={submitting}
                    aria-label="Cancel"
                    className="absolute top-3 right-3 w-7 -7 rounded-flex items-center justify-center 
                    text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                    <RiCloseLine size={16} />
                </button>
                <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center" >
                    {/* Icon */}
                    {
                        Icon && (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconWrapClasses}`} >
                                <Icon size={24} />
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default ConfirmUnblockModal