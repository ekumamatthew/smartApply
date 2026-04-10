import { ArrowRight, BarChart3, Target, Zap } from "lucide-react"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface HeroProps {
  className?: string
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden py-20 lg:py-32",
          className
        )}
        {...props}
      >
        {/* Animated Background */}
        <div
          className="absolute inset-0 animate-pulse bg-primary/5"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute inset-0 animate-pulse bg-secondary/3"
          style={{ animationDuration: "10s", animationDelay: "5s" }}
        ></div>

        <div className="relative container px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex animate-bounce items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Job Application Automation
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <span className="animate-pulse bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Land Your Dream Job
              </span>
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-8 max-w-2xl rounded-lg border border-border/20 bg-background/30 p-4 text-xl leading-relaxed text-foreground/90 backdrop-blur-sm">
              SwiftApplyHQ automates your job search with intelligent CV
              tailoring, personalized cover letters, and application tracking.
              Stop spending hours on repetitive tasks and start landing more
              interviews.
            </p>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="border border-white/20 bg-gradient-to-r from-green-600 to-blue-600 px-8 py-3 text-base text-white backdrop-blur-sm hover:from-green-700 hover:to-blue-700"
                asChild
              >
                <a href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className=" inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center justify-center gap-8 text-foreground/80 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 px-4 py-2 backdrop-blur-sm">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm">500+ Jobs Applied Daily</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 px-4 py-2 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm">3x Interview Rate</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Graphic Placeholder */}
          <div className="mt-16 flex justify-center">
            <div className="w-full max-w-5xl">
              <div className="relative overflow-hidden rounded-2xl border border-border/20 bg-background/30 p-8 backdrop-blur-sm">
                {/* Animated Background Effects */}
                <div className="absolute inset-0 animate-pulse bg-primary/5"></div>
                <div className="relative">
                  <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="mb-2 animate-pulse text-3xl font-bold text-primary">
                        85%
                      </div>
                      <div className="text-sm text-foreground/80">
                        Time Saved
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="mb-2 animate-pulse text-3xl font-bold text-primary"
                        style={{ animationDelay: "0.5s" }}
                      >
                        300%
                      </div>
                      <div className="text-sm text-foreground/80">
                        More Interviews
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="mb-2 animate-pulse text-3xl font-bold text-primary"
                        style={{ animationDelay: "1s" }}
                      >
                        10K+
                      </div>
                      <div className="text-sm text-foreground/80">
                        Happy Users
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Animated Elements */}
          <div
            className="absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full bg-primary/10 blur-3xl"
            style={{ animationDuration: "6s", animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-40 right-10 h-32 w-32 animate-pulse rounded-full bg-secondary/8 blur-3xl"
            style={{ animationDuration: "8s", animationDelay: "6s" }}
          ></div>
          <div
            className="absolute bottom-20 left-20 h-24 w-24 animate-pulse rounded-full bg-accent/6 blur-3xl"
            style={{ animationDuration: "7s", animationDelay: "9s" }}
          ></div>
        </div>
      </section>
    )
  }
)
Hero.displayName = "Hero"

export { Hero }
