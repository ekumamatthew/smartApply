"use client"

import { ApplicationDetail } from "@workspace/ui/components/application-detail"
import { Button } from "@workspace/ui/components/button"
import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { ArrowLeft, Edit } from "lucide-react"
import { useSearchParams } from "next/navigation"
import * as React from "react"

// Mock application data
const mockApplications: Record<
  string,
  {
    id: string
    title: string
    company: string
    location: string
    status: "applied" | "interview" | "offer" | "rejected"
    dateApplied: string
    jobUrl?: string
    description?: string
    requirements?: string[]
    salary?: string
    type?: string
    remote?: boolean
    contactInfo?: {
      recruiter?: string
      email?: string
      phone?: string
    }
    notes?: Array<{
      id: string
      content: string
      createdAt: string
      type: "general" | "interview" | "follow-up"
    }>
  }
> = {
  "1": {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    status: "interview" as const,
    dateApplied: "March 10, 2024",
    jobUrl: "https://example.com/job1",
    description:
      "We are looking for an experienced frontend developer to join our growing team. You will be responsible for building responsive web applications using React, TypeScript, and modern CSS frameworks. The ideal candidate has experience with state management, testing frameworks, and agile development methodologies.",
    requirements: [
      "5+ years of experience with React and TypeScript",
      "Strong understanding of modern CSS and responsive design",
      "Experience with state management (Redux, Zustand, etc.)",
      "Familiarity with testing frameworks (Jest, React Testing Library)",
      "Experience with RESTful APIs and GraphQL",
      "Excellent problem-solving and communication skills",
    ],
    salary: "$120,000 - $160,000",
    type: "Full-time",
    remote: true,
    contactInfo: {
      recruiter: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
    },
    notes: [
      {
        id: "1",
        content:
          "Initial application submitted through company portal. Received automated confirmation email.",
        createdAt: "March 10, 2024 - 2:30 PM",
        type: "general" as const,
      },
      {
        id: "2",
        content:
          "Phone screening scheduled for March 15th at 2:00 PM PST. Prepare questions about React experience and team collaboration.",
        createdAt: "March 12, 2024 - 10:15 AM",
        type: "interview" as const,
      },
      {
        id: "3",
        content:
          "Follow-up email sent to Sarah thanking her for the opportunity and confirming interview time. Attached portfolio link.",
        createdAt: "March 12, 2024 - 11:00 AM",
        type: "follow-up" as const,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "Remote",
    status: "applied" as const,
    dateApplied: "March 8, 2024",
    jobUrl: "https://example.com/job2",
    description:
      "Join our growing team as a full stack engineer working with modern web technologies.",
    requirements: [
      "3+ years of full stack development experience",
      "Proficiency in JavaScript/TypeScript",
      "Experience with Node.js and Express",
      "Knowledge of React and modern frontend frameworks",
      "Database design and SQL skills",
    ],
    salary: "$100,000 - $140,000",
    type: "Full-time",
    remote: true,
    contactInfo: {
      recruiter: "Mike Chen",
      email: "mike.chen@startupxyz.com",
      phone: "+1 (555) 987-6543",
    },
    notes: [
      {
        id: "1",
        content:
          "Applied through company website. Received immediate response.",
        createdAt: "March 8, 2024 - 3:00 PM",
        type: "general" as const,
      },
    ],
  },
}

export default function ApplicationDetailsPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("id")
  const [application, setApplication] = React.useState(
    mockApplications[jobId || "1"]
  )

  const handleUpdateStatus = (newStatus: string) => {
    if (application) {
      setApplication({
        ...application,
        status: newStatus as "applied" | "interview" | "offer" | "rejected",
      })
    }
    console.log("Status updated to:", newStatus)
  }

  const handleAddNote = (
    noteContent: string,
    noteType: "general" | "interview" | "follow-up"
  ) => {
    if (application) {
      const newNote = {
        id: Date.now().toString(),
        content: noteContent,
        createdAt: new Date().toLocaleString(),
        type: noteType,
      }
      setApplication({
        ...application,
        notes: [...(application.notes || []), newNote],
      })
    }
    console.log("Note added:", noteContent)
  }

  const handleSendFollowUp = () => {
    if (!application) return

    // In a real app, this would open an email client or send via API
    const emailSubject = `Follow-up: ${application.title} Application`
    const emailBody = `Dear ${application.contactInfo?.recruiter || "Hiring Manager"},\n\nI hope this email finds you well. I wanted to follow up on my application for the ${application.title} position at ${application.company}.\n\nI remain very interested in this opportunity and believe my skills in frontend development would be a great match for your team.\n\nPlease let me know if there are any updates regarding my application status or if you need any additional information from my end.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`

    window.open(
      `mailto:${application.contactInfo?.email}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`
    )
    console.log("Follow-up email sent")
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Application Not Found</h1>
            <p className="mb-4 text-muted-foreground">
              The application you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Button asChild>
              <a href="/dashboard/applications">Back to Applications</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="outline" className="flex items-center" asChild>
            <a href="/dashboard/applications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </a>
          </Button>
        </div>

        {/* Application Detail */}
        <ApplicationDetail
          application={application}
          onUpdateStatus={handleUpdateStatus}
          onAddNote={handleAddNote}
          onSendFollowUp={handleSendFollowUp}
        />

        {/* Edit Application Button */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit Application Details
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
