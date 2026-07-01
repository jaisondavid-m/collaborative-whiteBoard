import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            userid: null,
            role: null,
            
            login: (newToken, userid, role) =>
                set({ token: newToken, userid, role }),

            logout: () =>
                set({ token: null, userid: null, role: null })
        }),
        {
            name: "auth",
        }
    )
)

// if (typeof window !== "undefined") {
//     window.addEventListener("auth:logout", () => {
//         useAuthStore.getState().logout()
//     })
// }