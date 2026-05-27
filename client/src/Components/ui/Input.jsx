import React from "react"

function Input({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    name,
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
        </div>
    )
}

export default Input