"use client"

import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import {
  type EmailHistoryItem,
  type EmailThreadSummary,
  fetchEmailThreads,
  fetchThreadMessages,
} from "@/src/lib/dashboard-api"
import {
  applicationsSearchAtom,
  selectedThreadIdAtom,
} from "@/src/state/applications"
import { useQuery } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Briefcase, Clock, Mail, Search } from "lucide-react"
import * as React from "react"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function previewText(text: string, max = 160) {
  const compact = text.replace(/\s+/g, " ").trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max)}...`
}

function ThreadListItem({
  thread,
  isSelected,
  onSelect,
}: {
  thread: EmailThreadSummary
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{previewText(thread.jobDescription, 90)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {thread.latestEmailSubject || "No subject"}
          </p>
        </div>
        <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {thread.emailCount} {thread.emailCount === 1 ? "email" : "emails"}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        Updated {formatDate(thread.latestAt)}
      </div>
    </button>
  )
}

function MessageCard({ item }: { item: EmailHistoryItem }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{item.subject}</p>
        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
      </div>

      <div className="text-xs text-muted-foreground">
        Tone: <span className="font-medium text-foreground">{item.tone || "default"}</span>
      </div>

      {item.promptContext ? (
        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Prompt context: {previewText(item.promptContext, 220)}
        </div>
      ) : null}

      <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">
        {item.body}
      </div>

      {item.keyHighlights.length > 0 ? (
        <div>
          <p className="mb-1 text-sm font-medium">Key highlights</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {item.keyHighlights.map((point) => (
              <li key={`${item.id}-${point}`}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function ApplicationsPage() {
  const [search, setSearch] = useAtom(applicationsSearchAtom)
  const [selectedThreadId, setSelectedThreadId] = useAtom(selectedThreadIdAtom)

  const threadsQuery = useQuery({
    queryKey: ["email-threads"],
    queryFn: fetchEmailThreads,
  })

  const threads = threadsQuery.data || []

  const filteredThreads = React.useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return threads

    return threads.filter((thread) => {
      return (
        thread.jobDescription.toLowerCase().includes(value) ||
        (thread.latestEmailSubject || "").toLowerCase().includes(value)
      )
    })
  }, [search, threads])

  React.useEffect(() => {
    if (filteredThreads.length === 0) {
      setSelectedThreadId(null)
      return
    }

    const selectedStillVisible = filteredThreads.some(
      (thread) => thread.id === selectedThreadId
    )

    if (!selectedStillVisible) {
      setSelectedThreadId(filteredThreads[0]?.id ?? null)
    }
  }, [filteredThreads, selectedThreadId, setSelectedThreadId])

  const selectedThread = filteredThreads.find((thread) => thread.id === selectedThreadId)

  const messagesQuery = useQuery({
    queryKey: ["email-thread-messages", selectedThreadId],
    queryFn: () => fetchThreadMessages(selectedThreadId as string),
    enabled: Boolean(selectedThreadId),
  })

  const messages = messagesQuery.data || []

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Grouped history of generated application emails by job description.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Job Threads</p>
            <p className="text-2xl font-bold">{threads.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Generated Emails</p>
            <p className="text-2xl font-bold">
              {threads.reduce((sum, thread) => sum + thread.emailCount, 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Selected Thread</p>
            <p className="text-sm font-medium">
              {selectedThread
                ? `${selectedThread.emailCount} saved versions`
                : "None"}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job description or subject..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid h-[90vh] gap-6 lg:grid-cols-[360px_1fr]">
          <div className="no-scrollbar h-full space-y-3 overflow-y-auto rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Job Threads</h2>
              <span className="text-xs text-muted-foreground">
                {filteredThreads.length} shown
              </span>
            </div>

            {threadsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading threads...
              </p>
            ) : null}

            {threadsQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load threads.</p>
            ) : null}

            {!threadsQuery.isLoading && filteredThreads.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <Briefcase className="mx-auto mb-2 h-5 w-5" />
                No saved email history yet.
              </div>
            ) : null}

            <div className="space-y-3">
              {filteredThreads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onSelect={() => setSelectedThreadId(thread.id)}
                />
              ))}
            </div>
          </div>

          <div className="no-scrollbar h-full overflow-y-auto rounded-xl border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Email History</h2>
              {selectedThread ? (
                <span className="text-xs text-muted-foreground">
                  {selectedThread.emailCount} versions
                </span>
              ) : null}
            </div>

            {!selectedThread ? (
              <p className="text-sm text-muted-foreground">
                Select a job thread to view previous generated emails.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="mb-1 font-medium">Job Description</p>
                  <p className="text-muted-foreground">
                    {previewText(selectedThread.jobDescription, 500)}
                  </p>
                </div>

                {messagesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading history...
                  </p>
                ) : null}

                {messagesQuery.isError ? (
                  <p className="text-sm text-red-600">
                    Failed to load email history.
                  </p>
                ) : null}

                {!messagesQuery.isLoading && messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No saved messages in this thread yet.
                  </p>
                ) : null}

                <div className="space-y-3">
                  {messages.map((item) => (
                    <MessageCard key={item.id} item={item} />
                  ))}
                </div>

                {selectedThread ? (
                  <Button variant="outline" asChild>
                    <a href="/dashboard">
                      <Mail className="mr-2 h-4 w-4" />
                      Generate New Version For This Job
                    </a>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedDashboardLayout>
  )
}
