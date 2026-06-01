import React from "react"

function PasswordStrength({ password }) {

    let score = 0

    if(password.length >=8) {
        score++
    }

    if (/[A-Z]/.test(password)) {
        score++
    }

    if (/[a-z]/.test(password)) {
        score++
    }

    if (/[0-9]/.test(password)) {
        score++
    }

    if (/[!@#$%^&*()_+\-=?"'\\/|<>.,;:()[\]{}]/.test(password)) {
        score++
    }

    let label = "Weak"
    let color = "bg-red-500"

    if (score >= 3) {
        label = "Medium"
        color = "bg-yellow-500"
    }

    if (score >= 5) {
        label = "Strong"
        color = "bg-green-500"
    }

    return (
        <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
                <span>Password Strength</span>
                <span>{label}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full transition-all duration-300`}
                    style={{
                        width: `${(score/5)*100}` ,
                    }}
                />
            </div>
        </div>
    )
}

export default PasswordStrength