import { NextRequest, NextResponse } from "next/server"

function getBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
}

export async function POST(request: NextRequest) {
  const backendBaseUrl = getBackendBaseUrl()
  const upstreamUrl = `${backendBaseUrl}/contact`

  const headers = new Headers(request.headers)
  headers.delete("host")

  const body = await request.json()

  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  return NextResponse.json(data, {
    status: response.status,
  })
}
