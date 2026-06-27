import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function RootRedirect() {

    const { token } = useAuth()

    return <Navigate to={token ? "/home" : "/login"} />

}

export default RootRedirect