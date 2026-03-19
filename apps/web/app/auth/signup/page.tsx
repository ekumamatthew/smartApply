"use client"

import { Button } from "@workspace/ui/components/button"
import { Header } from "@workspace/ui/components/header"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Chrome, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { authClient, useSession } from "../../../src/auth/web-auth-client"
export default function SignUpPage() {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      })
      // Redirect to dashboard on successful sign-up
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: "github" | "google") => {
    try {
      await authClient.signIn.social({ provider })
    } catch (err) {
      setError(`${provider} sign up failed`)
    }
  }

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Already Signed In
          </h2>
          <p className="mb-6 text-gray-600">
            Welcome back, {session.user.name || session.user.email}!
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Start your journey to landing your dream job
            </p>
          </div>
          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Social Sign Up */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialSignUp("google")}
              type="button"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">
                      Toggle confirm password visibility
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    asChild
                  >
                    <a href="/terms">Terms of Service</a>
                  </Button>{" "}
                  and{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    asChild
                  >
                    <a href="/privacy">Privacy Policy</a>
                  </Button>
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <a href="/auth/signin">Sign in</a>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
