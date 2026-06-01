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
            className={`flex items-center gap-2 text-sm transition-colors ${
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
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
                Password Requirements
            </p>
            <div className="space-y-2">
                <Requirement
                    valid={checks.length}
                    text="At Least 8 characters"
                />
                <Requirement
                    valid={checks.uppercase}
                    text="One uppercase letter"
                />
                <Requirement
                    valid={checks.lowercase}
                    text="One lowercase letter"
                />
                <Requirement
                    valid={checks.number}
                    text="One number"
                />
                <Requirement
                    valid={checks.special}
                    text="One Special character"
                />
            </div>
        </div>
    )
}

export default PasswordRequirements