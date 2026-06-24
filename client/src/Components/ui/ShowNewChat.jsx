import React from "react"

function ShowNewChat({ newChatUser, setNewChatUser, startChat }) {

    return (
        <div className="flex gap-1.5" >
            <input
                value={newChatUser}
                onChange={e => setNewChatUser(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startChat(newChatUser)}
                placeholder="User ID..."
                className="flex-1 text-xs px-2 py-1.5 border border-black/10 rounded-md outline-none font-mono 
                bg-[#f5f5f2] focus:border-[#4ecdc4] transition-colors"
            />
            <button
                onClick={() => startChat(newChatUser)}
                className="bg-[#4ecdc4] text-white border-none rounded-md px-2.5 py-1.5 text-xs cursor-pointer font-mono"
            >
                Go
            </button>
        </div>
    )

}

export default ShowNewChat