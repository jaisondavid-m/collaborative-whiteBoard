import React , { useState } from "react"

import Card from "../ui/Card.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"

import { useToast } from "../../hooks/useToast.js"
import ToastContainer from "../ui/Toast.jsx"

import { useNavigate } from "react-router-dom"

import { checkRoomPassword } from "../../api/room.api.js"

function JoinRoomForm() {

    const navigate = useNavigate()

    const [roomId, setRoomId] = useState("")

    const [password, setPassword] = useState("")

    const [needsPassword, setNeedsPassword] = useState(false)

    const [loading, setLoading] = useState(false)

    const { toasts, toast } = useToast()

    const handleJoin = async (e) => {
        e.preventDefault()
        if (!roomId.trim()) return
        setLoading(true)
        try {
            await checkRoomPassword(roomId,password)
            navigate(`/whiteboard/${roomId}`)
        } catch (err) {
            const msg = err.response?.data?.error || "Error"
            if (err.response?.status === 401) {
                setNeedsPassword(true)
                toast("Wrong Password")
            } else {
                toast(msg)
            }
        } finally {
            setLoading(false)
        }
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
                    {needsPassword && (
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter room password"
                        />
                    )}
                    <Button type="submit" disabled={loading}>
                        {/* Join Room */}
                        {loading ? "Checking..." : "Join Room"}
                    </Button>
                </form>
                <ToastContainer toasts={toasts} />
            </div>
        </Card>
    )

}

export default JoinRoomForm

