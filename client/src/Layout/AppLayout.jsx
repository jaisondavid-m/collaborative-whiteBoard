import React from "react"
import { Outlet , useLocation } from "react-router-dom"
import Navbar from "../Components/ui/Navbar.jsx"
import NavbarV2 from "../Components/ui/NavbarV2.jsx"
import Footer from "../Components/ui/Footer.jsx"

function AppLayout() {

    const location = useLocation()

    const hideFooter =
        location.pathname.startsWith("/setting") ||
        location.pathname.startsWith("/chat") ||
        location.pathname.startsWith("/whiteboard")
    
    const hideNavbar =
        location.pathname.startsWith("/whiteboard")

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f2]">
            {/* <Navbar/> */}
            { !hideNavbar && <NavbarV2/> }
            <main className={`flex-1 
                    ${
                        hideNavbar
                            ? "pt-0"
                            : "pt-16"
                    }
                `}>
                <Outlet/>
            </main>
            { !hideFooter && <Footer/>}
        </div>
    )
}

export default AppLayout