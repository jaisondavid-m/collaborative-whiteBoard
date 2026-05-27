import React from "react"

function RoomLayout({
    children
}) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
            {children}
        </div>
    )
}

export default RoomLayout