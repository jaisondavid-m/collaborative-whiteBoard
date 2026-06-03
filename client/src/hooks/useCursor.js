import React , { useState , useEffect , useLayoutEffect } from "react"

function useCursor() {

    const [style, setStyle] = useState(
        () => localStorage.getItem("cursorStyle") || "default"
    )

    useEffect(() => {
        const onChange = () => 
            setStyle(localStorage.getItem("cursorStyle") || "default")
        window.addEventListener("storage",onChange)
        return () => window.removeEventListener("storage",onChange)
    },[])

    useLayoutEffect(() => {
        if (style !== "default") {
            document.body.classList.add("custom-cursor")
        } else {
            document.body.classList.remove("custom-cursor")
        }
    },[style])

    return style

}

export default useCursor