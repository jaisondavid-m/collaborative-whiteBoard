import React from "react"

function RoomLayout({
    children
}) {
    return (
        <div className="min-h-screen bg-[#f5f5f2] flex items-center justify-center p-5">
            {children}
        </div>
    )
}

export default RoomLayout