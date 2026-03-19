"use client"

import { Button } from "@workspace/ui/components/button"
import { Header } from "@workspace/ui/components/header"
import { Footer } from "@workspace/ui/components/footer"
import {
  Search,
  FileText,
  Mail,
  Target,
  Zap,
  CheckCircle
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 items-center justify-center w-full flex flex-col lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-primary/3 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-secondary/2 animate-pulse" style={{ animationDuration: '12s', animationDelay: '5s' }}></div>

        <div className="relative container px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4" />
              How SmartApply Works
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Land Your Dream Job in
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground backdrop-blur-sm bg-background/20 p-4 rounded-lg">
              Our intelligent platform automates the tedious parts of job searching,
              so you can focus on what matters most - preparing for interviews.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="relative group">
                <div className="rounded-2xl border border-border/20 bg-background/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Find Jobs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Search and discover opportunities that match your skills and career goals.
                  </p>
                  <div className="mt-4 flex items-center text-primary">
                    <Search className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">AI-Powered Search</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="rounded-2xl border border-border/20 bg-background/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Tailor CV</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automatically customize your CV for each application while maintaining your authentic voice.
                  </p>
                  <div className="mt-4 flex items-center text-secondary">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Smart Customization</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="rounded-2xl border border-border/20 bg-background/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Apply Smart</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Generate personalized emails and submit applications with one click.
                  </p>
                  <div className="mt-4 flex items-center text-accent">
                    <Mail className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">One-Click Apply</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group">
                <div className="rounded-2xl border border-border/20 bg-background/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <span className="text-lg font-bold">4</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Track Progress</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Monitor all your applications in one dashboard with detailed analytics.
                  </p>
                  <div className="mt-4 flex items-center text-orange-600">
                    <Target className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Success Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <CheckCircle className="mb-3 h-8 w-8 text-green-600" />
                <h4 className="mb-2 text-lg font-semibold text-foreground">85% Time Saved</h4>
                <p className="text-sm text-muted-foreground">
                  Automate repetitive tasks and focus on interview preparation
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <CheckCircle className="mb-3 h-8 w-8 text-blue-600" />
                <h4 className="mb-2 text-lg font-semibold text-foreground">3x More Interviews</h4>
                <p className="text-sm text-muted-foreground">
                  Professional applications that get recruiter attention
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border/20 bg-background/20 backdrop-blur-sm">
                <CheckCircle className="mb-3 h-8 w-8 text-purple-600" />
                <h4 className="mb-2 text-lg font-semibold text-foreground">10K+ Happy Users</h4>
                <p className="text-sm text-muted-foreground">
                  Join thousands who've landed their dream jobs
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              asChild
            >
              <a href="/signup">
                Start Your Journey
              </a>
            </Button>
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
