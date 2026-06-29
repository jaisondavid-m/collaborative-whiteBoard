import React, { useState } from "react"
import Input from "../ui/Input.jsx"
import Button from "../ui/Button.jsx"
import Card from "../ui/Card.jsx"
import GoogleLoginButton from "../ui/GoogleLoginButton.jsx"

import PasswordRequirements from "./PasswordRequirements.jsx"
import PasswordStrength from "./PasswordStrength.jsx"

import { RiEyeLine, RiEyeOffLine } from "react-icons/ri"

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

    const [showPassword, setShowPassword] = useState(false)

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
                    <div className="flex flex-col gap-1" >
                        <label className="text-sm font-medium text-gray-700" >Password</label>
                        <div className="relative" >
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                outline-none focus:border-[#4ecdc4] transition-colors pr-10 bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword( v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                hover:text-gray-600 transition-colors"
                            >
                                {
                                    showPassword
                                        ? <RiEyeOffLine size={16} />
                                        : <RiEyeLine size={16} />
                                }
                            </button>
                        </div>
                    </div>

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