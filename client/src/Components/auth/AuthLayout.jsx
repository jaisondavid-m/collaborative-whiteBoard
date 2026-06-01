import React from "react"

function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 px-4">
            <div className="mb-8 mt-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    SketchBoard
                </h1>
                <p className="text-gray-500 mt-2">
                    Real-Time Collaborative Whiteboard
                </p>
            </div>
            {children}
        </div>
    )
}

export default AuthLayout