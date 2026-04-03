"use client"

import { cn } from "@workspace/ui/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useSession } from "../auth/web-auth-client"
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
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  React.useEffect(() => {
    if (isPending) return
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/auth/signin?callbackUrl=${callbackUrl}`)
    }
  }, [isPending, pathname, router, session])

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    )
  }

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
