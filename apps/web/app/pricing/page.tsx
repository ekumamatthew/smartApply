"use client"

import { Button } from "@workspace/ui/components/button"
import { Header } from "@workspace/ui/components/header"
import { Footer } from "@workspace/ui/components/footer"
import {
  Check,
  Star,
  Zap,
  Users,
  Crown
} from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 w-full flex flex-col justify-center items-center lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-primary/3 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-secondary/2 animate-pulse" style={{ animationDuration: '12s', animationDelay: '5s' }}></div>

        <div className="relative container px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Crown className="mr-2 h-4 w-4" />
              Simple, Transparent Pricing
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Choose Your Perfect
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                SmartApply Plan
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground backdrop-blur-sm bg-background/20 p-4 rounded-lg">
              Start free, upgrade when you need more power. No hidden fees,
              cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <div className="relative rounded-2xl border border-border/20 bg-background/30 p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-foreground">Free</h3>
                  <div className="text-3xl font-bold text-foreground">$0</div>
                  <p className="text-sm text-muted-foreground">Forever free</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">5 applications per month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Basic CV tailoring</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Email templates</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Basic tracking</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/10"
                    size="lg"
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-2xl border-2 border-green-500/20 bg-green-500/5 p-8 backdrop-blur-sm">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-green-600 to-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    MOST POPULAR
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-foreground">Pro</h3>
                  <div className="text-3xl font-bold text-foreground">$19</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Unlimited applications</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Advanced CV tailoring</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">AI email generation</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-foreground">Advanced analytics</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    Start Pro Trial
                  </Button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="relative rounded-2xl border border-border/20 bg-background/30 p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-foreground">Enterprise</h3>
                  <div className="text-3xl font-bold text-foreground">$49</div>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Team collaboration</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">API access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm text-foreground">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-foreground">Dedicated support</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/10"
                    size="lg"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <h4 className="mb-3 text-lg font-semibold text-foreground">
                  Can I change plans anytime?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade, downgrade, or cancel your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <h4 className="mb-3 text-lg font-semibold text-foreground">
                  Is there a setup fee?
                </h4>
                <p className="text-sm text-muted-foreground">
                  No, there are no setup fees or hidden charges. You only pay for
                  the plan you choose.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <h4 className="mb-3 text-lg font-semibold text-foreground">
                  What if I need help?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Our support team is here to help! Pro users get priority support,
                  and Enterprise users get dedicated assistance.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <h4 className="mb-3 text-lg font-semibold text-foreground">
                  Is my data secure?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Absolutely! We use enterprise-grade encryption and never share your data
                  with third parties without your consent.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm text-primary backdrop-blur-sm">
              <Users className="mr-2 h-4 w-4" />
              Ready to get started?
              <a href="/signup" className="ml-2 font-medium underline hover:text-primary/80">
                Create your account
              </a>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-10 right-10 w-16 h-16 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '5s' }}></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
