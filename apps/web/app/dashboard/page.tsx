"use client"

import { Button } from "@workspace/ui/components/button"
import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  FileImage,
  FileText,
  Mail,
  Settings,
  TrendingUp,
  Upload,
} from "lucide-react"
import * as React from "react"

export default function DashboardPage() {
  const [jobLink, setJobLink] = React.useState("")
  const [jobDescription, setJobDescription] = React.useState("")
  const [selectedFeatures, setSelectedFeatures] = React.useState({
    tuneCV: true,
    includeCoverLetter: false,
    addPhoto: false,
  })

  const handleFeatureToggle = (feature: keyof typeof selectedFeatures) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  const handleGenerateApplication = () => {
    console.log("Generating application with:", {
      jobLink,
      jobDescription,
      features: selectedFeatures,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Welcome Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your job applications
              today.
            </p>
          </div>
          <Button className="flex items-center" asChild>
            <a href="/dashboard/applications">
              View Applications
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">+2 this week</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">1 this week</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">+1 this month</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Follow-ups</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">2 pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Import Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">
              Quick Job Application
            </h2>
            <p className="text-muted-foreground">
              Paste a job link or description to generate a customized
              application email
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobLink">Job Link (Optional)</Label>
                <Input
                  id="jobLink"
                  placeholder="https://example.com/job-posting"
                  value={jobLink}
                  onChange={(e) => setJobLink(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Job Description
                </Label>
                <textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Application Features
                </Label>
                <p className="text-sm text-muted-foreground">
                  Customize your application with these options
                </p>
              </div>

              <div className="space-y-3">
                {/* Tune CV */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Tune CV</p>
                      <p className="text-xs text-muted-foreground">
                        Optimize CV for this specific job
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle("tuneCV")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedFeatures.tuneCV ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedFeatures.tuneCV
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Include Cover Letter */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Include Cover Letter</p>
                      <p className="text-xs text-muted-foreground">
                        Generate a custom cover letter
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle("includeCoverLetter")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedFeatures.includeCoverLetter
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedFeatures.includeCoverLetter
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Add Photo to CV */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                      <FileImage className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Add Photo to CV</p>
                      <p className="text-xs text-muted-foreground">
                        Include passport photograph
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle("addPhoto")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedFeatures.addPhoto ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedFeatures.addPhoto
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-2 pt-4">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Existing CV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileImage className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="border-t pt-6">
            <Button
              onClick={handleGenerateApplication}
              className="w-full"
              disabled={!jobDescription.trim() && !jobLink.trim()}
            >
              <Mail className="mr-2 h-4 w-4" />
              Generate Application Email
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {jobDescription.trim() || jobLink.trim()
                ? "Ready to generate your customized application"
                : "Please provide a job link or description to continue"}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
