import React from "react"

function PasswordRequirements({ password }) {

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=?"'\\/|<>.,;:()[\]{}]/.test(password)
    }

    const Requirement = ({ valid , text }) => (
        <div
            className={`flex items-center gap-1.5 text-xs transition-colors ${
                valid 
                    ? "text-green-600"
                    : "text-gray-400"
            }`}
        >
            <span>
                {valid ? "✓" : "○"}
            </span>
            <span>{text}</span>
        </div>
    )

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-500 mb-1.5">
                Requirements
            </p>
            <div className="space-y-0.5">
                <Requirement
                    valid={checks.length}
                    text="8+ characters"
                />
                <Requirement
                    valid={checks.uppercase}
                    text="Uppercase letter"
                />
                <Requirement
                    valid={checks.lowercase}
                    text="Lowercase letter"
                />
                <Requirement
                    valid={checks.number}
                    text="Number"
                />
                <Requirement
                    valid={checks.special}
                    text="Special character"
                />
            </div>
        </div>
    )
}

export default PasswordRequirements