"use client"

import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import {
  type CvRecord,
  deleteCv,
  fetchCvs,
  setDefaultCv,
  uploadCv,
} from "@/src/lib/dashboard-api"
import {
  cvManagementErrorAtom,
  selectedCvIdAtom,
} from "@/src/state/cv-management"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  CheckCircle,
  FileText,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react"
import * as React from "react"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage
    }

    const maybeError = (error as { error?: unknown }).error
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError
    }
  }

  return fallback
}

function CvListItem({
  cv,
  selected,
  onSelect,
  setAsDefault,
  remove,
  isMutating,
}: {
  cv: CvRecord
  selected: boolean
  onSelect: () => void
  setAsDefault: (id: string) => void
  remove: (id: string) => void
  isMutating: boolean
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={`flex flex-col gap-3 rounded-lg border p-4 transition md:flex-row md:items-center md:justify-between ${
        selected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{cv.fileName}</p>
            {cv.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900">
                <Star className="h-3 w-3 fill-current" />
                Default
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Uploaded {formatDate(cv.createdAt)} • {formatFileSize(cv.sizeBytes)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isMutating || cv.isDefault}
          onClick={(event) => {
            event.stopPropagation()
            setAsDefault(cv.id)
          }}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          {cv.isDefault ? "Default" : "Set Default"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isMutating}
          onClick={(event) => {
            event.stopPropagation()
            remove(cv.id)
          }}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function CVManagementPage() {
  const queryClient = useQueryClient()
  const [selectedCvId, setSelectedCvId] = useAtom(selectedCvIdAtom)
  const [error, setError] = useAtom(cvManagementErrorAtom)
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null)

  const cvsQuery = useQuery({
    queryKey: ["cv-list"],
    queryFn: fetchCvs,
  })

  const cvs = cvsQuery.data || []

  React.useEffect(() => {
    if (cvs.length === 0) {
      setSelectedCvId(null)
      return
    }

    const activeId = selectedCvId || cvs.find((item) => item.isDefault)?.id
    const stillExists = cvs.some((item) => item.id === activeId)

    if (!stillExists) {
      setSelectedCvId(cvs.find((item) => item.isDefault)?.id ?? cvs[0]?.id ?? null)
    }
  }, [cvs, selectedCvId, setSelectedCvId])

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => uploadCv(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      setError("")
      setUploadingFile(null)
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, "Failed to upload CV"))
    },
  })

  const defaultMutation = useMutation({
    mutationFn: async (cvId: string) => setDefaultCv(cvId),
    onMutate: async (cvId: string) => {
      await queryClient.cancelQueries({ queryKey: ["cv-list"] })
      const previous = queryClient.getQueryData<CvRecord[]>(["cv-list"])

      queryClient.setQueryData<CvRecord[]>(["cv-list"], (current = []) =>
        current.map((item) => ({
          ...item,
          isDefault: item.id === cvId,
        }))
      )

      return { previous }
    },
    onSuccess: async (updatedCv) => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      if (updatedCv?.id) {
        setSelectedCvId(updatedCv.id)
      }
      setError("")
    },
    onError: (mutationError: unknown, _cvId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cv-list"], context.previous)
      }
      setError(getErrorMessage(mutationError, "Failed to set default CV"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (cvId: string) => deleteCv(cvId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      setError("")
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, "Failed to delete CV"))
    },
  })

  const defaultCv = cvs.find((cv) => cv.isDefault)
  const isMutating =
    uploadMutation.isPending || defaultMutation.isPending || deleteMutation.isPending

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV Management</h1>
          <p className="text-muted-foreground">
            Upload multiple CVs and choose which one is your default for email generation.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Upload CV</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Supported: pdf, doc, docx, txt, md, pptx (up to 10MB)
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx,.pptx"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] || null
                setUploadingFile(nextFile)
                setError("")
              }}
            />
            <Button
              type="button"
              disabled={!uploadingFile || uploadMutation.isPending}
              onClick={() => {
                if (!uploadingFile) return
                uploadMutation.mutate(uploadingFile)
              }}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CV
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Default CV</h2>
          {defaultCv ? (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{defaultCv.fileName}</p>
                <Star className="h-4 w-4 fill-current text-yellow-500" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Uploaded {formatDate(defaultCv.createdAt)} • {formatFileSize(defaultCv.sizeBytes)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No default CV selected yet.</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All CVs ({cvs.length})</h2>
          </div>

          {cvsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading CVs...</p>
          ) : null}

          {cvsQuery.isError ? (
            <p className="text-sm text-red-600">Failed to load CVs.</p>
          ) : null}

          {!cvsQuery.isLoading && cvs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No CVs uploaded yet.
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            {cvs.map((cv) => (
              <CvListItem
                key={cv.id}
                cv={cv}
                selected={selectedCvId === cv.id || cv.isDefault}
                onSelect={() => setSelectedCvId(cv.id)}
                setAsDefault={(id) => defaultMutation.mutate(id)}
                remove={(id) => deleteMutation.mutate(id)}
                isMutating={isMutating}
              />
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedDashboardLayout>
  )
}
