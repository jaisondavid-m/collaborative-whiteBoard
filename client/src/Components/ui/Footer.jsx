import React from "react"
import { href, Link , useNavigate } from "react-router-dom"
import { TbHexagon } from "react-icons/tb"
import { RiGithubLine , RiTwitterXLine , RiDiscordLine , RiArrowRightLine } from "react-icons/ri"
import { HiOutlineStatusOnline } from "react-icons/hi"

const FOOTER_LINKS = {
    Product: [
        { label: "Home" , path: "/home" },
        { label: "Create Room" , path: "/room" },
        { label: "Join Room" , path: "/room" },
        { label: "Whiteboard" , path: "/room" },
    ],
    Company: [
        { label: "About" , path: "#" },
        { label: "Blog" , path: "#" },
        { label: "Careers" , path: "#" },
        { label: "Contact" , path: "#" },
    ] ,
    Legal: [
        { label: "Privacy Policy" , path: "#" },
        { label: "Terms of Policy" , path: "#" },
        { label: "Cookie Policy" , path: "#" },
    ]
}

const SOCIAL_LINKS = [
    { label: "Github" , href: "#" , Icon: RiGithubLine },
    { label: "Twitter / X" , href: "#" , Icon: RiTwitterXLine },
    { label: "Discard", href: "#" , Icon: RiDiscordLine }
]

function FooterLinkGroup({ title, links }) {
    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-900 tracking-widest uppercase">
                {title}
            </h3>
            <ul className="flex flex-col gap-2">
                {links.map(link => (
                    <li key={link.label}>
                        <Link
                            to={link.label}
                            className="text-sm text-gray-500 hover:text-[#0f6e56] transition-colors duration-150"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function StatusBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#0f6e56] bg=[#e1f52] px-2.5 py-1 rounded-full font-medium">
            <HiOutlineStatusOnline size={12} className="text-[#4ecdc4]" />
            All systems operational
        </span>
    )
}

function Footer() {

    const navigate = useNavigate()
    const year = new Date().getFullYear()

    return (
        <footer className="font-mono bg-white border-t border-black/10 mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex items-centter gap-2">
                            <span className="w-8 h-8 bg-[#4ecdc4] rounded-md flex items-center justify-center text-white shadow-sm">
                                <TbHexagon/>
                            </span>
                            <span className="text-base font-semibold text-gray-800 tracking-tight">
                                SketchBoard
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                            A Real-Time Collaborative whiteboard for teams . Draw , brainstorm and build together - wherever you are.
                        </p>
                        <StatusBadge/>
                        <div className="flex items-center gap-2 mt-1">
                            {SOCIAL_LINKS.map(({ label , href , Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border-black/10 text-gray-400 hover:text-{#0f6e56]"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <FooterLinkGroup key={title} title={title} links={links} />
                    ))}
                </div>
            </div>
            <div className="border-t border-black/5">
                <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col mx:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        © {year} SketchBoard. Built with React , Go & Websockets.
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/room")}
                            className="flex items-center gap-1 text-xs text-[#4ecdc4] hover:text-[#3db8b0] font-medium transition-colors"
                        >
                            Start Drawing <RiArrowRightLine size={13} />
                        </button>
                        <span className="text-gray-200">\</span>
                        <span className="text-xs text-gray-400">v1.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    )

}

export default Footer