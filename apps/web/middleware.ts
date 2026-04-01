import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const authBase =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001"

  try {
    const response = await fetch(`${authBase}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    })

    if (!response.ok) return false
    const payload = (await response.json()) as { user?: unknown } | null
    return Boolean(payload?.user)
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const valid = await hasValidSession(request)
    if (!valid) {
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
