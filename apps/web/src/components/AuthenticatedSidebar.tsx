"use client"

import { Sidebar } from "@workspace/ui/components/sidebar"
import { useRouter } from "next/navigation"
import { authClient } from "../auth/web-auth-client"

interface AuthenticatedSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  onLogout?: () => void
}

export function AuthenticatedSidebar({
  className,
  isCollapsed = false,
  onToggle,
  onLogout,
}: AuthenticatedSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      await authClient.signOut()
      router.push("/")
    }
  }

  return (
    <div className="relative">
      <Sidebar
        className={className}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        onLogout={handleLogout}
      />
    </div>
  )
}
