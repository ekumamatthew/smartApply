import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authClient } from "./src/auth/web-auth-client"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    try {
      const session = await authClient.getSession({
        fetchOptions: {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        },
      })

      if (!session.data) {
        // Redirect to sign-in page with callback URL
        const url = new URL("/auth/signin", request.url)
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error("Middleware auth error:", error)
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
