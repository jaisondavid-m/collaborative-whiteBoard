import API from "./axios.js"
// import { useAuthStore } from "../store/authStore.js"

export const createRoom = (data) =>
    API.post("/api/room/create",data)

export const joinRoomSocket = (roomId,token,password="") =>
    new WebSocket(
        `ws://localhost:8000/api/room/join/${roomId}?token=${encodeURIComponent(token) || ""}&password=${encodeURIComponent(password)}`
    )

export const checkRoomPassword = (roomId, password) => 
    API.post(`/api/room/check/${roomId}`,{password})