"use client"

import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import { useAppToast } from "@/src/components/AppToastProvider"
import { UpgradePricingModal } from "@/src/components/UpgradePricingModal"
import { CV_TEMPLATE_DEFINITIONS } from "@/src/components/cv-builder/templates"
import {
  fallbackStructuredCv,
  mapStructuredCvToViewModel,
} from "@/src/components/cv-builder/types"
import {
  fetchCvOptimizationHistory,
  fetchCvParsedPreview,
  fetchCvs,
  fetchCvTemplates,
  optimizeCv,
  setDefaultCv,
  uploadCv,
  type CvOptimizationHistoryItem,
  type CvRecord,
  type CvTemplate,
  type ParsedCvSections,
  type StructuredCvData,
} from "@/src/lib/dashboard-api"
import { generateApplicationEmail } from "@/src/lib/email-generator-api"
import {
  emailGeneratorFormAtom,
  generatedEmailAtom,
  generatorErrorAtom,
} from "@/src/state/email-generator"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useAtom } from "jotai"
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  LayoutTemplate,
  Loader2,
  Mail,
  Sparkles,
  Upload,
} from "lucide-react"
import * as React from "react"

function getErrorMessage(error: unknown, fallback: string): string {
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
  }

  if (error instanceof Error) return error.message

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
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

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const [form, setForm] = useAtom(emailGeneratorFormAtom)
  const [generatedEmail, setGeneratedEmail] = useAtom(generatedEmailAtom)
  const [error, setError] = useAtom(generatorErrorAtom)
  const [showCvPicker, setShowCvPicker] = React.useState(false)
  const uploadCvInputRef = React.useRef<HTMLInputElement | null>(null)
  const [parsedCv, setParsedCv] = React.useState<ParsedCvSections | null>(null)
  const [parsedCvName, setParsedCvName] = React.useState<string>("")
  const [parsedFromCache, setParsedFromCache] = React.useState<boolean>(false)
  const [optimizeAlongside, setOptimizeAlongside] = React.useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("")
  const [extraCvRequirements, setExtraCvRequirements] = React.useState("")
  const [optimizeNote, setOptimizeNote] = React.useState("")
  const [showCvPreview, setShowCvPreview] = React.useState(false)
  const [previewTemplateId, setPreviewTemplateId] = React.useState("clean")
  const [isExportingPdf, setIsExportingPdf] = React.useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = React.useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
  const exportRef = React.useRef<HTMLDivElement | null>(null)
  const [showProgressModal, setShowProgressModal] = React.useState(false)
  const [progressActivity, setProgressActivity] = React.useState("Preparing request")
  const { showToast } = useAppToast()

  const cvsQuery = useQuery({
    queryKey: ["cv-list"],
    queryFn: fetchCvs,
  })
  const templatesQuery = useQuery({
    queryKey: ["cv-templates"],
    queryFn: fetchCvTemplates,
    enabled: optimizeAlongside,
  })

  const cvs = cvsQuery.data || []
  const templates = templatesQuery.data || []
  const defaultCv = React.useMemo(
    () => cvs.find((item) => item.isDefault) ?? cvs[0] ?? null,
    [cvs]
  )

  React.useEffect(() => {
    if (!optimizeAlongside) return
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0]?.id || "")
    }
  }, [optimizeAlongside, selectedTemplateId, templates])

  const optimizationHistoryQuery = useQuery({
    queryKey: ["cv-optimization-history", defaultCv?.id],
    queryFn: () => fetchCvOptimizationHistory(defaultCv!.id),
    enabled: Boolean(defaultCv?.id),
  })
  const latestOptimization = optimizationHistoryQuery.data?.[0] as
    | CvOptimizationHistoryItem
    | undefined

  const selectedPreviewTemplate = React.useMemo(
    () =>
      CV_TEMPLATE_DEFINITIONS.find((tpl) => tpl.id === previewTemplateId) ||
      CV_TEMPLATE_DEFINITIONS[0]!,
    [previewTemplateId]
  )

  const previewStructuredCv = React.useMemo<StructuredCvData | null>(() => {
    if (latestOptimization?.structuredCvJson)
      return latestOptimization.structuredCvJson
    if (latestOptimization?.optimizedCvText) {
      return fallbackStructuredCv(latestOptimization.optimizedCvText)
    }
    return null
  }, [latestOptimization])

  const previewTemplateData = React.useMemo(() => {
    if (!previewStructuredCv) return null
    return mapStructuredCvToViewModel(previewStructuredCv)
  }, [previewStructuredCv])

  const exportPreviewPdf = async () => {
    if (!previewTemplateData || !exportRef.current) {
      setError("No preview data available to export")
      return
    }

    try {
      setIsExportingPdf(true)
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
        const sliceHeightPx = Math.min(
          pageSliceHeightPx,
          fullCanvas.height - offsetY
        )
        const sliceCanvas = document.createElement("canvas")
        sliceCanvas.width = fullCanvas.width
        sliceCanvas.height = sliceHeightPx
        const ctx = sliceCanvas.getContext("2d")
        if (!ctx) throw new Error("Failed to prepare PDF canvas context")
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
        const renderHeightMm =
          (sliceHeightPx * contentWidthMm) / fullCanvas.width
        if (pageIndex > 0) pdf.addPage()
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

      const slug = (previewTemplateData.personal.name || "client")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      pdf.save(`${slug || "client"}-${selectedPreviewTemplate.id}-cv.pdf`)
    } catch (exportError: unknown) {
      setError(getErrorMessage(exportError, "Failed to export CV PDF"))
    } finally {
      setIsExportingPdf(false)
    }
  }

  const stopProgressModal = React.useCallback(() => {
    setShowProgressModal(false)
  }, [])

  const startProgressModal = React.useCallback(
    (activity: string) => {
      setShowProgressModal(true)
      setProgressActivity(activity)
    },
    []
  )

  const uploadCvMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadCv(file)
      if (!uploaded?.id) {
        throw new Error("Upload completed but CV record was not returned")
      }
      const parsedResult = await fetchCvParsedPreview(uploaded.id)
      return { uploaded, parsedResult, fileName: file.name }
    },
    onSuccess: async ({ parsedResult, fileName }) => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      setParsedCv(parsedResult.parsed)
      setParsedCvName(fileName)
      setParsedFromCache(parsedResult.fromCache)
      setError("")
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Failed to upload CV"))
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: async (cvId: string) => setDefaultCv(cvId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cv-list"] })
      setError("")
      setShowCvPicker(false)
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Failed to set default CV"))
    },
  })

  const loadDefaultCvParsedMutation = useMutation({
    mutationFn: async ({ cvId }: { cvId: string }) =>
      fetchCvParsedPreview(cvId, false),
    onSuccess: (data) => {
      setParsedCv(data.parsed)
      setParsedCvName(data.fileName)
      setParsedFromCache(data.fromCache)
      setError("")
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Failed to load parsed CV"))
    },
  })

  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!defaultCv?.id) {
        throw new Error("Upload a CV and set one as default first")
      }

      if (form.jobDescription.trim().length < 30) {
        throw new Error(
          "Please provide a fuller job description (at least 30 characters)"
        )
      }

      if (!form.recipientEmail.trim()) {
        throw new Error("Please provide recipient email")
      }

      startProgressModal("generating your tailored email")

      const email = await generateApplicationEmail({
        cvId: defaultCv.id,
        jobDescription: form.jobDescription,
        recipientEmail: form.recipientEmail,
        recipientName: form.recipientName || undefined,
        applicantName: form.applicantName || undefined,
        additionalContext: [form.additionalContext, form.jobUrl]
          .filter(Boolean)
          .join("\n"),
        tone: form.tone,
      })

      if (optimizeAlongside) {
        setProgressActivity("optimizing your CV")

        const keywords = extraCvRequirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)

        const optimized = await optimizeCv({
          cvId: defaultCv.id,
          jobDescription: form.jobDescription,
          templateId: selectedTemplateId || undefined,
          clientName: form.applicantName || undefined,
          keywords,
        })

        const templateName =
          (optimized.template as CvTemplate | undefined)?.name ||
          "selected template"
        setOptimizeNote(
          `CV optimized with ${templateName}. You can review it in CV Management history.`
        )

        await queryClient.invalidateQueries({
          queryKey: ["cv-optimization-history", defaultCv.id],
        })
        await queryClient.refetchQueries({
          queryKey: ["cv-optimization-history", defaultCv.id],
          type: "active",
        })
      } else {
        setOptimizeNote("")
      }

      setProgressActivity("finalizing results")

      return email
    },
    onSuccess: (data) => {
      setGeneratedEmail(data)
      setError("")
      showToast({
        variant: "success",
        title: "Email generation complete",
        description:
          "Your email has been saved in Applications. Open a thread to view history and CV preview.",
      })
      setShowProgressModal(false)
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Failed to generate email")
      setError(message)
      if (shouldShowUpgradeModal(err)) {
        setShowUpgradeModal(true)
      }
      showToast({
        variant: "error",
        title: "Generation failed",
        description: message,
      })
      stopProgressModal()
    },
  })

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopyEmail = async () => {
    if (!generatedEmail) return
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
    await navigator.clipboard.writeText(fullEmail)
  }

  React.useEffect(() => {
    if (!defaultCv?.id) {
      setParsedCv(null)
      setParsedCvName("")
      setParsedFromCache(false)
      return
    }

    loadDefaultCvParsedMutation.mutate({ cvId: defaultCv.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCv?.id])

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Email Generator
          </h1>
          <p className="text-muted-foreground">
            Select your default CV, paste job details, and generate a tailored
            application email.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid h-[90vh] gap-6 lg:grid-cols-2">
          <div className="h-auto space-y-5 rounded-xl border bg-card p-5">
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Default CV</Label>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => uploadCvInputRef.current?.click()}
                  disabled={uploadCvMutation.isPending}
                  title="Upload CV"
                >
                  {uploadCvMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <input
                ref={uploadCvInputRef}
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx,.pptx"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    uploadCvMutation.mutate(file)
                  }
                  event.currentTarget.value = ""
                }}
              />

              <p className="text-sm text-muted-foreground">
                {defaultCv
                  ? defaultCv.fileName
                  : "No CV yet. Click upload icon."}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCvPicker((prev) => !prev)}
                disabled={cvs.length === 0}
              >
                Choose / Set Default CV
              </Button>

              {showCvPicker ? (
                <div className="mt-2 space-y-2 rounded-md border bg-muted/30 p-2">
                  {cvs.map((item: CvRecord) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded border bg-background p-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.isDefault
                            ? "Current default"
                            : "Set as default"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={item.isDefault ? "default" : "outline"}
                        disabled={
                          setDefaultMutation.isPending || item.isDefault
                        }
                        onClick={() => setDefaultMutation.mutate(item.id)}
                      >
                        {item.isDefault ? (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Default
                          </>
                        ) : (
                          "Make Default"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL (optional)</Label>
              <Input
                id="jobUrl"
                value={form.jobUrl}
                onChange={(e) => handleFieldChange("jobUrl", e.target.value)}
                placeholder="https://company.com/jobs/123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <textarea
                id="jobDescription"
                value={form.jobDescription}
                onChange={(e) =>
                  handleFieldChange("jobDescription", e.target.value)
                }
                placeholder="Paste job description here..."
                className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) =>
                    handleFieldChange("recipientEmail", e.target.value)
                  }
                  placeholder="hr@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  value={form.recipientName}
                  onChange={(e) =>
                    handleFieldChange("recipientName", e.target.value)
                  }
                  placeholder="Hiring Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantName">Your Name (optional)</Label>
                <Input
                  id="applicantName"
                  value={form.applicantName}
                  onChange={(e) =>
                    handleFieldChange("applicantName", e.target.value)
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  value={form.tone}
                  onChange={(e) =>
                    handleFieldChange(
                      "tone",
                      e.target.value as typeof form.tone
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalContext">
                Additional Context (optional)
              </Label>
              <textarea
                id="additionalContext"
                value={form.additionalContext}
                onChange={(e) =>
                  handleFieldChange("additionalContext", e.target.value)
                }
                placeholder="Any specific achievements or details you want emphasized"
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-md border p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={optimizeAlongside}
                  onChange={(e) => setOptimizeAlongside(e.target.checked)}
                  className="h-4 w-4"
                />
                Optimize CV alongside email (optional)
              </label>

              {optimizeAlongside ? (
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cvTemplate">CV Template</Label>
                    <select
                      id="cvTemplate"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {templates.length === 0 ? (
                        <option value="">Loading templates...</option>
                      ) : (
                        templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extraCvRequirements">
                      Extra CV requirements (optional)
                    </Label>
                    <Input
                      id="extraCvRequirements"
                      value={extraCvRequirements}
                      onChange={(e) => setExtraCvRequirements(e.target.value)}
                      placeholder="Leadership, React, product analytics"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => generateEmailMutation.mutate()}
              disabled={generateEmailMutation.isPending}
            >
              {generateEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Application Email
                </>
              )}
            </Button>
          </div>

          <div className="no-scrollbar w-full space-y-5 lg:overflow-y-auto">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-lg font-semibold">CV Status</h2>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Current default CV</p>
                <div className="rounded-md border bg-background p-3">
                  {defaultCv ? defaultCv.fileName : "No default CV selected"}
                </div>
                {parsedCv ? (
                  <div className="mt-3 space-y-3 rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground">
                      Parsed CV: {parsedCvName || "Selected CV"}{" "}
                      {parsedFromCache ? "(cached)" : "(fresh parse)"}
                    </p>
                    <div>
                      <p className="font-medium">Summary</p>
                      <p className="text-muted-foreground">
                        {parsedCv.summary}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Top Skills</p>
                      <p className="text-muted-foreground">
                        {parsedCv.skills.slice(0, 10).join(", ") ||
                          "None detected"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Experience</p>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {parsedCv.experience.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
                {defaultCv && !parsedCv ? (
                  <p className="text-xs text-muted-foreground">
                    Loading parsed CV...
                  </p>
                ) : null}
                <div className="pt-2">
                  {!latestOptimization ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Generate email with “Optimize CV alongside email” enabled
                      to preview.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated Email</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyEmail}
                    disabled={!generatedEmail}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCvPreview(true)}
                    disabled={!latestOptimization}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview & Download CV
                  </Button>
                </div>
              </div>

              {!generatedEmail ? (
                <p className="text-sm text-muted-foreground">
                  Your generated email will appear here.
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="mb-1 font-medium">Subject</p>
                    <div className="rounded-md border bg-background p-3">
                      {generatedEmail.subject}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 font-medium">Body</p>
                    <div className="max-h-72 overflow-y-auto rounded-md border bg-background p-3 whitespace-pre-wrap">
                      {generatedEmail.body}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 font-medium">Key Highlights</p>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {generatedEmail.keyHighlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Mail className="mr-1 h-3 w-3" />
                    Ready to send to {form.recipientEmail || "recipient"}
                  </div>
                  {optimizeNote ? (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
                      {optimizeNote}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {showCvPreview ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border bg-background p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">CV Preview</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCvPreview(false)}
                >
                  Close
                </Button>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTemplatePicker((prev) => !prev)}
                >
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  Template
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={exportPreviewPdf}
                  disabled={isExportingPdf}
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>

              {showTemplatePicker ? (
                <div className="mb-3 grid gap-2 md:grid-cols-3">
                  {CV_TEMPLATE_DEFINITIONS.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setPreviewTemplateId(template.id)}
                      className={`rounded-md border p-2 text-left text-sm ${
                        previewTemplateId === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium">{template.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="overflow-auto rounded-md border bg-slate-100 p-3">
                <div className="origin-top-left scale-[0.75] transform transition-all duration-300 ease-out md:scale-[0.82] lg:scale-[0.9]">
                  {previewTemplateData ? (
                    <selectedPreviewTemplate.Component
                      data={previewTemplateData}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No optimized CV data available yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="pointer-events-none fixed top-0 -left-[20000px] opacity-0">
                <div ref={exportRef}>
                  {previewTemplateData ? (
                    <selectedPreviewTemplate.Component
                      data={previewTemplateData}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showProgressModal ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="w-[92%] max-w-md rounded-2xl border bg-background/95 p-6 shadow-2xl">
              <p className="text-sm font-medium text-muted-foreground">SwiftApplyHQ Progress</p>
              <h3 className="mt-1 text-lg font-semibold">
                Stay patient as we {progressActivity}...
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
                    setShowProgressModal(false)
                    showToast({
                      variant: "info",
                      title: "Processing continues in background",
                      description: "We will notify you here when it is done.",
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
