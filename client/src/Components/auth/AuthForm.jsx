import React, { useState } from "react"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import Card from "../ui/Card.jsx"
import GoogleLoginButton from "../ui/GoogleLoginButton.jsx"

import PasswordRequirements from "./PasswordRequirements.jsx"
import PasswordStrength from "./PasswordStrength.jsx"

function AuthForm({
    title,
    buttonText,
    onSubmit,
    toast,
    setLoading,
    isRegister = false,
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

        if (isRegister && !isPasswordValid()) {
            toast(
                "Password doest not meet all requirements",
                "error"
            )
            return
        }

        onSubmit(formData)

    }

    const isPasswordValid = () => {
        return (
            formData.password.length >= 8 &&
            /[A-Z]/.test(formData.password) &&
            /[a-z]/.test(formData.password) &&
            /[0-9]/.test(formData.password) &&
            /[!@#$%^&*()_+\-=?"'\\/|<>.,;:()[\]{}]/.test(formData.password)
        )
    }

    return (
        <Card>
            <div
                className="flex flex-col gap-3"
            // style={{ minWidth: "340px", maxWidth: "400px" }}
            >
                <div className="" >
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-400 mt-1 text-sm">
                        {isRegister
                            ? "Create your SketchBoard account"
                            : "Welcom back to SketchBoard !"
                        }
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <Input
                        type="text"
                        label="User ID"
                        placeholder="Enter your user ID"
                        value={formData.userid}
                        onChange={handleChange}
                        name="userid"
                    />
                    <Input
                        label="Password"
                        placeholder="Enter your Password"
                        value={formData.password}
                        onChange={handleChange}
                        type="password"
                        name="password"
                    />
                    {isRegister && (
                        <div className="grid grid-cols-2 gap-2 items-stretch" >
                            <div className="flex-1" >
                                <PasswordStrength
                                    password={formData.password}
                                />
                            </div>
                            <div className="flex-1" >
                                <PasswordRequirements
                                    password={formData.password}
                                />
                            </div>
                            
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={
                            isRegister && !isPasswordValid()
                        }
                        className="w-full mt-1 py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                        style={{
                            background: (isRegister && !isPasswordValid())
                                ? "#a0d8d5"
                                : "linear-gradient(135deg, #4ecdc4, #45b7aa)",
                            cursor: (isRegister && !isPasswordValid()) ? "not-allowed" : "pointer",
                            boxShadow: (isRegister && !isPasswordValid())
                                ? "none"
                                : "0px 2px 12px rgba(78,205,196,0.35)"
                        }}
                    >
                        {buttonText}
                    </button>
                </form>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
                <GoogleLoginButton toast={toast} setLoading={setLoading} />
            </div>
        </Card>
    )

}

export default AuthForm