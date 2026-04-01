"use client"

import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"

interface AuthenticatedDashboardLayoutProps {
  children: React.ReactNode
  className?: string
}
export const AuthenticatedDashboardLayout = React.forwardRef<
  HTMLDivElement,
  AuthenticatedDashboardLayoutProps
>(({ children, className, ...props }, ref) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  return (
    <div
      ref={ref}
      className={cn("flex min-h-screen bg-background", className)}
      {...props}
    >
      <AuthenticatedSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={cn(
          "no-scrollbar h-screen flex-1 overflow-y-auto transition-all duration-300",
          isSidebarCollapsed ? "sm:ml-30 md:ml-0" : "sm:ml-64 md:ml-0"
        )}
      >
        <div className="min-h-full w-full">{children}</div>
      </main>
    </div>
  )
})

AuthenticatedDashboardLayout.displayName = "AuthenticatedDashboardLayout"
