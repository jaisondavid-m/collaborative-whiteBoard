import React from "react"


function ChatCard({ Icon, title, desc, accent, delay }) {
    return (
        <div
            className="group bg-white border border-black/[0.07] rounded-2xl p-5 flex flex-col
            gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            style={{
                transitionDelay: `${delay}ms`
            }}
        >
            <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                    background: `${accent}18`,
                    color: accent,
                }}
            >
                <Icon size={18} />
            </span>
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1" >
                    {title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed" >
                    {desc}
                </p>
            </div>
            <span
                className="mt-auto w-5 h-0.5 rounded-full transition-all duration-300 group-hover:w-8"
                style={{
                    background: accent
                }}
            />
        </div>
    )
}

export default ChatCard