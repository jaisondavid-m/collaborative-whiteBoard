
//Not in use . it is converted to zustand store

import React, { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

    const [token, setToken] = useState(() => localStorage.getItem("token"))

    useEffect(() => {

        const handleLogout = () => setToken(null)

        window.addEventListener("auth:logout", handleLogout)

        return () => window.removeEventListener("auth:logout", handleLogout)
    },[])

    const login = (newToken, userid, role) => {

        localStorage.setItem("token", newToken)
        localStorage.setItem("userid", userid)
        localStorage.setItem("role", role)

        setToken(newToken)

    }

    const logout = () => {

        localStorage.removeItem("token")
        localStorage.removeItem("userid")
        localStorage.removeItem("role")

        setToken(null)

    }

    return (
        <AuthContext.Provider value={{ token, login, logout }} >
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () => useContext(AuthContext)