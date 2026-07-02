import React from "react"


function StatCard({ label, value, sub, Icon, color }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm
        flex items-center gap-4" >
            <span
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                    background: `${color}1A`, color
                }}
            >
                <Icon size={20} />
            </span>
            <div>
                <p className="text-sm text-gray-500" >
                    {label}
                </p>
                <h2 className="text-2xl font-bold text-gray-900" >
                    {value}
                </h2>
                {
                    sub && (
                        <p className="text-[11px] text-gray-400" >
                            {sub}
                        </p>
                    )
                }
            </div>
        </div>
    )
}

export default StatCard