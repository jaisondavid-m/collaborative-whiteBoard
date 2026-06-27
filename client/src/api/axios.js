import axios from "axios"

const API = axios.create({
    baseURL: "http://localhost:8000", //backend url
    headers: {
        "Content-Type":"application/json"
    }
})

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
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
            localStorage.removeItem("token")
            window.dispatchEvent(new Event("auth:logout"))
        }
        return Promise.reject(error)
    }
)

export default API