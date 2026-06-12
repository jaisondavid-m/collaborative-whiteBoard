import React from "react"

function MetricCardSkeleton() {
    return (
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5" >
            <div className="flex items-center justify-between mb-4" >
                <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
                <div className="w-8 h-3 rounded-md bg-gray-100 animate-pulse" />
            </div>
            <div className="space-y-2" >
                <div className="h-7 w-20 rounded-md bg-gray-100 animate-pulse" />
                <div className="h-3 w-24 rounded-md bg-gray-100 animate-pulse" />
                <div className="h-2 w-16 rounded-md bg-gray-100 animate-pulse" />
            </div>  
        </div>
    )
}

export default MetricCardSkeleton