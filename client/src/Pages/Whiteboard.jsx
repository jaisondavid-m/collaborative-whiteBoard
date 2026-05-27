import React , { useEffect } from "react"

import { useParams } from "react-router-dom"

import { joinRoomSocket } from "../api/room.api.js"

function Whiteboard() {

    const { roomId } = useParams()

    useEffect(() => {

        const socket = joinRoomSocket(roomId)

        socket.onopen = () => {
            console.log("Connected")
        }

        socket.onmessage = (event) => {
            console.log(event.data)
        }

        return () => {
            socket.close()
        }

    },[roomId])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold">WhiteBoard Room: {roomId}</h1>
        </div>
    )

}

export default Whiteboard