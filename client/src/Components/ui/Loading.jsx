import React , { useEffect , useState } from "react"

const steps = [
    { label: "Rooms" , width: "70%" },
    { label: "Sessions" , width: "45%" },
    { label: "Canvas" , width: "88%" },
]

function Loading({ message = "Loadaing your workspace" }) {

    const [dots, setDots] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(d => (d+1)%4)
        },400)
        return () => clearInterval(interval)
    },[])

    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono flex flex-col items-center justify-center" >
            <div className="flex flex-col items-center gap-7 animate-fade-up" >

                {/* Spinner + Logo */}
                <div
                    className="relative w-18 h-18 flex items-center justify-center"
                    style={{ width: 72 , height: 72 }}
                >
                    <svg
                        width="72"
                        height="72"
                        viewBox="0 0 72 72"
                        className="absolute inset-0"
                    >
                        <circle
                            cx="36"
                            cy="36"
                            r="28"
                            fill="none"
                            stroke="#e0e0da"
                            strokeWidth="3"
                        />
                        <circle
                            cx="36"
                            cy="36"
                            r="28"
                            fill="none"
                            stroke="#4ecdc4"
                            strokeWidth="3"
                            strokeDasharray="50 130"
                            strokeLinecap="round"
                            className="animate-spin origin-center"
                            style={{ animationDuration: "1s" }}
                        />
                    </svg>
                    <div className="w-9 h-9 bg-[#4ecdc4] rounded-[10px] flex items-center justify-center z-10" >
                        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" >
                            <path
                                d="M6 22L13 8L20 22M9 17h10"
                                stroke="white"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
                {/* Text */}
                <div className="text-center" >
                    <p className="text-[18px] font-medium text-gray-900" >SketchBoard</p>
                    <div className="flex items-center justify-center gap-1.5" >
                        <span className="text-[13px] text-gray-400" >
                            {message}
                        </span>
                        {[0,1,2].map(i => (
                            <span
                                key={i}
                                className="inline-block w-1 h-1 rounded-full bg-[#4ecdc4] transition-opacity duration-300"
                                style={{ opacity: dots > i ? 1 : 0.2 }}
                            />
                        ))}
                    </div>      
                </div>

                {/* Progress bars */}
                <div className="flex flex-col gap-2.5 w-60">
                    {steps.map((step,i) => (
                        <div
                            key={step.label}
                            className="flex items-center gap-2.5"
                        >
                            <div
                                className="h-2 bg-[#e0e0da] rounded-full overflow-hidden"
                                style={{ width: step.label === "Sessions" ? 120 : step.label === "Canvas" ? 190 : 160 }}
                            >
                                <div
                                    className="h-full bg-[#4ecdc4] rounded-full transition-all duration-1000"
                                    style={{
                                        width: step.width,
                                        opacity: 1 - i * 0.2,
                                        animation: `pulse ${1.5*i*0.15}s ease-in-out ${i*0.2}s infinite`
                                    }}
                                />
                            </div>
                            <span className="text-[12px] text-gray-400" >{step.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-gray-300 tracking-wide" >
                    Real-Time Collaborative whiteboard
                </p>
            </div>
            <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 1 }
                50% { opacity: 0.4 }
            }
            @keyframes fade-up {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0) }
            }
            .animate-fade-up {
                animation: fade-up 0.5s ease forwards;
            }
            `}</style>
        </div>
    )
}

export default Loading