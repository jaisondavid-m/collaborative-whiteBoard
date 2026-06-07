import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios.js"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"

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
    // const [error, setError] = useState("")
    const { toasts, toast } = useToast()

    const role = localStorage.getItem("role")
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
                            ? {...u , is_deleted: true}
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Logged in as <span className="font-medium">{role}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/home")}
                        className="text-sm text-gray-600 hover:text-black underline"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
            </div>
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        Loading users...
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex justify-center items-center">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100/80 backdrop-blur border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">User ID</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">Role</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-600">Joined</th>
                                    {canViewAdminPanel && (
                                        <th className="text-left px-6 py-3 font-medium text-gray-600">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr
                                        key={user.ID}
                                        className="hover:bg-gray-50/40 transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2" >
                                                {user.userid}
                                                {user.is_blocked && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800" >
                                                        Blocked
                                                    </span>
                                                )}
                                                {user.is_deleted && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800" >
                                                        Deleted
                                                    </span>
                                                )}
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
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4">
                                                {user.role === "superadmin" ? (
                                                    <span className="text-gray-400">Protected</span>
                                                ) : (
                                                    <div className="flex gap-2">
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
                        {users.length === 0 && (
                            <div className="text-center py-12 text-gray-400">No users found</div>
                        )}
                    </div>
                )}
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
                                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gay-50"
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
            <ToastContainer toasts={toasts} />
        </div>
    )
}

export default AdminPage