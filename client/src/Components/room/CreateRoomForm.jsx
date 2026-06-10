import React , { useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../ui/Card.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { useToast } from "../../hooks/useToast.js"
import ToastContainer from "../ui/Toast.jsx"

import { createRoom } from "../../api/room.api.js"

function CreateRoomForm() {

    const [formData, setFormData] = useState({
        roomId: "",
        name: "",
        password: "",
    })

    const { toasts , toast } = useToast()

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await createRoom(
                formData
            )
            navigate(`/whiteboard/${formData.roomId}`)
            // console.log(response.data)
            toast("Room Created successfully")
        } catch (error) {
            // alert(error.response?.data?.error)
            toast(error.response?.data?.error)
        }
    }

    return (
        <Card>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Create Room</h1>
                    <p className="text-gray-500 mt-1">
                        Start Collaborative Session
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <Input
                        label="Room ID"
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        placeholder="Enter the Room ID"
                    />
                    <Input
                        label="Room Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Room Name"
                    />
                    <Input
                        label="Password (optional)"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave Blank for public room"
                    />
                    <Button type="submit">
                        Create Room
                    </Button>
                </form>
                <ToastContainer toasts={toasts} />
            </div>
        </Card>
    )

}

export default CreateRoomForm