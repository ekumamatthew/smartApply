import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  Bell,
  Building,
  Clock,
  Edit,
  ExternalLink,
  MapPin,
  MoreVertical,
} from "lucide-react"
import * as React from "react"

interface JobCardProps {
  className?: string
  job: {
    id: string
    title: string
    company: string
    location: string
    status: "applied" | "interviewing" | "offered" | "rejected" | "saved"
    dateAdded: string
    url?: string
    description?: string
  }
  onViewDetails?: () => void
  onUpdateStatus?: () => void
  onFollowUp?: () => void
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-purple-100 text-purple-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  saved: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered",
  rejected: "Rejected",
  saved: "Saved",
}

const JobCard = React.forwardRef<HTMLDivElement, JobCardProps>(
  (
    { className, job, onViewDetails, onUpdateStatus, onFollowUp, ...props },
    ref
  ) => {
    const [showActions, setShowActions] = React.useState(false)

    return (
      <Card
        ref={ref}
        className={cn("p-6 transition-shadow hover:shadow-md", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {/* Job Title and Company */}
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {job.title}
                </h3>
                <div className="mt-1 flex items-center text-muted-foreground">
                  <Building className="mr-1 h-4 w-4" />
                  <span className="text-sm">{job.company}</span>
                </div>
                <div className="mt-1 flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="ml-4 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusColors[job.status]
                  )}
                >
                  {statusLabels[job.status]}
                </span>
              </div>
            </div>

            {/* Date Added */}
            <div className="mb-4 flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Added {job.dateAdded}
            </div>

            {/* Description Preview */}
            {job.description && (
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {job.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="flex items-center"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onUpdateStatus}
                className="flex items-center"
              >
                <Edit className="mr-1 h-4 w-4" />
                Update Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onFollowUp}
                className="flex items-center"
              >
                <Bell className="mr-1 h-4 w-4" />
                Follow Up
              </Button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showActions && (
                  <div className="absolute top-full right-0 z-10 mt-1 w-48 rounded-md border bg-popover shadow-lg">
                    <div className="py-1">
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent">
                        Edit Job
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent">
                        Duplicate Job
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent">
                        Archive Job
                      </button>
                      <hr className="my-1" />
                      <button className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-accent">
                        Delete Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }
)
JobCard.displayName = "JobCard"

export { JobCard }
