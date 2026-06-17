import Rect from "react"

function Empty({ icon: Icon, title, sub }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400" >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center" >
                <Icon size={24} />
            </div>
            <p className="font-medium text-gray-500 text-sm" >{title}</p>
            {sub && <p className="text-xs text-center max-w-[200px]" >{sub}</p>}
        </div>
    )
}

export default Empty