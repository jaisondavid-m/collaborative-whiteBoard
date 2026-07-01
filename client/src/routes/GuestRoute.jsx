import React from "react"
import { Navigate } from "react-router-dom"
// import { useAuth } from "../context/AuthContext.jsx"
import { useAuthStore } from "../store/authStore.js"

function GuestRoute({ children }) {
    
    const { token } = useAuthStore()

    return token ? <Navigate to="/home" /> : children

}

export default GuestRoute