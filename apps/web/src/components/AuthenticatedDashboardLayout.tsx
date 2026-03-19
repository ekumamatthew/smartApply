"use client"

import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

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
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarCollapsed ? "sm:ml-30 md:ml-0" : "sm:ml-64 md:ml-0"
      )}>
        <div className="min-h-full w-full">
          {children}
        </div>
      </main>
    </div>
  )
})

AuthenticatedDashboardLayout.displayName = "AuthenticatedDashboardLayout"
