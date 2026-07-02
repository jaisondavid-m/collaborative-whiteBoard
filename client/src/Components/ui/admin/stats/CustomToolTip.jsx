import React from "react"

function CustomToolTip({ active, payload, label }) {

    if (!active || !payload.length) return null

    return (
        <div className="bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg" >
            <p className="font-medium" >
                {label}
            </p>
            <p className="text-[#4ecdc4]" >
                {payload[0].value} visits
            </p>
        </div>
    )

}

export default CustomToolTip