"use client"

import { Sidebar } from "@workspace/ui/components/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { authClient, useSession } from "../auth/web-auth-client"

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
  const pathname = usePathname()
  const { data: session } = useSession()

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
        currentPath={pathname}
        user={{
          name: session?.user?.name ?? null,
          email: session?.user?.email ?? null,
        }}
      />
    </div>
  )
}
