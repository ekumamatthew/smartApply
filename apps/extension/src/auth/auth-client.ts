// Frontend Auth Client for BetterAuth Integration
import { EXT_API_BASE_URL } from "../config/env"

export class AuthClient {
  private baseUrl: string

  constructor(baseUrl: string = EXT_API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async signIn(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()
    return data
  }

  async signUp(email: string, password: string, name: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    const data = await response.json()
    return data
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/api/auth/session`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  }

  async signOut() {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Sign out failed")
    }

    return response.json()
  }

  // Social login methods
  async signInWithGoogle() {
    window.open(
      `${this.baseUrl}/api/auth/sign-in/google`,
      "_blank",
      "width=500,height=600"
    )
  }

  async signInWithGithub() {
    window.open(
      `${this.baseUrl}/api/auth/sign-in/github`,
      "_blank",
      "width=500,height=600"
    )
  }

  // For extension popup authentication
  async authenticateInExtension() {
    try {
      const user = await this.getCurrentUser()
      if (user && user.user) {
        return { authenticated: true, user: user.user }
      }
      return { authenticated: false, user: null }
    } catch (error) {
      return { authenticated: false, user: null, error }
    }
  }
}

// Usage in extension
export const authClient = new AuthClient()

// Extension popup integration
export async function checkAuthStatus() {
  const { authenticated, user } = await authClient.authenticateInExtension()

  if (authenticated) {
    // Show user dashboard
    console.log("User authenticated:", user)
    return user
  } else {
    // Show login screen
    console.log("User not authenticated")
    return null
  }
}

// Login form handler
export async function handleLogin(email: string, password: string) {
  try {
    const result = await authClient.signIn(email, password)
    console.log("Login successful:", result)
    return result
  } catch (error) {
    console.error("Login failed:", error)
    throw error
  }
}

// Registration form handler
export async function handleRegistration(
  email: string,
  password: string,
  name: string
) {
  try {
    const result = await authClient.signUp(email, password, name)
    console.log("Registration successful:", result)
    return result
  } catch (error) {
    console.error("Registration failed:", error)
    throw error
  }
}
