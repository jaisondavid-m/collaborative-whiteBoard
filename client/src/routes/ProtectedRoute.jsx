import React from "react"
import { Navigate } from "react-router-dom"
// import { useAuth } from "../context/AuthContext.jsx"
import { useAuthStore } from "../store/authStore.js"

function ProtectedRoute({
    children
}) {

    // const token = localStorage.getItem("token")
    const { token } = useAuthStore()

    if (!token) {
        return (
            <Navigate to="/login" />
        )
    }

    return children

}

export default ProtectedRoute