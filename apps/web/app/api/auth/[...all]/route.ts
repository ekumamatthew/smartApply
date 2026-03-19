import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001"
  const url = new URL(request.url)
  const backendPath = url.pathname.replace("/api/auth", "") + url.search

  try {
    const response = await fetch(`${backendUrl}${backendPath}`, {
      method: request.method,
      headers: {
        "Content-Type":
          request.headers.get("content-type") || "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: request.body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Set-Cookie": response.headers.get("set-cookie") || "",
      },
    })
  } catch (error) {
    console.error("Auth proxy error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
