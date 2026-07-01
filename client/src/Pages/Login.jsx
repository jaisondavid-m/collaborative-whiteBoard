import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../api/axios.js"
import AuthLayout from "../Components/auth/AuthLayout.jsx"
import AuthForm from "../Components/auth/AuthForm.jsx"

import ToastContainer from "../Components/ui/Toast.jsx"
import { useToast } from "../hooks/useToast.js"
// import { useAuth } from "../context/AuthContext.jsx"
import { useAuthStore } from "../store/authStore.js"

function Login() {

    const { login } = useAuthStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { toasts, toast } = useToast()

    const handleLoginV2 = async (data) => {
        try {
            const response = await API.post("/auth/login", data)
            login(
                response.data.token,
                response.data.userid,
                response.data.role
            )
            toast("Login Successful")
            navigate("/home")
        } catch (error) {
            toast(error.response?.data?.error || "Login failed", "error")
        }
    }

    // const handleLogin = async (data) => {
    //     try {
    //         setLoading(true)
    //         const response = await API.post(
    //             "/auth/login",
    //             data
    //         )
    //         localStorage.setItem(
    //             "token",
    //             response.data.token
    //         )
    //         localStorage.setItem("userid",response.data.userid)
    //         localStorage.setItem("role",response.data.role)
    //         // alert("Login SuccessFull")
    //         // navigate("/home")
    //         // console.log(response.data)
    //         toast("Login Successful")
    //         setTimeout(() => navigate("/home"), 500)
            
    //     } catch (error) {
    //         // console.error(error)
    //         // alert(error.response?.data?.error || "Login Failed")
    //         toast(error.response?.data?.error || "Login failed", "error")
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    return (
        <div>
            <AuthLayout>
                <AuthForm
                    title="Login"
                    buttonText={loading ? "Logging in..." : "Login"}
                    onSubmit={handleLoginV2}
                    toast={toast}
                    setLoading={setLoading}
                />
                <p className="text-sm text-center mt-5 text-gray-500">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-black font-semibold"
                    >
                        Register
                    </Link>
                </p>
            </AuthLayout>
            <ToastContainer toasts={toasts} />
        </div>

    )

}

export default Login