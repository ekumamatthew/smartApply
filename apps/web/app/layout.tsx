import { ThemeProvider } from "@/components/theme-provider"
import { AppProviders } from "@/src/components/AppProviders"
import { AuthProvider } from "@/src/components/AuthProvider"
import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import type { Metadata } from "next"
import type { CSSProperties } from "react"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.swiftapplyhq.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SwiftApplyHQ | AI Job Application Assistant",
    template: "%s | SwiftApplyHQ",
  },
  description:
    "SwiftApplyHQ helps job seekers generate tailored application emails, optimize CVs for ATS, and track applications in one dashboard.",
  applicationName: "SwiftApplyHQ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "SwiftApplyHQ",
    title: "SwiftApplyHQ | AI Job Application Assistant",
    description:
      "Create stronger job applications with AI-powered CV optimization and tailored outreach emails.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftApplyHQ | AI Job Application Assistant",
    description:
      "Optimize your CV, generate tailored emails, and track job applications with SwiftApplyHQ.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans")}
      style={
        {
          "--font-sans":
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          "--font-mono":
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
        } as CSSProperties
      }
    >
      <body>
        <AppProviders>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}
