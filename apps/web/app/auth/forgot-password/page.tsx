"use client"

import { Header } from "@workspace/ui/components/header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import * as React from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [message, setMessage] = React.useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/auth/reset-password`
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          redirectTo,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
      }

      if (!response.ok) {
        setError(payload.message || "Could not send reset email")
      } else {
        setMessage("Password reset link sent. Check your email inbox.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your account email and we will send a reset link.
            </p>
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          ) : null}
          {message ? (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <Link className="text-primary hover:underline" href="/auth/signin">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
