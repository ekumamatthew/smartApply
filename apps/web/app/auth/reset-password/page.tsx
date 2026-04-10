"use client"

import { Header } from "@workspace/ui/components/header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [message, setMessage] = React.useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!token) {
      setError("Missing reset token. Please request a new password reset email.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setError(payload.message || "Unable to reset password")
      } else {
        setMessage("Password reset successful. You can now sign in.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password")
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
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-sm text-muted-foreground">
              Create a new password for your SwiftApplyHQ account.
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
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset password"}
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
