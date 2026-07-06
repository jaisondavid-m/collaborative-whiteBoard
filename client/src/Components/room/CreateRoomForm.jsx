import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../ui/Card.jsx"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import { useToast } from "../../hooks/useToast.js"
import ToastContainer from "../ui/Toast.jsx"

import { createRoom } from "../../api/room.api.js"

function generateRoomId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function CreateRoomForm() {

    const [formData, setFormData] = useState({
        roomId: "",
        name: "",
        password: "",
    })

    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const { toasts, toast } = useToast()

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null })
        }
    }

    const handleGenerateId = () => {
        setFormData(prev => ({ ...prev, roomId: generateRoomId() }))
        setErrors(prev => ({ ...prev, roomId: null }))
    }

    const validate = () => {

        const next = {}

        if (!formData.roomId.trim())
            next.roomId = "Room ID is required"
        else if (/\s/.test(formData.roomId))
            next.roomId = "No spaces allowed"
        if (!formData.name.trim())
            next.name = "Give your room a name"
        setErrors(next)
        return Object.keys(next).length === 0

    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (submitting) return
        if (!validate()) return

        setSubmitting(true)

        try {
            await createRoom(formData)
            // const response = await createRoom(
            //     formData
            // )
            navigate(`/whiteboard/${formData.roomId}`, {
                state: {
                    password: formData.password,
                    flash: `Room "${formData.name}" created`,
                },
            })
            // console.log(response.data)
            // toast("Room Created successfully")
        } catch (error) {
            // alert(error.response?.data?.error)
            toast(error.response?.data?.error || "Couldn't create room, try agin")
        } finally {
            setSubmitting(false)
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
                    <div>
                        <div className="flex items-end gap-2" >
                            <div className="flex-1" >
                                <Input
                                    label="Room ID"
                                    name="roomId"
                                    value={formData.roomId}
                                    onChange={handleChange}
                                    placeholder="Enter or generate a Room ID"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateId}
                                className="h-[42px] px-3 text-xs border border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
                            >
                                Generate
                            </button>
                        </div>
                        {
                            errors.roomId && (
                                <p className="text-xs text-red-500 mt-1" >
                                    {errors.roomId}
                                </p>
                            )
                        }
                    </div>

                    <div>
                        <Input
                            label="Room Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter Room Name"
                        />
                        {
                            errors.name && (
                                <p className="text-xs text-red-500 mt-1" >
                                    {errors.name}
                                </p>
                            )
                        }
                    </div>

                    <Input
                        label="Password (optional)"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave Blank for public room"
                    />

                    <Button type="submit" disabled={submitting}>
                        { submitting ? "Creating..." : "Create Room" }
                    </Button>
                </form>
                <ToastContainer toasts={toasts} />
            </div>
        </Card>
    )

}

export default CreateRoomForm