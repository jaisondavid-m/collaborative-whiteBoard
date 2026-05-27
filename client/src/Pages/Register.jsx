import React , {useState} from "react"
import { Link , useNavigate } from "react-router-dom"
import API from "../api/axios.js"
import AuthLayout from "../Components/auth/AuthLayout"
import AuthForm from "../Components/auth/AuthForm"

function Register() {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

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
            alert("Registration successfull")
            navigate("/home")
            console.log(response.data)
        } catch (error) {
            console.error(error)
            alert(
                error.response?.data?.error ||
                "Registration Failed"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
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
    )
}

export default Register