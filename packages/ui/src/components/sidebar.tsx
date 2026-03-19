import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Briefcase,
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react"
import * as React from "react"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, isCollapsed = false, onToggle, ...props }, ref) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    const menuItems = [
      { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
      {
        icon: Briefcase,
        label: "Job Hub",
        href: "/dashboard/jobs",
        active: false,
      },
      {
        icon: FileText,
        label: "Applications",
        href: "/dashboard/applications",
        active: false,
      },
      {
        icon: Briefcase,
        label: "CV Management",
        href: "/dashboard/cv",
        active: false,
      },
      {
        icon: Calendar,
        label: "Calendar",
        href: "/dashboard/calendar",
        active: false,
      },
      {
        icon: Users,
        label: "Network",
        href: "/dashboard/network",
        active: false,
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/dashboard/settings",
        active: false,
      },
    ]

    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

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
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                    SA
                  </div>
                  <span className="text-lg font-bold">SmartApply</span>
                </div>
              )}
              {isCollapsed && (
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                  SA
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={onToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.active ? "default" : "ghost"}
                  className={cn("w-full justify-start", isCollapsed && "px-2")}
                  asChild
                >
                  <a href={item.href}>
                    <item.icon
                      className={cn("h-4 w-4", !isCollapsed && "mr-3")}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </a>
                </Button>
              ))}
            </nav>

            {/* User Section */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">JD</span>
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">John Doe</p>
                    <p className="truncate text-xs text-muted-foreground">
                      john@example.com
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
