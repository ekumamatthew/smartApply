"use client"

import React, { createContext, useContext, type ReactNode } from "react"
import { authClient, useSession, type User } from "../auth/web-auth-client"

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType {
  state: AuthState
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error, refetch } = useSession()

  const value: AuthContextType = {
    state: {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading: isPending,
      error: error ? String(error) : null,
    },
    signIn: async (email: string, password: string) => {
      await authClient.signIn.email({ email, password })
      await refetch()
    },
    signUp: async (email: string, password: string, name: string) => {
      await authClient.signUp.email({ email, password, name })
      await refetch()
    },
    signInWithGoogle: async () => {
      await authClient.signIn.social({ provider: "google" })
    },
    signInWithGithub: async () => {
      await authClient.signIn.social({ provider: "github" })
    },
    signOut: async () => {
      await authClient.signOut()
      await refetch()
    },
    checkAuthStatus: async () => {
      await refetch()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { state } = useAuth()

    if (state.isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (!state.isAuthenticated) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Authentication Required
            </h2>
            <p className="mb-6 text-gray-600">Please sign in to access this page.</p>
            <button
              onClick={() => {
                window.location.href = "/auth/signin"
              }}
              className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
