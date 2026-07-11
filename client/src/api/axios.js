import axios from "axios"
import { useAuthStore } from "../store/authStore.js"

const API = axios.create({
    baseURL: "https://cw.bitsathy.in", //backend url
    headers: {
        "Content-Type":"application/json"
    }
})

API.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token
        // const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // localStorage.removeItem("token")
            // window.dispatchEvent(new Event("auth:logout"))
            useAuthStore.getState().logout()
        }
        return Promise.reject(error)
    }
)

export default API