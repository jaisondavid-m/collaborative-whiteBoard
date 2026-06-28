import React from "react"

function Card({ children }) {
    return (
        <div
            className="bg-white px-6 py-6 rounded-2xl w-full"
            style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.06)"
            }}
        >
            {children}
        </div>
    )
}

export default Card