import React , { useState, useRef, useEffect } from "react"

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

    const passwordRef = useRef(null)

    const { toasts, toast } = useToast()

    const handleJoin = async (e) => {

        e.preventDefault()

        const trimmedId = roomId.trim()

        if (!trimmedId) {
            toast("Enter a Room ID first")
            return
        }

        // if (!roomId.trim()) return
        setLoading(true)

        try {

            await checkRoomPassword(trimmedId,password)

            navigate(`/whiteboard/${trimmedId}`, {
                state: { password, flash: "Joined room" }
            })

        } catch (err) {

            const msg = err.response?.data?.error || "Error"

            if (err.response?.status === 403) {
                setNeedsPassword(true)
                toast(needsPassword ? "Wrong Password" : "This room needs a password")
            } else if (err.response?.status === 401) {
                toast("Room not found")
            } else {
                toast(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (needsPassword)
            passwordRef.current?.focus()
    }, [needsPassword])

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
                            ref={passwordRef}
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

