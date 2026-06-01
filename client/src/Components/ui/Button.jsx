import React from "react"

function Button({ children , type = "button" , onClick , disabled=false , className="" , ...props }) {
    return (
        <button
            {...props}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full py-3 rounded-xl font-medium transition
                ${
                    disabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:opacity-90"
                }
                ${className}
            `}
        >
            {children}
        </button>
    )
}

export default Button