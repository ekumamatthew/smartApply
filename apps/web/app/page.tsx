"use client"
import { AuthenticatedHeader } from "@/src/components/AuthenticatedHeader"
import { EmailGenerator } from "@workspace/ui/components/email-generator"
import { Features } from "@workspace/ui/components/features"
import { Footer } from "@workspace/ui/components/footer"
import { Hero } from "@workspace/ui/components/hero"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      <main>
        <Hero />
        <Features />
        <EmailGenerator />
      </main>
      <Footer />
    </div>
  )
}
