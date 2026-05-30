import React, { useState, useEffect, useCallback, useRef } from "react"
import {

    TbShieldCheck, TbShieldX, TbActivity, TbUsers, TbRoute,
    TbFilter, TbRefresh, TbSearch, TbChevronDown, TbChevronUp,
    TbChevronLeft, TbChevronRight, TbX, TbClock, TbUser,
    TbWorld, TbTag, TbCode, TbAlertTriangle, TbCheck,
    TbSortAscending, TbSortDescending, TbDownload,
    TbLogin, TbLogout, TbDoor, TbKey, TbEdit, TbList,
    TbDatabase, TbTrendingUp, TbTrendingDown, TbMinus,
    TbCalendar, TbInfoCircle,
    TbEye

} from "react-icons/tb"

import API from "../api/axios.js"

const STATUS_CONFIG = {
    success: {
        label: "Success",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        Icon: TbCheck,
    },
    failure: {
        label: "Failure",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-500",
        dot: "bg-red-500",
        Icon: TbAlertTriangle,
    },
}

const METHOD_CONFIG = {
    GET: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    POST: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
    PUT: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    PATCH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    DELETE: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
}

const ACTION_ICONS = {
    login: TbLogin,
    register: TbUser,
    logout: TbLogout,
    create_room: TbDoor,
    join_room: TbKey,
    update_role: TbEdit,
}

function getMethodFromAction(action = "") {
    const method = action.split(" ")[0]
    return METHOD_CONFIG[method] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" }
}

function getActionIcon(action = "") {
    const lower = action.toLowerCase()
    for (const [key, Icon] of Object.entries(ACTION_ICONS)) {
        if (lower.includes(key)) return Icon
    }
    return TbRoute
}

function formatDate(dateStr) {

    const d = new Date(dateStr)

    return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    })

}

function timeAgo(dateStr) {

    const diff = Date.now() - new Date(dateStr).getTime()

    const s = Math.floor(diff / 1000)
    if (s < 60) {
        return `${s}s ago`
    }

    const m = Math.floor(s / 60)
    if (m < 60) {
        return `${m}m ago`
    }

    const h = Math.floor(m / 60)
    if (h < 24) {
        return `${h}h ago`
    }

    return `${Math.floor(h / 24)}d ago`

}

function MetricCard({ label, value, sub, Icon, trend, accent = "teal" }) {

    const accents = {
        teal: { icon: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10" },
        green: { icon: "text-emerald-500", bg: "bg-emerald-50" },
        red: { icon: "text-red-500", bg: "bg-red-50" },
        amber: { icon: "text-amber-500", bg: "bg-amber-50" },
        violet: { icon: "text-violet-500", bg: "bg-violet-50" },
    }

    const a = accents[accent] || accents.teal
    const TrendIcon = trend > 0 ? TbTrendingUp : trend < 0 ? TbTrendingDown : TbMinus
    const trendColor = trend > 0 ? "text-emerald-500" : trend < 0 ? "text-red-500" : "text-gray-400"

    return (
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.bg}`}>
                    <Icon size={18} className={a.icon} />
                </span>
                {trend !== undefined && (
                    <span className={`flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
                        <TrendIcon size={13} />
                        {Math.abs(trend)}
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
            </div>
        </div>
    )
}

function FilterChip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4ecdc4]/10 text-[#0f6e56] text-[11px] font-medium rounded-full border border-[#4ecdc4]/20">
            {label}
            <button
                onClick={onRemove}
                className="hover:text-red-500 transition-colors"
            >
                <TbX size={11} />
            </button>
        </span>
    )
}

function MetaModal({ log, onClose }) {

    if (!log) return null

    let meta = {}

    try {
        meta = JSON.parse(log.meta || "{}")
    } catch { }

    const StatusIcon = STATUS_CONFIG[log.status]?.Icon || TbInfoCircle

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.35)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-black/[0.08] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.07]">
                    <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${STATUS_CONFIG[log.status]?.bg}`}>
                            <StatusIcon size={16} className={STATUS_CONFIG[log.status]?.text} />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 font-mono">{log.action}</p>
                            <p className="text-[11px] text-gray-400">{formatDate(log.CreatedAt)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <TbX size={18} />
                    </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Actor", value: log.actorId || "-", Icon: TbUser },
                            { label: "Role", value: log.actorRole || "-", Icon: TbTag },
                            { label: "IP Address", value: log.ip || "-", Icon: TbWorld },
                            { label: "Target", value: log.targetId || "-", Icon: TbRoute },
                            { label: "Target Type", value: log.targetType || "-", Icon: TbDatabase },
                            { label: "Status", value: log.status || "-", Icon: StatusIcon },
                        ].map(({ label, value, Icon }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Icon size={12} className="text-gray-400" />
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-800 font-mono truncate">{value}</p>
                            </div>
                        ))}
                    </div>
                    {Object.keys(meta).length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <TbCode size={12} />
                                Meta
                            </p>
                            <pre className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-700 font-mono overflow-x-auto leading-relaxed border border-black/[0.05]">
                                {JSON.stringify(meta, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function LogRow({ log, onClick }) {

    const status = STATUS_CONFIG[log.status] || STATUS_CONFIG.success
    const methodStyle = getMethodFromAction(log.action)
    const ActionIcon = getActionIcon(log.action)
    const method = log.action?.split(" ")[0] || ""
    const path = log.action?.split(" ").slice(1).join(" ") || log.action

    return (
        <tr
            className="border-b border-black/[0.05] hover:bg-[#f9f9f7] cursor-pointer transition-colors group"
            onClick={() => onClick(log)}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}>
                        {method}
                    </span>
                    <span className="text-xs text-gray-700 font-mono truncate max-w-[180px]">{path}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.bg} ${status.text} ${status.border}`}
                >
                    <status.Icon size={10} />
                    {status.label}
                </span>
            </td>
            <td className="px-4 py-3">
                {log.actorId
                    ? <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#4ecdc4]/15 text-[#0f6e56] flex items-center justify-center text-[9px] font-bold">
                            {log.actorId[0]?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-700 font-mono">
                            {log.actorId}
                        </span>
                    </div>
                    : <span className="text-xs text-gray-400">anonymous</span>
                }
            </td>
            <td className="px-4 py-3">
                <span className="text-xs text-gray-500 font-mono">{log.ip || "-"}</span>
            </td>
            <td className="px-4 py-3">
                <div title={formatDate(log.CreatedAt)}>
                    <p className="text-xs text-gray-700">{timeAgo(log.CreatedAt)}</p>
                    <p className="text-[10px] text-gray-400" >{formatDate(log.CreatedAt)}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/[0.06] text-gray-500"
                >
                    <TbEye size={14} />
                </button>
            </td>
        </tr>
    )
}

function TopActionBar({ label, count, max, color = "#4ecdc4" }) {

    const pct = max ? Math.round((count / max) * 100) : 0

    return (
        <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-600 font-mono w-40 truncate shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className="text-[11px] text-gray-500 font-mono w-10 text-right shrink-0">
                {count}
            </span>
        </div>
    )
}

function Audit() {

    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [selectedLog, setSelectedLog] = useState(null)
    const [sortDir, setSortDir] = useState("desc")

    const [filters, setFilters] = useState({
        action: "",
        actor: "",
        status: "",
        method: "",
        from: "",
        to: "",
    })

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    const limit = 20
    const searchTimer = useRef(null)

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 400);
    }, [search])

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page, limit })

            if (filters.status) params.set("status", filters.status)
            if (filters.method) params.set("method", filters.method)
            if (filters.actor || debouncedSearch) params.set("actor", filters.actor || debouncedSearch)
            if (filters.action) params.set("action", filters.action)
            if (filters.from) params.set("from", filters.from)
            if (filters.to) params.set("to", filters.to)

            const res = await API.get(`/admin/audit-logs?${params}`)
            const data = res.data
            let fetched = data.logs || []

            if (sortDir === "asc") {
                fetched = [...fetched].reverse()
            }
            setLogs(fetched)
            setTotal(data.total || 0)
            setPages(data.pages || 1)
        } catch {
            setLogs([])
        } finally {
            setLoading(false)
        }
    }, [page, filters, debouncedSearch, sortDir])

    const fetchStats = useCallback(async () => {

        setStatsLoading(true)

        try {
            const res = await API.get("/admin/audit-logs/stats")
            setStats(res.data)
        } catch {
            setStats(null)
        } finally {
            setStatsLoading(false)
        }
    }, [])

    useEffect(() => { fetchLogs() }, [fetchLogs])
    useEffect(() => { fetchStats() }, [fetchStats])

    const activeFilters = Object.entries(filters).filter(([, v]) => v !== "")

    const clearFilters = (key) => {
        setFilters(f => ({ ...f, [key]: "" }))
        setPage(1)
    }

    const clearAll = () => {
        setFilters({ action: "", actor: "", status: "", method: "", from: "", to: "" })
        setSearch("")
        setPage(1)
    }

    const exportCSV = () => {

        const header = ["Action", "Status", "Actor", "Role", "IP", "Target", "Created At"]
        const rows = logs.map(l => [
            l.action, l.status, l.actorId, l.actorRole, l.ip, l.targetId,
            formatDate(l.CreatedAt)
        ])
        const csv = [header, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `audit-logs-${Date.now()}.csv`
        a.click()
    }

    const maxActionCount = stats?.top_actions?.[0]?.count || 1

    return (
        <div className="min-h-screen bg-[#f5f5f2] font-mono">

            <div className="bg-white border-b border-black/[0.07] px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 bg-[#4ecdc4]/10 text-[#4ecdc4] rounded-xl flex items-center justify-center">
                            <TbShieldCheck size={20} />
                        </span>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">Audit Logs</h1>
                            <p className="text-[11px] text-gray-400">Full request &amp; action trail</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 border border-black/[0.1] rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <TbDownload size={14} /> Export CSV
                        </button>
                        <button
                            onClick={() => {
                                fetchLogs();
                                fetchStats()
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 border border-black/[0.1] rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <TbRefresh size={14} /> Refresh
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        label="Total Requests"
                        value={statsLoading ? "…" : (stats?.total_requests ?? 0).toLocaleString()}
                        Icon={TbActivity}
                        accent="teal"
                    />
                    <MetricCard
                        label="Failures"
                        value={statsLoading ? "…" : (stats?.failed_requests ?? 0).toLocaleString()}
                        sub="HTTP 4xx / 5xx"
                        Icon={TbShieldX}
                        accent="red"
                    />
                    <MetricCard
                        label="Success Rate"
                        value={statsLoading ? "…" : `${(stats?.success_rate ?? 0).toFixed(1)}%`}
                        Icon={TbTrendingUp}
                        accent="green"
                    />
                    <MetricCard
                        label="Unique Actors"
                        value={statsLoading ? "…" : (stats?.top_actors?.length ?? 0)}
                        sub="tracked users"
                        Icon={TbUsers}
                        accent="violet"
                    />
                </div>
                {/* Top actions + Top actors */}
                {stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
                            <p className="text-xs font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <TbList size={14} className="text-[#4ecedc4]" />
                                Top Endpoints
                            </p>
                            <div className="flex flex-col gap-3">
                                {stats.top_actions?.slice(0,8).map((a,i) => (
                                    <TopActionBar
                                        key={i}
                                        label={a.action}
                                        count={a.count}
                                        max={maxActionCount}
                                        color={i % 2 === 0 ? "#4ecdc4" : "#a78bfa"}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
                            <p className="text-xs font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <TbUsers size={14} className="text-violet-500" />
                                Most Active Users
                            </p>
                            <div className="flex flex-col gap-3">
                                {stats.top_actions?.slice(0,8).map((a,i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {a.actor_id?.[0]?.toUpperCase() || "?"}
                                        </span>
                                        <TopActionBar
                                            label={a.action_id || "anonymous"}
                                            count={a.count}
                                            max={stats.top_actors?.[0]?.count || 1}
                                            color="#7c3aed"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white border border-black/[0.07] rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[180px]">
                            <TbSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                placeholder="Search By Actor..."
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4] transition-colors"
                            />
                        </div>
                        
                        {/* Status */}
                        <select
                            value={filters.status}
                            onChange={e => {
                                setFilters(f => ({ ...f , status: e.target.value }))
                                setPage(1)
                            }}
                            className="px-3 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4]"
                        >
                            <option value="">All Status</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </select>

                        {/* Method */}
                        <select
                            value={filters.method}
                            onChange={e => {
                                setFilters(f => ({ ...f, method: e.target.value }))
                                setPage(1)
                            }}
                            className="px-3 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4]"
                        >
                            <option value="">All Methods</option>
                            {["GET","POST","PUT","PATCH","DELETE"].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        {/* Action Path */}
                        <input
                            type="text"
                            placeholder="Filter by action/path…"
                            value={filters.action}
                            onChange={e => {
                                setFilters(f => ({ ...f , action: e.target.value }))
                                setPage(1)
                            }}
                            className="px-3 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4] w-44"
                        />
                        <div className="flex items-center gap-1.5">
                            <TbCalendar size={13} className="text-gray-400" />
                            <input
                                type="date"
                                value={filters.from}
                                onChange={e => {
                                    setFilters(f => ({ ...f , from: e.target.value }))
                                    setPage(1)
                                }}
                                className="px-2 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4]"
                            />
                            <span className="text-gray-400 text-xs">→</span>
                            <input
                                type="date"
                                value={filters.to}
                                onChange={e => {
                                    setFilters(f => ({ ...f , to: e.target.value }))
                                }}
                                className="px-2 py-2 text-xs bg-gray-50 border border-black/[0.08] rounded-xl outline-none focus:border-[#4ecdc4]"
                            />
                        </div>

                        {/* Sort */}
                        <button
                            onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-black/[0.08] rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {sortDir === "desc"
                                ? <><TbSortDescending size={14} /> Newest</>
                                : <><TbSortAscending size={14} /> Oldest</>
                            }
                        </button>
                    </div>
                    {(activeFilters.length > 0 || search) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-black/[0.05]">
                            <TbFilter size={12} className="text-gray-400" />
                            {search && <FilterChip label={`actor: ${search}`} onRemove={() => setSearch("")} />}
                            {activeFilters.map(([k, v]) => (
                                <FilterChip key={k} label={`${k}: ${v}`} onRemove={() => clearFilters(k)} />
                            ))}
                            <button
                                onClick={clearAll}
                                className="text-[11px] text-red-400 hover:text-red-600 transition-colors ml-1"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
                <div className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-2 border-b border-black/[0.06]">
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-800">{total.toLocaleString()}</span> total Logs
                            {loading && <span className="ml-2 text-[#4ecdc4] animate-pulse">loading...</span>}
                        </p>
                        <p className="text-[11px] text-gray-400">Page {page} of {pages}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    {["Action / Path" , "Status" , "Actor" , "IP" , "Time" , ""].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array.from({ length: 8 }).map((_,i) => (
                                        <tr key={i} className="border-b border-black/[0.05]">
                                            {Array.from({ length: 6 }).map((_,j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-3 bg-gray-100 rounded-md animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : logs.length === 0
                                        ? <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-sm text-gray-400">
                                                No Audit Logs Found !
                                            </td>
                                        </tr>
                                        : logs.map((log,i) => (
                                            <LogRow key={log.ID || i} log={log} onClick={setSelectedLog} />
                                        ))
                                }
                            </tbody>
                        </table>
                    </div> 
                    {pages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-black/[0.06]">
                            <button
                                onClick={() => setPage(p => Math.max(1, p-1))}
                                disabled={page===1}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-black/[0.1] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <TbChevronLeft size={13} /> Prev
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(pages, 7)}, (_,i) => {
                                    const p = pages <= 7
                                        ? i + 1
                                        : page <=4 ? i + 1
                                        : page >= pages - 3 ? pages - 6 -i
                                        : pages - 3 + i
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-7 h-7 text-[11px] rounded-lg transition-colors font-mono
                                                ${page === p
                                                    ? "bg-[#4ecdc4] text-white font-bold"
                                                    : "text-gray-500 hover:bg-gray-100"
                                                }
                                                `}
                                        >
                                            {p}
                                        </button>
                                    )
                                } )}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pages, p+1))}
                                disabled = {page === pages}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-black/[0.1] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <TbChevronRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}

            {selectedLog && (
                <MetaModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}

                />
            )}
        </div>
    )
}

export default Audit