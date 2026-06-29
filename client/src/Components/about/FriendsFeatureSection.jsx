import React from "react"
import FriendCard from "./FriendCard.jsx"
import {
    TbUsers, TbUserCheck,
    TbUserX, TbBell,
} from "react-icons/tb"
import {
    RiUserAddLine, RiShieldLine,
} from "react-icons/ri"

const FRIEND_FEATURES = [
    {
        Icon: RiUserAddLine,
        title: "Friend Request",
        desc: "Send and receive friend requests by user ID. Accept or decline from your Friends Tab.",
        accent: "#4ecdc4",
    },
    {
        Icon: TbUserCheck,
        title: "Friends List",
        desc: "Views all your connections in one place. Search, message or remove friends anytime.",
        accent: "#f5a623",
    },
    {
        Icon: TbUserX,
        title: "Block & Unblock",
        desc: "Block users to prevent messages and requests. Unblock them whenever you want.",
        accent: "#e94560",
    },
    {
        Icon: TbBell,
        title: "Notifications",
        desc: "Get notified about friend requests, system alerts and announcements in real time",
        accent: "#7ed321",
    }
]

function FriendsFeatureSection() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-16" >
            <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2" >
                Social
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" >
                Build your network
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                {FRIEND_FEATURES.map((f, i) => (
                    <FriendCard
                        key={f.title}
                        {...f}
                        delay={i * 80}
                    />
                ))}
            </div>
        </section>
    )
}

export default FriendsFeatureSection