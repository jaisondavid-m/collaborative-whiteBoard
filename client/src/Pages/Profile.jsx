import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"

const PERM_LIST = [
    { key: "view_rooms", label: "View Rooms", icon: "🏠", roles: ["user", "admin", "superadmin"] },
    { key: "create_room", label: "Create Room", icon: "➕", roles: ["user", "admin", "superadmin"] },
    { key: "view_users", label: "View All users", icon: "👥", roles: ["admin", "superadmin"] },
    { key: "manage_roles", label: "Manage roles", icon: "🛡️", roles: ["superadmin"] },
    { key: "system_config", label: "System Config", icon: "⚙️", roles: ["superadmin"] }
]

const ROLE_STYLES = {
    user: { badge: "bg-gray-100 text-gray-700", avatar: "bg-[#9FE1CB] text-[#085041]", cover: "from-[#9FE1CB]/30" },
    admin: { badge: "bg-blue-100 text-blue-800", avatar: "bg-[#85B7EB] text-[#0C447C]", cover: "from-[#85B7EB]/30" },
    superadmin: { badge: "bg-purple-100 text-purple-800", avatar: "bg-[#AFA9EC] text-[#3C3489]", cover: "from-[#AFA(EC]/30" }
}

function PermChip({ label, active }) {
    return (
        <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors
            ${active
                ? "bg-[#E1F5EE] border-[#5DCAA5] text-[#085041]"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }
        `}>
            {!active && <span className="text-[10px]">🔒</span>}
            {label}
        </span>
    )
}

function DeleteModal({ onClose, onConfirm, isDeleting }) {

    const [countdown, setCountdown] = useState(3)
    const [canDelete, setCanDelete] = useState(false)

    useEffect(() => {
        if (countdown === 0) {
            setCanDelete(true)
            return
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isDeleting ? onClose : undefined}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 overflow-hidden" >
                <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600 w-full" >
                    <div className="p-6" >
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4" >
                            <span className="text-2xl" >🗑️</span>
                        </div>
                        <h2 className="text-center text-lg font-semibold text-gray-900 mb-1" >Delete Account</h2>
                        <p className="text-center text-sm text-gray-500 mb-5" >
                            This action is <span className="font-semibold text-red-500">irreversible</span>. Your account and all associated data will be permanently removed.
                        </p>
                        <div className={`flex items-center justify-center gap-2 mb-5 rounded-xl py-2.5 px-4 border ${canDelete ? "bg-red-50 border-red-200" : "bg-red-50 border-red-100"}`} >
                            {!canDelete && (
                                <svg className="w-4 h-4 text-red-400 animate-spin" fill="none" viewBox="0 0 24 24" >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            <p className="text-sm text-red-500 font-medium" >
                                {canDelete ? "!! You can now confirm deletion" : <>Please wait <span className="font-bold">{countdown}s</span> before confirming</>}
                            </p>
                        </div>
                        <div className="flex gap-3" >
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={!canDelete || isDeleting}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${canDelete && !isDeleting
                                        ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                                        : "bg-red-200 text-red-300 cursor-not-allowed"
                                    }
                                    `}
                            >
                                {isDeleting ? "Deleting..." : !canDelete ? `Wais ${countdown}s` : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

function Profile() {

    const navigate = useNavigate()
    const { toasts, toast } = useToast()
    const [userid, setUserid] = useState("")
    const [role, setRole] = useState("user")
    const [token, setToken] = useState("")
    const [showDeleteModal, setShowModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        setUserid(localStorage.getItem("userid") || "guest")
        setRole(localStorage.getItem("role") || "user")
        setToken(localStorage.getItem("token") || "")
    }, [])

    const styles = ROLE_STYLES[role] || ROLE_STYLES.user
    const initials = userid.slice(0, 2).toUpperCase()
    const shortToken = token ? token.slice(0, 36) + "…" : "No Active session"
    const joinedDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userid")
        localStorage.removeItem("role")
        navigate("/login")
    }

    const handleDeleteAccount = async () => {

        setIsDeleting(true)

        try {
            const res = await fetch("/api/user", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json()
                // alert(data.error || "Failed to delete account")
                toast(data.error || "Failed to delete account")
                setIsDeleting(false)
                return
            }
            localStorage.removeItem("token")
            localStorage.removeItem("userid")
            localStorage.removeItem("role")
            navigate("/login")
        } catch {
            // alert("Something went wrong. Please try again later.")
            toast("Something went wrong. Please Try again later.", "error")
            setIsDeleting(false)
        }
    }

    return (
        <>
            <ToastContainer toasts={toasts} />
            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowModal(false)}
                    onConfirm={handleDeleteAccount}
                    isDeleting={isDeleting}
                />
            )}
            <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 pt-10">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className={`h-28 bg-gradient-to-br ${styles.cover} to-white`} />
                        <div className="px-7 pb-7 -mt-8">
                            <div className="flex items-end justify-between mb-5">
                                <div className={`w-16 h-16 rounded-full ${styles.avatar} flex items-center justify-center text-xl font-semibold border-4 border-white shadow-sm select-none`}>
                                    {initials}
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles.badge}`}>
                                    {role}
                                </span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">{userid}</h1>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <span>📅</span>Member since {joinedDate}
                            </p>
                            <hr className="my-5 border-gray-100" />
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Account Info</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[11px] text-gray-400 mb-1">User ID</p>
                                    <p className="text-sm font-medium text-gray-900 break-all">{userid}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[11px] text-gray-400 mb-1">Role</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{role}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 col-span">
                                    <p className="text-[11px] text-gray-400 mb-1">Session Token</p>
                                    <p className="text-[11px] font-mono text-gray-500 break-all">{shortToken}</p>
                                </div>
                            </div>
                            <hr className="my-5 border-gray-100" />
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Permissions</p>
                            <div className="flex flex-wrap gap-2">
                                {PERM_LIST.map(p => (
                                    <PermChip
                                        key={p.key}
                                        label={p.label}
                                        active={p.roles.includes(role)}
                                    />
                                ))}
                            </div>
                            <hr className="my-5 border-gray-100" />
                            <div className="flex flex-col gap-2">
                                {(role === "admin" || role === "superadmin") && (
                                    <button
                                        onClick={() => navigate("/admin")}
                                        className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-colors
                                            ${role === "superadmin"
                                                ? "border-purple-200 text-purple-700 hover:bg-purple-50"
                                                : "border-blue-200 text-blue-700 hover:bg-blue-50"
                                            }
                                    `}
                                    >
                                        🛡️ Go To Admin Panel
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                                >
                                    🚪 Log Out
                                </button>
                                <button className="mt-2 rounded-xl border border-red-200 bg-red-200 bg-red-50/50 p-4" >
                                    <p className="text-[11px] font-semibold text-red-400 uppercase tracking-widest mb-1" >Danger Zone</p>
                                    <p className="text-xs text-gray-400 mb-3" >Once deleted, you account cannot be recovered</p>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="w-full py-2.5 rounded-xl cursor-pointer bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                                    >
                                        Delete Account
                                    </button>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile