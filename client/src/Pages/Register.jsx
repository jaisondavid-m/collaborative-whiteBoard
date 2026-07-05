import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../api/axios.js"
import AuthLayout from "../Components/auth/AuthLayout"
import AuthForm from "../Components/auth/AuthForm"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"
import { useAuthStore } from "../store/authStore.js"

function Register() {

    // const navigate = useNavigate()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { toasts, toast } = useToast()
    const { login } = useAuthStore()

    const handleRegisterV2 = async (data) => {
        try {
            setLoading(true)
            const response = await API.post("/auth/register", data)
            login(
                response.data.token,
                response.data.userid,
                response.data.role
            )
            toast("Account Created Successfully")
            navigate("/home")
        } catch (error) {
            toast(error.response?.data?.error || "Registration Failed", "error")
        } finally {
            setLoading(false)
        }
    }

    // const handleRegister = async (data) => {
    //     try {
    //         setLoading(true)
    //         const response = await API.post(
    //             "/auth/register",
    //             data
    //         )
    //         localStorage.setItem(
    //             "token",
    //             response.data.token
    //         )
    //         localStorage.setItem("userid",response.data.userid)
    //         localStorage.setItem("role",response.data.role)
    //         toast("Account Created Successfully")
    //         setTimeout(() => {
    //             navigate("/home")
    //         }, 500);
    //         // alert("Registration successfull")
    //         // navigate("/home")
    //         // console.log(response.data)
    //     } catch (error) {
    //         // console.error(error)
    //         // alert(
    //         //     error.response?.data?.error ||
    //         //     "Registration Failed"
    //         // )
    //         toast(error.response?.data?.error || "Registration Failed", "error")
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    return (
        <div>
            <AuthLayout>
                <AuthForm
                    title="Create Account"
                    buttonText={loading ? "Registering..." : "Register"}
                    onSubmit={handleRegisterV2}
                    toast={toast}
                    loading={loading}
                    setLoading={setLoading}
                    isRegister={true}
                />
                <p className="text-sm mt-5 text-center text-gray-500">
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