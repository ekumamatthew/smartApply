import { NextRequest, NextResponse } from "next/server"

function getBackendAuthBaseUrl() {
  const explicit = process.env.BETTER_AUTH_PROXY_TARGET
  const fallback =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  return (explicit || fallback).replace(/\/+$/, "")
}

async function proxyAuth(request: NextRequest) {
  const backendBaseUrl = getBackendAuthBaseUrl()
  const incomingUrl = new URL(request.url)
  const upstreamPath = incomingUrl.pathname.replace(/^\/api\/auth/, "/api/auth")
  const upstreamUrl = `${backendBaseUrl}${upstreamPath}${incomingUrl.search}`

  const headers = new Headers(request.headers)
  headers.delete("host")
  headers.set("x-forwarded-host", incomingUrl.host)
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""))

  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    cache: "no-store",
    duplex: "half",
  } as RequestInit)

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("content-length")

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export const GET = proxyAuth
export const POST = proxyAuth
export const PUT = proxyAuth
export const PATCH = proxyAuth
export const DELETE = proxyAuth
export const OPTIONS = proxyAuth
export const HEAD = proxyAuth
