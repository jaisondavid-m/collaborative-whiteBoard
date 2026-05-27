import React from "react"

function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-y-5 px-4">
            {children}
        </div>
    )
}

export default AuthLayout