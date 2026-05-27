import React , { useState } from "react"
import { Link , useNavigate } from "react-router-dom"
import API from "../api/axios.js"
import AuthLayout from "../Components/auth/AuthLayout.jsx"
import AuthForm from "../Components/auth/AuthForm.jsx"

function Login() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (data) => {
        try {
            setLoading(true)
            const response = await API.post(
                "/auth/login",
                data
            )
            localStorage.setItem(
                "token",
                response.data.token
            )
            alert("Login SuccessFull")
            navigate("/home")
            console.log(response.data)
        } catch (error) {
            console.error(error)
            alert(error.response?.data?.error || "Login Failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <AuthForm
                title="Login"
                buttonText={loading ? "Logging in..." : "Login"}
                onSubmit={handleLogin}
            />
            <p className="text-sm text-center text-gray-500">
                Don't have and account?{" "}
                <Link
                    to="/register"
                    className="text-black font-semibold"
                >
                    Register
                </Link>
            </p>
        </AuthLayout>
    )

}

export default Login