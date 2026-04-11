import { Brain, Clock, FileText, Mail, Shield, TrendingUp } from "lucide-react"
import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

interface FeaturesProps {
  className?: string
}

const Features = React.forwardRef<HTMLDivElement, FeaturesProps>(
  ({ className, ...props }, ref) => {
    const features: Feature[] = [
      {
        icon: <Brain className="h-6 w-6 text-white" />,
        title: "No More Guesswork",
        description:
          "Paste any job post and quickly see what matters most, so you stop second-guessing every application.",
        gradient: "from-blue-500 to-purple-600",
      },
      {
        icon: <FileText className="h-6 w-6 text-white" />,
        title: "Tailored CVs Without Rework",
        description:
          "Turn one base CV into role-specific versions in minutes instead of rewriting from scratch every time.",
        gradient: "from-green-500 to-blue-600",
      },
      {
        icon: <Mail className="h-6 w-6 text-white" />,
        title: "Emails That Sound Like You",
        description:
          "Generate clear, professional application emails that fit the role and still feel personal.",
        gradient: "from-purple-500 to-pink-600",
      },
      {
        icon: <TrendingUp className="h-6 w-6 text-white" />,
        title: "Stay in Control",
        description:
          "Track every application, follow-up, and version in one place instead of losing opportunities in scattered notes.",
        gradient: "from-blue-600 to-purple-600",
      },
      {
        icon: <Shield className="h-6 w-6 text-white" />,
        title: "Private by Default",
        description:
          "Your CV and job data stay protected, so you can apply with confidence.",
        gradient: "from-green-600 to-blue-600",
      },
      {
        icon: <Clock className="h-6 w-6 text-white" />,
        title: "Save Hours Every Week",
        description:
          "Automate repetitive application work so your time goes to interviews, preparation, and real progress.",
        gradient: "from-purple-600 to-pink-600",
      },
    ]

    return (
      <section
        ref={ref}
        id="features"
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden bg-background py-20 lg:py-32",
          className
        )}
        {...props}
      >
        {/* Animated Background */}
        <div
          className="absolute inset-0 animate-pulse bg-primary/4"
          style={{ animationDuration: "9s", animationDelay: "3s" }}
        ></div>
        <div
          className="absolute inset-0 animate-pulse bg-secondary/2"
          style={{ animationDuration: "12s", animationDelay: "7s" }}
        ></div>

        <div className="relative container px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Job Search Is Hard Enough.
              <span className="block animate-pulse bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Applying Should Be Easier.
              </span>
            </h2>
            <p className="mx-auto max-w-2xl rounded-lg bg-white/5 p-4 text-xl text-muted-foreground backdrop-blur-sm">
              SwiftApplyHQ removes the busywork that drains your energy and
              slows you down, so you can submit stronger applications without
              burning out.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Animated Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                ></div>

                <CardHeader className="relative">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} animate-pulse`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle
                    className="text-xl transition-colors duration-300 group-hover:bg-clip-text group-hover:text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${feature.gradient.replace("from-", "").replace(" to-", ", ").replace("500", "600").replace("600", "700")})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm">
                {/* Animated Background */}
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>

                <div className="relative">
                  <h3 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
                    Ready to Apply With Less Stress?
                  </h3>
                  <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                    Send better applications in less time and improve your odds
                    of getting interviews.
                  </p>
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <a
                      href="/auth/signup"
                      className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent transition-all duration-300 hover:from-green-700 hover:to-blue-700"
                    >
                      Start Free
                    </a>
                    <div className="flex items-center rounded-lg bg-white/5 px-4 py-2 text-muted-foreground backdrop-blur-sm">
                      No credit card required
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Animated Elements */}
          <div
            className="absolute top-10 left-10 h-16 w-16 animate-pulse rounded-full bg-primary/8 blur-3xl"
            style={{ animationDuration: "7s", animationDelay: "4s" }}
          ></div>
          <div
            className="absolute top-20 right-20 h-20 w-20 animate-pulse rounded-full bg-secondary/6 blur-3xl"
            style={{ animationDuration: "9s", animationDelay: "8s" }}
          ></div>
          <div
            className="absolute bottom-10 left-1/3 h-14 w-14 animate-pulse rounded-full bg-accent/4 blur-3xl"
            style={{ animationDuration: "8s", animationDelay: "12s" }}
          ></div>
        </div>
      </section>
    )
  }
)
Features.displayName = "Features"

export { Features }
