import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../api/axios.js"
import AuthLayout from "../Components/auth/AuthLayout"
import AuthForm from "../Components/auth/AuthForm"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"

function Register() {

    // const navigate = useNavigate()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { toasts, toast } = useToast()

    const handleRegister = async (data) => {
        try {
            setLoading(true)
            const response = await API.post(
                "/auth/register",
                data
            )
            localStorage.setItem(
                "token",
                response.data.token
            )
            toast("Account Created Successfully")
            setTimeout(() => {
                navigate("/home")
            }, 500);
            // alert("Registration successfull")
            // navigate("/home")
            // console.log(response.data)
        } catch (error) {
            // console.error(error)
            // alert(
            //     error.response?.data?.error ||
            //     "Registration Failed"
            // )
            toast(error.response?.data?.error || "Registration Failed", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <AuthLayout>
                <AuthForm
                    title="Create Account"
                    buttonText={loading ? "Registering..." : "Register"}
                    onSubmit={handleRegister}
                />
                <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-black font-semibold"
                    >
                        Login
                    </Link>
                </p>
            </AuthLayout>
            <ToastContainer toasts={toasts}/>
        </div>

    )
}

export default Register