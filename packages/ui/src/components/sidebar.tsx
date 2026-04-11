"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Briefcase,
  Calendar,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import * as React from "react"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
  onLogout?: () => void
  currentPath?: string
  user?: {
    name?: string | null
    email?: string | null
  }
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      isCollapsed = false,
      onToggle,
      onLogout,
      currentPath,
      user,
      ...props
    },
    ref
  ) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)
    const [pathname, setPathname] = React.useState(currentPath ?? "")
    const [mobileBadgePos, setMobileBadgePos] = React.useState({
      x: 4,
      y: 4,
    })
    const badgeRef = React.useRef<HTMLDivElement>(null)
    const dragOffsetRef = React.useRef({ x: 0, y: 0 })
    const startPointerRef = React.useRef({ x: 0, y: 0 })
    const isDraggingRef = React.useRef(false)
    const didDragRef = React.useRef(false)

    React.useEffect(() => {
      if (currentPath) {
        setPathname(currentPath)
        return
      }

      if (typeof window !== "undefined") {
        setPathname(window.location.pathname)
      }
    }, [currentPath])

    const clampBadgePosition = React.useCallback((x: number, y: number) => {
      if (typeof window === "undefined") {
        return { x, y }
      }
      const rect = badgeRef.current?.getBoundingClientRect()
      const width = rect?.width ?? 44
      const height = rect?.height ?? 44
      const maxX = Math.max(0, window.innerWidth - width)
      const maxY = Math.max(0, window.innerHeight - height)
      return {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY),
      }
    }, [])

    const onBadgePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (typeof window === "undefined") return
      isDraggingRef.current = true
      didDragRef.current = false
      startPointerRef.current = { x: event.clientX, y: event.clientY }
      const rect = badgeRef.current?.getBoundingClientRect()
      dragOffsetRef.current = {
        x: event.clientX - (rect?.left ?? mobileBadgePos.x),
        y: event.clientY - (rect?.top ?? mobileBadgePos.y),
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const onBadgePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return
      const deltaX = Math.abs(event.clientX - startPointerRef.current.x)
      const deltaY = Math.abs(event.clientY - startPointerRef.current.y)
      if (deltaX > 3 || deltaY > 3) {
        didDragRef.current = true
      }
      const nextX = event.clientX - dragOffsetRef.current.x
      const nextY = event.clientY - dragOffsetRef.current.y
      setMobileBadgePos(clampBadgePosition(nextX, nextY))
    }

    const onBadgePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (isDraggingRef.current && !didDragRef.current) {
        setIsMobileOpen(true)
      }
      isDraggingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    }

    React.useEffect(() => {
      if (typeof window === "undefined") return
      const onResize = () => {
        setMobileBadgePos((prev) => clampBadgePosition(prev.x, prev.y))
      }
      window.addEventListener("resize", onResize)
      return () => {
        window.removeEventListener("resize", onResize)
      }
    }, [clampBadgePosition])

    const displayName =
      user?.name?.trim() || user?.email?.split("@")[0] || "User"
    const displayEmail = user?.email?.trim() || "No email"
    const initials = displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2)
    const avatarText = initials || "U"

    const menuItems = [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      {
        icon: Briefcase,
        label: "Job Hub",
        href: "/dashboard/jobs",
      },
      {
        icon: FileText,
        label: "Applications",
        href: "/dashboard/applications",
      },
      {
        icon: Briefcase,
        label: "CV Management",
        href: "/dashboard/cv",
      },
      {
        icon: Calendar,
        label: "Calendar",
        href: "/dashboard/calendar",
      },
      {
        icon: Users,
        label: "Network",
        href: "/dashboard/network",
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/dashboard/settings",
      },
    ]

    return (
      <>
        {/* Mobile Menu Button */}

        <div
          ref={badgeRef}
          className={cn(
            "z-[60] rounded-lg border border-border bg-background p-2 md:hidden",
            isMobileOpen ? "hidden" : "fixed"
          )}
          style={{
            left: `${mobileBadgePos.x}px`,
            top: `${mobileBadgePos.y}px`,
            touchAction: "none",
          }}
          onPointerDown={onBadgePointerDown}
          onPointerMove={onBadgePointerMove}
          onPointerUp={onBadgePointerUp}
          onPointerCancel={onBadgePointerUp}
        >
          <img
            onClick={() => setIsMobileOpen(true)}
            src={"/branding/logobg.png"}
            className="h-6 w-6 object-contain"
            alt="SwiftApplyHQ"
          />
        </div>

        {isMobileOpen ? (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-[60] h-11 w-auto rounded-xl border border-border/60 bg-background/95 px-2 shadow-sm backdrop-blur md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <img
              src={"/branding/swiftapply.png"}
              className="h-7 w-[150px] object-contain"
              alt="SwiftApplyHQ"
            />
          </Button>
        ) : null}

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={cn(
            "fixed top-0 left-0 z-40 h-screen border-r bg-card transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
            "md:relative md:translate-x-0",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
            className
          )}
          {...props}
        >
          <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Button
                onClick={onToggle}
                variant="ghost"
                size="icon"
                className="hidden h-auto w-full md:flex"
              >
                <img
                  src={
                    isCollapsed
                      ? "/branding/logobg.png"
                      : "/branding/swiftapply.png"
                  }
                  className="h-auto w-auto"
                  alt="SwiftApplyHQ"
                />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "px-2"
                    )}
                    asChild
                  >
                    <a href={item.href} onClick={() => setIsMobileOpen(false)}>
                      <item.icon
                        className={cn("h-4 w-4", !isCollapsed && "mr-3")}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </a>
                  </Button>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">{avatarText}</span>
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                className={cn(
                  "mt-4 w-full justify-start",
                  isCollapsed && "px-2"
                )}
                onClick={onLogout}
              >
                <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }
)
Sidebar.displayName = "Sidebar"

export { Sidebar }
