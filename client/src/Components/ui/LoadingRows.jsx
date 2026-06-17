import React from "react"

function LoadingRows() {
    return (
        <ul className="divide-y divide-gray-100 animate-pulse" >
            {
                [1,2,3].map(i => (
                    <li key={i} className="flex items-center gap-3 py-3.5 px-1" >
                        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                        <div className="flex-1 space-y-1.5" >
                            <div className="h-3 bg-gray-100 rounded-md w-32" />
                            <div className="h-2.5 bg-gray-100 rounded-md w-20" />
                        </div>
                        <div className="flex gap-2" >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                            <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                        </div>
                    </li>
                ))
            }
        </ul>
    )
}

export default LoadingRows