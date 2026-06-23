import React from "react"

function AvatarColor(id = ""){
    const colors = [
        { bg: "rgba(78,205,196,0.15)", text: "#0f6e56" },
        { bg: "rgba(83,74,183,0.12)", text: "#3c3489" },
        { bg: "rgba(216,90,48,0.12)", text: "#993c1d" },
        { bg: "rgba(212,83,126,0.12)", text: "#72243e" }
    ]
    return colors[id.charCodeAt(0) % colors.length]
}
export default AvatarColor