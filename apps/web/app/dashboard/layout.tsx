import { AuthProvider } from "@/src/components/AuthProvider"
import "@workspace/ui/globals.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthProvider>{children}</AuthProvider>
}
