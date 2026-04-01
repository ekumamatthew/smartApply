import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { EXT_WEB_APP_URL } from "../config/env"
import type { ExtensionRequest, ExtensionResponse, JobData } from "../types/messages"
import "./globals.css"
import "./test-styles.css"

function Popup() {
  const [currentJob, setCurrentJob] = useState<JobData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("Ready")

  // Load current job on mount
  useEffect(() => {
    loadCurrentJob()
  }, [])

  const loadCurrentJob = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getJob" })
      const typedResponse = response as ExtensionResponse
      if (typedResponse.success && typedResponse.job) {
        setCurrentJob(typedResponse.job)
        updateJobFields(typedResponse.job)
      }
    } catch (error) {
      console.error("Error loading current job:", error)
    }
  }

  const updateJobFields = (job: JobData) => {
    const titleInput = document.getElementById("job-title") as HTMLInputElement
    const companyInput = document.getElementById("company") as HTMLInputElement

    if (titleInput) titleInput.value = job.title || "No job detected"
    if (companyInput) companyInput.value = job.company || "No company detected"
  }

  const handleExtractJob = async () => {
    setIsLoading(true)
    setStatus("Extracting...")

    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (tab.id) {
        // Send message to content script to extract job
        const response = (await chrome.tabs.sendMessage(tab.id, {
          action: "detectJob",
        } satisfies ExtensionRequest)) as ExtensionResponse

        if (response.success && response.job) {
          setCurrentJob(response.job)
          updateJobFields(response.job)
          setStatus("Job extracted!")
        } else {
          setStatus("No job found")
        }
      }
    } catch (error) {
      console.error("Error extracting job:", error)
      setStatus("Error extracting job")
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("Ready"), 2000)
    }
  }

  const handleGenerateEmail = async () => {
    if (!currentJob) {
      setStatus("No job to generate email for")
      return
    }

    setIsLoading(true)
    setStatus("Generating email...")

    try {
      // Store job and open dashboard for email generation
      await chrome.storage.local.set({
        lastExtractedJob: currentJob,
        action: "generateEmail",
      })

      // Open dashboard
      chrome.tabs.create({
        url: `${EXT_WEB_APP_URL}/dashboard?generateEmail=true`,
      })

      setStatus("Opening dashboard...")
    } catch (error) {
      console.error("Error generating email:", error)
      setStatus("Error generating email")
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("Ready"), 2000)
    }
  }

  const handleSettings = () => {
    chrome.tabs.create({
      url: `${EXT_WEB_APP_URL}/dashboard/settings`,
    })
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-white"
      style={{
        background: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Animated Background */}
      <div
        className="absolute inset-0 animate-pulse bg-blue-50"
        style={{
          position: "absolute",
          inset: 0,
          background: "#eff6ff",
          animation: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          animationDelay: "2s",
        }}
      ></div>
      <div
        className="absolute inset-0 animate-pulse bg-purple-50"
        style={{
          position: "absolute",
          inset: 0,
          background: "#faf5ff",
          animation: "pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          animationDelay: "5s",
        }}
      ></div>

      <div
        className="relative p-4"
        style={{ position: "relative", padding: "16px" }}
      >
        {/* Header */}
        <div
          className="mb-6 flex items-center justify-between"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600"
              style={{
                width: "32px",
                height: "32px",
                background:
                  "linear-gradient(to bottom right, #2563eb, #9333ea)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="text-xs font-bold text-white"
                style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}
              >
                SA
              </span>
            </div>
            <span
              className="font-bold text-gray-900"
              style={{ fontWeight: "bold", color: "#111827" }}
            >
              SmartApply
            </span>
          </div>
          <div
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 backdrop-blur-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              border: "1px solid #dbeafe",
              background: "#eff6ff",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#2563eb",
              backdropFilter: "blur(4px)",
            }}
          >
            <CheckCircle
              className="mr-1 h-3 w-3"
              style={{ marginRight: "4px", height: "12px", width: "12px" }}
            />
            Active
          </div>
        </div>

        {/* Main Content */}
        <div
          className="space-y-4"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Quick Actions */}
          <div
            className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm"
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "16px",
              backdropFilter: "blur(4px)",
            }}
          >
            <h3
              className="mb-3 flex items-center gap-2 font-semibold text-gray-900"
              style={{
                fontWeight: "600",
                color: "#111827",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Zap
                className="h-4 w-4 text-blue-600"
                style={{ width: "16px", height: "16px", color: "#2563eb" }}
              />
              Quick Actions
            </h3>
            <div
              className="space-y-2"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Button
                onClick={handleExtractJob}
                disabled={isLoading}
                className="w-full justify-start border border-gray-200 bg-white/50 text-gray-900 backdrop-blur-sm hover:bg-white/70"
                variant="outline"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  border: "1px solid #e5e7eb",
                  background: isLoading
                    ? "#f3f4f6"
                    : "rgba(255, 255, 255, 0.5)",
                  color: isLoading ? "#9ca3af" : "#111827",
                  backdropFilter: "blur(4px)",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Briefcase
                  className="mr-2 h-4 w-4 text-blue-600"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                    color: isLoading ? "#9ca3af" : "#2563eb",
                  }}
                />
                {isLoading ? "Extracting..." : "Extract Job Details"}
              </Button>
              <Button
                onClick={handleGenerateEmail}
                disabled={isLoading || !currentJob}
                className="w-full justify-start border border-gray-200 bg-white/50 text-gray-900 backdrop-blur-sm hover:bg-white/70"
                variant="outline"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  border: "1px solid #e5e7eb",
                  background:
                    isLoading || !currentJob
                      ? "#f3f4f6"
                      : "rgba(255, 255, 255, 0.5)",
                  color: isLoading || !currentJob ? "#9ca3af" : "#111827",
                  backdropFilter: "blur(4px)",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: isLoading || !currentJob ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Target
                  className="mr-2 h-4 w-4 text-purple-600"
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                    color: isLoading || !currentJob ? "#9ca3af" : "#9333ea",
                  }}
                />
                {isLoading ? "Generating..." : "Generate Email"}
              </Button>
            </div>
          </div>

          {/* Current Job Detection */}
          <div
            className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm"
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "16px",
              backdropFilter: "blur(4px)",
            }}
          >
            <h3
              className="mb-3 flex items-center gap-2 font-semibold text-gray-900"
              style={{
                fontWeight: "600",
                color: "#111827",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles
                className="h-4 w-4 text-purple-600"
                style={{ width: "16px", height: "16px", color: "#9333ea" }}
              />
              Current Page
            </h3>
            <div
              className="space-y-3"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <Label
                  htmlFor="job-title"
                  className="text-sm font-medium text-gray-700"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Job Title
                </Label>
                <Input
                  id="job-title"
                  placeholder="Detecting job title..."
                  className="border-gray-200 bg-white/50 text-sm backdrop-blur-sm"
                  style={{
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(4px)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  readOnly
                />
              </div>
              <div>
                <Label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Detecting company..."
                  className="border-gray-200 bg-white/50 text-sm backdrop-blur-sm"
                  style={{
                    fontSize: "14px",
                    border: "1px solid #e5e7eb",
                    background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(4px)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div
            className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm"
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "16px",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  className="text-sm text-gray-600"
                  style={{ fontSize: "14px", color: "#6b7280" }}
                >
                  Extension Status
                </p>
                <p
                  className="text-lg font-semibold text-blue-600"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#2563eb",
                  }}
                >
                  {status}
                </p>
              </div>
              <Button
                onClick={handleSettings}
                size="sm"
                className="border border-blue-200 bg-blue-50 text-blue-600 backdrop-blur-sm hover:bg-blue-100"
                variant="outline"
                style={{
                  border: "1px solid #dbeafe",
                  background: "#eff6ff",
                  color: "#2563eb",
                  backdropFilter: "blur(4px)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 border-t border-gray-200 pt-4"
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <a
            href={`${EXT_WEB_APP_URL}/dashboard`}
            target="_blank"
            className="flex items-center justify-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-800"
            style={{
              fontSize: "14px",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1d4ed8")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#2563eb")}
          >
            Open Dashboard
            <ArrowRight
              className="h-3 w-3"
              style={{ width: "12px", height: "12px" }}
            />
          </a>
        </div>

        {/* Floating Elements */}
        <div
          className="absolute top-4 right-4 h-8 w-8 animate-pulse rounded-full bg-blue-100 blur-xl"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            background: "#dbeafe",
            borderRadius: "50%",
            filter: "blur(12px)",
            animation: "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute bottom-4 left-4 h-6 w-6 animate-pulse rounded-full bg-purple-100 blur-xl"
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            width: "24px",
            height: "24px",
            background: "#f3e8ff",
            borderRadius: "50%",
            filter: "blur(12px)",
            animation: "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: "3s",
          }}
        ></div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<Popup />)
