"use client";

import { User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserData } from "@/hooks/use-user-data"
import { cn } from "@/lib/utils"

// Menu items.
const items = [
  {
    title: "Account",
    url: "/settings/account",
    icon: User,
  },
  {
    title: "Admin", 
    url: "/settings/admin",
    icon: Settings,
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const { userData } = useUserData()
  
  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (item.title === "Admin") {
      return ["admin", "superadmin"].includes(userData?.role)
    }
    return true
  })

  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:block flex-shrink-0">
      <div className="flex flex-col h-full pt-8 px-4 pb-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 px-2">Settings</h2>
        </div>
        
        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-gray-900" : "text-gray-500"
                )} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}