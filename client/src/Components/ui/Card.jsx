import React from "react"

function Card({ children }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            {children}
        </div>
    )
}

export default Card