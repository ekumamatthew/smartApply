import { ThemeProvider } from "@/components/theme-provider"
import { AppProviders } from "@/src/components/AppProviders"
import { AuthProvider } from "@/src/components/AuthProvider"
import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import type { CSSProperties } from "react"

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
