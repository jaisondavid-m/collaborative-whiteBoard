import React, { useEffect, useState } from "react"
import API from "../../../../api/axios"

import {
    TbUsersGroup, TbCalendarStats, TbChartBar
} from "react-icons/tb"

import StatCard from "./StatCard.jsx"
import MonthlyGraph from "./MonthlyGraph.jsx"

function StatsOverview() {

    const [online, setOnline] = useState(null)
    const [today, setToday] = useState(null)
    const [monthly, setMonthly] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchStats = async () => {
            try {
                const [onlineRes, todayRes, monthRes] = await Promise.all([
                    API.get("/admin/stats/online"),
                    API.get("/admin/stats/today"),
                    API.get("/admin/stats/month"),
                ])
                setOnline(onlineRes.data)
                setToday(todayRes.data)
                setMonthly(monthRes.data)
            } catch {
                // 
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        const interval = setInterval(fetchStats, 30000)

        return () => clearInterval(interval)

    },[])

    return (
        <div className="max-w-7xl mx-auto mb-6" >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4" >
                <StatCard
                    label="Online Now"
                    value={loading ? "..." : online?.onlineCount ?? 0}
                    sub="active websocket sessions"
                    Icon={TbUsersGroup}
                    color="#22c55e"
                />
                <StatCard
                    label="Visited Today"
                    value={loading ? "..." : today?.totalToday ?? 0}
                    sub={today?.date}
                    Icon={TbCalendarStats}
                    color="#4ecdc4"
                />
                <StatCard
                    label="This Month"
                    value={loading ? "..." : monthly?.data?.reduce((a,b) => a + b.count, 0)  ?? 0}
                    sub={monthly?.month}
                    Icon={TbChartBar}
                    color="#a78bfa"
                />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm" >
                <h3 className="text-sm font-semibold text-gray-700 mb-4" >
                    Daily Visits - {monthly?.month}
                </h3>
                {
                    loading ? (
                        <div className="h-40 flex items-center justify-center text-sm text-gray-400" >
                            Loading graph...
                        </div>
                    ) : (
                        <MonthlyGraph data={monthly?.data} />
                    )
                }
            </div>
        </div>
    )

}

export default StatsOverview