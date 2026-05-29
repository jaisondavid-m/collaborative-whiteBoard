import React , { useEffect , useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios.js"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"

function AdminPage() {

    const navigate = useNavigate()
    const [users, setUsers] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [promoting, setPromoting] = useState(null)
    // const [error, setError] = useState("")
    const { toasts , toast } = useToast()

    const role = localStorage.getItem("role")
    const isSuperAdmin = role === "superadmin"
    const canViewAdminPanel = role === "admin" || role === "superadmin"

    useEffect(() => {
        fetchUsers()
    },[])

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
            await API.post("/superadmin/promote",{ userid, role:newRole })
            setUsers(prev => 
                prev.map(u => u.userid === userid ? { ...u, role: newRole } : u )
            )
            toast(`Role updated to ${newRole}`)
        } catch (err) {
            toast(err.response?.data?.error || "Failed to update role","error")
        } finally {
            setPromoting(null)
        }
    }

    const roleColor = (r) => {
        if (r === "superadmin") return "bg-purple-100 text-purple-800"
        if (r === "admin") return "bg-blue-100 text-blue-800"
        return "bg-gray-100 text-gray-700"
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
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
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    Loading users...
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
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
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 px-4 font-medium text-gray-900">{user.userid}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
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
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50"
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
            <ToastContainer toasts={toasts} />
        </div>
    )
}

export default AdminPage