"use client"
import { EmailGenerator } from "@workspace/ui/components/email-generator"
import { Features } from "@workspace/ui/components/features"
import { Footer } from "@workspace/ui/components/footer"
import { Header } from "@workspace/ui/components/header"
import { Hero } from "@workspace/ui/components/hero"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <EmailGenerator />
      </main>
      <Footer />
    </div>
  )
}
