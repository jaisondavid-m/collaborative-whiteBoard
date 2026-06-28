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
        desc: "sample",
        accent: "#4ecdc4",
    }
]

function FriendsFeatureSection() {
    return (
        <section>
            {FRIEND_FEATURES.map((f, i) => (
                <FriendCard
                    key={f.title} 
                    {...f}
                    delay={i * 80}
                />
            ))}
        </section>
    )
}

export default FriendsFeatureSection