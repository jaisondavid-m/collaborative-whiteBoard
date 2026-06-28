import React , { useEffect , useRef , useState } from "react"
import { useNavigate } from "react-router-dom"
import { TbHexagon , TbArrowRight , TbBrandGithub , TbMail , TbUsers , TbPencil , TbBolt , TbShieldLock } from "react-icons/tb"
import { RiReactjsLine } from "react-icons/ri"
import { SiGo } from "react-icons/si"
import { HiOutlineSparkles } from "react-icons/hi2"

import FriendsFeatureSection from "../Components/about/FriendsFeatureSection.jsx"

function useFadeIn() {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
            { threshold: 0.15 }
        )
        io.observe(el)
        return () => io.disconnect()
    },[])
    return [ref, visible]
}

function FadeSection({ children , delay = 0 , className = "" }) {

    const [ref, visible] = useFadeIn()
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
            style={{transitionDelay: `${delay}ms`}}
        >
            {children}
        </div>
    )
}

const FEATURES = [
    {
        Icon: TbPencil,
        title: "Real-Time Canvas",
        desc: "Draw, sketch and annotate together with zero latency. Every suncs instantly across all connected users.",
        accent: "#4ecdc4",
    },
    {
        Icon: TbUsers,
        title: "Multi-user Rooms",
        desc: "Create private or public rooms, invite collaborators with a link and work together in a shared space.",
        accent: "#f5a623",
    },
    {
        Icon: TbBolt,
        title: "Websocket Powered",
        desc: "Persistent connections via Websockets ensure your board stays live - no polling, no lag",
        accent: "#e94560",
    },
    {
        Icon: TbShieldLock,
        title: "Password Protected",
        desc: "Optionally lock rooms with a password so only the right people can join your session",
        accent: "#7ed321"
    }
]

const STACK = [
    { Icon: RiReactjsLine, label: "React", color: "#61dafb" },
    { Icon: SiGo, label: "Go", color: "#00acd7" },
    { Icon: TbBolt, label: "WebSockets" , color: "#4ecdc4" },
    { Icon: TbShieldLock, label: "JWT Auth" , color: "#f5a623" },
]

function HeroBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-[#4ecdc4] bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 px-3 py-1 rounded-full mb-5">
            <HiOutlineSparkles size={12} />
            Open Source · v1.0.0
        </span>
    )
}

function FeatureCard({ Icon , title , desc , accent , delay }) {

    const [ref, visible] = useFadeIn()
    return (
        <div
            ref={ref}
            className={`group bg-white border border-black/[0.07] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: `${delay}ms` }}
        > 
            <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accent}18`,color:accent }}
            >
                <Icon size={20} />
            </span>
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
            <span
                className="mt-auto w-6 h-0.5 rounded-full transition-all duration-300 group-hover:w-10"
                style={{ background: accent }}
            />
        </div>
    )
}

function StackPill({ Icon , label , color }) {
    return (
        <div className="flex items-center gap-2 bg-black/[0.04] hover:bg-black/[0.07] border border-black/[0.06] px-4 py-2.5 rounded-xl transition-colors cursor-default">
            <Icon size={18} style={{ color }} />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    )
}

function About() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono">
            <section className="relative overflow-hidden border-b border-black/[0.07] bg-white">
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px , transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#4ecdc4] bllur-3xl pointer-events-none" />
                <div className="relative max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-[#4ecdc4] rounded-2xl flex items-center justify-center shadow-lg mb-6">
                        <TbHexagon size={28} strokeWidth={2} />
                    </div>
                    <HeroBadge/>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.12] tracking-tight mb-5">
                        Collaborate without <br />
                        <span className="text-[#4ecdc4]">boundaries.</span>
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl leading-relaxed mb-8">
                        SketchBoard is a real-time collaborative whiteboard built for teams who think visually. Draw, diagra, and brainstorm - all in one shared space, live
                    </p>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <button
                            onClick={() => navigate("/room")}
                            className="flex items-center gap-2 bg-[#4ecdc4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#3db8b0] active:scale-95 transition-all"
                        >
                            Start Drawing <TbArrowRight size={15} />
                        </button>
                        <a
                            href="https://github.com/jaisondavid-m"
                            target="_blank"
                            // rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-black/10 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-black/[0.04] transition-colors"
                        >
                            <TbBrandGithub size={15}/>
                        </a>
                    </div>
                </div>
            </section>
            <section className="max-w-3xl mx-auto px-6 py-20">
                <FadeSection>
                    <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2">What I build</p>
                    <h2 className="text-2xl font-bold text-gray-900">Everything you need to think together</h2>
                </FadeSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FEATURES.map((f,i) => (
                        <FeatureCard key={f.title} {...f} delay={i*80} />
                    ))}
                </div>
            </section>
            <section className="border-t border-black/[0.07] bg-white">
                <div className="max-w-3xl mx-auto px-6 py-16">
                    <FadeSection className="text-center mb-10">
                        <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2">Tech Stack</p>
                        <h2 className="text-2xl font-bold text-gray-900">Built with modern tools</h2>
                    </FadeSection>
                    <FadeSection delay={100} className="flex flex-wrap gap-3 justify-center">
                        {STACK.map(s => <StackPill key={s.label} {...s} />)}
                    </FadeSection>
                </div>
            </section>
            <section className="mx-w-3xl mx-auto px-6 py-20">
                <FadeSection className="text-center mb-12">
                    <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2">WorkFlow</p>
                    <h2 className="text-2xl font-bold text-gray-900">Up and running in seconds</h2>
                </FadeSection>
                <div className="flex flex-col gap-0">
                    {[
                        {step: "01" , title: "Create an account", desc: "Sign Up in seconds - just a username and password."},
                        {step: "02" , title: "Open a room", desc: "Create a new room or join one with an existing ID."},
                        {step: "03", title: "Draw Together", desc: "Invite collaborators and start sketching in real time."}
                    ].map(({ step, title , desc }, i) => (
                        <FadeSection key={step} delay={i*100}>
                            <div className="flex gap-5 items-start group py-6 border-b border-black/[0.06] last:border-0">
                                <span className="text-2xl font-bold text-[#4ecdc4]/30 group-hover:text-[#4ecdc4] transition-colors duration-300 shrink-0 w-10 text-right leading-none mt-0.5">
                                    {step}
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxrd">{desc}</p>
                                </div>
                            </div>
                        </FadeSection>
                    ))}
                </div>
            </section>
            <FriendsFeatureSection/>
            <section className="border-t border-black/[0.07] bg-white">
                <div className="max-w-3xl mx-auto px-6 py-16">
                    <FadeSection className="flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] tracking-[3px] uppercase text-[#4ecdc4] font-semibold mb-2">Get in touch</p>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Have a quesetion?</h2>
                            <p className="text-sm  text-gray-500 max-w-sm leading-relaxed">
                                Found a bug, have a feature idea or just want to say hi? Drop me a mail - I read everything
                            </p>
                        </div>
                        <a
                            href="mailto:developer@bitsathy.in"
                            className="shrink-0 flex items-center gap-3 bg-[#f5f5f2] border border-black/10 hover:border-[#4ecdc4] hover:bg-[#e6faf8] px-6 py-4 rounded-2xl transition-all duration-200 group"
                        >
                            <span className="w-9 h-9 rounded-xl bg-[#4ecdc4]/10 text-[#4ecdc4] flex items-center justify-center group-hover:bg-[#4ecdc4] group-hover:text-white transition-all duration-200">
                                <TbMail size={18} />
                            </span>
                            <div className="text-left">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Email Me</p>
                                <p className="text-sm font-semibold text-gray-800">developer@bitsathy.in</p>
                            </div>
                        </a>
                    </FadeSection>
                </div>
            </section>
            {/* <FriendsFeatureSection/> */}
        </div>
    )
}

export default About