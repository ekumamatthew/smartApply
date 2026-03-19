import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import {
  Building,
  Calendar,
  Clock,
  Edit,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Send,
  Trash2,
  User,
} from "lucide-react"
import * as React from "react"

interface ApplicationDetailProps {
  className?: string
  application: {
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
  onUpdateStatus?: (newStatus: string) => void
  onAddNote?: (
    note: string,
    type: "general" | "interview" | "follow-up"
  ) => void
  onSendFollowUp?: () => void
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  interview: "bg-purple-100 text-purple-800 border-purple-200",
  offer: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  applied: "Applied",
  interview: "Interview Scheduled",
  offer: "Offer Received",
  rejected: "Rejected",
}

const ApplicationDetail = React.forwardRef<
  HTMLDivElement,
  ApplicationDetailProps
>(
  (
    {
      className,
      application,
      onUpdateStatus,
      onAddNote,
      onSendFollowUp,
      ...props
    },
    ref
  ) => {
    const [newNote, setNewNote] = React.useState("")
    const [noteType, setNoteType] = React.useState<
      "general" | "interview" | "follow-up"
    >("general")
    const [isEditingStatus, setIsEditingStatus] = React.useState(false)

    const handleAddNote = () => {
      if (newNote.trim() && onAddNote) {
        onAddNote(newNote.trim(), noteType)
        setNewNote("")
      }
    }

    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        {/* Job Details */}
        <Card className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold">{application.title}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  <span>{application.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{application.location}</span>
                </div>
                {application.type && (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{application.type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                  statusColors[application.status]
                )}
              >
                {statusLabels[application.status]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingStatus(!isEditingStatus)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Update
              </Button>
            </div>
          </div>

          {/* Status Update Section */}
          {isEditingStatus && (
            <div className="mb-6 rounded-lg border bg-muted/50 p-4">
              <Label className="text-sm font-medium">
                Update Application Status
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(statusLabels).map(([value, label]) => (
                  <Button
                    key={value}
                    variant={
                      application.status === value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      if (onUpdateStatus) onUpdateStatus(value)
                      setIsEditingStatus(false)
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Job Information Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date Applied
                </Label>
                <div className="mt-1 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{application.dateApplied}</span>
                </div>
              </div>

              {application.salary && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Salary Range
                  </Label>
                  <div className="mt-1 font-medium">{application.salary}</div>
                </div>
              )}

              {application.remote !== undefined && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Work Type
                  </Label>
                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-2 py-1 text-xs font-medium",
                        application.remote
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {application.remote ? "Remote" : "On-site"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {application.contactInfo?.recruiter && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Recruiter
                  </Label>
                  <div className="mt-1 flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{application.contactInfo.recruiter}</span>
                  </div>
                </div>
              )}

              {application.contactInfo?.email && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <div className="mt-1 flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{application.contactInfo.email}</span>
                  </div>
                </div>
              )}

              {application.contactInfo?.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </Label>
                  <div className="mt-1 flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{application.contactInfo.phone}</span>
                  </div>
                </div>
              )}

              {application.jobUrl && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Job Posting
                  </Label>
                  <div className="mt-1 flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Original Posting
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {application.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Job Description
              </Label>
              <div className="mt-2 rounded-lg bg-muted/50 p-4">
                <p className="text-sm leading-relaxed">
                  {application.description}
                </p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {application.requirements && application.requirements.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Key Requirements
              </Label>
              <div className="mt-2 space-y-1">
                {application.requirements.map((req, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-2 mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={onSendFollowUp}>
              <Send className="mr-2 h-4 w-4" />
              Send Follow-up Email
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Cover Letter
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Application
            </Button>
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notes & Follow-ups</h2>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {/* Add New Note */}
          <div className="mb-6 rounded-lg border bg-muted/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label>Note Type</Label>
                <select
                  value={noteType}
                  onChange={(e) =>
                    setNoteType(
                      e.target.value as "general" | "interview" | "follow-up"
                    )
                  }
                  className="flex h-8 items-center justify-between rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="general">General</option>
                  <option value="interview">Interview Prep</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this application..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddNote}>
                  <Save className="mr-1 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Notes */}
          <div className="space-y-3">
            {application.notes && application.notes.length > 0 ? (
              application.notes.map((note) => (
                <div key={note.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-2 py-1 text-xs font-medium",
                          note.type === "interview"
                            ? "bg-purple-100 text-purple-800"
                            : note.type === "follow-up"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {note.type === "interview"
                          ? "Interview Prep"
                          : note.type === "follow-up"
                            ? "Follow-up"
                            : "General"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {note.createdAt}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <p>No notes yet. Add your first note to track your progress.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }
)
ApplicationDetail.displayName = "ApplicationDetail"

export { ApplicationDetail }
