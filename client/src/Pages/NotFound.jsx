import React, { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

function NotFound() {

    const navigate = useNavigate()
    const pathRef = useRef(null)

    useEffect(() => {
        if (pathRef.current) {
            const length = pathRef.current.getTotalLength()
            pathRef.current.style.strokeDasharray = length
            pathRef.current.style.animation = "draw-path 2s ease forwards"
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono flex flex-col items-center justify-center px-4" >

            {/* Floating canvas illustration */}
            <div
                className="mb-8"
                style={{
                    animation: "float 3s ease-in-out infinite",
                }}
            >
                <svg
                    width="220"
                    height="160"
                    viewBox="0 0 220 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="20" y1="20" width="180" height="120"
                        rx="10"
                        fill="white"
                        stroke="#e0e0da"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="20" y="20" width="180" height="28"
                        rx="10"
                        fill="#f5f5f2"
                        stroke="#e0e0da"
                        strokeWidth="1.5"
                    />
                    <rect x="20" y="34" width="180" height="14" fill="#f5f5f2" />
                    <circle cx="40" cy="34" r="5" fill="#f0877a" />
                    <circle cx="57" cy="34" r="5" fill="#f5c842" />
                    <circle cx="74" cy="34" r="5" fill="#5fcf80" />
                    <path
                        ref={pathRef}
                        d="M50 90 Q80 60 110 90 Q140 120 170 80"
                        stroke="#4ecdc4"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M5 110 L175 110"
                        stroke="#e0e0da"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                    />
                    <rect
                        x="85" y="68" width="52" height="22" rx="4"
                        fill="#4ecdc4"
                        fillOpacity="0.15"
                        stroke="#4ecdc4"
                        strokeWidth="1"
                    />
                    <text
                        x="111" y="83"
                        textAnchor="middle"
                        fontFamily="ui-monospace, monospace"
                        fontSize="10"
                        fill="#0f6e56"
                    >
                        404
                    </text>
                    <rect x="148" y="100" width="8" height="8" rx="2" fill="#4ecdc4" fillOpacity="0.5" />
                    <rect x="50" y="72" width="8" height="8" rx="2" fill="#e0e0da" />
                    <rect x="165" y="58" width="6" height="6" rx="1" fill="#f5c842" fillOpacity="0.6" />
                    <line
                        x1="161" y1="81" x2="161" y2="95"
                        stroke="#4ecdc4"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        style={{
                            animation: "blink 1s step-end infinite"
                        }}
                    />
                </svg>
            </div>
            {/* Badge */}
            <div className="mb-3 animate-fade-up" style={{ animationDelay: "0.1s" }} >
                <span
                    className="text-[13px] text-[#4ecdc4] bg-[#e1f5ee] px-3 py-1 rounded-full tracking-wide"
                >
                    404 - Page Not Found
                </span>
            </div>
            <h1
                className="text-[26px] font-medium text-gray-900 text-center mb-2 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
            >
                This Page doesn't exist
            </h1>
            <p
                className="text-[14px] text-gray-400 text-center max-w-sm leading-relaxed mb-8 animate-fade-up"
                style={{ animation: "0.3s" }}
            >
                The page you're looking for may have been deleted or might be wrong
            </p>
            <div
                className="flex flex-wrap gap-3 justify-center animate-fade-up"
                style={{ animationDelay: "0.45s" }}
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-[13px] rounded-[10px] border border-gray-900 hover:bg-[#4ecdc4] hover:border-[#4ecdc4] transition-all duration-150"
                    // style={{ animationDelay: "0.45s" }}
                >
                    ← Back to Home
                </button>
                <button
                    onClick={() => navigate("/room")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-[13px] rounded-[10px] border border-black/10 hover:border-[#4ecdc4] transition-all duration-150 "
                >
                    Create a room
                </button>
            </div>
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }
                    @keyframes fade-up {
                        from { opacity: 0; transform: translateY(12px) }
                        to { opacity: 1, transform: translateY(0) }
                    }
                    @keyframes draw-path {
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                    }
                `}
            </style>
        </div>
    )
}

export default NotFound