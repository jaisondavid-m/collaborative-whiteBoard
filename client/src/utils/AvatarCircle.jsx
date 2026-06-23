import React from "react"
import AvatarColor from "./AvatarColor.js"

function AvatarCircle({ userId, size = 32 }) {

    const c = AvatarCircle(userId)

    return (
        <div
            style={{
                background: c.bg,
                color: c.text,
                width: size,
                height: size,
                fontSize: size * 0.34
            }}
            className="rounded-full flex items-center justify-center font-medium shrink-0 select-none font-mono"
        >
            {userId.slice(0, 2).toUpperCase()}
        </div>
    )
}

export default AvatarCircle