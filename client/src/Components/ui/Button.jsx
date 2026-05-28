import React from "react"

function Button({ children , type = "button" , onClick , disabled=false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
            {children}
        </button>
    )
}

export default Button