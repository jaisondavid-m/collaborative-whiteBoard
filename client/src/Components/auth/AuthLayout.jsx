import React from "react"

function AuthLayout({ children }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center flex-col px-4 py-6"
            style={{
                backgroundImage: "linear-gradient(135deg, #f0fdfb 0%, #eef7ff 45%, #f5f3ff 100%),radial-gradient(circle at 10% 10%, rgba(78,205,196,0.16) 0%, transparent 65%),radial-gradient(circle at 90% 0%, rgba(69,183,170,0.12) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(147,139,236,0.10) 0%, transparent 50%)" 
            }}
        >
            <div className="mb-5 mt-2 text-center">
                <div className="inline-block" >
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
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
            <div className="w-full" style={{ maxWidth: "420px" }} >
                {children} 
            </div>
        </div>
    )
}

export default AuthLayout