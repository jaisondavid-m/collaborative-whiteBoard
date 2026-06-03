import React from "react"
import { Outlet , useLocation } from "react-router-dom"
import Navbar from "../Components/ui/Navbar.jsx"
import Footer from "../Components/ui/Footer.jsx"

function AppLayout() {

    const location = useLocation()

    const hideFooter =
        location.pathname.startsWith("/setting")

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f2]">
            <Navbar/>
            <main className="flex-1">
                <Outlet/>
            </main>
            { !hideFooter && <Footer/>}
        </div>
    )
}

export default AppLayout