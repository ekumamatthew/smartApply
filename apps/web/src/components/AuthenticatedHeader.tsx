"use client"

import { Header } from "@workspace/ui/components/header"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "../auth/web-auth-client"

interface AuthenticatedHeaderProps {
  className?: string
}

export function AuthenticatedHeader({ className }: AuthenticatedHeaderProps) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isPending) {
    return (
      <div className="sticky top-0 z-50 flex w-full justify-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                SA
              </div>
              <span className="text-xl font-bold">SmartApply</span>
            </div>
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex w-full justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 lg:justify-center",
        className
      )}
    >
      <Header className={className} />
      {/* Auth Overlay */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {session ? (
          <>
            <span className="hidden text-sm text-muted-foreground md:inline-flex">
              {session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="hidden px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:inline-flex"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/signin"
              className="hidden px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="hidden rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
