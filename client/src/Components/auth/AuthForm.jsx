import React , { useState } from "react"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import Card from "../ui/Card.jsx"

function AuthForm({
    title,
    buttonText,
    onSubmit,
}) {

    const [formData, setFormData] = useState({
        userid: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Card>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-gray-500 mt-2">Welcome Back</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        type="text"
                        label="User ID"
                        placeholder="Enter userid"
                        value={formData.userid}
                        onChange={handleChange}
                        name="userid"
                    />
                    <Input
                        label="Password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        type="password"
                        name="password"
                    />
                    <Button type="submit">
                        {buttonText}
                    </Button>
                </form>
            </div>
        </Card>
    )

}

export default AuthForm