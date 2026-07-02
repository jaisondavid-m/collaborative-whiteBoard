import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore.js"

function RootRedirect() {

    const { token } = useAuthStore()

    return <Navigate to={token ? "/home" : "/login"} />

}

export default RootRedirect