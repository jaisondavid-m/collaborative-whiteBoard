import API from "./axios.js"

export const createRoom = (data) =>
    API.post("/api/room/create",data)

export const joinRoomSocket = (roomId,password="") =>
    new WebSocket(
        `ws://localhost:8000/api/room/join/${roomId}?token=${localStorage.getItem("token") || ""}&password=${encodeURIComponent(password)}`
    )

export const checkRoomPassword = (roomId, password) => 
    API.post(`/api/room/check/${roomId}`,{password})