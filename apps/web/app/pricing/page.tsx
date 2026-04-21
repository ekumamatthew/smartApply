"use client"

import { Button } from "@workspace/ui/components/button"
import { Footer } from "@workspace/ui/components/footer"
import { Header } from "@workspace/ui/components/header"
import { Check, Crown, Star, Users } from "lucide-react"

export default function PricingPage() {
  return (
    <div>
      <Header />

      <div className="min-h-screen bg-background">
        <main className="flex w-full flex-col items-center justify-center py-20 lg:py-32">
          {/* Animated Background */}
          <div
            className="absolute inset-0 animate-pulse bg-primary/3"
            style={{ animationDuration: "10s", animationDelay: "2s" }}
          ></div>
          <div
            className="absolute inset-0 animate-pulse bg-secondary/2"
            style={{ animationDuration: "12s", animationDelay: "5s" }}
          ></div>

          <div className="relative container px-4">
            {/* Section Header */}
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <Crown className="mr-2 h-4 w-4" />
                Pay-As-You-Go Credits
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Purchase Credits for Your
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Applications Processing
                </span>
              </h2>
              <p className="mx-auto max-w-2xl rounded-lg bg-background/20 p-4 text-xl text-muted-foreground backdrop-blur-sm">
                Buy credits once, use them whenever you need. No subscriptions,
                no expiration.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto max-w-2xl">
              {/* Single Credit Package */}
              <div className="relative rounded-2xl border-2 border-green-500/20 bg-green-500/5 p-8 backdrop-blur-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="rounded-full bg-gradient-to-r from-green-600 to-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    ALL FEATURES INCLUDED
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    Credit Package
                  </h3>
                  Free
                  {/* <div className="text-4xl font-bold text-foreground">$10</div>
                  <p className="text-lg text-muted-foreground">1,000 credits</p> */}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      All AI features unlocked
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      Email generation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      CV optimization
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">
                      Priority support
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-foreground">
                      Credits never expire
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    Buy Credits Now
                  </Button>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mx-auto mt-20 max-w-4xl">
              <div className="mb-12 text-center">
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-border/20 bg-background/20 p-6 backdrop-blur-sm">
                  <h4 className="mb-3 text-lg font-semibold text-foreground">
                    How do credits work?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Credits are consumed when you use AI features like email
                    generation and CV optimization. Each feature has a specific
                    credit cost, and you can buy more credits anytime.
                  </p>
                </div>

                <div className="rounded-xl border border-border/20 bg-background/20 p-6 backdrop-blur-sm">
                  <h4 className="mb-3 text-lg font-semibold text-foreground">
                    Do credits expire?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No! Credits never expire. Buy them once and use them
                    whenever you need them. No pressure to use them quickly.
                  </p>
                </div>

                <div className="rounded-xl border border-border/20 bg-background/20 p-6 backdrop-blur-sm">
                  <h4 className="mb-3 text-lg font-semibold text-foreground">
                    Can I buy credits in bulk?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Our Enterprise package offers the best value with 7,000
                    credits at a 29% discount compared to the Starter package.
                  </p>
                </div>

                <div className="rounded-xl border border-border/20 bg-background/20 p-6 backdrop-blur-sm">
                  <h4 className="mb-3 text-lg font-semibold text-foreground">
                    Is my data secure?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We use enterprise-grade encryption and never
                    share your data with third parties without your consent.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm text-primary backdrop-blur-sm">
                <Users className="mr-2 h-4 w-4" />
                Ready to get started?
                <a
                  href="/auth/signup"
                  className="ml-2 font-medium underline hover:text-primary/80"
                >
                  Create your account
                </a>
              </div>
            </div>

            {/* Floating Elements */}
            <div
              className="absolute top-10 right-10 h-16 w-16 animate-pulse rounded-full bg-primary/8 blur-3xl"
              style={{ animationDuration: "7s", animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-10 left-10 h-20 w-20 animate-pulse rounded-full bg-secondary/6 blur-3xl"
              style={{ animationDuration: "9s", animationDelay: "5s" }}
            ></div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
