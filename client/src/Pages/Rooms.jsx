import React from "react"
import { useNavigate } from "react-router-dom"

import RoomLayout from "../Components/room/RoomLayout.jsx"
import CreateRoomForm from "../Components/room/CreateRoomForm.jsx"
import JoinRoomForm from "../Components/room/JoinRoomForm.jsx"

function Rooms() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono">
            {/* <header className="h-14 bg-white border-b border-black/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-7 h-7 bg-[#4ecdc4] rounded-md flex items-center justify-center text-white">⬡</span>
                    SketchBoard
                </div>
                <button
                    onClick={() => navigate("/home")}
                    className="text-sm text-gray-400 hover:text-gray-600"
                >
                    ← Back to Home
                </button>
            </header> */}
            <RoomLayout>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <CreateRoomForm />
                    <JoinRoomForm />
                </div>
            </RoomLayout>
        </div>
    )
}

export default Rooms