import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

function ProtectedRoute({
    children
}) {

    // const token = localStorage.getItem("token")
    const { token } = useAuth()

    if (!token) {
        return (
            <Navigate to="/login" />
        )
    }

    return children

}

export default ProtectedRoute