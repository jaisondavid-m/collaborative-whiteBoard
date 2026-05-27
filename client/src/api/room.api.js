import API from "./axios.js"

export const createRoom = (data) =>
    API.post("/api/room/create",data)

export const joinRoomSocket = (roomId) =>
    new WebSocket(
        `ws://localhost:8000/api/room/join/${roomId}?token=${localStorage.getItem("token") || ""}`
    )