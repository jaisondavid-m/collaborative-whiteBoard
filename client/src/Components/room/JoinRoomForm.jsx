import React , { useState } from "react"

import Card from "../ui/Card.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"

import { useToast } from "../../hooks/useToast.js"
import ToastContainer from "../ui/Toast.jsx"

import { useNavigate } from "react-router-dom"

function JoinRoomForm() {

    const navigate = useNavigate()

    const [roomId, setRoomId] = useState("")

    const { toasts, toast } = useToast()

    const handleJoin = (e) => {
        e.preventDefault()
        navigate(`/whiteboard/${roomId}`)
    }

    return (
        <Card> 
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Join Room</h1>
                    <p className="text-gray-500 mt-1">Connect to live whiteBoard</p>
                </div>
                <form
                    onSubmit={handleJoin}
                    className="flex flex-col gap-4"
                >
                    <Input
                        label="Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter Room ID"
                    />
                    <Button type="submit">
                        Join Room
                    </Button>
                </form>
                <ToastContainer toasts={toasts} />
            </div>
        </Card>
    )

}

export default JoinRoomForm

