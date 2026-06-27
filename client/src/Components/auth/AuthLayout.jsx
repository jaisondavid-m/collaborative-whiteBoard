import React from "react"

function AuthLayout({ children }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center flex-col bg-gray-50 px-4"
            style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #e0faf8 0%, transparent 50%), radial-gradient(circle at 80% 80%, #f0f9ff 0%, transparent 50%)" }}
        >
            <div className="mb-8 mt-4 text-center">
                <div className="inline-block" >
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Sketch<span style={{ color: "#4ecdc4" }} >Board</span>
                    </h1>
                    <div style={{
                            height: "3px",
                            background: "linear-gradient(90deg, #4ecdc4, #45b7aa)",  
                            borderRadius: "2px",
                            marginTop: "4px",
                        }} />
                </div>
                <p className="text-gray-400 mt-3 text-sm tracking-wide uppercase font-medium">
                    Real-Time Collaborative Whiteboard
                </p>
            </div>
            {children}
        </div>
    )
}

export default AuthLayout