"use client"

import { cn } from "@workspace/ui/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { authClient, useSession } from "../auth/web-auth-client"
import { useAppToast } from "./AppToastProvider"
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
  const [isSendingVerification, setIsSendingVerification] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useAppToast()
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

  const user = session.user as { email?: string; emailVerified?: boolean }
  const isEmailVerified = Boolean(user?.emailVerified)

  const handleSendVerification = async () => {
    const email = user?.email?.trim()
    if (!email) {
      showToast({
        variant: "error",
        title: "Email not found",
        description: "Please sign out and sign in again.",
      })
      return
    }

    setIsSendingVerification(true)
    try {
      const callbackURL =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL,
      })
      if (result.error) {
        throw new Error(result.error.message || "Could not send verification email")
      }

      showToast({
        variant: "success",
        title: "Verification email sent",
        description: "Check your inbox for the verification link.",
      })
    } catch (error) {
      showToast({
        variant: "error",
        title: "Unable to send verification email",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsSendingVerification(false)
    }
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
        {!isEmailVerified ? (
          <div className="sticky hidden top-0 z-20 border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="mx-auto flex max-w-6xl items-center text-base justify-between gap-3 text-sm">
              <p>
                Your email is not verified yet. Verify your account to keep it secure.
              </p>
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
                className="rounded-md border border-amber-400 px-3 py-1 font-medium hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSendingVerification ? "Sending..." : "Send verification link"}
              </button>
            </div>
          </div>
        ) : null}
        <div className="min-h-full w-full">{children}</div>
      </main>
    </div>
  )
})

AuthenticatedDashboardLayout.displayName = "AuthenticatedDashboardLayout"
