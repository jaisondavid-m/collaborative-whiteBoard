import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import API from "../../api/axios.js"
import { useAuthStore } from "../../store/authStore.js"

function GoogleLoginButton({ toast, setLoading }) {

    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const handleSuccess = async (credentialResponse) => {
        const token = credentialResponse?.credential
        if (!token) {
            toast("Google Login Failed", "error")
            return
        }
        try {
            setLoading(true)
            const response = await API.post("/auth/google", { token })
            // localStorage.setItem("token", response.data.token)
            // localStorage.setItem("userid", response.data.userid)
            // localStorage.setItem("role", response.data.role)
            login(response.data.token, response.data.userid, response.data.role)
            toast("Login Successful")
            navigate("/home")
        } catch (err) {
            toast(err.response?.data?.error || "Google Login Failed", "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast("Google Login Failed", "error")}
        />
    )
}

export default GoogleLoginButton