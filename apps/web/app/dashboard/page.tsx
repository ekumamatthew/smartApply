"use client"

import { AuthenticatedDashboardLayout } from "@/src/components/AuthenticatedDashboardLayout"
import {
  generateApplicationEmail,
  parseCvFile,
} from "@/src/lib/email-generator-api"
import {
  emailGeneratorFormAtom,
  generatedEmailAtom,
  generatorErrorAtom,
  parsedCvAtom,
  uploadedCvAtom,
} from "@/src/state/email-generator"
import { useMutation } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Copy, FileText, Loader2, Mail, Sparkles, Upload } from "lucide-react"

export default function DashboardPage() {
  const [form, setForm] = useAtom(emailGeneratorFormAtom)
  const [cvFile, setCvFile] = useAtom(uploadedCvAtom)
  const [parsedCv, setParsedCv] = useAtom(parsedCvAtom)
  const [generatedEmail, setGeneratedEmail] = useAtom(generatedEmailAtom)
  const [error, setError] = useAtom(generatorErrorAtom)

  const parseCvMutation = useMutation({
    mutationFn: async (file: File) => parseCvFile(file),
    onSuccess: (data) => {
      setParsedCv(data.parsed)
      setError("")
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Failed to parse CV"))
    },
  })

  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!cvFile) {
        throw new Error("Please upload your CV first")
      }

      if (form.jobDescription.trim().length < 30) {
        throw new Error("Please provide a fuller job description (at least 30 characters)")
      }

      if (!form.recipientEmail.trim()) {
        throw new Error("Please provide recipient email")
      }

      return generateApplicationEmail({
        cv: cvFile,
        jobDescription: form.jobDescription,
        recipientEmail: form.recipientEmail,
        recipientName: form.recipientName || undefined,
        applicantName: form.applicantName || undefined,
        additionalContext: [form.additionalContext, form.jobUrl]
          .filter(Boolean)
          .join("\n"),
        tone: form.tone,
      })
    },
    onSuccess: (data) => {
      setGeneratedEmail(data)
      setError("")
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Failed to generate email"))
    },
  })

  const handleFieldChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopyEmail = async () => {
    if (!generatedEmail) return

    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
    await navigator.clipboard.writeText(fullEmail)
  }

  return (
    <AuthenticatedDashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Email Generator</h1>
          <p className="text-muted-foreground">
            Upload CV, paste job description, and generate a tailored application email.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5 rounded-xl border bg-card p-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CV
              </Label>
              <Input
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setCvFile(file)
                  setParsedCv(null)
                  setGeneratedEmail(null)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Supported: txt, pdf, doc, docx, pptx (max 10MB)
              </p>
              {cvFile && (
                <p className="text-sm text-foreground">Selected: {cvFile.name}</p>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={!cvFile || parseCvMutation.isPending}
                onClick={() => cvFile && parseCvMutation.mutate(cvFile)}
              >
                {parseCvMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing CV...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Parse CV Sections
                  </>
                )}
              </Button>
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
                onChange={(e) => handleFieldChange("jobDescription", e.target.value)}
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
                  onChange={(e) => handleFieldChange("recipientEmail", e.target.value)}
                  placeholder="hr@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  value={form.recipientName}
                  onChange={(e) => handleFieldChange("recipientName", e.target.value)}
                  placeholder="Hiring Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantName">Your Name (optional)</Label>
                <Input
                  id="applicantName"
                  value={form.applicantName}
                  onChange={(e) => handleFieldChange("applicantName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  value={form.tone}
                  onChange={(e) =>
                    handleFieldChange("tone", e.target.value as typeof form.tone)
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
              <Label htmlFor="additionalContext">Additional Context (optional)</Label>
              <textarea
                id="additionalContext"
                value={form.additionalContext}
                onChange={(e) => handleFieldChange("additionalContext", e.target.value)}
                placeholder="Any specific achievements or details you want emphasized"
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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

          <div className="space-y-5">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-lg font-semibold">Parsed CV Insights</h2>
              {!parsedCv ? (
                <p className="text-sm text-muted-foreground">
                  Parse your CV to preview extracted skills, experience, and education.
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium">Summary</p>
                    <p className="text-muted-foreground">{parsedCv.summary}</p>
                  </div>
                  <div>
                    <p className="font-medium">Top Skills</p>
                    <p className="text-muted-foreground">
                      {parsedCv.skills.slice(0, 10).join(", ") || "None detected"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Experience Highlights</p>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {parsedCv.experience.slice(0, 4).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated Email</h2>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedDashboardLayout>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
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
