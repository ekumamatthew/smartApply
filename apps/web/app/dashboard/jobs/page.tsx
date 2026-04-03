"use client"

import { Button } from "@workspace/ui/components/button"
import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Mail,
  Users
} from "lucide-react"
import * as React from "react"

export default function JobHubPage() {
  return (
    <AuthenticatedDashboardLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Animated Coming Soon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 animate-bounce">
                <Briefcase className="w-16 h-16 text-white" />
              </div>
              
              {/* Animated Text */}
              <div className="space-y-4">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  Coming Soon
                </h1>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-semibold text-foreground">
              Job Hub
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Discover and track job opportunities from top companies. Get personalized recommendations and apply with one click.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Smart Matching</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Real-time Updates</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Company Insights</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Be the first to know when we launch!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20">
                <Mail className="mr-2 h-4 w-4" />
                Notify Me
              </Button>
              <Button asChild>
                <a href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </a>
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Progress: 75% Complete</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedDashboardLayout>
  )
}
