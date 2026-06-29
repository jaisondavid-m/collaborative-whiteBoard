import React from "react"
import {
    TbMessage2, TbWifi,
    TbEyeOff, TbTrash,
} from "react-icons/tb"

import ChatCard from "./ChatCard.jsx"

const CHAT_FEATURES = [
    {
        Icon: TbMessage2,
        title: "Private Messaging",
        desc: "Chat one-on-one with any user. Conversations are stored and resumed exactly where you left off.",
        accent: "#4ecdc4"
    },
    {
        Icon: TbWifi,
        title: "Live Typing Indicators",
        desc: "See when the other person is typing in real time - powered by the WebSocket connection.",
        accent: "#534ab7",
    },
    {
        Icon: TbEyeOff,
        title: "Online Presence",
        desc: "Know who's online at glance. Green dots show active users across conversations and friend lists.",
        accent: "#f5a623",
    },
    {
        Icon: TbTrash,
        title: "Delete Message",
        desc: "Made a mistake? Delete any message you sent. \
        It disappers from both side of the conversation.",
        accent: "#e94560",
    }
]


function ChatFeatureSection() {
    return (
        <section className="border-t border-black/[0.07] bg-white" >
            <div className="max-w-3xl mx-auto px-6 py-16" >
                <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2" > 
                    Messaging
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mb-8" >
                    Talk while you work
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    {
                        CHAT_FEATURES.map((f,i) => (
                            <ChatCard
                                key={f.title}
                                {...f}
                                delay={ i * 80 }
                            />
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

// function ChatFeatureSection({ Icon, title, desc, accent, delay }) {
//     return (
//         <div
//             className="group bg-white border border-black/[0.07] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md
//             hover:-translate-y-1 transition-all duration-300"
//             style={{
//                 transitionDelay: `${delay}ms`
//             }}
//         >
//             <span
//                 className="w-9 h-9 rounded-xl flex items-center justify-center"
//                 style={{
//                     background: `${accent}18`,
//                     color: accent,
//                 }}
//             >
//                 <Icon size={18} />
//             </span>
//             <div>
//                 <h3 className="text-sm font-semibold text-gray-800 mb-1" >
//                     {title}
//                 </h3>
//                 <p className="text-xs text-gray-500 leading-relaxed" >
//                     {desc}
//                 </p>
//             </div>
//             <span
//                 className="mt-auto w-5 h-0.5 rounded-full transition-all duration-300 group-hover:w-8"
//                 style={{
//                     background: accent
//                 }}
//             />
//         </div>
//     )
// }

export default ChatFeatureSection