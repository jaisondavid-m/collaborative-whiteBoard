import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios.js"

import ToastContainer from "../Components/ui/Toast.jsx"
import SendNotificationModal from "../Components/ui/notification/SendNotificationModal.jsx"
import { useToast } from "../hooks/useToast.js"
import { RiBellLine } from "react-icons/ri"

import StatsOverview from "../Components/ui/admin/stats/StatsOverview.jsx"

import { useAuthStore } from "../store/authStore.js"

function AdminPage() {

    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [promoting, setPromoting] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [blocking, setBlocking] = useState(null)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [selectedBlockedUser, setSelectedBlockedUser] = useState(null)
    const [showNotifModal, setShowNotifModal] = useState(false)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")
    // const [error, setError] = useState("")
    const { toasts, toast } = useToast()

    const { role } = useAuthStore()
    // const role = localStorage.getItem("role")
    const isSuperAdmin = role === "superadmin"
    const canViewAdminPanel = role === "admin" || role === "superadmin"

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await API.get("/admin/users")
            setUsers(res.data.users)
        } catch (err) {
            toast(err.response?.data?.error || "Failed to load users", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userid, newRole) => {
        try {
            setPromoting(userid)
            await API.post("/superadmin/promote", { userid, role: newRole })
            setUsers(prev =>
                prev.map(u => u.userid === userid ? { ...u, role: newRole } : u)
            )
            toast(`Role updated to ${newRole}`)
        } catch (err) {
            toast(err.response?.data?.error || "Failed to update role", "error")
        } finally {
            setPromoting(null)
        }
    }

    const handleDeleteUser = async () => {

        if (!selectedUser) return

        try {

            setDeleting(selectedUser)

            await API.delete(`/admin/users/${selectedUser}`)

            setUsers(prev =>
                prev.map(u =>
                    u.userid === selectedUser
                        ? { ...u, is_deleted: true }
                        : u
                )

            )

            toast("User deleted successfully")

            setShowDeleteModal(false)
            setSelectedUser(null)

        } catch (err) {
            toast(
                err.response?.data?.error || "Failed to delete user",
                "error"
            )
        } finally {
            setDeleting(null)
        }

    }

    const handleBlockUser = async () => {

        if (!selectedBlockedUser) return

        try {
            setBlocking(selectedBlockedUser)
            await API.put(`/admin/users/${selectedBlockedUser}/block`)
            setUsers(prev =>
                prev.map(u =>
                    u.userid === selectedBlockedUser
                        ? { ...u, is_blocked: true }
                        : u
                )
            )

            toast("User Blocked Successfully")

            setShowBlockModal(false)
            setSelectedBlockedUser(null)

        } catch (err) {
            toast(
                err.response?.data?.error || "Failed to block user",
                "error"
            )
        } finally {
            setBlocking(null)
        }
    }

    const handleUnblockUser = async (userid) => {

        try {
            await API.put(`/admin/users/${userid}/unblock`)
            setUsers(prev =>
                prev.map(u =>
                    u.userid === userid
                        ? { ...u, is_blocked: false }
                        : u
                )
            )
            toast("User unblocked successfully")
        } catch (err) {
            toast(
                err.response?.data?.error || "Failed to unblock user",
                "error"
            )
        }

    }

    const handleRecoverUser = async (userid) => {

        try {

            await API.put(`/admin/users/${userid}`)

            setUsers(prev =>
                prev.map(u =>
                    u.userid === userid
                        ? { ...u, is_deleted: false }
                        : u
                )
            )

            toast("User recovered successfully")

        } catch (err) {

            toast(
                err.response?.data?.error || "Failed to recover user",
                "error"
            )

        }

    }

    const filteredUsers = users.filter(user => {

        const matchedSearch = user.userid.toLowerCase().includes(search.toLowerCase())

        const matchesFilter =
            filter === "all" ||
            (filter === "admin" && user.role === "admin" || user.role === "superadmin") ||
            (filter === "blocked" && user.is_blocked) ||
            (filter === "deleted" && user.is_deleted)

        return matchedSearch && matchesFilter

    })

    const openDeleteModal = (userid) => {
        setSelectedUser(userid)
        setShowDeleteModal(true)
    }

    const openBlockModal = (userid) => {
        setSelectedBlockedUser(userid)
        setShowBlockModal(true)
    }

    const roleColor = (r) => {
        if (r === "superadmin") return "bg-purple-100 text-purple-800"
        if (r === "admin") return "bg-blue-100 text-blue-800"
        return "bg-gray-100 text-gray-700"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Logged in as <span className="font-medium">{role}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3" >
                        <button
                            onClick={() => navigate("/home")}
                            className="text-sm text-gray-600 hover:text-black underline"
                        >
                            ← Back to Home
                        </button>
                        <button
                            onClick={() => setShowNotifModal(true)}
                            className="flex items-center gap-1.5 text-sm bg-[#4ecdc4] text-white px-4 py-2 rounded-xl hover:bg-[#3db8b0] transition-all active:scale-95"
                        >
                            <RiBellLine size={14} /> Send Notification
                        </button>
                    </div>

                </div>
            </div>

            {/* Stats overview */}
            <StatsOverview />

            <div className="max-w-7xl mx-auto mb-4" >
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm" >
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                    />
                </div>
                <div className="flex flex-wrap gap-2 mt-4" >
                    <button
                        onClick={() => setFilter("all")}
                        className={`text-left p-4 bg-white rounded-2xl shadow-sm border transition-colors ${filter === "all"
                            ? "border-[#4ecdc4] ring-1 ring-[#4ecdc4]/30"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-sm text-gray-500" >All</p>
                        <h2 className="text-2xl font-bold mt-1" >
                            {users.length}
                        </h2>
                    </button>
                    <button
                        onClick={() => setFilter("admin")}
                        className={`p-4 text-left bg-white rounded-2xl shadow-sm border transition-colors ${filter === "admin"
                            ? "border-[#4ecdc4] ring-1 ring-[#4ecdc4]/30"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-sm text-gray-500" >Admins</p>
                        <h2 className="text-2xl font-bold mt-1" >
                            {users.filter(u => u.role === "admin").length}
                        </h2>
                    </button>
                    <button
                        onClick={() => setFilter("blocked")}
                        className={`text-left bg-white p-4 rounded-2xl shadow-sm border transition-colors ${filter === "blocked"
                            ? "border-[#4ecdc4] ring-1 ring-[#4ecdc4]/30"
                            : "border-gray-200 hover:border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-sm text-gray-500" >Blocked</p>
                        <h2 className="text-2xl font-bold mt-1" >
                            {users.filter(u => u.is_blocked).length}
                        </h2>
                    </button>
                    <button
                        onClick={() => setFilter("deleted")}
                        className={`text-left bg-white p-4 rounded-2xl shadow-sm border transition-colors ${filter === "deleted"
                            ? "border-[#4ecdc4] ring-1 ring-[#4ecdc4]/30"
                            : "border-gray-200 hover:border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <p className="text-sm text-gray-500" >Deleted</p>
                        <h2 className="text-2xl font-bold mt-1" >
                            {users.filter(u => u.is_deleted).length}
                        </h2>
                    </button>
                </div>
            </div>
            {/* <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <h2 className="text-2xl font-bold mt-1">{users.length}</h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Admins</p>
                    <h2 className="text-2xl font-bold mt-1">{users.filter(u => u.role === "admin").length}</h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Super Admins</p>
                    <h2 className="text-2xl font-bold mt-1">
                        {users.filter(u => u.role === "superadmin").length}
                    </h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm" >
                    <p className="text-sm text-gray-500" >Blocked Users</p>
                    <h2 className="text-2xl font-bold mt-1" >
                        {users.filter(u => u.is_blocked).length}
                    </h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm" >
                    <p className="text-sm text-gray-500" >Delete Users</p>
                    <h2 className="text-2xl font-bold mt-1" >
                        {users.filter(u => u.is_deleted).length}
                    </h2>
                </div>
            </div> */}
            <div className="max-w-7xl mx-auto">
                <div className="px-6 py-4 border-b bg-gray-50 text-center" >
                    <h2 className="font-semibold text-gray-800" >User Management</h2>
                    <p className="text-sm text-gray-500 mt-1" >
                        Manage users, roles, blocks and recoveries.
                    </p>
                </div>
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        Loading users...
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">

                        <table className="w-full text-sm">
                            <thead className="bg-gray-100/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">User</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">Role</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">Joined</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                                    {canViewAdminPanel && (
                                        <th className="text-left px-6 py-3 font-medium text-gray-600">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => (
                                    <tr
                                        key={user.ID}
                                        className="hover:bg-gray-50/40 transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2" >
                                                <div className="w-10 h-10 rounded-full bg-[#e6faf8] text-[#0f6e56] flex items-center justify-center font-semibold" >
                                                    {user.userid.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.userid}</p>
                                                    <p className="text-xs text-gray-500" >
                                                        ID #{user.ID}
                                                    </p>
                                                </div>
                                                {/* {user.is_blocked && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800" >
                                                        Blocked
                                                    </span>
                                                )}
                                                {user.is_deleted && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800" >
                                                        Deleted
                                                    </span>
                                                )} */}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${roleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.CreatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4" >
                                            {user.is_deleted ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                                    Deleted
                                                </span>
                                            ) : user.is_blocked ? (
                                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700" >
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700" >
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4">
                                                {user.role === "superadmin" ? (
                                                    <span className="text-gray-400">Protected</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.role === "user" && (
                                                            <button
                                                                disabled={promoting === user.userid}
                                                                onClick={() => handleRoleChange(user.userid, "admin")}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                                            >
                                                                {promoting === user.userid ? "..." : "Make Admin"}
                                                            </button>
                                                        )}
                                                        {user.role === "admin" && (
                                                            <button
                                                                disabled={promoting === user.userid}
                                                                onClick={() => handleRoleChange(user.userid, "user")}
                                                                className="px-3 py-1 bg-gray-600 text-white rounded-md text-xs hover:bg-gray-700 disabled:opacity-50"
                                                            >
                                                                {promoting === user.userid ? "..." : "Demote to User"}
                                                            </button>
                                                        )}
                                                        {user.is_blocked ? (
                                                            <button
                                                                onClick={() => handleUnblockUser(user.userid)}
                                                                className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                                                            >
                                                                UnBlock
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openBlockModal(user.userid)}
                                                                className="px-3 py-1 bg-yellow-600 text-white rounded-md text-xs hover:bg-yellow-700"
                                                            >
                                                                Block
                                                            </button>
                                                        )}
                                                        {user.is_deleted ? (
                                                            <button
                                                                onClick={() => handleRecoverUser(user.userid)}
                                                                className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                                                            >
                                                                Recover
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openDeleteModal(user.userid)}
                                                                className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}

                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-16 text-gray-400">
                                <div className="text-3xl mb-2" >🔍</div>
                                <p className="text-sm" >
                                    No users match your search or filter
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="max-w-7xl mx-auto mt-6" >
                <div className="grid md:grid-cols-2 gap-4" >
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm" >
                        <h3 className="font-semibold text-lg" >Notifications</h3>
                        <p className="text-sm text-gray-500 mt-2" >
                            Send notifications to users
                        </p>
                        <button
                            onClick={() => setShowNotifModal(true)}
                            className="mt-4 px-4 py-2 bg-[#4ecdc4] text-white rounded-xl"
                        >
                            Send Notification
                        </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm" >
                        <h3 className="font-semibold text-lg" >
                            Audit Logs
                        </h3>
                        <p className="text-sm text-gray-500 mt-2" >
                            View system activities and admin actions.
                        </p>
                        <button
                            onClick={() => navigate("/audit-logs")}
                            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-xl"
                        >
                            View logs
                        </button>
                    </div>
                </div>
            </div>
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" >
                            <h2 className="text-xl font-bold text-gray-900" >
                                Delete User
                            </h2>
                            <p className="mt-3 text-gray-600" >
                                Are you sure you want to delete
                                <span className="font-semibold text-red-600" >
                                    {" "}{selectedUser}
                                </span>
                            </p>
                            <p className="text-sm text-gray-500 mt-2" >
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3 mt-6" >
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedUser(null)
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={deleting}
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting ? "Deleting..." : "Delete User"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showBlockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" >
                            <h2 className="text-xl font-bold text-gray-900" >
                                Block User
                            </h2>
                            <p className="mt-3 text-gray-600" >
                                Are you sure you want to block
                                <span className="font-semibold text-yellow-600" >
                                    {" "}{selectedBlockedUser}
                                </span>
                                ?
                            </p>
                            <p className="text-sm text-gray-500 mt-2" >
                                The user will no longer be able to login.
                            </p>
                            <div className="flex justify-end gap-3 mt-6" >
                                <button
                                    onClick={() => {
                                        setShowBlockModal(false)
                                        setSelectedBlockedUser(null)
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={blocking}
                                    onClick={handleBlockUser}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:opacity-50"
                                >
                                    {blocking ? "Blocking" : "Block User"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <SendNotificationModal
                open={showNotifModal}
                onClose={() => setShowNotifModal(false)}
                users={users}
                onSent={() => toast("Notification sent successfully")}
            />
            <ToastContainer
                toasts={toasts}
            />
        </div>
    )
}

export default AdminPage