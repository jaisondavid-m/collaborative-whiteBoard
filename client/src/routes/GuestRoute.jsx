import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

function GuestRoute({ children }) {
    
    const { token } = useAuth()

    return token ? <Navigate to="/home" /> : children

}

export default GuestRoute