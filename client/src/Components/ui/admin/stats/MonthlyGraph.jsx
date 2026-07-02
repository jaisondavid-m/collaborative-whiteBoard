import React from "react"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from "recharts"

import CustomToolTip from "./CustomToolTip.jsx"


function MonthlyGraph({ data }) {

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-10 text-sm text-gray-400" >
                No visit data yet this month
            </div>
        )
    }

    const chartData = data.map(d => ({
        day: d.date?.split("-")[2],
        count: d.count,
    }))

    return (
        <div className="h-48 -ml-2" >
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <BarChart data={chartData} barCategoryGap="20%" >
                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="day"
                        tick={{
                            fontSize: 9,
                            fill: "#9ca3af"
                        }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{
                            fontSize: 10,
                            fill: "#9ca3af"
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={28}
                    />
                    <Tooltip
                        content={<CustomToolTip/>}
                        cursor={{
                            fill: "rgba(78,205,196,0.08"
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill="#4ecdc4"
                        radius={[4,4,0,0]}
                        maxBarSize={18}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default MonthlyGraph