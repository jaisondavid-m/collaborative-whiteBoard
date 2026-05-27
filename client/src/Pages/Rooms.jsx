import React from "react"

import RoomLayout from "../Components/room/RoomLayout.jsx"
import CreateRoomForm from "../Components/room/CreateRoomForm.jsx"
import JoinRoomForm from "../Components/room/JoinRoomForm.jsx"

function Rooms() {
    return (
        <RoomLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                <CreateRoomForm/>
                <JoinRoomForm/>
            </div>
        </RoomLayout>
    )
}

export default Rooms