import React from "react"
import { RiUserUnfollowLine } from "react-icons/ri"

function ConfirmRemoveModal({ target, onClose, onConfirm, loading }) {

    if (!target) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" >
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg w-full max-w-sm p-6" >
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4" >
                    <RiUserUnfollowLine size={20} className="text-orange-400" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900 font-mono mb-1" >
                    Remove Friend?
                </h2>
                <p className="text-xs text-gray-400 font-mono mb-6" >
                    <span className="text-gray-600 font-medium" >{target}</span> Will be removed
                    from your friends list. You can send a request again later.
                </p>
                <div className="flex gap-2" >
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-mono
                        text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm()}
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl bg-orange-400 text-sm font-mono text-white hover:bg-orange-500 transition-colors
                        disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                        {
                            loading
                                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : "Remove"
                        }
                    </button>
                </div>
            </div>
        </div>
    )

}

export default ConfirmRemoveModal