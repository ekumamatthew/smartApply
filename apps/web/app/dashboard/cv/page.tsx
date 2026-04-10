"use client"

import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import { useAppToast } from "@/src/components/AppToastProvider"
import { UpgradePricingModal } from "@/src/components/UpgradePricingModal"
import {
  deleteCv,
  fetchCvs,
  fetchCvOptimizationHistory,
  type StructuredCvData,
  fetchCvTemplates,
  type CvRecord,
  optimizeCv,
  setDefaultCv,
  uploadCv,
} from "@/src/lib/dashboard-api"
import { CV_TEMPLATE_DEFINITIONS } from "@/src/components/cv-builder/templates"
import {
  fallbackStructuredCv,
  mapStructuredCvToViewModel,
} from "@/src/components/cv-builder/types"
import {
  cvManagementErrorAtom,
  cvOptimizationFormAtom,
  selectedCvIdAtom,
} from "@/src/state/cv-management"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  CheckCircle,
  Copy,
  FileText,
  LayoutTemplate,
  Loader2,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react"
import * as React from "react"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeCode = (error as { code?: unknown }).code
    if (
      typeof maybeCode === "string" &&
      (maybeCode === "TRIAL_EXHAUSTED_EMAIL" ||
        maybeCode === "TRIAL_EXHAUSTED_CV" ||
        maybeCode === "INSUFFICIENT_CREDITS")
    ) {
      return "Free trial exhausted. Upgrade to get unlimited access."
    }

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

function shouldShowUpgradeModal(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const code = (error as { code?: unknown }).code
  return (
    code === "TRIAL_EXHAUSTED_EMAIL" ||
    code === "TRIAL_EXHAUSTED_CV" ||
    code === "INSUFFICIENT_CREDITS"
  )
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
  const { showToast } = useAppToast()
  const [selectedCvId, setSelectedCvId] = useAtom(selectedCvIdAtom)
  const [error, setError] = useAtom(cvManagementErrorAtom)
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null)
  const [optimizationForm, setOptimizationForm] = useAtom(cvOptimizationFormAtom)
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("clean")
  const [showTemplatePicker, setShowTemplatePicker] = React.useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
  const [isExportingPdf, setIsExportingPdf] = React.useState(false)
  const [showOptimizeProgressModal, setShowOptimizeProgressModal] =
    React.useState(false)
  const [optimizeActivity, setOptimizeActivity] =
    React.useState("optimizing your CV")
  const previewRef = React.useRef<HTMLDivElement | null>(null)
  const exportRef = React.useRef<HTMLDivElement | null>(null)

  const cvsQuery = useQuery({
    queryKey: ["cv-list"],
    queryFn: fetchCvs,
  })
  const templatesQuery = useQuery({
    queryKey: ["cv-templates"],
    queryFn: fetchCvTemplates,
  })

  const cvs = cvsQuery.data || []
  const templates = templatesQuery.data || []

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

  React.useEffect(() => {
    if (templates.length === 0 || optimizationForm.templateId) {
      return
    }

    const bestTemplate =
      templates.find((item) => item.standard === optimizationForm.standard) || templates[0]

    if (bestTemplate) {
      setOptimizationForm((prev) => ({ ...prev, templateId: bestTemplate.id }))
    }
  }, [optimizationForm.standard, optimizationForm.templateId, setOptimizationForm, templates])

  const selectedCv = React.useMemo(() => {
    if (!selectedCvId) {
      return cvs.find((item) => item.isDefault) || null
    }
    return cvs.find((item) => item.id === selectedCvId) || null
  }, [cvs, selectedCvId])

  const optimizationHistoryQuery = useQuery({
    queryKey: ["cv-optimization-history", selectedCv?.id],
    queryFn: () => fetchCvOptimizationHistory(selectedCv!.id),
    enabled: Boolean(selectedCv?.id),
  })

  const latestOptimization = optimizationHistoryQuery.data?.[0] || null
  const selectedTemplate = React.useMemo(
    () =>
      CV_TEMPLATE_DEFINITIONS.find((tpl) => tpl.id === selectedTemplateId) ||
      CV_TEMPLATE_DEFINITIONS[0]!,
    [selectedTemplateId]
  )

  const structuredCv = React.useMemo<StructuredCvData | null>(() => {
    if (latestOptimization?.structuredCvJson) {
      return latestOptimization.structuredCvJson
    }
    if (latestOptimization?.optimizedCvText) {
      return fallbackStructuredCv(latestOptimization.optimizedCvText)
    }
    return null
  }, [latestOptimization])

  const templateData = React.useMemo(() => {
    if (!structuredCv) return null
    return mapStructuredCvToViewModel(structuredCv)
  }, [structuredCv])

  const uploadMutation = useMutation({
    onMutate: () => {
      showToast({
        variant: "info",
        title: "CV upload started",
        description: "Uploading your CV now.",
      })
    },
    mutationFn: async (file: File) => uploadCv(file),
    onSuccess: async (uploaded) => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      if (uploaded?.id) {
        setSelectedCvId(uploaded.id)
      }
      setError("")
      setUploadingFile(null)
      showToast({
        variant: "success",
        title: "CV upload complete",
        description: "Your CV is ready and listed below.",
      })
    },
    onError: (mutationError: unknown) => {
      const message = getErrorMessage(mutationError, "Failed to upload CV")
      setError(message)
      showToast({
        variant: "error",
        title: "CV upload failed",
        description: message,
      })
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
      if (shouldShowUpgradeModal(mutationError)) {
        setShowUpgradeModal(true)
      }
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

  const stopOptimizeProgress = React.useCallback(() => {
    setShowOptimizeProgressModal(false)
  }, [])

  const startOptimizeProgress = React.useCallback((activity: string) => {
    setOptimizeActivity(activity)
    setShowOptimizeProgressModal(true)
  }, [])

  const optimizeMutation = useMutation({
    onMutate: () => {
      startOptimizeProgress("optimizing your CV for this job")
      showToast({
        variant: "info",
        title: "CV optimization started",
        description: "You can continue in background while we process it.",
      })
    },
    mutationFn: async () => {
      if (!selectedCv?.id) {
        throw new Error("Select or upload a CV first")
      }
      if (optimizationForm.jobDescription.trim().length < 30) {
        throw new Error("Please add a fuller job description (at least 30 characters)")
      }

      const keywords = optimizationForm.keywordsCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

      return optimizeCv({
        cvId: selectedCv.id,
        standard: optimizationForm.standard,
        templateId: optimizationForm.templateId || undefined,
        jobDescription: optimizationForm.jobDescription,
        keywords,
        clientName: optimizationForm.clientName || undefined,
        clientEmail: optimizationForm.clientEmail || undefined,
        clientPhone: optimizationForm.clientPhone || undefined,
        clientLocation: optimizationForm.clientLocation || undefined,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cv-optimization-history", selectedCv?.id],
      })
      setError("")
      setShowOptimizeProgressModal(false)
      showToast({
        variant: "success",
        title: "CV optimization complete",
        description: "Preview has been updated. You can also review this in Applications.",
      })
    },
    onError: (mutationError: unknown) => {
      const message = getErrorMessage(mutationError, "Failed to optimize CV")
      setError(message)
      stopOptimizeProgress()
      if (shouldShowUpgradeModal(mutationError)) {
        setShowUpgradeModal(true)
      }
      showToast({
        variant: "error",
        title: "CV optimization failed",
        description: message,
      })
    },
  })

  const exportTemplatePdf = async () => {
    if (!templateData) {
      setError("No CV data available to export yet")
      return
    }
    if (!exportRef.current) {
      setError("Export view is not ready yet")
      return
    }

    try {
      setIsExportingPdf(true)
      setError("")

      const [{ jsPDF }, { toCanvas }] = await Promise.all([
        import("jspdf"),
        import("html-to-image"),
      ])

      const fullCanvas = await toCanvas(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = 210
      const pageHeight = 297
      const margin = 6
      const contentWidthMm = pageWidth - margin * 2
      const contentHeightMm = pageHeight - margin * 2

      const pageSliceHeightPx = Math.floor(
        fullCanvas.width * (contentHeightMm / contentWidthMm)
      )

      let offsetY = 0
      let pageIndex = 0

      while (offsetY < fullCanvas.height) {
        const sliceHeightPx = Math.min(pageSliceHeightPx, fullCanvas.height - offsetY)
        const sliceCanvas = document.createElement("canvas")
        sliceCanvas.width = fullCanvas.width
        sliceCanvas.height = sliceHeightPx
        const ctx = sliceCanvas.getContext("2d")

        if (!ctx) {
          throw new Error("Failed to prepare PDF canvas context")
        }

        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
        ctx.drawImage(
          fullCanvas,
          0,
          offsetY,
          fullCanvas.width,
          sliceHeightPx,
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        )

        const sliceDataUrl = sliceCanvas.toDataURL("image/png")
        const renderHeightMm = (sliceHeightPx * contentWidthMm) / fullCanvas.width

        if (pageIndex > 0) {
          pdf.addPage()
        }

        pdf.addImage(
          sliceDataUrl,
          "PNG",
          margin,
          margin,
          contentWidthMm,
          renderHeightMm
        )

        offsetY += sliceHeightPx
        pageIndex += 1
      }

      const slug = (templateData.personal.name || "client")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      pdf.save(`${slug || "client"}-${selectedTemplate.id}-cv.pdf`)
    } catch (exportError: unknown) {
      setError(getErrorMessage(exportError, "Failed to export PDF"))
    } finally {
      setIsExportingPdf(false)
    }
  }

  const isMutating =
    uploadMutation.isPending || defaultMutation.isPending || deleteMutation.isPending

  const templateOptions = templates.filter(
    (item) => item.standard === optimizationForm.standard
  )

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV Management</h1>
          <p className="text-muted-foreground">
            Upload CVs, set a default, then optimize each CV for a specific job using ATS or other standards.
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
          <h2 className="text-lg font-semibold">All CVs ({cvs.length})</h2>
          <div className="mt-4 space-y-3">
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
            {!cvsQuery.isLoading && cvs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No CVs uploaded yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">CV Optimizer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tailor your selected CV for each job description and choose from 10 template styles.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected CV</label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {selectedCv?.fileName || "No CV selected"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CV Standard</label>
              <select
                value={optimizationForm.standard}
                onChange={(event) =>
                  setOptimizationForm((prev) => ({
                    ...prev,
                    standard: event.target.value as typeof prev.standard,
                    templateId: "",
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ats">ATS Standard</option>
                <option value="modern">Modern</option>
                <option value="executive">Executive</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name</label>
              <Input
                value={optimizationForm.clientName}
                onChange={(event) =>
                  setOptimizationForm((prev) => ({
                    ...prev,
                    clientName: event.target.value,
                  }))
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Email</label>
              <Input
                value={optimizationForm.clientEmail}
                onChange={(event) =>
                  setOptimizationForm((prev) => ({
                    ...prev,
                    clientEmail: event.target.value,
                  }))
                }
                placeholder="john@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Phone</label>
              <Input
                value={optimizationForm.clientPhone}
                onChange={(event) =>
                  setOptimizationForm((prev) => ({
                    ...prev,
                    clientPhone: event.target.value,
                  }))
                }
                placeholder="+234..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Location</label>
              <Input
                value={optimizationForm.clientLocation}
                onChange={(event) =>
                  setOptimizationForm((prev) => ({
                    ...prev,
                    clientLocation: event.target.value,
                  }))
                }
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Template Design</label>
            <select
              value={optimizationForm.templateId}
              onChange={(event) =>
                setOptimizationForm((prev) => ({
                  ...prev,
                  templateId: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {templatesQuery.isLoading ? <option>Loading templates...</option> : null}
              {templateOptions.length > 0
                ? templateOptions.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))
                : templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {templates.find((item) => item.id === optimizationForm.templateId)?.preview ||
                "Pick a template to shape the optimized CV output style."}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Target Job Description</label>
            <textarea
              value={optimizationForm.jobDescription}
              onChange={(event) =>
                setOptimizationForm((prev) => ({
                  ...prev,
                  jobDescription: event.target.value,
                }))
              }
              className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Extra Keywords (optional)</label>
            <Input
              value={optimizationForm.keywordsCsv}
              onChange={(event) =>
                setOptimizationForm((prev) => ({
                  ...prev,
                  keywordsCsv: event.target.value,
                }))
              }
              placeholder="React, Product analytics, Stakeholder management"
            />
          </div>

          <Button
            type="button"
            className="mt-5"
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending || !selectedCv}
          >
            {optimizeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing CV...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize CV
              </>
            )}
          </Button>

          {latestOptimization ? (
            <div className="mt-6 space-y-4 rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">Template Preview</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTemplatePicker(true)}
                  >
                    <LayoutTemplate className="mr-1 h-4 w-4" />
                    Choose Template
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard.writeText(latestOptimization.optimizedCvText)
                    }
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copy Raw
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={exportTemplatePdf}
                    disabled={isExportingPdf || !templateData}
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      "Download PDF"
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Active template: <span className="font-medium text-foreground">{selectedTemplate.label}</span>
              </p>

              <div className="overflow-auto rounded-md border bg-slate-100 p-3">
                <div
                  key={selectedTemplate.id}
                  ref={previewRef}
                  className="origin-top-left scale-[0.75] transform transition-all duration-300 ease-out md:scale-[0.82] lg:scale-[0.9]"
                >
                  {templateData ? <selectedTemplate.Component data={templateData} /> : null}
                </div>
              </div>

              <div className="pointer-events-none fixed -left-[20000px] top-0 opacity-0">
                <div ref={exportRef}>
                  {templateData ? <selectedTemplate.Component data={templateData} /> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {showTemplatePicker ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl border bg-background p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pick CV Template</h3>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowTemplatePicker(false)}>
                  Close
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {CV_TEMPLATE_DEFINITIONS.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id)
                      setShowTemplatePicker(false)
                    }}
                    className={`rounded-lg border p-3 text-left transition ${
                      selectedTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <p className="font-medium">{template.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {showOptimizeProgressModal ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="w-[92%] max-w-md rounded-2xl border bg-background/95 p-6 shadow-2xl">
              <p className="text-sm font-medium text-muted-foreground">SwiftApplyHQ Progress</p>
              <h3 className="mt-1 text-lg font-semibold">
                Stay patient as we {optimizeActivity}...
              </h3>
              <div className="mt-6 flex items-center gap-3 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowOptimizeProgressModal(false)
                    showToast({
                      variant: "info",
                      title: "Optimization continues in background",
                      description: "We will notify you when it is complete.",
                    })
                  }}
                >
                  Continue in background
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <UpgradePricingModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </div>
    </AuthenticatedDashboardLayout>
  )
}
