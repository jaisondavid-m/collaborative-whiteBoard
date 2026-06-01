import React from "react"

function Card({ children }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
            {children}
        </div>
    )
}

export default Card