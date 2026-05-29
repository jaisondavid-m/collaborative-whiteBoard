import React , { useState , useEffect , useRef } from "react"
import { TbHexagon , TbShieldLock , TbEye , TbDatabase , TbUserCheck , TbTrash , TbMail , TbCookie , TbLock , TbRefresh , TbChevronDown } from "react-icons/tb"

const LAST_UPDATED = "May 28, 2025"

const SECTION = [
    {
        id: "information-we-collect",
        Icon: TbDatabase,
        title: "Information We Collect",
        accent: "#4ecdc4",
        content: [
            {
                subtitle: "Account Information",
                text: "When you register, we collect your username and a securely hashed version of your password. We do not \
                collect your real name, phone number or any other government-issued identification",
            },
            {
                subtitle: "Room & Canvas Data",
                text: "We store the rooms you create, including the room name, room id, optional password hash and drawing events associated with each session. \
                This data powers the real, time sync and history replay features."
            },
            {
                subtitle: "Usage Data",
                text: "We may collect basic technical data such as your browser type, device type and session timestamps to help diagnose issues and improve performance. \
                We dont use third party analytics tracker",
            }
        ]
    },
    {
        id: "how-we-use",
        Icon: TbEye,
        title: "How We Use Your Information",
        accent: "#f5a623",
        content: [
            {
                subtitle: "To Provide the Service",
                text: "Your account data is used to authenticate you and associate rooms and drawings with your profile. \
                Room data is used to render your canvas and sync it iwth collaborators in real time.",
            },
            {
                subtitle: "To Improve SketchBoard",
                text: "Aggregated, anonymised usage patterns help us understand how the product is used and where we can improve. \
                No Individual user's activity is sold or shared with advertisers",
            },
            {
                subtitle: "To Communicate with you",
                text: "If you contact us at developer@bitsathy.in, we use your email address solely to respond to your inquiry. We do not send marketing emails.",
            },
        ]
    },
    {
        id: "data-sharing",
        Icon: TbUserCheck,
        title: "Data Sharing And Disclosure",
        accent: "#e94560",
        content: [
            {
                subtitle: "We Do Not Sell Your Data",
                text: "We never sell, rent or trade your personal information to third parties for \
                marketing or any other commercial purpose",
            },
            {
                subtitle: "Service Providers",
                text: "We may use trusted infrastructure providers (e.g: vercel,render) to operate the service. These providers are contractually bound to handle your data securely and only as directed by us."
            },
            {
                subtitle: "Legal Requirements",
                text: "We may disclose information if required to do so by law or in response to valid legal process . We will notify you if permitted to do so."
            },
        ],
    },
    {
        id: "Cookies",
        Icon: TbCookie,
        title: "Cookies And LocalStorage",
        // accent: "Cookies & Local Storage",
        accent: "#7ed321",
        content: [
            {
                subtitle: "Authentication Token",
                text: "We Store a JWT Authentication token in your browser's localstorage to keep you logged in across sessions. This token expires automatically and is removed when you log out."
            },
            {
                subtitle: "No Tacking Cookies",
                text: "We do not use advertisiting cookies, cross-site tracking pixedls or third \
                party analytics cookies. The only browser storage we use is strictly necessary for the site to function.",
            },
        ],
    },
    {
        id: "data-security",
        Icon: TbLock,
        title: "Data Security",
        accent: "#533483",
        content: [
            {
                subtitle: "Password Storage",
                text: "Passwords are hashed using strong one-way hashing algorithm before being stored. We never store plaintext passwords.",
            },
            {
                subtitle: "Transport Security",
                text: "All communication between your browser and our servers is encrypted via HTTPS and WSS (Secure Websockets). Data in transit is protected against interception.",
            },
            {
                subtitle: "Access Controls",
                text: "Access to production systems and user data is strictly limited. \
                Password-Protected rooms and an additional layer of access control within the application itself.",
            },
        ],
    },
    {
        id: "your-rights",
        Icon: TbShieldLock,
        title: "Your Rights",
        accent: "#45b7d1",
        content: [
            {
                subtitle: "Access & Portability",
                text: "You may request a copy of the personal data we hold about you at any time by contacting us at developer@bitsathy.in",
            },
            {
                subtitle: "Correction",
                text: "If any information we hold about you is inaccurate, you may request that we correct it.",
            },
            {
                subtitle: "Deletion",
                text: "You may request deletion of your account and all associated data. Upon a verified request we will permanently remove your account, rooms and drawing history within 30 days",
            },
        ],
    },
    {
        id: "data-retention",
        Icon: TbTrash,
        title: "Data Retention",
        accent: "#ff6b6b",
        content: [
            {
                subtitle: "Active Accounts",
                text: "We retain your account and oom data for as long as your account is active \
                so that your boards remain accessible.",
            },
            {
                subtitle: "Deleted Accounts",
                text: "When you delete your account, all personally idetifiable data is permanetly purged within 30 days. Anonymised aggregate statistics may be retained indefinitely.",
            },
        ],
    },
    {
        id: "changes",
        Icon: TbRefresh,
        title: "Change to this policy",
        accent: "#4ecdc4",
        content: [
            {
                subtitle: "Notification of Changes",
                text: "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last Updated' data at the top of this page. Continued use of SketchBoard after changes are posted constitutes your acceptance of the revised policy.",
            },
            {
                subtitle: "Material Change",
                text: "For Significant changes that affect your rights, we will make reasonable efforts to notify you directly via the websiste or by email if we have you contact details",
            },
        ],
    },
]

function TocItem({ section , active , onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150
                        ${active
                            ? "bg-[#4ecdc4]/10 text-[#0f6e56] font-semibold"
                            : "text-gray-500 hover:text-gray-800 hover:bg-black/[0.04]"
                        }
            `}
        >
            <section.Icon size={13} style={{ color: active ? "#4ecdc4" : undefined }}/>
            {section.title}
        </button>
    )
}

function PolicySection({ section, index }) {

    const [open, setOpen] = useState(true)
    const ref = useRef(null)

    return (
        <div
            ref={ref}
            id={section.id}
            className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden scroll-mt-24"
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
            >
                <div className="flex items-center gap-3">
                    <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${section.accent}15`, color: section.accent }}
                    >
                        <section.Icon size={18} />
                    </span>
                    <div>
                        <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-0.5">
                            {String(index+1).padStart(2,"0")}
                        </p>
                        <h2 className="text-sm font-semibold text-gray-800">{section.title}</h2>
                    </div>  
                </div>
                <TbChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <div className={
                `overflow-hidden transition-all duration-300 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`
            }>
                <div className="px-6 pb-6 flex flex-col gap-5 border-t border-black/[0.05]">
                    {section.content.map((block,i) => (
                        <div key={i} className="pt-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: section.accent }}
                                />
                                <h3 className="text-xs font-semibold text-gray-800">{block.subtitle}</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed pl-3.5">{block.text}</p>
                        </div>  
                    ))}
                </div>
            </div>
        </div>
    )
}

function PrivacyPolicy() {

    const [activeId, setActiveId] = useState(SECTION[0].id)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveId(entry.target.id)
                })
            },
            { rootMargin: "-30% 0px -60% 0px" }
        )
        SECTION.forEach(s => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    },[])

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: "smooth" , block: "start" })
    }

    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono">
            <section className="relative bg-white border-b border-black/[0.07] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(#000 1px, transparent 1px),linear-gradient(90deg,#000 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div
                    className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#4ecdc4]/10 blur-3xl pointer-events-none"
                />
                <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
                    <span className="w-12 h-12 bg-[#4ecdc4]/10 text-[#4ecdc4] rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <TbShieldLock size={24} />
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3" >
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed mb-5">
                        We Belive privacy is a right, not a feature. Here's exactly what data we collect, why we collect it and how we protect it
                    </p>
                    <div className="inline-flex items-center gap-2 text-[11px] text-gray-400 bg-black/[0.04] px-3 py-1.5 rounded-full">
                        <TbRefresh size={11} />
                        Last updated: {LAST_UPDATED}
                    </div>
                </div>
            </section>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex gap-8 items-start">
                    <aside className="hidden lg:flex flex-col gap-1 w-56 shrink-0 sticky top-24">
                        <p className="text-[9px] tracking-[2px] uppercase text-gray-400 font-semibold px-3 mb-2">
                            Contents
                        </p>
                        {SECTION.map(s => (
                            <TocItem
                                key={s.id}
                                section={s}
                                active={activeId === s.id}
                                onClick={() => scrollTo(s.id)}
                            />
                        ))}
                        <div className="mt-6 mx-3 p-3 bg-[#e6faf8] border border-[#4ecdc4]/20 rounded-xl">
                            <p className="text-[10px] font-semibold text-[#0f6e56] mb-1">Questions?</p>
                            <a
                                href="mailto:developer@bitsathy.in"
                                className="flex items-center gap-1.5 text-[10px] text-[#4ecdc4] hover:underline break-all"
                            >
                                <TbMail size={11} />
                                developer@bitsathy.in
                            </a>
                        </div>
                    </aside>
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        <div className="bg-[#e6faf8] border border-[#4ecdc4]/25 rounded-2xl px-5 py-4 flex gap-3 items-start">
                            <TbHexagon size={20} className="text-[#4ecdc4] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-[#0f6e56] mb-1" >The Short version</p>
                                <p>
                                    We collect only what's necessary to run SketchBoard. We don't sell your data, we don't show you ads,
                                    and you can delete your account any time. If you have questions, email <a href="mailto:developer@bitsathy.in">developer@bitsathy.in</a>
                                </p>
                            </div>
                        </div>
                        {SECTION.map((section,i) => (
                            <PolicySection
                                key={section.id}
                                section={section}
                                index={i}
                            />
                        ))}
                        <div className="bg-white border border-black/[0.07] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 mt-2">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-1">Still Have Questions?</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                                    If anything in this policy is unclear, or you want to exercise any of your rights, react out - we're happy to help
                                </p>
                            </div>
                            <a
                                href="mailto:developer@bitsathy.in"
                                className="shrink-0 flex items-center gap-3 border border-black/10 hover:border-[#4ecdc4] hover:bg-[#e5faf8] px-5 py-3 rounded-xl transition-all duration-200 group"
                            >
                                <span className="w-8 h-8 rounded-lg bg-[#4ecdc4]/10 text-[#4ecdc4] flex items-center justify-center group-hover:bg-[#4ecdc4] group-hover:text-white transition-all">
                                    <TbMail size={16} />
                                </span>
                                <div className="text-left">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">Email Us</p>
                                    <p className="text-xs font-semibold text-gray-800" >developer@bitsathy.in</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy