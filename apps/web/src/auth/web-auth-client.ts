"use client"

import { emailOTPClient } from "better-auth/client/plugins"
import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
  // Use same-origin auth proxy route to avoid cross-site cookie/session issues.
  baseURL: "",
  basePath: "/api/auth",
  plugins: [emailOTPClient(), nextCookies()],
})

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  getSession,
  forgetPassword,
  resetPassword,
  getAccessToken,
  verifyEmail,
  sendVerificationEmail,
  emailOtp,
} = authClient
export type User = typeof authClient.$Infer.Session.user
// export type Session = typeof authClient.$Infer.Session;
