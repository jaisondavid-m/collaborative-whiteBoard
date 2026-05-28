import React from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../Components/ui/Navbar.jsx"

function AppLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f2]">
            <Navbar/>
            <main className="flex-1">
                <Outlet/>
            </main>
        </div>
    )
}

export default AppLayout