import { Sidebar } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, className, ...props }, ref) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn("flex min-h-screen bg-background", className)}
        {...props}
      >
        <Sidebar
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
  }
)
DashboardLayout.displayName = "DashboardLayout"

export { DashboardLayout }
