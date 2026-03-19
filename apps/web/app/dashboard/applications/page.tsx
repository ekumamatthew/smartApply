"use client"

import { Button } from "@workspace/ui/components/button"
import { DashboardLayout } from "@workspace/ui/components/dashboard-layout"
import { Input } from "@workspace/ui/components/input"
import { JobCard } from "@workspace/ui/components/job-card"
import { Label } from "@workspace/ui/components/label"
import {
  Briefcase,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  MapPin,
  Plus,
  Search,
  Upload,
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

// Mock data for demonstration
const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    status: "applied" as const,
    dateAdded: "2 days ago",
    url: "https://example.com/job1",
    description:
      "Looking for an experienced frontend developer with React and TypeScript expertise.",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "Remote",
    status: "interviewing" as const,
    dateAdded: "1 week ago",
    url: "https://example.com/job2",
    description:
      "Join our growing team as a full stack engineer working with modern web technologies.",
  },
  {
    id: "3",
    title: "Product Designer",
    company: "Design Studio",
    location: "New York, NY",
    status: "offered" as const,
    dateAdded: "3 weeks ago",
    url: "https://example.com/job3",
    description:
      "Creative product designer needed for innovative design studio.",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Austin, TX",
    status: "saved" as const,
    dateAdded: "1 month ago",
    url: "https://example.com/job4",
    description:
      "Experienced DevOps engineer to help scale our cloud infrastructure.",
  },
  {
    id: "5",
    title: "Mobile Developer",
    company: "AppWorks",
    location: "Seattle, WA",
    status: "rejected" as const,
    dateAdded: "2 months ago",
    url: "https://example.com/job5",
    description: "iOS and Android developer with React Native experience.",
  },
]

export default function ApplicationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("dateAdded")
  const [showFilters, setShowFilters] = React.useState(false)

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (jobId: string) => {
    // Navigate to job details page
    router.push(`/dashboard/applications/details?id=${jobId}`)
  }

  const handleUpdateStatus = (jobId: string) => {
    console.log("Update status for job:", jobId)
  }

  const handleFollowUp = (jobId: string) => {
    console.log("Follow up for job:", jobId)
  }

  const handleAddJob = () => {
    console.log("Add new job")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">
              Manage your job applications and track their progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleAddJob}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              >
                <option value="dateAdded">Date Added</option>
                <option value="title">Job Title</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>All time</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Filter by location..." />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>All types</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{mockJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === "applied").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviewing</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === "interviewing").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Plus className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold">
                  {mockJobs.filter((j) => j.status === "offered").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you&apos;re
                looking for.
              </p>
              <Button className="mt-4" onClick={handleAddJob}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={() => handleViewDetails(job.id)}
                  onUpdateStatus={() => handleUpdateStatus(job.id)}
                  onFollowUp={() => handleFollowUp(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
